import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useComicDraft } from '@/features/comic/store/useComicDraft';
import { editStoryTextAgainstPlot, generateOutlineFromPlot, generateStoryWritingAssist, reviewOutlineAgainstPlot, StoryWritingStage } from '@/features/comic/api/generateStoryWritingAssist';
import { usePopSound } from '@/hooks/usePopSound';
import { AikidButton, AikidIcon, AikidPage, AikidSafeBox, AikidStepNavigator } from '@/ui';

const TEXT_STEPS = ['Chọn cốt truyện', 'Chế độ viết', 'Dàn ý 3 phần', 'Mở đầu', 'Diễn biến', 'Kết thúc', 'Biên tập'] as const;
type WritingMode = 'self' | 'ai';

export default function StoryTextScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ plotId?: string }>();
  const { playPop } = usePopSound();
  const hydrate = useComicDraft((state) => state.hydrate);
  const hydrated = useComicDraft((state) => state.hydrated);
  const library = useComicDraft((state) => state.library);
  const project = useComicDraft((state) => state.project);

  const [step, setStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [selectedPlotId, setSelectedPlotId] = useState('');
  const [mode, setMode] = useState<WritingMode | null>(null);
  const [outline, setOutline] = useState({ opening: '', development: '', ending: '' });
  const [opening, setOpening] = useState('');
  const [development, setDevelopment] = useState('');
  const [ending, setEnding] = useState('');
  const [aiLoadingStage, setAiLoadingStage] = useState<StoryWritingStage | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Partial<Record<StoryWritingStage, string>>>({});
  const [outlineAiLoading, setOutlineAiLoading] = useState<'generate' | 'review' | null>(null);
  const [outlineReview, setOutlineReview] = useState('');
  const [editorAiLoading, setEditorAiLoading] = useState(false);
  const [editedStorySuggestion, setEditedStorySuggestion] = useState('');

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrate, hydrated]);

  const plots = useMemo(() => {
    const saved = library.filter((item) => item.pages.some((page) => page.idea.trim()));
    if (saved.length) return saved;
    return project.pages.some((page) => page.idea.trim()) ? [{ ...project, versionId: 'current-draft', version: 0, savedAt: project.updatedAt }] : [];
  }, [library, project]);

  const selectedPlot = plots.find((item) => item.versionId === selectedPlotId);
  const hasPlot = plots.length > 0;

  useEffect(() => {
    if (params.plotId && plots.some((item) => item.versionId === params.plotId)) {
      setSelectedPlotId(params.plotId);
    }
  }, [params.plotId, plots]);

  const goNext = () => {
    playPop();
    if (step === 1 && !selectedPlotId) return Alert.alert('Chọn cốt truyện', 'Hãy chọn một cốt truyện trước.');
    if (step === 2 && !mode) return Alert.alert('Chọn chế độ viết', 'Hãy chọn Tự viết hoặc Viết cùng AI.');
    if (step === 3 && (!outline.opening.trim() || !outline.development.trim() || !outline.ending.trim())) {
      return Alert.alert('Dàn ý chưa hoàn thành', 'Hãy hoàn thành đủ Mở đầu, Diễn biến và Kết thúc trước khi viết truyện.');
    }
    if (step < TEXT_STEPS.length) {
      const nextStep = step + 1;
      setStep(nextStep);
      setMaxVisitedStep((current) => Math.max(current, nextStep));
    }
  };

  const plotFramework = useMemo(() => {
    const page = selectedPlot?.pages[0];
    if (!page) return '';
    return [
      `Nhân vật: ${selectedPlot.cast.map((character) => `${character.name} (${character.role === 'main' ? 'chính' : 'phụ'}; ${character.personality})`).join('; ') || 'Chưa chọn'}`,
      `Ý tưởng gốc: ${page.idea}`,
      ...page.panels.map((beat, index) => `${index + 1}. ${beat.action}`),
    ].join('\n');
  }, [selectedPlot]);

  const buildOutlineWithAi = async () => {
    if (!plotFramework) return;
    setOutlineAiLoading('generate');
    setOutlineReview('');
    try {
      setOutline(await generateOutlineFromPlot(plotFramework));
      setOutlineReview('AI đã dựng dàn ý từ đúng bốn mốc cốt truyện. Em có thể chỉnh câu chữ nhưng nên giữ nguyên các sự kiện chính.');
      playPop();
    } catch (error) {
      Alert.alert('AI chưa thể dựng dàn ý', error instanceof Error ? error.message : 'Hãy thử lại sau.');
    } finally {
      setOutlineAiLoading(null);
    }
  };

  const reviewOutline = async () => {
    if (!outline.opening.trim() || !outline.development.trim() || !outline.ending.trim()) {
      return Alert.alert('Dàn ý chưa hoàn thành', 'Hãy nhập đủ ba phần để AI kiểm tra.');
    }
    setOutlineAiLoading('review');
    try {
      setOutlineReview(await reviewOutlineAgainstPlot(plotFramework, outline));
      playPop();
    } catch (error) {
      Alert.alert('AI chưa thể kiểm tra', error instanceof Error ? error.message : 'Hãy thử lại sau.');
    } finally {
      setOutlineAiLoading(null);
    }
  };

  const editStoryWithAi = async () => {
    const storyText = [opening, development, ending].filter(Boolean).join('\n\n');
    if (!storyText.trim()) return Alert.alert('Chưa có nội dung', 'Hãy viết truyện trước khi nhờ AI biên tập.');
    setEditorAiLoading(true);
    try {
      setEditedStorySuggestion(await editStoryTextAgainstPlot(plotFramework, storyText));
      playPop();
    } catch (error) {
      Alert.alert('AI chưa thể biên tập', error instanceof Error ? error.message : 'Hãy thử lại sau.');
    } finally {
      setEditorAiLoading(false);
    }
  };

  const applyEditedStory = () => {
    const paragraphs = editedStorySuggestion.split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean);
    if (paragraphs.length < 3) {
      return Alert.alert('Chưa thể áp dụng', 'Bản biên tập chưa tách đủ Mở đầu, Diễn biến và Kết thúc.');
    }
    setOpening(paragraphs[0] || '');
    setDevelopment(paragraphs.length > 2 ? paragraphs.slice(1, -1).join('\n\n') : paragraphs[1] || '');
    setEnding(paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : '');
    setEditedStorySuggestion('');
    playPop();
  };

  const saveStory = async () => {
    if (!selectedPlot) return;
    const raw = await AsyncStorage.getItem('aikid.comic.text-stories.v1');
    const current = raw ? JSON.parse(raw) : [];
    const createdAt = new Date().toISOString();
    const story = {
      id: `text-${createdAt}`,
      plotVersionId: selectedPlot.versionId,
      title: selectedPlot.title || selectedPlot.pages[0]?.title || 'Truyện chữ của em',
      characters: selectedPlot.cast,
      mode,
      outline,
      opening,
      development,
      ending,
      content: [opening, development, ending].filter(Boolean).join('\n\n'),
      createdAt,
    };
    await AsyncStorage.setItem('aikid.comic.text-stories.v1', JSON.stringify([story, ...(Array.isArray(current) ? current : [])]));
    playPop();
    router.replace({ pathname: '/(app)/comic/library-v2', params: { tab: 'text' } });
  };

  const requestAiSuggestion = async (stage: StoryWritingStage, currentDraft: string) => {
    if (!selectedPlot) return;
    setAiLoadingStage(stage);
    try {
      const plotPage = selectedPlot.pages[0];
      const plotFramework = [
        `Nhân vật: ${selectedPlot.cast.map((character) => `${character.name} (${character.role === 'main' ? 'chính' : 'phụ'}; ${character.personality})`).join('; ')}`,
        ...(plotPage?.panels.map((beat, index) => `${index + 1}. ${beat.action}`) || []),
      ].filter(Boolean).join('\n');
      const suggestion = await generateStoryWritingAssist({
        stage,
        plot: [plotPage?.idea || selectedPlot.title || '', plotFramework].filter(Boolean).join('\n'),
        outline: outline[stage],
        currentDraft,
      });
      setAiSuggestions((current) => ({ ...current, [stage]: suggestion }));
      playPop();
    } catch (error) {
      Alert.alert('AI chưa thể hỗ trợ', error instanceof Error ? error.message : 'Hãy thử lại sau.');
    } finally {
      setAiLoadingStage(null);
    }
  };

  const renderPlotSelection = () => (
    <View>
      <Text style={styles.sectionTitle}>Chọn cốt truyện đã hoàn thành</Text>
      <Text style={styles.sectionDescription}>Truyện chữ dùng khung cốt truyện làm nền rồi phát triển thành câu chuyện dài hơn, có chi tiết, cảm xúc và chuyển tiếp.</Text>
      {!hasPlot ? (
        <View style={styles.lockedState}>
          <Ionicons name="lock-closed-outline" size={38} color="#A18D7F" />
          <Text style={styles.lockedTitle}>Chưa có cốt truyện</Text>
          <Text style={styles.lockedDescription}>Em cần hoàn thành ít nhất một cốt truyện trước khi viết truyện chữ.</Text>
          <View style={styles.lockedAction}>
            <AikidButton style={styles.lockedButton} variant="nav" onPress={() => router.push('/(app)/comic/genre-v2')}>Tạo cốt truyện</AikidButton>
          </View>
        </View>
      ) : (
        <View style={styles.plotGrid}>
          {plots.map((item) => {
            const active = item.versionId === selectedPlotId;
            const page = item.pages[0];
            return (
              <TouchableOpacity key={item.versionId} style={[styles.plotCard, active && styles.plotCardActive]} onPress={() => { playPop(); setSelectedPlotId(item.versionId); }}>
                <View style={styles.plotIcon}><Ionicons name="map-outline" size={26} color={active ? '#FFF' : '#FF5E97'} /></View>
                <Text style={[styles.plotTitle, active && styles.plotTitleActive]} numberOfLines={2}>{item.title || page?.title || 'Cốt truyện chưa đặt tên'}</Text>
                <Text style={styles.plotMeta} numberOfLines={2}>{item.genre} · {page?.idea || 'Cốt truyện đã lưu'}</Text>
                {active ? <Text style={styles.selectedBadge}>ĐÃ CHỌN</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderMode = () => (
    <View>
      <Text style={styles.sectionTitle}>Chọn chế độ viết</Text>
      <Text style={styles.sectionDescription}>Luồng hiện tại chỉ làm truyện ngắn; đã bỏ lựa chọn truyện nhiều chương.</Text>
      <View style={styles.modeGrid}>
        <TouchableOpacity style={[styles.modeCard, mode === 'self' && styles.modeCardActive]} onPress={() => { playPop(); setMode('self'); }}>
          <Ionicons name="create-outline" size={34} color="#FF5E97" />
          <Text style={styles.modeTitle}>Tự viết</Text>
          <Text style={styles.modeText}>Em tự viết từng phần, AI hỗ trợ biên tập ở cuối.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeCard, mode === 'ai' && styles.modeCardActive]} onPress={() => { playPop(); setMode('ai'); }}>
          <Ionicons name="sparkles-outline" size={34} color="#FF884D" />
          <Text style={styles.modeTitle}>Viết cùng AI</Text>
          <Text style={styles.modeText}>Trả lời gợi ý, tự viết bản đầu rồi AI hỗ trợ chỉnh câu chữ.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const writingField = (
    stage: StoryWritingStage,
    title: string,
    description: string,
    questions: string[],
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
  ) => (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
      {mode === 'ai' ? (
        <View style={styles.aiAssistant}>
          <View style={styles.aiAssistantHeader}>
            <View style={styles.aiAssistantTitleRow}>
              <Ionicons name="sparkles" size={19} color="#FF6B8E" />
              <Text style={styles.aiAssistantTitle}>AI hỗ trợ phần này</Text>
            </View>
            <TouchableOpacity
              style={[styles.aiAskButton, aiLoadingStage === stage && styles.aiAskButtonDisabled]}
              disabled={aiLoadingStage !== null}
              onPress={() => void requestAiSuggestion(stage, value)}
            >
              <Ionicons name="sparkles-outline" size={16} color="#FFF" />
              <Text style={styles.aiAskButtonText}>{aiLoadingStage === stage ? 'AI đang nghĩ...' : 'Nhờ AI gợi ý'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.aiPromptLabel}>Trước khi viết, em thử trả lời:</Text>
          <View style={styles.aiQuestionList}>
            {questions.map((question, index) => (
              <View key={question} style={styles.aiQuestion}>
                <Text style={styles.aiQuestionNumber}>{index + 1}</Text>
                <Text style={styles.aiQuestionText}>{question}</Text>
              </View>
            ))}
          </View>
          {aiSuggestions[stage] ? (
            <View style={styles.aiSuggestion}>
              <Text style={styles.aiSuggestionLabel}>Gợi ý của AI — em có thể sửa lại theo ý mình</Text>
              <Text style={styles.aiSuggestionText}>{aiSuggestions[stage]}</Text>
              <TouchableOpacity
                style={styles.useSuggestionButton}
                onPress={() => onChangeText(value.trim() ? `${value.trim()}\n\n${aiSuggestions[stage]}` : aiSuggestions[stage] || '')}
              >
                <Ionicons name="add-circle-outline" size={17} color="#FF5E97" />
                <Text style={styles.useSuggestionText}>Thêm vào bài viết</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : null}
      <TextInput style={styles.editor} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#A3A3A3" multiline textAlignVertical="top" />
    </View>
  );

  return (
    <AikidPage scene="comic" title="Truyện chữ" backHref="/(app)/comic/create-v2" container="wide" scroll={false} keyboardAware>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AikidSafeBox variant="panel" style={styles.workspace}>
          <View style={styles.textStepper}>
            <AikidStepNavigator
              steps={TEXT_STEPS}
              currentStep={step}
              maxVisitedStep={maxVisitedStep}
              onStepPress={(value) => {
                playPop();
                setStep(value);
              }}
            />
          </View>

          <View style={styles.content}>
            {step === 1 ? renderPlotSelection() : null}
            {step === 2 ? renderMode() : null}
            {step === 3 ? (
              <View>
                <Text style={styles.sectionTitle}>Dàn ý 3 phần</Text>
                <Text style={styles.sectionDescription}>Chuyển bốn mốc cốt truyện thành ba phần để phát triển thành truyện chữ mà không làm lệch câu chuyện.</Text>
                <View style={styles.outlineWorkspace}>
                  <View style={styles.plotReference}>
                    <View style={styles.plotReferenceHeader}>
                      <Ionicons name="map-outline" size={19} color="#FF5E97" />
                      <Text style={styles.plotReferenceTitle}>Khung cốt truyện cần bám sát</Text>
                    </View>
                    {selectedPlot?.pages[0]?.panels.map((beat, index) => (
                      <View key={beat.id} style={styles.plotReferenceBeat}>
                        <Text style={styles.plotReferenceNumber}>{index + 1}</Text>
                        <View style={styles.plotReferenceCopy}>
                          <Text style={styles.plotReferenceRole}>{['MỞ ĐẦU', 'BIẾN CỐ', 'CAO TRÀO', 'KẾT QUẢ'][index]}</Text>
                          <Text style={styles.plotReferenceText}>{beat.action}</Text>
                        </View>
                      </View>
                    ))}
                    {mode === 'ai' ? (
                      <AikidButton style={styles.outlineAiButton} variant="nav" onPress={() => void buildOutlineWithAi()} disabled={outlineAiLoading !== null} leftIcon={<Ionicons name="sparkles-outline" size={16} color="#FFF" />}>
                        {outlineAiLoading === 'generate' ? 'AI đang dựng...' : 'AI dựng dàn ý chuẩn'}
                      </AikidButton>
                    ) : (
                      <View style={styles.selfWritingNote}>
                        <Ionicons name="create-outline" size={17} color="#8A7463" />
                        <Text style={styles.selfWritingNoteText}>Chế độ Tự viết: em tự lập dàn ý, AI chỉ kiểm tra mức độ bám cốt truyện.</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.outlineForm}>
                    {(['opening', 'development', 'ending'] as const).map((key, index) => (
                      <View key={key} style={styles.outlineField}>
                        <Text style={styles.fieldLabel}>{index + 1}. {index === 0 ? 'MỞ ĐẦU · MỐC 1' : index === 1 ? 'DIỄN BIẾN · MỐC 2 + 3' : 'KẾT THÚC · MỐC 4'}</Text>
                        <TextInput style={styles.outlineInput} value={outline[key]} onChangeText={(value) => { setOutline((current) => ({ ...current, [key]: value })); setOutlineReview(''); }} placeholder="Ghi ý chính bám theo cốt truyện..." placeholderTextColor="#A3A3A3" multiline />
                      </View>
                    ))}
                    <AikidButton variant="feature" onPress={() => void reviewOutline()} disabled={outlineAiLoading !== null} leftIcon={<Ionicons name="checkmark-circle-outline" size={17} color="#475569" />}>
                      {outlineAiLoading === 'review' ? 'AI đang kiểm tra...' : 'AI kiểm tra bám cốt truyện'}
                    </AikidButton>
                    {outlineReview ? (
                      <View style={styles.outlineReview}><Ionicons name="shield-checkmark-outline" size={19} color="#3A9B70" /><Text style={styles.outlineReviewText}>{outlineReview}</Text></View>
                    ) : null}
                  </View>
                </View>
              </View>
            ) : null}
            {step === 4 ? writingField('opening', 'Viết mở đầu', 'Giới thiệu nhân vật, bối cảnh và điều khơi mào câu chuyện.', ['Nhân vật đang ở đâu và làm gì?', 'Điều gì bất ngờ bắt đầu câu chuyện?', 'Em muốn người đọc cảm thấy thế nào?'], opening, setOpening, 'Bắt đầu câu chuyện của em...') : null}
            {step === 5 ? writingField('development', 'Viết diễn biến', 'Phát triển thử thách và hành động của nhân vật.', ['Khó khăn lớn nhất là gì?', 'Nhân vật đã thử cách nào để giải quyết?', 'Điều gì khiến tình huống gay cấn hơn?'], development, setDevelopment, 'Điều gì xảy ra tiếp theo?') : null}
            {step === 6 ? writingField('ending', 'Viết kết thúc', 'Giải quyết sự kiện chính và khép lại câu chuyện.', ['Nhân vật giải quyết vấn đề ra sao?', 'Nhân vật thay đổi hoặc học được điều gì?', 'Hình ảnh cuối cùng của câu chuyện là gì?'], ending, setEnding, 'Câu chuyện kết thúc như thế nào?') : null}
            {step === 7 ? (
              <View>
                <Text style={styles.sectionTitle}>Biên tập truyện chữ</Text>
                <Text style={styles.sectionDescription}>Đọc toàn bộ truyện, chỉnh câu chữ và kiểm tra sự liên kết trước khi lưu. AI chỉ biên tập cách diễn đạt, không thay đổi cốt truyện của em.</Text>
                <View style={styles.previewBox}>
                  <Text style={styles.previewText}>{[opening, development, ending].filter(Boolean).join('\n\n') || 'Nội dung truyện sẽ xuất hiện ở đây.'}</Text>
                </View>
                <View style={styles.editorAssistActions}>
                  <AikidButton variant="feature" onPress={() => void editStoryWithAi()} disabled={editorAiLoading} leftIcon={<Ionicons name="sparkles-outline" size={17} color="#475569" />}>
                    {editorAiLoading ? 'AI đang biên tập...' : 'AI hỗ trợ biên tập'}
                  </AikidButton>
                </View>
                {editedStorySuggestion ? (
                  <View style={styles.editedSuggestion}>
                    <View style={styles.editedSuggestionHeader}>
                      <View>
                        <Text style={styles.editedSuggestionTitle}>Bản AI đề xuất</Text>
                        <Text style={styles.editedSuggestionHint}>Đọc lại trước khi áp dụng. Bài gốc vẫn được giữ nguyên.</Text>
                      </View>
                      <AikidButton variant="nav" onPress={applyEditedStory}>Dùng bản biên tập</AikidButton>
                    </View>
                    <Text style={styles.editedSuggestionText}>{editedStorySuggestion}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            {step > 1 ? <AikidButton variant="feature" onPress={() => setStep((value) => value - 1)} leftIcon={<AikidIcon name="arrow-left" size={17} />}>Quay lại</AikidButton> : null}
            {step < TEXT_STEPS.length ? <AikidButton variant="nav" onPress={goNext} disabled={step === 1 && !hasPlot}>Tiếp tục</AikidButton> : <AikidButton variant="cta" onPress={() => void saveStory()} leftIcon={<AikidIcon name="save" size={17} color="#FFF" />}>Lưu truyện chữ</AikidButton>}
          </View>
        </AikidSafeBox>
      </ScrollView>
    </AikidPage>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, width: '100%' },
  scrollContent: { paddingBottom: 22 },
  workspace: { width: '100%', minHeight: 480 },
  textStepper: { borderBottomWidth: 1, borderBottomColor: '#EBDCD0', paddingBottom: 13, marginBottom: 20 },
  content: { minHeight: 340 },
  sectionTitle: { color: '#475569', fontSize: 24, fontWeight: '900' },
  sectionDescription: { color: '#8A7463', fontSize: 13, lineHeight: 19, marginTop: 4, marginBottom: 18 },
  lockedState: { alignItems: 'center', justifyContent: 'center', minHeight: 260, borderWidth: 2, borderColor: '#EBDCD0', borderStyle: 'dashed', borderRadius: 22, backgroundColor: '#FFF8F2', padding: 24 },
  lockedTitle: { color: '#475569', fontSize: 18, fontWeight: '900', marginTop: 10 },
  lockedAction: { width: '100%', alignItems: 'center', marginTop: 16 },
  lockedButton: { alignSelf: 'center' },
  lockedDescription: { maxWidth: 390, color: '#8A7463', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5, marginBottom: 16 },
  plotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  plotCard: { width: 220, minHeight: 160, borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 20, backgroundColor: '#FFF', padding: 14 },
  plotCardActive: { borderColor: '#FF5E97', backgroundColor: '#FFF4F7' },
  plotIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F3' },
  plotTitle: { color: '#475569', fontSize: 14, fontWeight: '900', marginTop: 10 },
  plotTitleActive: { color: '#FF5E97' },
  plotMeta: { color: '#8A7463', fontSize: 10, lineHeight: 15, marginTop: 4 },
  selectedBadge: { color: '#FF5E97', fontSize: 9, fontWeight: '900', marginTop: 8 },
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  modeCard: { flex: 1, minWidth: 240, minHeight: 190, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 22, backgroundColor: '#FFF', padding: 20 },
  modeCardActive: { borderColor: '#FF5E97', backgroundColor: '#FFF4F7' },
  modeTitle: { color: '#475569', fontSize: 18, fontWeight: '900', marginTop: 10 },
  modeText: { maxWidth: 260, color: '#8A7463', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 },
  outlineWorkspace: { flexDirection: 'row', alignItems: 'stretch', flexWrap: 'wrap', gap: 16 },
  plotReference: { flex: 0.9, minWidth: 310, borderWidth: 1.5, borderColor: '#FFD5E0', borderRadius: 18, backgroundColor: '#FFF7FA', padding: 14 },
  plotReferenceHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  plotReferenceTitle: { color: '#475569', fontSize: 14, fontWeight: '900' },
  plotReferenceBeat: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginBottom: 10 },
  plotReferenceNumber: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#FFE1E9', color: '#FF5E97', fontSize: 10, lineHeight: 23, fontWeight: '900', textAlign: 'center' },
  plotReferenceCopy: { flex: 1 },
  plotReferenceRole: { color: '#FF5E97', fontSize: 9, fontWeight: '900', marginBottom: 2 },
  plotReferenceText: { color: '#66584F', fontSize: 10, lineHeight: 15 },
  outlineAiButton: { alignSelf: 'center', marginTop: 5 },
  selfWritingNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, borderRadius: 13, backgroundColor: '#F5EFEA', padding: 11, marginTop: 5 },
  selfWritingNoteText: { flex: 1, color: '#8A7463', fontSize: 10, lineHeight: 16, fontWeight: '700' },
  outlineForm: { flex: 1.2, minWidth: 360 },
  outlineField: { marginBottom: 12 },
  fieldLabel: { color: '#8A7463', fontSize: 11, fontWeight: '900', marginBottom: 5 },
  outlineInput: { minHeight: 66, borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 14, backgroundColor: '#FFF', color: '#475569', fontSize: 13, lineHeight: 19, paddingHorizontal: 14, paddingVertical: 10 },
  outlineReview: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 14, backgroundColor: '#EFFAF5', padding: 12, marginTop: 10 },
  outlineReviewText: { flex: 1, color: '#287456', fontSize: 11, lineHeight: 17, fontWeight: '700' },
  aiAssistant: { borderWidth: 1.5, borderColor: '#FFD3DF', borderRadius: 18, backgroundColor: '#FFF7FA', padding: 14, marginBottom: 14 },
  aiAssistantHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  aiAssistantTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  aiAssistantTitle: { color: '#475569', fontSize: 15, fontWeight: '900' },
  aiAskButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, backgroundColor: '#FF6B8E', paddingHorizontal: 14, paddingVertical: 9 },
  aiAskButtonDisabled: { opacity: 0.6 },
  aiAskButtonText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  aiPromptLabel: { color: '#8A684E', fontSize: 11, fontWeight: '800', marginTop: 13, marginBottom: 8 },
  aiQuestionList: { gap: 7 },
  aiQuestion: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiQuestionNumber: { width: 21, height: 21, borderRadius: 11, backgroundColor: '#FFE1E9', color: '#FF5E97', fontSize: 10, lineHeight: 21, fontWeight: '900', textAlign: 'center' },
  aiQuestionText: { flex: 1, color: '#66584F', fontSize: 11, lineHeight: 16 },
  aiSuggestion: { borderTopWidth: 1, borderTopColor: '#FFDCE5', marginTop: 13, paddingTop: 12 },
  aiSuggestionLabel: { color: '#FF5E97', fontSize: 10, fontWeight: '900', marginBottom: 6 },
  aiSuggestionText: { color: '#475569', fontSize: 12, lineHeight: 19 },
  useSuggestionButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  useSuggestionText: { color: '#FF5E97', fontSize: 11, fontWeight: '900' },
  editor: { minHeight: 230, borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 18, backgroundColor: '#FFF', color: '#475569', fontSize: 15, lineHeight: 23, padding: 16 },
  previewBox: { minHeight: 260, borderRadius: 18, backgroundColor: '#FFF', padding: 18 },
  previewText: { color: '#475569', fontSize: 15, lineHeight: 24 },
  editorAssistActions: { alignItems: 'center', marginTop: 14 },
  editedSuggestion: { borderWidth: 1.5, borderColor: '#FFD5E0', borderRadius: 18, backgroundColor: '#FFF7FA', padding: 16, marginTop: 14 },
  editedSuggestionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottomWidth: 1, borderBottomColor: '#FFDCE5', paddingBottom: 12, marginBottom: 12 },
  editedSuggestionTitle: { color: '#FF5E97', fontSize: 15, fontWeight: '900' },
  editedSuggestionHint: { color: '#8A7463', fontSize: 10, marginTop: 3 },
  editedSuggestionText: { color: '#475569', fontSize: 14, lineHeight: 23 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10, borderTopWidth: 1, borderTopColor: '#EBDCD0', paddingTop: 15, marginTop: 18 },
});
