import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { useAuth } from '@/core/auth/useAuth';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_QUESTIONS,
  useCharacterDraft,
} from '@/features/character';
import {
  buildCharacterJobPrompt,
  generateImageViaGateway,
} from '@/features/creative/generateImageViaGateway';
import { useFamily } from '@/features/family/store/useFamily';
import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';
import { CompactOptionField, PromptComposer, type PromptField } from '@/features/kids-ui/CreativeKit';
import { queryClient } from '@/core/query/queryClient';

export default function CharacterGenerateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const activeChild = useFamily((s) => s.getActiveChild());
  const {
    draft,
    hydrate,
    isHydrated,
    setActiveCategory,
    setAnswer,
    setIdeaShape,
    setGeneratedImageUri,
    getUserPrompt,
    saveCurrentToStorage,
    resetDraft,
    randomizeDraft,
  } = useCharacterDraft();

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { width } = useWindowDimensions();
  const desktop = width >= 900;

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const cat = draft.activeCategory;
  const questions = CATEGORY_QUESTIONS[cat];
  const answers = draft.categoryInputs[cat] || [];

  const promptFields = useMemo<PromptField[]>(() => questions.map((question, index) => ({
    key: `${cat}-${index}`,
    label: question.subject,
    value: answers[index] || '',
    options: sortChoices(question.choices),
    placeholder: question.placeholder,
    onChange: (value) => setAnswer(cat, index, value),
    tone: (['sky', 'violet', 'amber', 'rose', 'emerald'] as const)[index % 5],
  })), [answers, cat, questions, setAnswer]);
  const commandFields = useMemo<PromptField[]>(() => CATEGORY_ORDER.flatMap((category, categoryIndex) =>
    CATEGORY_QUESTIONS[category].map((question, index) => ({
      key: `command-${category}-${index}`,
      label: question.subject,
      value: draft.categoryInputs[category]?.[index]?.trim() || '',
      options: sortChoices(question.choices),
      placeholder: question.placeholder,
      onChange: (value: string) => setAnswer(category, index, value),
      tone: (['sky', 'violet', 'amber', 'rose', 'emerald'] as const)[categoryIndex % 5],
    })).filter((field) => Boolean(field.value) && (field.key.startsWith('command-shape-') || draft.selectedAnswerKeys?.includes(field.key.replace('command-', ''))))), [draft.categoryInputs, draft.selectedAnswerKeys, setAnswer]);
  const ideaField = draft.ideaNotes?.shape?.trim() ? [{
    key: 'optional-idea',
    label: 'Ý tưởng thêm',
    value: draft.ideaNotes.shape.trim(),
    options: [] as string[],
    placeholder: 'Tự viết ý tưởng của em',
    onChange: setIdeaShape,
    tone: 'rose' as const,
  }] : [];

  async function handleSave() {
    if (!draft.generatedImageUri) {
      Alert.alert('Chưa có ảnh nhân vật', 'Hãy tạo nhân vật AI trước. Ảnh hoàn thành sẽ tự động được lưu vào Gallery.');
      return;
    }
    setSaving(true);
    try {
      const item = await saveCurrentToStorage(activeChild?.id);
      if (item) {
        void queryClient.invalidateQueries({ queryKey: ['media', 'gallery'] });
        Alert.alert('Đã lưu vào Gallery', `"${item.name}" đã vào mục Nhân vật; ảnh AI của job nằm riêng tại mục Ảnh AI.`, [
          {
            text: 'Mở Gallery',
            onPress: () => router.push('/(app)/gallery'),
          },
          { text: 'Đóng' },
        ]);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateAi() {
    if (!token) {
      Alert.alert('Cần đăng nhập', 'Đăng nhập phụ huynh để gen ảnh qua Gateway.');
      return;
    }
    if (!activeChild) {
      Alert.alert(
        'Chọn hồ sơ con',
        'Gen AI gắn với hồ sơ con dưới tài khoản phụ huynh.',
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Chọn con',
            onPress: () => router.push('/(app)/family'),
          },
        ],
      );
      return;
    }
    if (!activeChild.consent.allowAiCreate) {
      Alert.alert(
        'AI đang tắt',
        `Hồ sơ “${activeChild.name}” chưa bật tạo ảnh AI. Bật trong Gia đình / hồ sơ con.`,
      );
      return;
    }
    const userPrompt = getUserPrompt();
    if (!userPrompt.trim()) {
      Alert.alert('Thiếu mô tả', 'Điền form nhân vật trước khi gen AI.');
      return;
    }

    setGenerating(true);
    try {
      const result = await generateImageViaGateway({
        userPrompt: buildCharacterJobPrompt(userPrompt),
        referenceDataUrl: draft.uploadedImageUri?.startsWith('data:')
          ? draft.uploadedImageUri
          : null,
        referenceHttpsUrl: draft.uploadedImageUri?.startsWith('http')
          ? draft.uploadedImageUri
          : null,
        childProfileId: activeChild.id,
      });
      setGeneratedImageUri(result.imageUrl);
      void queryClient.invalidateQueries({ queryKey: ['media', 'gallery'] });
      Alert.alert(
        'Xong!',
        `Đã tạo ảnh cho ${activeChild.name} (media + jobs).`,
        [
          { text: 'Lưu vào kho', onPress: () => void handleSave() },
          { text: 'OK' },
        ],
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gen ảnh thất bại';
      Alert.alert('Lỗi gen AI', msg);
    } finally {
      setGenerating(false);
    }
  }

  if (!isHydrated) {
    return (
      <ScreenChrome title="Chi tiết" backHref="/(app)/character">
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500">Đang tải…</Text>
        </View>
      </ScreenChrome>
    );
  }

  return <ScreenChrome title="Tạo nhân vật AI" subtitle="Chạm chọn · tự động lưu" backHref="/(app)/character">
    <ScrollView contentContainerStyle={{ padding: desktop ? 24 : 14, paddingBottom: 56 }} keyboardShouldPersistTaps="handled">
      <View style={{ width: '100%', maxWidth: 1180, alignSelf: 'center', flexDirection: desktop ? 'row' : 'column-reverse', gap: 18, alignItems: 'flex-start' }}>
        <View style={{ width: desktop ? 410 : '100%' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" contentContainerStyle={{ paddingRight: 8 }}>
            {CATEGORY_ORDER.map((id) => <Pressable key={id} onPress={() => setActiveCategory(id)} className={`mr-2 rounded-full px-3.5 py-2.5 ${cat === id ? 'bg-slate-900' : 'border border-orange-100 bg-white'}`}><Text className={`text-[12px] font-extrabold ${cat === id ? 'text-white' : 'text-slate-700'}`}>{CATEGORY_LABELS[id]}</Text></Pressable>)}
          </ScrollView>
          <View className="rounded-[24px] border border-orange-100 bg-white p-3">
            <Text className="mb-2 px-1 text-[12px] font-extrabold text-slate-900">{CATEGORY_LABELS[cat]} · {questions.length} lựa chọn</Text>
            {promptFields.map((field) => <CompactOptionField key={field.key} field={field} />)}
          </View>
        </View>

        <View style={{ flex: 1, width: desktop ? undefined : '100%', gap: 14 }}>
          <PromptComposer
            lead="Tạo một nhân vật AI:"
            fields={[...ideaField, ...commandFields]}
            tail=". Hình ảnh thân thiện, rõ toàn thân và phù hợp với trẻ em."
            action={<Pressable accessibilityRole="button" accessibilityLabel="Tạo ngẫu nhiên toàn bộ nhân vật" onPress={randomizeDraft} className="rounded-full bg-violet-100 px-3.5 py-2.5 active:opacity-70"><Text className="text-[12px] font-extrabold text-violet-700">🎲 Ngẫu nhiên</Text></Pressable>}
            editor={<TextInput value={draft.ideaNotes?.shape || ''} onChangeText={setIdeaShape} placeholder="Ý tưởng thêm (không bắt buộc), ví dụ: đang trồng cây trên Mặt Trăng…" placeholderTextColor="#94A3B8" multiline textAlignVertical="top" className="min-h-[68px] rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 px-3.5 py-3 text-[14px] text-slate-900" />}
          />
          {draft.generatedImageUri ? <View className="overflow-hidden rounded-[24px] border border-orange-100 bg-white"><Image source={{ uri: draft.generatedImageUri }} style={{ width: '100%', height: desktop ? 360 : 280 }} resizeMode="contain" /><Text className="px-3 py-2 text-center text-[11px] text-slate-400">Kết quả AI · đã gắn với Gallery</Text></View> : <View className="h-48 items-center justify-center rounded-[24px] border border-dashed border-orange-200 bg-orange-50/50"><Text className="text-4xl">✨</Text><Text className="mt-2 font-bold text-slate-500">Nhân vật sẽ xuất hiện ở đây</Text></View>}
          <View className={`${desktop ? 'flex-row' : ''} gap-3`}>
            <Pressable accessibilityRole="button" onPress={() => void handleGenerateAi()} disabled={generating} className={`flex-1 flex-row items-center justify-center rounded-2xl bg-brand px-5 ${generating ? 'opacity-70' : ''}`} style={{ minHeight: 56 }}>{generating ? <ActivityIndicator color="#fff" /> : null}<Text className="ml-2 text-[15px] font-extrabold text-white">{generating ? 'Đang tạo nhân vật…' : '✨ Tạo nhân vật AI'}</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => void handleSave()} disabled={saving} className={`items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-5 ${!draft.generatedImageUri ? 'opacity-50' : ''}`} style={{ minHeight: 56 }}><Text className="font-extrabold text-emerald-700">{saving ? 'Đang lưu…' : 'Lưu hồ sơ & mở Gallery'}</Text></Pressable>
          </View>
          <Pressable onPress={() => Alert.alert('Làm mới?', 'Xóa draft hiện tại về mặc định.', [{ text: 'Huỷ' }, { text: 'Làm mới', style: 'destructive', onPress: resetDraft }])} className="self-center px-4 py-2"><Text className="text-[12px] font-bold text-slate-400">Làm mới bản nháp</Text></Pressable>
        </View>
      </View>
    </ScrollView>
  </ScreenChrome>;
}

function sortChoices(choices: string[]): string[] {
  return [...choices].sort((a, b) => {
    const aStart = a.toLowerCase().startsWith('không');
    const bStart = b.toLowerCase().startsWith('không');
    if (aStart && !bStart) return -1;
    if (!aStart && bStart) return 1;
    return 0;
  });
}
