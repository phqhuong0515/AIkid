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
  } = useCharacterDraft();

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const cat = draft.activeCategory;
  const questions = CATEGORY_QUESTIONS[cat];
  const answers = draft.categoryInputs[cat] || [];

  const promptPreview = useMemo(
    () => (isHydrated ? getUserPrompt() : ''),
    [isHydrated, draft, getUserPrompt],
  );

  async function handleSave() {
    setSaving(true);
    try {
      const item = await saveCurrentToStorage();
      if (item) {
        Alert.alert('Đã lưu', `"${item.name}" đã vào kho (offline).`, [
          {
            text: 'Xem kho',
            onPress: () => router.push('/(app)/character/storage'),
          },
          { text: 'OK' },
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
        provider: 'google-native',
        childProfileId: activeChild.id,
      });
      setGeneratedImageUri(result.imageUrl);
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

  return (
    <ScreenChrome
      title="Tạo chi tiết"
      subtitle="Gateway jobs · auto-save"
      backHref="/(app)/character"
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 56 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-2 text-[13px] font-semibold text-slate-700">
          Ý tưởng nhanh
        </Text>
        <TextInput
          className="mb-4 min-h-[72px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-[15px] text-slate-900"
          value={draft.ideaNotes?.shape || ''}
          onChangeText={setIdeaShape}
          placeholder="Ví dụ: con mèo màu cam tròn xoe..."
          placeholderTextColor="#94A3B8"
          multiline
        />

        <Text className="mb-2 text-[13px] font-semibold text-slate-700">
          Nhóm câu hỏi
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {CATEGORY_ORDER.map((id) => {
            const active = cat === id;
            return (
              <Pressable
                key={id}
                onPress={() => setActiveCategory(id)}
                className={`mr-2 rounded-full px-3 py-2 ${
                  active ? 'bg-brand' : 'border border-slate-200 bg-white'
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    active ? 'text-white' : 'text-slate-700'
                  }`}
                >
                  {CATEGORY_LABELS[id]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {questions.map((q, idx) => (
          <View key={`${cat}-${idx}`} className="mb-4">
            <Text className="mb-2 text-[12px] font-bold uppercase tracking-wide text-slate-600">
              {q.label}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              {sortChoices(q.choices).map((c) => {
                const selected =
                  (answers[idx] || '').toLowerCase() === c.toLowerCase();
                return (
                  <Pressable
                    key={c}
                    onPress={() => setAnswer(cat, idx, c)}
                    className={`mr-2 rounded-full px-3 py-1.5 ${
                      selected
                        ? 'bg-orange-500'
                        : 'border border-orange-100 bg-orange-50'
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-semibold ${
                        selected ? 'text-white' : 'text-orange-900'
                      }`}
                    >
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <TextInput
              className="min-h-[48px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-[15px] text-slate-900"
              value={answers[idx] || ''}
              onChangeText={(v) => setAnswer(cat, idx, v)}
              placeholder={q.placeholder}
              placeholderTextColor="#94A3B8"
            />
          </View>
        ))}

        <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-3">
          <Text className="text-[11px] font-semibold uppercase text-slate-400">
            Prompt preview (user only)
          </Text>
          <Text className="mt-2 text-[13px] leading-5 text-slate-700">
            {promptPreview || '—'}
          </Text>
        </View>

        {draft.generatedImageUri ? (
          <View className="mb-4 overflow-hidden rounded-2xl border border-orange-100 bg-white">
            <Image
              source={{ uri: draft.generatedImageUri }}
              style={{ width: '100%', height: 220 }}
              resizeMode="contain"
            />
            <Text className="px-3 py-2 text-center text-[11px] text-slate-400">
              Kết quả job · media/storage
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => void handleGenerateAi()}
          disabled={generating}
          className={`mb-3 h-12 items-center justify-center rounded-2xl bg-brand ${
            generating ? 'opacity-70' : ''
          }`}
        >
          {generating ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#fff" />
              <Text className="text-[15px] font-bold text-white">
                Đang gen (upload + job)…
              </Text>
            </View>
          ) : (
            <Text className="text-[15px] font-bold text-white">
              ✨ Gen ảnh AI (Gateway)
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => void handleSave()}
          disabled={saving}
          className={`mb-3 h-12 items-center justify-center rounded-2xl bg-brand ${
            saving ? 'opacity-70' : ''
          }`}
        >
          <Text className="text-base font-bold text-white">
            {saving ? 'Đang lưu…' : 'Lưu vào kho offline'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            Alert.alert('Reset form?', 'Xóa draft hiện tại về mặc định.', [
              { text: 'Hủy', style: 'cancel' },
              {
                text: 'Reset',
                style: 'destructive',
                onPress: () => resetDraft(),
              },
            ])
          }
          className="h-11 items-center justify-center"
        >
          <Text className="text-[13px] font-semibold text-red-500">
            Reset draft
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenChrome>
  );
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
