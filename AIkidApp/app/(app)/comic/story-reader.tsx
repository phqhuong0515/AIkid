import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ComicPanel, useComicDraft } from '@/features/comic/store/useComicDraft';
import { COMIC_BUBBLE_EDITOR_ENABLED, ComicBubble, ComicDialogueOverlay } from '@/features/comic/ComicDialogueOverlay';
import { listRemoteComicStories } from '@/features/comic/api/comicRemoteLibrary';
import { useFamily } from '@/features/family/store/useFamily';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { AikidButton, AikidIcon, AikidPage, AikidSafeBox } from '@/ui';

type StoredTextStory = {
  id: string;
  title: string;
  opening?: string;
  development?: string;
  ending?: string;
  content?: string;
  createdAt?: string;
};
type StoredComicStory = {
  id: string;
  title: string;
  artStyle?: string;
  pages?: {
    id: string;
    imageUrl?: string;
    panels?: { id: string; content: string; dialogue?: string }[];
    bubbles?: ComicBubble[];
  }[];
  panels?: { id: string; content: string; dialogue?: string; imageUrl?: string }[];
};

const TEXT_STORY_KEY = 'aikid.comic.text-stories.v1';

export default function StoryReaderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; type?: string }>();
  const childId = useFamily((state) => state.activeChildId);
  const ipId = useWorkspace((state) => state.activeIpId);
  const hydrate = useComicDraft((state) => state.hydrate);
  const library = useComicDraft((state) => state.library);
  const project = useComicDraft((state) => state.project);
  const loadFromLibrary = useComicDraft((state) => state.loadFromLibrary);
  const updateLibraryItem = useComicDraft((state) => state.updateLibraryItem);
  const [textStory, setTextStory] = useState<StoredTextStory | null>(null);
  const [comicStory, setComicStory] = useState<StoredComicStory | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeComicPage, setActiveComicPage] = useState(0);
  const [textDraft, setTextDraft] = useState({ opening: '', development: '', ending: '' });
  const [panelDrafts, setPanelDrafts] = useState<ComicPanel[]>([]);

  useEffect(() => {
    void hydrate();
    if (params.type === 'comic') {
      void AsyncStorage.getItem('aikid.comic.stories.v1').then(async (raw) => {
        try {
          const stories = raw ? JSON.parse(raw) : [];
          const localStory = Array.isArray(stories) ? stories.find((story) => story.id === params.id) || null : null;
          if (localStory) {
            setComicStory(localStory);
          } else if (ipId) {
            const remoteStories = await listRemoteComicStories({ ipId, childId });
            setComicStory(remoteStories.find((story) => story.id === params.id || story.remoteAssetId === params.id) as StoredComicStory || null);
          } else {
            setComicStory(null);
          }
        } catch {
          setComicStory(null);
        } finally {
          setLoaded(true);
        }
      });
      return;
    }
    if (params.type !== 'text') {
      setLoaded(true);
      return;
    }
    void AsyncStorage.getItem(TEXT_STORY_KEY).then((raw) => {
      try {
        const stories = raw ? JSON.parse(raw) : [];
        const found = Array.isArray(stories) ? stories.find((story) => story.id === params.id) || null : null;
        setTextStory(found);
        setTextDraft({ opening: found?.opening || '', development: found?.development || '', ending: found?.ending || '' });
      } finally {
        setLoaded(true);
      }
    });
  }, [childId, hydrate, ipId, params.id, params.type]);

  const plot = useMemo(() => {
    if (params.type !== 'plot') return null;
    if (params.id === 'current-draft') return project;
    return library.find((item) => item.versionId === params.id) || null;
  }, [library, params.id, params.type, project]);

  useEffect(() => {
    setPanelDrafts(plot?.pages[0]?.panels || []);
  }, [plot]);

  const title = textStory?.title || comicStory?.title || plot?.title || plot?.pages[0]?.title || 'Nội dung truyện';
  const plotPage = plot?.pages[0];
  const comicPages = comicStory?.pages?.filter((page) => page.imageUrl) || [];
  const currentComicPage = comicPages[activeComicPage];
  const storyFramework = useMemo(() => {
    if (!plot) return [];
    const plan = plot.storyPlan;
    if (!plan) {
      return (plot.pages[0]?.panels || []).map((panel, index) => ({
        label: ['Mở thế giới', 'Biến cố khởi phát', 'Cao trào', 'Hạ màn'][index] || `Nhịp ${index + 1}`,
        source: `Dữ liệu cũ · Mốc ${index + 1}`,
        content: panel.action || 'Chưa có nội dung',
      }));
    }
    const mainCharacter = plot.cast.find((character) => character.role === 'main')?.name
      || plot.cast[0]?.name
      || 'Nhân vật chính';
    const companions = plot.cast
      .filter((character) => character.name !== mainCharacter)
      .map((character) => character.name)
      .join(', ');
    return [
      {
        label: 'Mở thế giới',
        source: 'Từ bước 1–4',
        content: `${mainCharacter}${companions ? ` cùng ${companions}` : ''} xuất hiện trong một câu chuyện ${plot.genre.toLocaleLowerCase('vi')}, vào ${plan.time.toLocaleLowerCase('vi')} ${plan.setting.toLocaleLowerCase('vi')}. Khi ấy, ${mainCharacter} đang ${plan.openingAction.toLocaleLowerCase('vi')} với tâm trạng ${plan.openingEmotion.toLocaleLowerCase('vi')}.`,
      },
      {
        label: 'Biến cố khởi phát',
        source: 'Từ bước 5',
        content: `${plan.unexpectedEvent}. Biến cố này phá vỡ trạng thái ban đầu và khiến ${mainCharacter} ${plan.reaction.toLocaleLowerCase('vi')}.`,
      },
      {
        label: 'Mục tiêu hành động',
        source: 'Từ bước 6',
        content: `Sau biến cố, ${mainCharacter} quyết định ${plan.purpose.toLocaleLowerCase('vi')}. Đây là mục tiêu dẫn dắt toàn bộ phần giữa của câu chuyện.`,
      },
      {
        label: 'Chuỗi thử thách',
        source: 'Từ bước 7',
        content: `Trên đường thực hiện mục tiêu, ${mainCharacter} gặp khó khăn: ${plan.obstacle.toLocaleLowerCase('vi')}. Nhân vật lựa chọn ${plan.attempt.toLocaleLowerCase('vi')}, khiến tình huống tiếp tục phát triển.`,
      },
      {
        label: 'Cao trào',
        source: 'Từ bước 8',
        content: `Mọi xung đột hội tụ khi ${mainCharacter} phải ${plan.climax.toLocaleLowerCase('vi')}. Đây là khoảnh khắc quyết định nhân vật có đạt được mục tiêu hay không.`,
      },
      {
        label: 'Hạ màn và bài học',
        source: 'Từ bước 9–10',
        content: `${plan.ending}. Sau hành trình, ${mainCharacter} hiểu rằng ${plan.lesson.toLocaleLowerCase('vi')}.`,
      },
    ];
  }, [plot]);

  useEffect(() => {
    setActiveComicPage((current) => Math.min(current, Math.max(0, comicPages.length - 1)));
  }, [comicPages.length]);

  const editComicPage = (pageIndex: number) => {
    if (!comicStory) return;
    router.push({
      pathname: '/(app)/comic/story-comic',
      params: {
        comicStoryId: comicStory.id,
        editPage: String(pageIndex),
      },
    });
  };

  const addComicPage = () => {
    if (!comicStory) return;
    router.push({
      pathname: '/(app)/comic/story-comic',
      params: {
        comicStoryId: comicStory.id,
        appendPage: '1',
      },
    });
  };

  const saveEdits = async () => {
    if (textStory) {
      const raw = await AsyncStorage.getItem(TEXT_STORY_KEY);
      const stories = raw ? JSON.parse(raw) : [];
      const updated = Array.isArray(stories) ? stories.map((story) => story.id === textStory.id
        ? { ...story, ...textDraft, content: [textDraft.opening, textDraft.development, textDraft.ending].filter(Boolean).join('\n\n') }
        : story) : [];
      await AsyncStorage.setItem(TEXT_STORY_KEY, JSON.stringify(updated));
      setTextStory({ ...textStory, ...textDraft, content: [textDraft.opening, textDraft.development, textDraft.ending].filter(Boolean).join('\n\n') });
    } else if (plot && plotPage && params.id && params.id !== 'current-draft') {
      await updateLibraryItem(params.id, {
        pages: plot.pages.map((page) => page.id === plotPage.id ? { ...page, panels: panelDrafts } : page),
      });
    }
    setEditing(false);
    Alert.alert('Đã lưu', 'Nội dung chỉnh sửa đã được cập nhật.');
  };

  const renderTextStory = () => editing ? (
    <View style={styles.editStack}>
      {([
        ['opening', 'MỞ ĐẦU'],
        ['development', 'DIỄN BIẾN'],
        ['ending', 'KẾT THÚC'],
      ] as const).map(([key, label]) => (
        <View key={key}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TextInput
            style={styles.editor}
            value={textDraft[key]}
            onChangeText={(value) => setTextDraft((current) => ({ ...current, [key]: value }))}
            multiline
            textAlignVertical="top"
          />
        </View>
      ))}
    </View>
  ) : (
    <View style={styles.paper}>
      {[textStory?.opening, textStory?.development, textStory?.ending].filter(Boolean).map((paragraph, index) => (
        <Text key={index} style={styles.paragraph}>{paragraph}</Text>
      ))}
    </View>
  );

  const renderPlot = () => (
    <View style={styles.plotContent}>
      <View style={styles.frameworkHeader}>
        <View>
          <Text style={styles.beatsTitle}>Khung câu chuyện</Text>
          <Text style={styles.frameworkDescription}>Sáu nhịp kể chuyện được tổng hợp từ 10 lựa chọn, dùng làm dàn khung để phát triển thành truyện chữ hoặc truyện tranh.</Text>
        </View>
        <View style={styles.frameworkBadge}><Text style={styles.frameworkBadgeText}>6 NHỊP KỂ CHUYỆN</Text></View>
      </View>
      <View style={styles.beatGrid}>
        {storyFramework.map((item, index) => (
          <View key={`${index}-${item.label}`} style={styles.beatCard}>
            <View style={styles.beatNumber}><Text style={styles.beatNumberText}>{index + 1}</Text></View>
            <Text style={styles.beatRole}>{item.label.toUpperCase()}</Text>
            <Text style={styles.beatSource}>{item.source}</Text>
            <Text style={styles.beatAction}>{item.content}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <AikidPage scene="comic" title={title} backHref="/(app)/comic/library-v2" container="wide" scroll={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AikidSafeBox variant="panel" style={styles.reader}>
          {loaded && (textStory || comicStory || plot) ? (
            <>
              <View style={styles.header}>
                <View style={styles.iconBox}><Ionicons name={comicStory ? 'images-outline' : textStory ? 'document-text-outline' : 'map-outline'} size={28} color="#FF5E97" /></View>
                <View style={styles.headerCopy}>
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.meta}>{comicStory ? `TRUYỆN TRANH · ${comicStory.artStyle || 'TỰ DO'}` : textStory ? 'TRUYỆN CHỮ' : `CỐT TRUYỆN · ${plot?.genre || 'TỰ DO'}`}</Text>
                </View>
                <View style={styles.headerActions}>
                  {comicStory ? (
                    <>
                      <AikidButton variant="feature" onPress={() => editComicPage(activeComicPage)} leftIcon={<Ionicons name="pencil-outline" size={16} color="#475569" />}>Sửa trang này</AikidButton>
                      <AikidButton variant="nav" onPress={addComicPage} leftIcon={<Ionicons name="add" size={18} color="#FFF" />}>Thêm trang</AikidButton>
                    </>
                  ) : editing ? (
                    <>
                      <AikidButton variant="feature" onPress={() => setEditing(false)}>Hủy</AikidButton>
                      <AikidButton variant="nav" onPress={() => void saveEdits()} leftIcon={<AikidIcon name="save" size={16} color="#FFF" />}>Lưu thay đổi</AikidButton>
                    </>
                  ) : plot ? (
                    <AikidButton
                      variant="feature"
                      onPress={() => {
                        if (params.id && params.id !== 'current-draft') loadFromLibrary(params.id);
                        router.push({
                          pathname: '/(app)/comic/idea-v2',
                          params: { genre: plot.genre, mode: 'text', edit: '1' },
                        });
                      }}
                      leftIcon={<Ionicons name="pencil-outline" size={16} color="#475569" />}
                    >
                      Chỉnh sửa 10 bước
                    </AikidButton>
                  ) : !comicStory ? (
                    <AikidButton variant="feature" onPress={() => setEditing(true)} leftIcon={<Ionicons name="pencil-outline" size={16} color="#475569" />}>Chỉnh sửa</AikidButton>
                  ) : null}
                </View>
              </View>

              {comicStory ? (
                comicPages.length && currentComicPage ? (
                  <View style={styles.comicPages}>
                    <View style={styles.pageToolbar}>
                      <View>
                        <Text style={styles.pageToolbarEyebrow}>ĐANG ĐỌC</Text>
                        <Text style={styles.pageToolbarTitle}>Trang {activeComicPage + 1} / {comicPages.length}</Text>
                      </View>
                      <View style={styles.pageToolbarActions}>
                        <AikidButton size="sm" variant="feature" disabled={activeComicPage === 0} onPress={() => setActiveComicPage((value) => Math.max(0, value - 1))}>← Trang trước</AikidButton>
                        <AikidButton size="sm" variant="feature" disabled={activeComicPage === comicPages.length - 1} onPress={() => setActiveComicPage((value) => Math.min(comicPages.length - 1, value + 1))}>Trang sau →</AikidButton>
                      </View>
                    </View>
                    {comicPages.length > 1 ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pageStrip}>
                        {comicPages.map((page, pageIndex) => (
                          <TouchableOpacity key={page.id || `thumb-${pageIndex}`} style={[styles.pageThumb, pageIndex === activeComicPage && styles.pageThumbActive]} onPress={() => setActiveComicPage(pageIndex)}>
                            <Image source={{ uri: page.imageUrl }} style={styles.pageThumbImage} contentFit="cover" />
                            <Text style={[styles.pageThumbLabel, pageIndex === activeComicPage && styles.pageThumbLabelActive]}>Trang {pageIndex + 1}</Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.addPageThumb} onPress={addComicPage}>
                          <Ionicons name="add" size={26} color="#FF5E97" />
                          <Text style={styles.addPageThumbText}>Thêm trang</Text>
                        </TouchableOpacity>
                      </ScrollView>
                    ) : null}
                    <View key={currentComicPage.id} style={styles.comicPage}>
                        <View style={styles.comicPageHeading}>
                          <Text style={styles.comicPageNumber}>TRANG {activeComicPage + 1}</Text>
                          <AikidButton size="sm" variant="feature" onPress={() => editComicPage(activeComicPage)} leftIcon={<Ionicons name="refresh-outline" size={15} color="#475569" />}>Sửa hoặc vẽ lại</AikidButton>
                        </View>
                        <View style={styles.comicPageCanvas}>
                          <Image source={{ uri: currentComicPage.imageUrl }} style={styles.comicPageImage} contentFit="contain" />
                          {COMIC_BUBBLE_EDITOR_ENABLED && currentComicPage.bubbles?.length ? <ComicDialogueOverlay bubbles={currentComicPage.bubbles} panelCount={currentComicPage.panels?.length || currentComicPage.bubbles.length} /> : null}
                        </View>
                        <View style={styles.pagePanelSummary}>
                          {currentComicPage.panels?.map((panel, panelIndex) => (
                            <View key={panel.id} style={styles.pagePanelRow}>
                              <Text style={styles.comicPanelNumber}>PANEL {panelIndex + 1}</Text>
                              <Text style={styles.comicPanelText}>{panel.content}</Text>
                              {panel.dialogue ? <Text style={styles.comicDialogue}>“{panel.dialogue}”</Text> : null}
                            </View>
                          ))}
                        </View>
                    </View>
                    <View style={styles.bottomPager}>
                      <AikidButton variant="feature" disabled={activeComicPage === 0} onPress={() => setActiveComicPage((value) => Math.max(0, value - 1))}>← Trang trước</AikidButton>
                      <Text style={styles.bottomPagerText}>{activeComicPage + 1} / {comicPages.length}</Text>
                      <AikidButton variant="nav" disabled={activeComicPage === comicPages.length - 1} onPress={() => setActiveComicPage((value) => Math.min(comicPages.length - 1, value + 1))}>Trang sau →</AikidButton>
                    </View>
                  </View>
                ) : (
                  <View style={styles.comicGrid}>
                    {comicStory.panels?.map((panel, index) => (
                      <View key={panel.id} style={styles.comicPanel}>
                        {panel.imageUrl ? <Image source={{ uri: panel.imageUrl }} style={styles.comicImage} contentFit="cover" /> : <View style={styles.comicImageEmpty}><Ionicons name="image-outline" size={42} color="#C8B5A7" /></View>}
                        <View style={styles.comicCaption}>
                          <Text style={styles.comicPanelNumber}>PANEL {index + 1}</Text>
                          <Text style={styles.comicPanelText}>{panel.content}</Text>
                          {panel.dialogue ? <Text style={styles.comicDialogue}>“{panel.dialogue}”</Text> : null}
                        </View>
                      </View>
                    ))}
                  </View>
                )
              ) : textStory ? renderTextStory() : renderPlot()}

              {!editing && !comicStory ? (
                <View style={styles.convertActions}>
                  {plot ? (
                    <>
                      <AikidButton variant="nav" onPress={() => router.push({ pathname: '/(app)/comic/story-text', params: { plotId: params.id } })} leftIcon={<Ionicons name="document-text-outline" size={17} color="#FFF" />}>Viết thành truyện chữ</AikidButton>
                      <AikidButton variant="cta" onPress={() => router.push({ pathname: '/(app)/comic/story-comic', params: { plotId: params.id } })} leftIcon={<Ionicons name="images-outline" size={17} color="#FFF" />}>Tạo truyện tranh</AikidButton>
                    </>
                  ) : (
                    <AikidButton variant="cta" onPress={() => router.push({ pathname: '/(app)/comic/story-comic', params: { textStoryId: params.id } })} leftIcon={<Ionicons name="images-outline" size={17} color="#FFF" />}>Chuyển thành truyện tranh</AikidButton>
                  )}
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.notFound}><Ionicons name="document-outline" size={52} color="#C8B5A7" /><Text style={styles.notFoundTitle}>{loaded ? 'Không tìm thấy truyện' : 'Đang mở truyện...'}</Text></View>
          )}
        </AikidSafeBox>
      </ScrollView>
    </AikidPage>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 28 },
  reader: { width: '100%', minHeight: 520 },
  header: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14, borderBottomWidth: 1, borderBottomColor: '#EBDCD0', paddingBottom: 18, marginBottom: 20 },
  iconBox: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F4' },
  headerCopy: { flex: 1, minWidth: 240 },
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  title: { color: '#475569', fontSize: 26, fontWeight: '900' },
  meta: { color: '#FF5E97', fontSize: 10, fontWeight: '900', letterSpacing: 0.7, marginTop: 5 },
  paper: { maxWidth: 820, width: '100%', alignSelf: 'center', borderRadius: 20, backgroundColor: '#FFFCF8', padding: 28 },
  paragraph: { color: '#475569', fontSize: 16, lineHeight: 29, marginBottom: 18 },
  editStack: { maxWidth: 900, width: '100%', alignSelf: 'center', gap: 16 },
  fieldLabel: { color: '#8A7463', fontSize: 10, fontWeight: '900', marginBottom: 5 },
  editor: { minHeight: 130, borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 16, backgroundColor: '#FFF', color: '#475569', fontSize: 14, lineHeight: 22, padding: 14 },
  plotContent: { maxWidth: 960, width: '100%', alignSelf: 'center' },
  plotSummary: { borderRadius: 16, backgroundColor: '#FFF7F1', padding: 16, marginBottom: 20 },
  plotSummaryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  plotSummaryLabel: { color: '#FF5E97', fontSize: 10, fontWeight: '900', marginBottom: 6 },
  plotSummaryCount: { color: '#FF5E97', fontSize: 10, fontWeight: '900', borderRadius: 999, backgroundColor: '#FFE7EF', paddingHorizontal: 10, paddingVertical: 5 },
  originalIdeaGrid: { gap: 8 },
  originalIdeaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.72)', padding: 10 },
  originalIdeaNumber: { width: 24, height: 24, borderRadius: 12, color: '#FFF', backgroundColor: '#FF7597', textAlign: 'center', lineHeight: 24, fontSize: 10, fontWeight: '900' },
  originalIdeaCopy: { flex: 1, minWidth: 0 },
  originalIdeaLabel: { color: '#FF5E97', fontSize: 9, fontWeight: '900', letterSpacing: 0.4, marginBottom: 3 },
  plotSummaryText: { color: '#475569', fontSize: 14, lineHeight: 22 },
  beatsTitle: { color: '#475569', fontSize: 19, fontWeight: '900', marginBottom: 12 },
  frameworkHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  frameworkDescription: { maxWidth: 620, color: '#8A7463', fontSize: 12, lineHeight: 18, marginTop: -7 },
  frameworkBadge: { borderRadius: 999, backgroundColor: '#FFF0F4', paddingHorizontal: 12, paddingVertical: 7 },
  frameworkBadgeText: { color: '#FF5E97', fontSize: 9, fontWeight: '900' },
  beatGrid: { gap: 12 },
  beatCard: { position: 'relative', borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 18, backgroundColor: '#FFF', padding: 16, paddingLeft: 58 },
  beatNumber: { position: 'absolute', left: 14, top: 15, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF5E97' },
  beatNumberText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  beatRole: { color: '#FF5E97', fontSize: 10, fontWeight: '900', letterSpacing: 0.5, marginBottom: 6 },
  beatSource: { alignSelf: 'flex-start', color: '#8A7463', fontSize: 9, fontWeight: '800', borderRadius: 999, backgroundColor: '#FFF4EE', paddingHorizontal: 8, paddingVertical: 4, marginBottom: 7 },
  beatAction: { color: '#475569', fontSize: 14, lineHeight: 21, fontWeight: '700' },
  beatEditor: { minHeight: 70, borderWidth: 1, borderColor: '#EBDCD0', borderRadius: 12, color: '#475569', padding: 10, marginBottom: 10 },
  convertActions: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10, borderTopWidth: 1, borderTopColor: '#EBDCD0', paddingTop: 18, marginTop: 22 },
  comicGrid: { maxWidth: 980, width: '100%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  comicPages: { maxWidth: 980, width: '100%', alignSelf: 'center', gap: 24 },
  pageToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderRadius: 16, backgroundColor: '#FFF7F1', padding: 14 },
  pageToolbarEyebrow: { color: '#FF5E97', fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  pageToolbarTitle: { color: '#475569', fontSize: 18, fontWeight: '900', marginTop: 3 },
  pageToolbarActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pageStrip: { gap: 10, paddingVertical: 2 },
  pageThumb: { width: 108, borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 14, backgroundColor: '#FFF', padding: 5 },
  pageThumbActive: { borderColor: '#FF5E97', backgroundColor: '#FFF0F4' },
  pageThumbImage: { width: '100%', aspectRatio: 1, borderRadius: 9, backgroundColor: '#F5EFEA' },
  pageThumbLabel: { color: '#8A7463', fontSize: 10, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  pageThumbLabelActive: { color: '#FF5E97' },
  addPageThumb: { width: 108, minHeight: 138, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#FF9DBC', borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF8FB' },
  addPageThumbText: { color: '#FF5E97', fontSize: 10, fontWeight: '900', marginTop: 5 },
  comicPage: { borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 20, backgroundColor: '#FFF', padding: 16 },
  comicPageHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  comicPageNumber: { color: '#FF5E97', fontSize: 11, fontWeight: '900' },
  comicPageCanvas: { position: 'relative', width: '100%', aspectRatio: 1, maxHeight: 900, borderRadius: 14, backgroundColor: '#F5EFEA', overflow: 'hidden' },
  comicPageImage: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%', backgroundColor: '#F5EFEA' },
  pagePanelSummary: { gap: 10, marginTop: 14 },
  pagePanelRow: { borderRadius: 12, backgroundColor: '#FFF8F3', padding: 12 },
  comicPanel: { width: '48%', minWidth: 320, borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 18, backgroundColor: '#FFF', overflow: 'hidden' },
  comicImage: { width: '100%', height: 300, backgroundColor: '#F5EFEA' },
  comicImageEmpty: { width: '100%', height: 300, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5EFEA' },
  comicCaption: { padding: 14 },
  comicPanelNumber: { color: '#FF5E97', fontSize: 9, fontWeight: '900', marginBottom: 6 },
  comicPanelText: { color: '#475569', fontSize: 12, lineHeight: 18 },
  comicDialogue: { color: '#8A5B74', fontSize: 12, lineHeight: 18, fontStyle: 'italic', marginTop: 7 },
  bottomPager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12 },
  bottomPagerText: { minWidth: 64, color: '#475569', fontSize: 13, fontWeight: '900', textAlign: 'center' },
  notFound: { flex: 1, minHeight: 400, alignItems: 'center', justifyContent: 'center' },
  notFoundTitle: { color: '#8A7463', fontSize: 18, fontWeight: '800', marginTop: 12 },
});
