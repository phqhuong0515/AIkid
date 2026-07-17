import { useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useCharacterDraft } from '@/features/character';
import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';

export default function CharacterStorageScreen() {
  const { hydrate, isHydrated, saved, removeSaved } = useCharacterDraft();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <ScreenChrome
      title="Kho nhân vật"
      subtitle={`${saved.length} đã lưu · offline`}
      backHref="/(app)/character"
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {!isHydrated ? (
          <Text className="text-center text-slate-500">Đang tải…</Text>
        ) : null}

        {isHydrated && saved.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
            <Text className="text-center text-[15px] font-semibold text-slate-700">
              Chưa có nhân vật
            </Text>
            <Text className="mt-2 text-center text-[13px] text-slate-500">
              Vào “Tạo dáng & chi tiết” → Lưu vào kho offline.
            </Text>
          </View>
        ) : null}

        {saved.map((c) => (
          <View
            key={c.id}
            className="mb-3 rounded-2xl border border-orange-100 bg-white p-4"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-base font-bold text-slate-900">
                  {c.name}
                </Text>
                <Text className="mt-1 text-[12px] text-slate-500">
                  {[c.species, c.gender, c.age].filter(Boolean).join(' · ') ||
                    '—'}
                </Text>
                <Text className="mt-1 text-[11px] text-slate-400">
                  {c.source} · {new Date(c.createdAt).toLocaleString('vi-VN')}
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  Alert.alert('Xóa?', `Xóa “${c.name}” khỏi kho local?`, [
                    { text: 'Hủy', style: 'cancel' },
                    {
                      text: 'Xóa',
                      style: 'destructive',
                      onPress: () => void removeSaved(c.id),
                    },
                  ])
                }
                hitSlop={8}
              >
                <Text className="text-[13px] font-semibold text-red-500">
                  Xóa
                </Text>
              </Pressable>
            </View>
            {c.userPrompt ? (
              <Text
                className="mt-2 text-[12px] leading-5 text-slate-600"
                numberOfLines={3}
              >
                {c.userPrompt}
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </ScreenChrome>
  );
}
