import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { generateComicScriptViaGateway } from '@/features/comic/api/generateComicScript';
import { ComicCharacter, StoryPlan, useComicDraft } from '@/features/comic/store/useComicDraft';
import { CharacterPicker, listRemoteCharacters, mergeCharacterLibrary, useCharacterDraft } from '@/features/character';
import { useFamily } from '@/features/family/store/useFamily';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { usePopSound } from '@/hooks/usePopSound';
import { AikidButton, AikidIcon, AikidPage, AikidSafeBox, AikidStepNavigator } from '@/ui';

const STEPS = ['Nhân vật', 'Bối cảnh', 'Khởi đầu', 'Điều bất ngờ', 'Mục đích', 'Trở ngại', 'Cao trào', 'Kết thúc', 'Bài học'] as const;
const NAVIGATOR_STEPS = ['Thể loại', ...STEPS] as const;
const STEP_DESCRIPTIONS = [
  'Chọn nhân vật đã lưu và xác định vai trò trong câu chuyện',
  'Chọn thời gian và không gian diễn ra câu chuyện',
  'Xác định hành động và cảm xúc lúc mở đầu',
  'Tạo biến cố làm câu chuyện bắt đầu chuyển động',
  'Chọn điều nhân vật muốn đạt được',
  'Đặt ra thử thách và cách nhân vật tìm lời giải',
  'Xác định khoảnh khắc căng thẳng nhất',
  'Chọn cách câu chuyện được giải quyết',
  'Chọn điều nhân vật thay đổi hoặc học được',
] as const;
const EMPTY_PLAN: StoryPlan = {
  time: '', setting: '', openingAction: '', openingEmotion: '', unexpectedEvent: '', reaction: '',
  purpose: '', obstacle: '', attempt: '', climax: '', ending: '', lesson: '',
};
const OPTIONS = {
  time: ['Sáng sớm', 'Buổi trưa', 'Chiều tà', 'Đêm trăng', 'Ngày xưa', 'Tương lai'],
  setting: ['Trong khu rừng', 'Ở trường học', 'Bên bờ biển', 'Trong lâu đài', 'Ngoài vũ trụ', 'Tại ngôi làng nhỏ'],
  openingAction: ['Ăn uống', 'Nằm ngủ', 'Đi trên đường', 'Nói chuyện', 'Đọc sách', 'Chờ một người'],
  openingEmotion: ['Vui vẻ', 'Háo hức', 'Sợ hãi', 'Buồn bã', 'Tò mò', 'Lo lắng'],
  unexpectedEvent: ['Món đồ quan trọng biến mất', 'Tìm thấy một vật lạ', 'Người bạn bất ngờ xuất hiện', 'Một cánh cửa bí mật mở ra', 'Có tiếng động kỳ lạ', 'Bị đưa đến một nơi khác'],
  reaction: ['Ngạc nhiên đứng sững', 'Hoảng hốt lùi lại', 'Tò mò tiến đến gần', 'Vội vàng kiểm tra', 'Gọi người khác giúp', 'Bình tĩnh quan sát'],
  purpose: ['Tìm lại thứ đã mất', 'Giúp đỡ một người', 'Khám phá một bí mật', 'Hoàn thành nhiệm vụ', 'Sửa chữa sai lầm', 'Bảo vệ điều quan trọng'],
  obstacle: ['Phải vượt qua nỗi sợ', 'Không biết bắt đầu từ đâu', 'Bị người khác ngăn cản', 'Không ai tin lời', 'Phải giữ bí mật', 'Rắc rối ngày càng lớn'],
  attempt: ['Tự tìm cách giải quyết', 'Nhờ người khác giúp', 'Thử lại theo cách khác', 'Dùng một món đồ đặc biệt', 'Nghĩ ra một kế hoạch', 'Quan sát và tìm manh mối'],
  climax: ['Đối mặt với nỗi sợ lớn nhất', 'Chạy đua với thời gian', 'Đưa ra lựa chọn khó khăn', 'Hợp sức cùng bạn bè', 'Tìm ra bí mật cuối cùng', 'Hy sinh điều mình quý'],
  ending: ['Kết thúc có hậu', 'Kết thúc mở', 'Kết thúc cảm động', 'Mọi người trở về an toàn', 'Nhân vật hoàn thành nhiệm vụ', 'Một hành trình mới bắt đầu'],
  lesson: ['Không thể làm mọi thứ một mình', 'Phải tin vào bản thân', 'Cần lắng nghe nhiều hơn', 'Một sai lầm vẫn có thể sửa chữa', 'Dũng cảm là biết vượt qua nỗi sợ', 'Tình bạn là điều đáng quý'],
} satisfies Record<keyof StoryPlan, string[]>;

type PlanKey = keyof StoryPlan;
type StepField = { key: PlanKey; label: string; prompt: string };
const STEP_FIELDS: Record<number, StepField[]> = {
  2: [{ key: 'time', label: 'Thời gian', prompt: 'Câu chuyện xảy ra khi nào?' }, { key: 'setting', label: 'Không gian', prompt: 'Câu chuyện diễn ra ở đâu?' }],
  3: [{ key: 'openingAction', label: 'Hành động mở đầu', prompt: 'Nhân vật đang làm gì?' }, { key: 'openingEmotion', label: 'Cảm xúc', prompt: 'Nhân vật cảm thấy thế nào?' }],
  4: [{ key: 'unexpectedEvent', label: 'Điều bất ngờ', prompt: 'Điều gì bất ngờ xảy ra?' }, { key: 'reaction', label: 'Phản ứng', prompt: 'Nhân vật phản ứng thế nào?' }],
  5: [{ key: 'purpose', label: 'Mục đích', prompt: 'Nhân vật muốn đạt được điều gì?' }],
  6: [{ key: 'obstacle', label: 'Trở ngại', prompt: 'Điều gì cản trở nhân vật?' }, { key: 'attempt', label: 'Cách thử sức', prompt: 'Nhân vật thử làm gì để giải quyết?' }],
  7: [{ key: 'climax', label: 'Cao trào', prompt: 'Khoảnh khắc căng thẳng nhất là gì?' }],
  8: [{ key: 'ending', label: 'Kết thúc', prompt: 'Câu chuyện kết thúc như thế nào?' }],
  9: [{ key: 'lesson', label: 'Bài học', prompt: 'Nhân vật thay đổi hoặc học được điều gì?' }],
};

export default function StoryIdeaWizard() {
  const router = useRouter();
  const { genre, mode, edit } = useLocalSearchParams<{ genre?: string; mode?: string; edit?: string }>();
  const editingExisting = edit === '1';
  const { playPop } = usePopSound();
  const activeChild = useFamily((state) => state.getActiveChild());
  const ipId = useWorkspace((state) => state.activeIpId);
  const project = useComicDraft((state) => state.project);
  const hydrated = useComicDraft((state) => state.hydrated);
  const hydrate = useComicDraft((state) => state.hydrate);
  const patchProject = useComicDraft((state) => state.patchProject);
  const updatePage = useComicDraft((state) => state.updatePage);
  const saveToLibrary = useComicDraft((state) => state.saveToLibrary);
  const savedCharacters = useCharacterDraft((state) => state.saved);
  const charactersHydrated = useCharacterDraft((state) => state.isHydrated);
  const hydrateCharacters = useCharacterDraft((state) => state.hydrate);
  const remoteCharacters = useQuery({
    queryKey: ['character-library', activeChild?.id ?? null, ipId ?? null],
    enabled: Boolean(ipId),
    queryFn: () => listRemoteCharacters({ ipId: ipId!, childId: activeChild?.id }),
  });
  const characters = useMemo(() => {
    return mergeCharacterLibrary(remoteCharacters.data ?? [], savedCharacters);
  }, [remoteCharacters.data, savedCharacters]);
  const characterLibraryReady = charactersHydrated && (!ipId || !remoteCharacters.isLoading);
  const [step, setStep] = useState(1);
  const [maxVisited, setMaxVisited] = useState(editingExisting ? 9 : 1);
  const [selectedIds, setSelectedIds] = useState<string[]>(project.cast.map((item) => item.sourceId || item.id));
  const [mainId, setMainId] = useState(project.cast.find((item) => item.role === 'main')?.sourceId || '');
  const [roles, setRoles] = useState<Record<string, string>>(() => Object.fromEntries(project.cast.map((item) => [item.sourceId || item.id, item.personality])));
  const [plan, setPlan] = useState<StoryPlan>({ ...EMPTY_PLAN, ...project.storyPlan });
  const [isGenerating, setIsGenerating] = useState(false);
  const restoredDraft = useRef(false);
  const pageRef = useRef<ScrollView>(null);

  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrate, hydrated]);
  useEffect(() => { void hydrateCharacters(); }, [hydrateCharacters]);
  useEffect(() => {
    if (!hydrated || restoredDraft.current) return;
    restoredDraft.current = true;
    setSelectedIds(project.cast.map((item) => item.sourceId || item.id));
    setMainId(project.cast.find((item) => item.role === 'main')?.sourceId || '');
    setRoles(Object.fromEntries(project.cast.map((item) => [item.sourceId || item.id, item.personality])));
    setPlan({ ...EMPTY_PLAN, ...project.storyPlan });
    if (editingExisting) setMaxVisited(9);
  }, [editingExisting, hydrated, project.cast, project.storyPlan]);
  useEffect(() => {
    pageRef.current?.scrollTo({ y: 0, animated: true });
  }, [step]);

  const cast = useMemo<ComicCharacter[]>(() => selectedIds.flatMap((id) => {
    const character = characters.find((item) => item.id === id);
    const existing = project.cast.find((item) => (item.sourceId || item.id) === id);
    if (!character && !existing) return [];
    const name = character?.name || existing?.name || 'Nhân vật';
    return [{
      id: `story-${id}`,
      sourceId: id,
      name,
      role: id === mainId ? 'main' : 'supporting',
      personality: roles[id]?.trim() || character?.description || (id === mainId ? 'nhân vật chính của câu chuyện' : 'người bạn đồng hành'),
      appearancePrompt: character?.userPrompt || (character ? `${character.species || 'Nhân vật'} ${name}` : existing?.appearancePrompt || name),
      referenceImageUrl: character?.fullbodyImgUri || character?.avatarUri || existing?.referenceImageUrl || null,
    }];
  }), [characters, mainId, project.cast, roles, selectedIds]);

  const validateStep = () => {
    if (step === 1) {
      if (!selectedIds.length) return 'Hãy chọn ít nhất một nhân vật.';
      if (!mainId || !selectedIds.includes(mainId)) return 'Hãy chọn một nhân vật chính.';
      return '';
    }
    const missing = (STEP_FIELDS[step] || []).find((field) => !plan[field.key].trim());
    return missing ? `Hãy hoàn thành mục “${missing.label}”.` : '';
  };

  const goNext = async () => {
    playPop();
    const error = validateStep();
    if (error) return Alert.alert('Chưa hoàn thành', error);
    if (step < 9) {
      setStep((value) => value + 1);
      setMaxVisited((value) => Math.max(value, step + 1));
      return;
    }
    const page = project.pages[0];
    if (!page || isGenerating) return;
    setIsGenerating(true);
    try {
      const panels = await generateComicScriptViaGateway({
        pageId: page.id,
        idea: plan.unexpectedEvent,
        genre: typeof genre === 'string' ? genre : 'Phiêu lưu',
        panelCount: page.panelCount,
        cast,
        storyPlan: plan,
        childProfileId: activeChild?.id,
      });
      const title = `${plan.unexpectedEvent} của ${cast.find((item) => item.role === 'main')?.name || 'nhân vật'}`;
      patchProject({ title, genre: typeof genre === 'string' ? genre : 'Phiêu lưu', cast, storyPlan: plan });
      updatePage(page.id, { title: plan.unexpectedEvent, idea: buildPlanText(plan), panels, status: 'draft', error: null });
      await saveToLibrary();
      router.push('/(app)/comic/library-v2');
    } catch (error) {
      Alert.alert('Không tạo được cốt truyện', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCharacter = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        const next = current.filter((value) => value !== id);
        if (mainId === id) setMainId(next[0] || '');
        return next;
      }
      if (current.length >= 4) {
        Alert.alert('Đủ nhân vật', 'Một cốt truyện chọn tối đa 4 nhân vật.');
        return current;
      }
      if (!mainId) setMainId(id);
      return [...current, id];
    });
  };

  const goToGenre = () => {
    router.replace({
      pathname: '/(app)/comic/genre-v2',
      params: { mode: typeof mode === 'string' ? mode : 'text' },
    });
  };

  return (
    <AikidPage scene="comic" title="Tạo cốt truyện" backHref="/(app)/comic/genre-v2" container="wide" scroll={false} keyboardAware>
      <ScrollView ref={pageRef} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AikidSafeBox variant="panel" style={styles.workspace}>
          <AikidStepNavigator
            steps={NAVIGATOR_STEPS}
            currentStep={step + 1}
            maxVisitedStep={maxVisited + 1}
            onStepPress={(value) => {
              if (value === 1) {
                goToGenre();
                return;
              }
              setStep(value - 1);
            }}
          />
          <View style={styles.currentStepCard}>
            <Text style={styles.currentStepEyebrow}>BƯỚC {step + 1}/10 · {STEPS[step - 1].toUpperCase()}</Text>
            <Text style={styles.currentStepDescription}>{STEP_DESCRIPTIONS[step - 1]}</Text>
          </View>

          {step === 1 ? (
            <View>
              <Text style={styles.title}>Chọn các nhân vật</Text>
              <Text style={styles.subtitle}>Chọn tối đa 4 nhân vật, sau đó xác định một nhân vật chính.</Text>
              {!characterLibraryReady ? (
                <View style={styles.characterState}>
                  <Ionicons name="hourglass-outline" size={34} color="#FF7597" />
                  <Text style={styles.characterStateTitle}>Đang mở kho nhân vật...</Text>
                </View>
              ) : characters.length ? (
                <CharacterPicker
                  characters={characters.map((character) => ({
                    id: character.id,
                    name: character.name,
                    imageUri: character.fullbodyImgUri || character.avatarUri,
                    subtitle: character.species || (character.source === 'ai' ? 'Nhân vật AI' : undefined),
                  }))}
                  selectedIds={selectedIds}
                  maxSelection={4}
                  onToggle={toggleCharacter}
                  onCreate={() => router.push('/(app)/character/generate-v2')}
                  renderSelectedActions={(character) => {
                    const main = mainId === character.id;
                    return (
                      <>
                        <TouchableOpacity style={[styles.mainButton, main && styles.mainButtonActive]} onPress={() => setMainId(character.id)}>
                          <Ionicons name={main ? 'star' : 'star-outline'} size={15} color={main ? '#FFF' : '#FF5E97'} />
                          <Text style={[styles.mainButtonText, main && styles.mainButtonTextActive]}>{main ? 'Nhân vật chính' : 'Đặt làm nhân vật chính'}</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.roleInput}
                          value={roles[character.id] || ''}
                          onChangeText={(value) => setRoles((current) => ({ ...current, [character.id]: value }))}
                          placeholder="Vai trò trong câu chuyện..."
                        />
                      </>
                    );
                  }}
                />
              ) : (
                <View style={styles.characterState}>
                  <View style={styles.emptyCharacterIcon}><Ionicons name="people-outline" size={38} color="#FF7597" /></View>
                  <Text style={styles.characterStateTitle}>Kho nhân vật đang trống</Text>
                  <Text style={styles.characterStateText}>Hãy tạo và lưu ít nhất một nhân vật trước khi bắt đầu cốt truyện.</Text>
                  <View style={styles.emptyCharacterAction}>
                    <AikidButton style={styles.centeredCreateButton} variant="nav" onPress={() => router.push('/(app)/character/generate-v2')} leftIcon={<Ionicons name="add" size={18} color="#FFF" />}>Tạo nhân vật</AikidButton>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View>
              <Text style={styles.title}>{STEPS[step - 1]}</Text>
              <Text style={styles.subtitle}>Chọn một gợi ý hoặc tự viết ý tưởng của em.</Text>
              {(STEP_FIELDS[step] || []).map((field) => (
                <View key={field.key} style={styles.field}>
                  <Text style={styles.fieldTitle}>{field.label}</Text>
                  <Text style={styles.fieldPrompt}>{field.prompt}</Text>
                  <View style={styles.optionGrid}>
                    {OPTIONS[field.key].map((option) => (
                      <TouchableOpacity key={option} style={[styles.option, plan[field.key] === option && styles.optionSelected]} onPress={() => setPlan((current) => ({ ...current, [field.key]: option }))}>
                        <Text style={[styles.optionText, plan[field.key] === option && styles.optionTextSelected]}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput style={styles.customInput} value={OPTIONS[field.key].includes(plan[field.key]) ? '' : plan[field.key]} onChangeText={(value) => setPlan((current) => ({ ...current, [field.key]: value }))} placeholder="Ý tưởng khác của em..." multiline />
                </View>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            <AikidButton variant="feature" onPress={() => step > 1 ? setStep(step - 1) : goToGenre()} leftIcon={<AikidIcon name="arrow-left" size={18} />}>Quay lại</AikidButton>
            <Text style={styles.counter}>{step + 1}/10</Text>
            <AikidButton
              variant="nav"
              onPress={() => void goNext()}
              loading={isGenerating}
              disabled={step === 1 && (!characterLibraryReady || !characters.length)}
            >
              {step === 9 ? 'Tạo cốt truyện' : 'Tiếp tục'}
            </AikidButton>
          </View>
        </AikidSafeBox>
      </ScrollView>
    </AikidPage>
  );
}

function buildPlanText(plan: StoryPlan) {
  return [
    `Bối cảnh: ${plan.time}, ${plan.setting}.`,
    `Khởi đầu: nhân vật ${plan.openingAction.toLowerCase()} và cảm thấy ${plan.openingEmotion.toLowerCase()}.`,
    `Điều bất ngờ: ${plan.unexpectedEvent}; phản ứng: ${plan.reaction}.`,
    `Mục đích: ${plan.purpose}. Trở ngại: ${plan.obstacle}. Cách thử sức: ${plan.attempt}.`,
    `Cao trào: ${plan.climax}. Kết thúc: ${plan.ending}. Bài học: ${plan.lesson}.`,
  ].join('\n');
}

const styles = StyleSheet.create({
  page: { paddingBottom: 24 },
  workspace: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: 22 },
  currentStepCard: { marginTop: 8, marginBottom: 22, borderRadius: 14, borderWidth: 1, borderColor: '#F3D9DF', backgroundColor: 'rgba(255,255,255,0.82)', paddingHorizontal: 14, paddingVertical: 9 },
  currentStepEyebrow: { color: '#FF5E97', fontSize: 11, fontWeight: '900', letterSpacing: 0.6, textAlign: 'center' },
  currentStepDescription: { color: '#475569', fontSize: 13, fontWeight: '700', lineHeight: 18, textAlign: 'center', marginTop: 2 },
  title: { fontSize: 26, fontWeight: '900', color: '#475569', textAlign: 'center' },
  subtitle: { color: '#786A61', textAlign: 'center', marginTop: 7, marginBottom: 22 },
  characterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  characterCard: { width: '22%', minWidth: 190, padding: 13, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E9DED4', borderRadius: 20 },
  characterCardCompact: { width: '46%', minWidth: 150 },
  cardSelected: { borderColor: '#FF7597', backgroundColor: '#FFF7F9' },
  characterSelect: { alignItems: 'center' },
  avatar: { width: 82, height: 82, borderRadius: 18 },
  avatarEmpty: { width: 82, height: 82, borderRadius: 18, backgroundColor: '#F5EEE8', alignItems: 'center', justifyContent: 'center' },
  characterName: { color: '#475569', fontWeight: '900', marginTop: 8, textAlign: 'center' },
  characterHint: { color: '#9A897C', fontSize: 11, marginTop: 3 },
  mainButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 7, borderRadius: 12, borderWidth: 1, borderColor: '#FFB0C6', marginTop: 10 },
  mainButtonActive: { backgroundColor: '#FF5E97', borderColor: '#FF5E97' },
  mainButtonText: { color: '#FF5E97', fontWeight: '800', fontSize: 11 },
  mainButtonTextActive: { color: '#FFF' },
  roleInput: { marginTop: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E9DED4', borderRadius: 10, padding: 9, fontSize: 12 },
  createCard: { alignItems: 'center', justifyContent: 'center', minHeight: 170, borderStyle: 'dashed' },
  characterState: { minHeight: 245, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: '#EBDCD0', borderRadius: 22, backgroundColor: '#FFFDFB' },
  emptyCharacterIcon: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFEAF0' },
  characterStateTitle: { color: '#475569', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  characterStateText: { color: '#8A7463', fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 440, marginBottom: 5 },
  emptyCharacterAction: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  centeredCreateButton: { alignSelf: 'center' },
  field: { padding: 16, borderRadius: 20, backgroundColor: '#FDF9F5', marginBottom: 16 },
  fieldTitle: { color: '#FF5E97', fontWeight: '900', fontSize: 18 },
  fieldPrompt: { color: '#66584F', marginTop: 4, marginBottom: 12 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  option: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E9DED4' },
  optionSelected: { backgroundColor: '#FF7597', borderColor: '#FF7597' },
  optionText: { color: '#66584F', fontWeight: '700' },
  optionTextSelected: { color: '#FFF' },
  customInput: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E9DED4', borderRadius: 14, padding: 12, minHeight: 48, marginTop: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 20 },
  counter: { color: '#FF5E97', fontWeight: '900' },
});
