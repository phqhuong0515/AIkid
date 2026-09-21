import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { generateImageViaGateway } from '@/features/creative/generateImageViaGateway';
import { generateComicPanelsFromSource, reviewComicPanelsAgainstSource } from '@/features/comic/api/generateComicPanelAssist';
import { saveComicStoryToBalo } from '@/features/comic/api/comicRemoteLibrary';
import { BubbleCorner, COMIC_BUBBLE_EDITOR_ENABLED, ComicBubble, ComicDialogueOverlay } from '@/features/comic/ComicDialogueOverlay';
import { COMIC_LAYOUTS, ComicPanelCount, DEFAULT_COMIC_LAYOUT_ID, getComicLayout, getDefaultComicLayoutForCount } from '@/features/comic/comicLayouts';
import { ComicCharacter, useComicDraft } from '@/features/comic/store/useComicDraft';
import { ART_STYLES } from '@/features/art/constants';
import { CharacterPicker } from '@/features/character';
import { useResponsiveLayout } from '@/features/kids-ui/useResponsiveLayout';
import { AikidButton, AikidPage, AikidSafeBox, AikidStepNavigator } from '@/ui';

type TextStory = { id: string; title?: string; plotVersionId?: string; opening?: string; development?: string; ending?: string; characters?: ComicCharacter[] };
type SourceChoice = { id: string; type: 'plot' | 'text'; title: string; description: string; beats: string[]; characters: ComicCharacter[] };
type ComicPanelDraft = { id: string; content: string; characterIds: string[]; dialogue: string; imageUrl: string; jobId: string; error: string };
type ComicPageDraft = { id: string; imageUrl: string; jobId: string; layoutId?: string; panels: ComicPanelDraft[]; bubbles: ComicBubble[] };
type StoredComic = {
  id: string;
  sourceId: string;
  sourceType: 'plot' | 'text';
  title: string;
  artStyle?: string;
  pages: ComicPageDraft[];
  createdAt?: string;
};

const FLOW_STEPS = ['Chọn nguồn', 'Nét vẽ', 'Bố cục', 'Từng khung', 'Hoàn thiện'];
const COMIC_STORY_KEY = 'aikid.comic.stories.v1';
const COMIC_IMAGE_JOB_IDS_KEY = 'aikid.comic.image-job-ids.v1';

function buildComicPagePrompt(
  stylePrompt: string,
  panels: ComicPanelDraft[],
  characters: ComicCharacter[],
  layoutLabel: string,
) {
  const characterById = new Map(characters.map((character) => [character.id, character]));
  const usedCharacterIds = new Set(panels.flatMap((panel) => panel.characterIds));
  const characterBible = characters.filter((character) => usedCharacterIds.has(character.id)).map((character) => [
    character.name,
    character.appearancePrompt || character.personality,
  ].filter(Boolean).join(': ')).join('; ');
  const panelDirectives = panels.map((panel, index) => {
    const names = panel.characterIds.map((id) => characterById.get(id)?.name).filter(Boolean).join(', ');
    const dialogue = panel.dialogue.trim() ? ` | EXACT VIETNAMESE SPEECH: "${panel.dialogue.trim()}"` : ' | NO SPEECH';
    return `P${index + 1} | CAST: ${names || 'none'} | SCENE: ${panel.content.trim()}${dialogue}`;
  }).join('\n');

  return [
    `MANDATORY STORYBOARD: Create one ${panels.length}-panel comic page. Depict exactly the following scene in each matching panel; never invent or replace the story:`,
    panelDirectives,
    'STORY RULE: each panel shows only its assigned moment. Maintain cause-and-effect continuity and consistent characters. Render each supplied speech line exactly once, verbatim, in its matching panel; do not translate it.',
    `LAYOUT: the LAST reference image is the strict ${layoutLabel} template; earlier references are characters. Preserve its aspect ratio, panel positions, shapes, borders, margins and white gutters exactly. Reading order is left-to-right, top-to-bottom. Keep artwork clipped inside panels.`,
    `ART STYLE: ${stylePrompt}.`,
    characterBible ? `CHARACTERS: ${characterBible}. Match reference identity, face, colors, clothes and proportions throughout.` : '',
    'No title, captions, extra dialogue, sound effects, watermark, extra panels, duplicated characters or invented story elements.',
  ].filter(Boolean).join('\n');
}

function buildPanels(beats: string[], count: ComicPanelCount, defaultCharacterIds: string[]): ComicPanelDraft[] {
  const clean = beats.filter(Boolean);
  return Array.from({ length: count }, (_, index) => {
    const sourceIndex = Math.min(clean.length - 1, Math.floor(index * clean.length / count));
    return {
      id: `panel-${index + 1}`,
      content: clean[sourceIndex] || '',
      characterIds: defaultCharacterIds,
      dialogue: '',
      imageUrl: '',
      jobId: '',
      error: '',
    };
  });
}

async function resolveLayoutDataUrl(thumbnail: number) {
  const asset = Asset.fromModule(thumbnail);
  if (!asset.localUri) await asset.downloadAsync();
  const uri = asset.localUri || asset.uri;
  if (!uri) throw new Error('Không đọc được ảnh bố cục đã chọn');
  if (uri.startsWith('data:')) return uri;
  const response = await fetch(uri);
  if (!response.ok) throw new Error('Không tải được ảnh bố cục đã chọn');
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không chuyển được ảnh bố cục'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(blob);
  });
}

export default function StoryComicScreen() {
  const router = useRouter();
  const responsive = useResponsiveLayout({ maxContent: 1200 });
  const params = useLocalSearchParams<{ plotId?: string; textStoryId?: string; comicStoryId?: string; editPage?: string; appendPage?: string }>();
  const hydrate = useComicDraft((state) => state.hydrate);
  const library = useComicDraft((state) => state.library);
  const project = useComicDraft((state) => state.project);
  const [textStories, setTextStories] = useState<TextStory[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [step, setStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [artStyleId, setArtStyleId] = useState('');
  const [layoutId, setLayoutId] = useState(DEFAULT_COMIC_LAYOUT_ID);
  const [layoutCountFilter, setLayoutCountFilter] = useState<ComicPanelCount>(4);
  const [pageCharacterIds, setPageCharacterIds] = useState<string[]>([]);
  const [panels, setPanels] = useState<ComicPanelDraft[]>([]);
  const [completedPages, setCompletedPages] = useState<ComicPageDraft[]>([]);
  const [pageImageUrl, setPageImageUrl] = useState('');
  const [pageJobId, setPageJobId] = useState('');
  const [pageError, setPageError] = useState('');
  const [showBubbles, setShowBubbles] = useState(false);
  const [bubbleCorners, setBubbleCorners] = useState<Record<string, BubbleCorner>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [panelAiLoading, setPanelAiLoading] = useState<'generate' | 'review' | null>(null);
  const [panelReview, setPanelReview] = useState('');
  const [editingComic, setEditingComic] = useState<StoredComic | null>(null);
  const [editingPageIndex, setEditingPageIndex] = useState<number | null>(null);
  const [editLoaded, setEditLoaded] = useState(false);

  useEffect(() => {
    void hydrate();
    void AsyncStorage.getItem('aikid.comic.text-stories.v1').then((raw) => {
      try {
        const parsed = raw ? JSON.parse(raw) : [];
        setTextStories(Array.isArray(parsed) ? parsed : []);
      } catch {
        setTextStories([]);
      }
    });
  }, [hydrate]);

  useEffect(() => {
    if (!params.comicStoryId || editLoaded) return;
    void AsyncStorage.getItem(COMIC_STORY_KEY).then((raw) => {
      try {
        const stories = raw ? JSON.parse(raw) : [];
        const found = Array.isArray(stories) ? stories.find((item) => item.id === params.comicStoryId) : null;
        if (found) setEditingComic(found);
      } finally {
        setEditLoaded(true);
      }
    });
  }, [editLoaded, params.comicStoryId]);

  const sources = useMemo<SourceChoice[]>(() => {
    const plots = library.length
      ? library
      : project.pages.some((page) => page.idea.trim()) ? [{ ...project, versionId: 'current-draft' }] : [];
    const plotSources = plots.filter((item) => item.pages.some((page) => page.idea.trim())).map((item) => ({
      id: item.versionId,
      type: 'plot' as const,
      title: item.title || item.pages[0]?.title || 'Cốt truyện',
      description: `Cốt truyện · ${item.cast.length} nhân vật · chia các mốc thành khung tranh`,
      beats: item.pages[0]?.panels.map((panel) => panel.action).filter(Boolean) || [],
      characters: item.cast,
    }));
    return [
      ...plotSources,
      ...textStories.map((story) => {
        const relatedPlot = plots.find((item) => item.versionId === story.plotVersionId);
        return {
          id: story.id,
          type: 'text' as const,
          title: story.title || 'Truyện chữ của em',
          description: 'Truyện chữ · chọn cảnh quan trọng để vẽ',
          beats: [story.opening, story.development, story.ending].filter((value): value is string => Boolean(value)),
          characters: story.characters?.length ? story.characters : relatedPlot?.cast || [],
        };
      }),
    ];
  }, [library, project, textStories]);

  useEffect(() => {
    const requested = params.plotId ? `plot:${params.plotId}` : params.textStoryId ? `text:${params.textStoryId}` : '';
    if (requested && sources.some((source) => `${source.type}:${source.id}` === requested)) setSelectedKey(requested);
  }, [params.plotId, params.textStoryId, sources]);

  useEffect(() => {
    if (!editingComic || !sources.length) return;
    const sourceKey = `${editingComic.sourceType}:${editingComic.sourceId}`;
    if (sources.some((source) => `${source.type}:${source.id}` === sourceKey)) setSelectedKey(sourceKey);
    const style = ART_STYLES.find((item) => item.labelVi === editingComic.artStyle);
    if (style) setArtStyleId(style.id);

    const requestedIndex = params.editPage !== undefined ? Number(params.editPage) : null;
    if (requestedIndex !== null && Number.isInteger(requestedIndex) && editingComic.pages[requestedIndex]) {
      const page = editingComic.pages[requestedIndex];
      setEditingPageIndex(requestedIndex);
      const restoredLayout = page.layoutId ? getComicLayout(page.layoutId) : getDefaultComicLayoutForCount(page.panels.length);
      setLayoutId(restoredLayout.id);
      setLayoutCountFilter(restoredLayout.panelCount);
      setPanels(page.panels);
      setPageImageUrl(page.imageUrl || '');
      setPageJobId(page.jobId || '');
      setCompletedPages(editingComic.pages.filter((_, index) => index !== requestedIndex));
      setStep(5);
      setMaxVisitedStep(5);
    } else if (params.appendPage === '1') {
      setEditingPageIndex(null);
      setCompletedPages(editingComic.pages);
      setPanels([]);
      setPageImageUrl('');
      setStep(3);
      setMaxVisitedStep(3);
    }
  }, [editingComic, params.appendPage, params.editPage, sources]);

  const selected = sources.find((source) => `${source.type}:${source.id}` === selectedKey);
  const selectedStyle = ART_STYLES.find((style) => style.id === artStyleId);
  const selectedLayout = getComicLayout(layoutId);
  const panelCount = selectedLayout.panelCount;
  const sourceText = selected?.beats.map((beat, index) => `${index + 1}. ${beat}`).join('\n') || '';
  const pagePrompt = selected && selectedStyle
    ? buildComicPagePrompt(selectedStyle.canonicalPrompt, panels, selected.characters, `${panelCount}-panel layout`)
    : '';
  const usedCharacterIds = new Set(panels.flatMap((panel) => panel.characterIds));
  const referenceCharacters = selected?.characters.filter(
    (character) => usedCharacterIds.has(character.id) && character.referenceImageUrl?.startsWith('http'),
  ) || [];
  const bubbles: ComicBubble[] = panels.map((panel, panelIndex) => ({
    panelId: panel.id,
    panelIndex,
    text: panel.dialogue,
    corner: bubbleCorners[panel.id] || (panelIndex % 2 === 0 ? 'top-right' : 'top-left'),
  }));

  useEffect(() => {
    if (!selected) {
      setPageCharacterIds([]);
      return;
    }
    const mainIds = selected.characters.filter((character) => character.role === 'main').map((character) => character.id);
    setPageCharacterIds(mainIds.length ? mainIds : selected.characters.slice(0, 1).map((character) => character.id));
  }, [selected]);

  const updatePanel = (id: string, value: Partial<ComicPanelDraft>) => {
    setPanels((current) => current.map((panel) => panel.id === id ? { ...panel, ...value, imageUrl: value.imageUrl ?? '' } : panel));
  };

  const goNext = () => {
    if (step === 1 && !selected) return Alert.alert('Chọn nội dung gốc', 'Hãy chọn một cốt truyện hoặc truyện chữ.');
    if (step === 2 && !selectedStyle) return Alert.alert('Chọn phong cách', 'Hãy chọn phong cách vẽ cho toàn bộ truyện.');
    if (step === 3 && selected) setPanels(buildPanels(selected.beats, panelCount, pageCharacterIds));
    if (step === 4 && panels.some((panel) => !panel.content.trim())) return Alert.alert('Khung tranh chưa hoàn chỉnh', 'Mỗi khung cần có nội dung cảnh.');
    const next = Math.min(5, step + 1);
    setStep(next);
    setMaxVisitedStep((current) => Math.max(current, next));
  };

  const generateComicPage = async () => {
    if (isGenerating || !selected || !selectedStyle || !pagePrompt) return;
    setIsGenerating(true);
    setPageError('');
    try {
      const referenceHttpsUrls = selected.characters
        .filter((character) => usedCharacterIds.has(character.id))
        .map((character) => character.referenceImageUrl)
        .filter((url): url is string => Boolean(url?.startsWith('http')));
      const result = await generateImageViaGateway({
        userPrompt: pagePrompt,
        referenceDataUrl: await resolveLayoutDataUrl(selectedLayout.thumbnail),
        referenceHttpsUrls,
        purpose: 'comic-page',
      });
      const rawComicJobIds = await AsyncStorage.getItem(COMIC_IMAGE_JOB_IDS_KEY);
      const comicJobIds = rawComicJobIds ? JSON.parse(rawComicJobIds) : [];
      await AsyncStorage.setItem(
        COMIC_IMAGE_JOB_IDS_KEY,
        JSON.stringify([
          result.jobId,
          ...(Array.isArray(comicJobIds)
            ? comicJobIds.filter((id) => id !== result.jobId)
            : []),
        ].slice(0, 300)),
      );
      setPageImageUrl(result.imageUrl);
      setPageJobId(result.jobId);
      setShowBubbles(false);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Không tạo được trang truyện');
    } finally {
      setIsGenerating(false);
    }
  };

  const buildPanelsWithAi = async () => {
    if (!selected) return;
    setPanelAiLoading('generate');
    setPanelReview('');
    try {
      const suggestions = await generateComicPanelsFromSource({
        sourceText,
        panelCount,
        characterNames: selected.characters.map((character) => character.name),
      });
      setPanels(suggestions.map((suggestion, index) => ({
        id: panels[index]?.id || `panel-${index + 1}`,
        content: suggestion.content,
        characterIds: selected.characters
          .filter((character) => suggestion.characterNames.some((name) => name.toLocaleLowerCase() === character.name.toLocaleLowerCase()))
          .map((character) => character.id),
        dialogue: suggestion.dialogue,
        imageUrl: '',
        jobId: '',
        error: '',
      })));
      const dialogueCount = suggestions.filter((suggestion) => suggestion.dialogue.trim()).length;
      setPanelReview(`AI đã chia cảnh và gợi ý lời thoại cho ${dialogueCount}/${suggestions.length} khung. Em hãy đọc lại và sửa theo ý mình.`);
    } catch (error) {
      Alert.alert('AI chưa thể chia cảnh', error instanceof Error ? error.message : 'Hãy thử lại sau.');
    } finally {
      setPanelAiLoading(null);
    }
  };

  const reviewPanels = async () => {
    if (!selected) return;
    setPanelAiLoading('review');
    try {
      setPanelReview(await reviewComicPanelsAgainstSource({
        sourceText,
        panels: panels.map((panel) => ({
          content: panel.content,
          characterNames: selected.characters.filter((character) => panel.characterIds.includes(character.id)).map((character) => character.name),
          dialogue: panel.dialogue,
        })),
      }));
    } catch (error) {
      Alert.alert('AI chưa thể kiểm tra', error instanceof Error ? error.message : 'Hãy thử lại sau.');
    } finally {
      setPanelAiLoading(null);
    }
  };

  const saveComic = async () => {
    if (!selected || !selectedStyle) return;
    const raw = await AsyncStorage.getItem(COMIC_STORY_KEY);
    const current = raw ? JSON.parse(raw) : [];
    const createdAt = new Date().toISOString();
    const currentPage = { id: editingPageIndex !== null ? editingComic?.pages[editingPageIndex]?.id || `page-${editingPageIndex + 1}` : `page-${completedPages.length + 1}`, imageUrl: pageImageUrl, jobId: pageJobId, layoutId, panels, bubbles };
    const nextPages = editingComic
      ? editingPageIndex !== null
        ? editingComic.pages.map((page, index) => index === editingPageIndex ? currentPage : page)
        : [...editingComic.pages, currentPage]
      : [...completedPages, currentPage];
    const comic = {
      id: editingComic?.id || `comic-story-${createdAt}`,
      sourceId: selected.id,
      sourceType: selected.type,
      title: selected.title,
      artStyle: selectedStyle.labelVi,
      pages: nextPages,
      panels: nextPages.flatMap((page) => page.panels),
      coverImageUrl: nextPages[0]?.imageUrl || pageImageUrl,
      createdAt: editingComic?.createdAt || createdAt,
      updatedAt: createdAt,
    };
    const nextStories = editingComic
      ? (Array.isArray(current) ? current.map((item) => item.id === editingComic.id ? comic : item) : [comic])
      : [comic, ...(Array.isArray(current) ? current : [])];
    await AsyncStorage.setItem(COMIC_STORY_KEY, JSON.stringify(nextStories));
    try {
      const remoteAssetId = await saveComicStoryToBalo(comic);
      const syncedComic = { ...comic, remoteAssetId };
      const syncedStories = nextStories.map((item) => item.id === comic.id ? syncedComic : item);
      await AsyncStorage.setItem(COMIC_STORY_KEY, JSON.stringify(syncedStories));
      router.replace({ pathname: '/(app)/comic/story-reader', params: { id: comic.id, type: 'comic' } });
    } catch (error) {
      Alert.alert(
        'Đã lưu trên thiết bị, chưa lưu được vào Balo',
        error instanceof Error ? error.message : 'Hãy kiểm tra kết nối và thử lưu lại.',
      );
    }
  };

  return (
    <AikidPage scene="comic" title="Tạo truyện tranh" backHref="/(app)/comic/create-v2" container="wide" scroll={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AikidSafeBox variant="panel" style={styles.workspace}>
          <View style={styles.stepper}>
            <AikidStepNavigator
              steps={FLOW_STEPS}
              currentStep={step}
              maxVisitedStep={maxVisitedStep}
              onStepPress={setStep}
            />
          </View>

          {step === 1 ? (
            <>
              <Text style={styles.title}>Chọn nội dung gốc</Text>
              <Text style={styles.description}>Dùng cốt truyện hoặc truyện chữ đã hoàn thành để phát triển thành truyện tranh.</Text>
              <View style={styles.sourceGrid}>
                {sources.map((source) => {
                  const active = `${source.type}:${source.id}` === selectedKey;
                  return (
                    <TouchableOpacity key={`${source.type}:${source.id}`} style={[styles.sourceCard, active && styles.sourceCardActive]} onPress={() => setSelectedKey(`${source.type}:${source.id}`)}>
                      <Ionicons name={source.type === 'plot' ? 'map-outline' : 'document-text-outline'} size={30} color={active ? '#FFF' : '#FF5E97'} />
                      <Text style={[styles.sourceTitle, active && styles.sourceTitleActive]}>{source.title}</Text>
                      <Text style={[styles.sourceType, active && styles.sourceTypeActive]}>{source.description}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Text style={styles.title}>Chọn nét vẽ</Text>
              <Text style={styles.description}>Dùng cùng bộ nét vẽ của Xưởng vẽ. Phong cách đã chọn sẽ được giữ thống nhất trên toàn bộ trang truyện.</Text>
              <View style={[styles.styleGrid, !responsive.isTabletUp && styles.styleGridCompact]}>
                {ART_STYLES.map((style) => (
                  <TouchableOpacity key={style.id} style={[styles.styleCard, { width: responsive.isTabletUp ? '48%' : '100%' }, artStyleId === style.id && styles.optionActive]} onPress={() => setArtStyleId(style.id)}>
                    <Image source={style.thumbnail} style={styles.styleThumbnail} contentFit="cover" />
                    <View style={styles.styleInfo}>
                      <Text style={styles.optionTitle}>{style.labelVi}</Text>
                      <Text style={styles.styleDescription}>{style.descriptionVi}</Text>
                    </View>
                    {artStyleId === style.id ? <View style={styles.selectedMark}><Ionicons name="checkmark" size={16} color="#FFF" /></View> : null}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Text style={styles.title}>Chọn bố cục trang truyện</Text>
              <Text style={styles.description}>Chọn số khung, sau đó chọn cách sắp xếp em thích. AI sẽ vẽ cả trang theo đúng mẫu này trong một lần.</Text>
              <View style={styles.countFilterRow}>
                {([3, 4, 5, 6] as ComicPanelCount[]).map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[styles.countFilter, layoutCountFilter === count && styles.countFilterActive]}
                    onPress={() => {
                      setLayoutCountFilter(count);
                      setLayoutId(getDefaultComicLayoutForCount(count).id);
                    }}
                  >
                    <Text style={[styles.countFilterText, layoutCountFilter === count && styles.countFilterTextActive]}>{count} khung</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.layoutGrid}>
                {COMIC_LAYOUTS.filter((layout) => layout.panelCount === layoutCountFilter).map((layout) => {
                  const active = layout.id === layoutId;
                  return (
                    <TouchableOpacity key={layout.id} style={[styles.layoutCard, active && styles.layoutCardActive]} onPress={() => setLayoutId(layout.id)}>
                      <Image source={layout.thumbnail} style={styles.layoutThumbnail} contentFit="contain" />
                      <Text style={[styles.layoutLabel, active && styles.layoutLabelActive]}>{layout.label}</Text>
                      {active ? <View style={styles.layoutSelectedMark}><Ionicons name="checkmark" size={15} color="#FFF" /></View> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Text style={styles.title}>Nội dung từng khung</Text>
              <Text style={styles.description}>Kiểm tra cảnh, chọn nhân vật xuất hiện và ghi lời thoại dự định dùng sau.</Text>
              <View style={styles.characterPicker}>
                <View style={styles.characterPickerHeader}>
                  <View>
                    <Text style={styles.characterPickerTitle}>Nhân vật dùng trong trang</Text>
                  <Text style={styles.characterPickerHelp}>Chọn nhân vật trước, sau đó có thể bật hoặc tắt riêng trong từng khung.</Text>
                  </View>
                  <Text style={styles.characterPickerCount}>{pageCharacterIds.length} đã chọn</Text>
                </View>
                {selected?.characters.length ? (
                  <CharacterPicker
                    characters={selected.characters.map((character) => ({
                      id: character.id,
                      name: character.name,
                      imageUri: character.referenceImageUrl,
                      subtitle: character.referenceImageUrl?.startsWith('http') ? 'Có ảnh mẫu' : 'Chưa có ảnh',
                    }))}
                    selectedIds={pageCharacterIds}
                    maxSelection={selected.characters.length}
                    onToggle={(id) => {
                      const active = pageCharacterIds.includes(id);
                      const next = active
                        ? pageCharacterIds.filter((characterId) => characterId !== id)
                        : [...pageCharacterIds, id];
                      setPageCharacterIds(next);
                      setPanels((current) => current.map((panel) => ({
                        ...panel,
                        characterIds: active
                          ? panel.characterIds.filter((characterId) => characterId !== id)
                          : [...new Set([...panel.characterIds, id])],
                      })));
                      setPageImageUrl('');
                    }}
                  />
                ) : <Text style={styles.noCharacter}>Cốt truyện này chưa có nhân vật. Hãy quay lại Kho nhân vật để bổ sung.</Text>}
              </View>
              <View style={styles.panelAssistWorkspace}>
                <View style={styles.sourceReference}>
                  <View style={styles.sourceReferenceHeader}><Ionicons name="map-outline" size={18} color="#FF5E97" /><Text style={styles.sourceReferenceTitle}>Nội dung nguồn cần bám sát</Text></View>
                  {selected?.beats.map((beat, index) => (
                    <View key={index} style={styles.sourceBeat}>
                      <Text style={styles.sourceBeatNumber}>{index + 1}</Text>
                      <Text style={styles.sourceBeatText}>{beat}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.panelAiTools}>
                  <View style={styles.panelAiHeader}><Ionicons name="sparkles" size={19} color="#FF5E97" /><Text style={styles.panelAiTitle}>AI cùng em chia cảnh</Text></View>
                  <Text style={styles.panelAiText}>AI chia cảnh, chọn nhân vật và gợi ý thoại theo đúng nội dung nguồn. Em luôn có thể sửa lại.</Text>
                  <View style={styles.panelAiActions}>
                    <AikidButton variant="nav" onPress={() => void buildPanelsWithAi()} disabled={panelAiLoading !== null} leftIcon={<Ionicons name="sparkles-outline" size={16} color="#FFF" />}>
                      {panelAiLoading === 'generate' ? 'AI đang chia...' : 'AI gợi ý từng khung'}
                    </AikidButton>
                    <AikidButton variant="feature" onPress={() => void reviewPanels()} disabled={panelAiLoading !== null} leftIcon={<Ionicons name="checkmark-circle-outline" size={16} color="#475569" />}>
                      {panelAiLoading === 'review' ? 'AI đang kiểm tra...' : 'Kiểm tra bám cốt truyện'}
                    </AikidButton>
                  </View>
                  {panelReview ? <View style={styles.panelReview}><Ionicons name="shield-checkmark-outline" size={18} color="#32835F" /><Text style={styles.panelReviewText}>{panelReview}</Text></View> : null}
                </View>
              </View>
              <View style={styles.panelGrid}>
                {panels.map((panel, index) => (
                  <View key={panel.id} style={styles.panelEditor}>
                    <Text style={styles.panelBadge}>KHUNG {index + 1}</Text>
                    <Text style={styles.fieldLabel}>NỘI DUNG KHUNG TRUYỆN</Text>
                    <TextInput style={styles.contentInput} value={panel.content} onChangeText={(content) => updatePanel(panel.id, { content })} multiline />
                    <Text style={styles.fieldLabel}>NHÂN VẬT CÓ TRONG KHUNG</Text>
                    <View style={styles.characterRow}>
                      {selected?.characters.filter((character) => pageCharacterIds.includes(character.id)).length ? selected.characters.filter((character) => pageCharacterIds.includes(character.id)).map((character) => {
                        const active = panel.characterIds.includes(character.id);
                        return (
                          <TouchableOpacity key={character.id} style={[styles.characterChip, active && styles.characterChipActive]} onPress={() => updatePanel(panel.id, { characterIds: active ? panel.characterIds.filter((id) => id !== character.id) : [...panel.characterIds, character.id] })}>
                            <Text style={[styles.characterChipText, active && styles.characterChipTextActive]}>{character.name}</Text>
                          </TouchableOpacity>
                        );
                      }) : <Text style={styles.noCharacter}>Nguồn này chưa gắn nhân vật.</Text>}
                    </View>
                    <Text style={styles.fieldLabel}>LỜI THOẠI (KHÔNG BẮT BUỘC)</Text>
                    <TextInput style={styles.dialogueInput} value={panel.dialogue} onChangeText={(dialogue) => updatePanel(panel.id, { dialogue })} placeholder="Nhân vật nói gì trong khung này?" />
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {step === 5 ? (
            <>
              <Text style={styles.title}>{editingPageIndex !== null ? `Sửa trang ${editingPageIndex + 1}` : 'Tạo hình và hoàn thiện'}</Text>
              <Text style={styles.description}>{editingPageIndex !== null ? `Em có thể sửa nội dung rồi vẽ lại riêng trang ${editingPageIndex + 1}. Các trang khác vẫn được giữ nguyên.` : `Trang ${completedPages.length + 1}: tạo một trang gồm ${panels.length} khung, có cảnh và lời thoại đã chuẩn bị.`}</Text>
              <View style={[styles.pagePreviewLayout, !responsive.isTabletUp && styles.pagePreviewLayoutCompact]}>
                <View style={styles.pagePreview}>
                  {pageImageUrl
                    ? (
                      <View style={styles.pageCanvas}>
                        <Image source={{ uri: pageImageUrl }} style={styles.pageImage} contentFit="contain" />
                        {COMIC_BUBBLE_EDITOR_ENABLED && showBubbles ? <ComicDialogueOverlay bubbles={bubbles} panelCount={panels.length} /> : null}
                      </View>
                    )
                    : <View style={styles.pagePlaceholder}><Ionicons name="grid-outline" size={52} color="#C8B5A7" /><Text style={styles.pagePlaceholderTitle}>Một trang · {panels.length} khung</Text><Text style={styles.pagePlaceholderText}>Các khung sẽ được vẽ liền mạch trong cùng một trang.</Text></View>}
                </View>
                <View style={styles.readyCard}>
                  <View style={styles.readyHeader}>
                    <View style={styles.readyIcon}><Ionicons name="sparkles" size={22} color="#FF5E97" /></View>
                    <View style={styles.readyCopy}><Text style={styles.readyTitle}>Sẵn sàng vẽ trang truyện</Text><Text style={styles.readyText}>AI sẽ đặt lời thoại tự nhiên vào đúng khung và tránh che nhân vật.</Text></View>
                  </View>
                  <View style={styles.readyLine}><Ionicons name="checkmark-circle" size={18} color="#43B97F" /><Text style={styles.readyLineText}>{selectedStyle?.labelVi || 'Nét vẽ đã chọn'} · {panels.length} khung</Text></View>
                  <Text style={styles.sampleTitle}>Ảnh mẫu nhân vật</Text>
                  {referenceCharacters.length ? (
                    <View style={styles.sampleCharacters}>
                      {referenceCharacters.map((character) => (
                        <View key={character.id} style={styles.sampleCharacter}>
                          <Image source={{ uri: character.referenceImageUrl! }} style={styles.sampleImage} contentFit="cover" />
                          <Text style={styles.sampleName} numberOfLines={1}>{character.name}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.noSample}><Ionicons name="alert-circle-outline" size={18} color="#A6653A" /><Text style={styles.noSampleText}>Chưa có ảnh mẫu. Nhân vật có thể chưa giống thiết kế ban đầu.</Text></View>
                  )}
                  <View style={styles.dialogueNotice}><Ionicons name="chatbubble-ellipses-outline" size={18} color="#7C68B5" /><Text style={styles.dialogueNoticeText}>{panels.filter((panel) => panel.dialogue.trim()).length} lời thoại sẽ được đưa vào trang tranh.</Text></View>
                  {COMIC_BUBBLE_EDITOR_ENABLED && pageImageUrl ? (
                    <View style={styles.bubbleEditor}>
                      <View style={styles.bubbleEditorHeader}>
                        <Text style={styles.bubbleEditorTitle}>Lời thoại và bong bóng</Text>
                        <AikidButton size="sm" variant={showBubbles ? 'feature' : 'nav'} onPress={() => setShowBubbles((value) => !value)}>
                          {showBubbles ? 'Ẩn lời thoại' : 'Thêm lời thoại'}
                        </AikidButton>
                      </View>
                      {showBubbles ? panels.map((panel, panelIndex) => (
                        <View key={panel.id} style={styles.bubbleRow}>
                          <Text style={styles.bubbleLabel}>KHUNG {panelIndex + 1}</Text>
                          <TextInput
                            style={styles.bubbleInput}
                            value={panel.dialogue}
                            onChangeText={(dialogue) => updatePanel(panel.id, { dialogue })}
                            placeholder="Nhập lời thoại..."
                          />
                          <View style={styles.cornerChoices}>
                            {([
                              ['top-left', '↖'],
                              ['top-right', '↗'],
                              ['bottom-left', '↙'],
                              ['bottom-right', '↘'],
                            ] as [BubbleCorner, string][]).map(([corner, icon]) => {
                              const active = (bubbleCorners[panel.id] || (panelIndex % 2 === 0 ? 'top-right' : 'top-left')) === corner;
                              return (
                                <TouchableOpacity key={corner} style={[styles.cornerButton, active && styles.cornerButtonActive]} onPress={() => setBubbleCorners((current) => ({ ...current, [panel.id]: corner }))}>
                                  <Text style={[styles.cornerButtonText, active && styles.cornerButtonTextActive]}>{icon}</Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      )) : null}
                    </View>
                  ) : null}
                  {pageError ? <Text style={styles.errorText}>{pageError}</Text> : null}
                </View>
              </View>
              <View style={styles.generateActions}>
                <AikidButton variant="nav" onPress={() => void generateComicPage()} disabled={isGenerating}>{isGenerating ? 'Đang vẽ trang truyện...' : pageImageUrl ? 'Vẽ lại trang truyện' : 'Vẽ trang truyện'}</AikidButton>
                {editingPageIndex === null ? (
                  <AikidButton
                    variant="feature"
                    onPress={() => {
                      if (!pageImageUrl) return;
                      setCompletedPages((current) => [...current, { id: `page-${current.length + 1}`, imageUrl: pageImageUrl, jobId: pageJobId, layoutId, panels, bubbles }]);
                      setPanels([]);
                      setPageImageUrl('');
                      setPageJobId('');
                      setPageError('');
                      setShowBubbles(false);
                      setBubbleCorners({});
                      setStep(3);
                    }}
                    disabled={!pageImageUrl}
                  >
                    Tạo trang truyện mới
                  </AikidButton>
                ) : null}
                <AikidButton variant="cta" onPress={() => void saveComic()} disabled={!pageImageUrl}>{editingComic ? 'Lưu vào truyện' : 'Lưu truyện tranh'}</AikidButton>
              </View>
            </>
          ) : null}

          {step < 5 ? (
            <View style={styles.actions}>
              {step > 1 ? <AikidButton variant="feature" onPress={() => setStep((value) => Math.max(1, value - 1))}>Quay lại</AikidButton> : null}
              <AikidButton variant="nav" onPress={goNext}>Tiếp tục</AikidButton>
            </View>
          ) : null}
        </AikidSafeBox>
      </ScrollView>
    </AikidPage>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  workspace: { width: '100%', minHeight: 560 },
  stepper: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#EBDCD0', paddingBottom: 15, marginBottom: 20 },
  title: { color: '#475569', fontSize: 24, fontWeight: '900' },
  description: { color: '#8A7463', fontSize: 13, lineHeight: 19, marginTop: 4, marginBottom: 18 },
  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  sourceCard: { width: 240, minHeight: 155, borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 20, backgroundColor: '#FFF', padding: 16 },
  sourceCardActive: { borderColor: '#FF5E97', backgroundColor: '#FF729C' },
  sourceTitle: { color: '#475569', fontSize: 15, fontWeight: '900', marginTop: 12 },
  sourceTitleActive: { color: '#FFF' },
  sourceType: { color: '#8A7463', fontSize: 11, lineHeight: 17, marginTop: 5 },
  sourceTypeActive: { color: '#FFF4F7' },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  styleGridCompact: { alignItems: 'stretch' },
  styleCard: { position: 'relative', minWidth: 0, minHeight: 150, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 20, backgroundColor: '#FFF', padding: 10, gap: 14, overflow: 'hidden' },
  styleThumbnail: { width: 116, height: 116, borderRadius: 14, backgroundColor: '#F5EFEA' },
  styleInfo: { flex: 1, minWidth: 0 },
  styleDescription: { color: '#8A7463', fontSize: 10, lineHeight: 15, marginTop: 5 },
  selectedMark: { position: 'absolute', right: 10, top: 10, width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF5E97' },
  optionActive: { borderColor: '#FF5E97', backgroundColor: '#FFF1F5' },
  optionTitle: { color: '#475569', fontSize: 14, fontWeight: '900', marginTop: 8 },
  countFilterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  countFilter: { minWidth: 86, borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 999, backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 9, alignItems: 'center' },
  countFilterActive: { borderColor: '#FF5E97', backgroundColor: '#FF5E97' },
  countFilterText: { color: '#8A7463', fontSize: 12, fontWeight: '900' },
  countFilterTextActive: { color: '#FFF' },
  layoutGrid: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 16 },
  layoutCard: { position: 'relative', width: 156, borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 18, backgroundColor: '#FFF', padding: 10, alignItems: 'center' },
  layoutCardActive: { borderColor: '#FF5E97', backgroundColor: '#FFF1F5' },
  layoutThumbnail: { width: 118, height: 158, borderRadius: 8, backgroundColor: '#FFF' },
  layoutLabel: { color: '#67584D', fontSize: 11, fontWeight: '900', marginTop: 8 },
  layoutLabelActive: { color: '#FF5E97' },
  layoutSelectedMark: { position: 'absolute', right: 7, top: 7, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF5E97' },
  panelGrid: { gap: 14 },
  characterPicker: { borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 18, backgroundColor: '#FFF', padding: 14, marginBottom: 16 },
  characterPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  characterPickerTitle: { color: '#475569', fontSize: 15, fontWeight: '900' },
  characterPickerHelp: { color: '#8A7463', fontSize: 10, lineHeight: 15, marginTop: 4 },
  characterPickerCount: { color: '#FF5E97', fontSize: 10, fontWeight: '900', backgroundColor: '#FFF0F4', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  characterGallery: { gap: 10, paddingRight: 4 },
  characterCard: { position: 'relative', width: 132, borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 16, backgroundColor: '#FFF', padding: 8 },
  characterCardActive: { borderColor: '#FF5E97', backgroundColor: '#FFF7FA' },
  characterPhoto: { width: '100%', height: 100, borderRadius: 11, backgroundColor: '#F5EFEA' },
  characterPhotoEmpty: { width: '100%', height: 100, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5EFEA' },
  characterName: { color: '#475569', fontSize: 11, fontWeight: '900', marginTop: 7 },
  referenceBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start', borderRadius: 999, backgroundColor: '#EFFAF5', paddingHorizontal: 6, paddingVertical: 4, marginTop: 5 },
  referenceBadgeMissing: { backgroundColor: '#FFF5E9' },
  referenceBadgeText: { color: '#287456', fontSize: 8, fontWeight: '800' },
  referenceBadgeTextMissing: { color: '#A6653A' },
  characterCheck: { position: 'absolute', right: 5, top: 5, width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF5E97' },
  panelAssistWorkspace: { flexDirection: 'row', alignItems: 'stretch', flexWrap: 'wrap', gap: 14, marginBottom: 16 },
  sourceReference: { flex: 1, minWidth: 340, borderWidth: 1.5, borderColor: '#FFD5E0', borderRadius: 18, backgroundColor: '#FFF7FA', padding: 14 },
  sourceReferenceHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  sourceReferenceTitle: { color: '#475569', fontSize: 14, fontWeight: '900' },
  sourceBeat: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  sourceBeatNumber: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFE1E9', color: '#FF5E97', fontSize: 10, lineHeight: 22, fontWeight: '900', textAlign: 'center' },
  sourceBeatText: { flex: 1, color: '#66584F', fontSize: 10, lineHeight: 15 },
  panelAiTools: { flex: 1, minWidth: 340, borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 18, backgroundColor: '#FFF', padding: 14 },
  panelAiHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  panelAiTitle: { color: '#475569', fontSize: 14, fontWeight: '900' },
  panelAiText: { color: '#8A7463', fontSize: 11, lineHeight: 17, marginTop: 7 },
  panelAiActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  panelReview: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, borderRadius: 13, backgroundColor: '#EFFAF5', padding: 10, marginTop: 12 },
  panelReviewText: { flex: 1, color: '#287456', fontSize: 10, lineHeight: 16, fontWeight: '700' },
  panelEditor: { borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 18, backgroundColor: '#FFF', padding: 16 },
  panelBadge: { color: '#FF5E97', fontSize: 10, fontWeight: '900', marginBottom: 9 },
  fieldLabel: { color: '#8A7463', fontSize: 9, fontWeight: '900', marginBottom: 5, marginTop: 7 },
  contentInput: { minHeight: 72, borderWidth: 1, borderColor: '#EBDCD0', borderRadius: 12, color: '#475569', fontSize: 13, lineHeight: 19, padding: 10 },
  characterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  characterChip: { borderWidth: 1, borderColor: '#EBDCD0', borderRadius: 999, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 7 },
  characterChipActive: { borderColor: '#FF5E97', backgroundColor: '#FF5E97' },
  characterChipText: { color: '#475569', fontSize: 11, fontWeight: '800' },
  characterChipTextActive: { color: '#FFF' },
  noCharacter: { color: '#A18D7F', fontSize: 11 },
  dialogueInput: { minHeight: 45, borderWidth: 1, borderColor: '#EBDCD0', borderRadius: 12, color: '#475569', fontSize: 13, paddingHorizontal: 10 },
  pagePreviewLayout: { flexDirection: 'row', alignItems: 'stretch', gap: 16 },
  pagePreviewLayoutCompact: { flexDirection: 'column' },
  pagePreview: { flex: 1.15, minWidth: 0, minHeight: 420, borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 18, backgroundColor: '#F5EFEA', overflow: 'hidden' },
  pageCanvas: { position: 'relative', width: '100%', aspectRatio: 1, minHeight: 420, backgroundColor: '#F5EFEA' },
  pageImage: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%', backgroundColor: '#F5EFEA' },
  pagePlaceholder: { flex: 1, minHeight: 420, alignItems: 'center', justifyContent: 'center', padding: 24 },
  pagePlaceholderTitle: { color: '#475569', fontSize: 18, fontWeight: '900', marginTop: 12 },
  pagePlaceholderText: { maxWidth: 300, color: '#8A7463', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  readyCard: { flex: 0.85, minWidth: 0, borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 18, backgroundColor: '#FFF', padding: 16 },
  readyHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  readyIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F4' },
  readyCopy: { flex: 1, minWidth: 0 },
  readyTitle: { color: '#475569', fontSize: 17, fontWeight: '900' },
  readyText: { color: '#8A7463', fontSize: 11, lineHeight: 17, marginTop: 4 },
  readyLine: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 12, backgroundColor: '#EFFAF5', padding: 10, marginTop: 15 },
  readyLineText: { flex: 1, color: '#287456', fontSize: 11, fontWeight: '800' },
  sampleTitle: { color: '#475569', fontSize: 12, fontWeight: '900', marginTop: 17, marginBottom: 9 },
  sampleCharacters: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sampleCharacter: { width: 94, borderWidth: 1.5, borderColor: '#FFD5E0', borderRadius: 14, backgroundColor: '#FFF7FA', padding: 6 },
  sampleImage: { width: '100%', height: 78, borderRadius: 9, backgroundColor: '#F5EFEA' },
  sampleName: { color: '#475569', fontSize: 9, fontWeight: '900', textAlign: 'center', marginTop: 6 },
  noSample: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 12, backgroundColor: '#FFF5E9', padding: 10 },
  noSampleText: { flex: 1, color: '#A6653A', fontSize: 10, lineHeight: 15, fontWeight: '700' },
  dialogueNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, borderRadius: 12, backgroundColor: '#F5F2FF', padding: 10, marginTop: 14 },
  dialogueNoticeText: { flex: 1, color: '#695796', fontSize: 10, lineHeight: 16, fontWeight: '700' },
  bubbleEditor: { borderTopWidth: 1, borderTopColor: '#EBDCD0', marginTop: 15, paddingTop: 14 },
  bubbleEditorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  bubbleEditorTitle: { color: '#475569', fontSize: 13, fontWeight: '900' },
  bubbleRow: { borderRadius: 13, backgroundColor: '#FFF8F3', padding: 10, marginTop: 9 },
  bubbleLabel: { color: '#FF5E97', fontSize: 9, fontWeight: '900', marginBottom: 5 },
  bubbleInput: { minHeight: 42, borderWidth: 1, borderColor: '#EBDCD0', borderRadius: 10, backgroundColor: '#FFF', color: '#475569', fontSize: 11, paddingHorizontal: 9 },
  cornerChoices: { flexDirection: 'row', gap: 6, marginTop: 7 },
  cornerButton: { width: 34, height: 30, borderWidth: 1, borderColor: '#EBDCD0', borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  cornerButtonActive: { borderColor: '#FF5E97', backgroundColor: '#FF5E97' },
  cornerButtonText: { color: '#8A7463', fontSize: 15, fontWeight: '900' },
  cornerButtonTextActive: { color: '#FFF' },
  errorText: { color: '#D64545', fontSize: 10, marginTop: 7 },
  generateActions: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, borderTopWidth: 1, borderTopColor: '#EBDCD0', paddingTop: 16, marginTop: 20 },
});
