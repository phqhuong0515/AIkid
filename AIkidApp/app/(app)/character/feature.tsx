import { useRouter } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';
import { useCharacterDraft } from '@/features/character';

const GENDERS = ['bé trai', 'bé gái', 'không xác định'] as const;

export default function CharacterFeatureScreen() {
  const router = useRouter();
  const { draft, hydrate, isHydrated, setMeta } = useCharacterDraft();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!isHydrated) {
    return (
      <ScreenChrome title="Hồ sơ" backHref="/(app)/character">
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500">Đang tải…</Text>
        </View>
      </ScreenChrome>
    );
  }

  return (
    <ScreenChrome
      title="Hồ sơ nhân vật"
      subtitle="Tự động lưu trên máy"
      backHref="/(app)/character"
    >
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 48,
          maxWidth: 560,
          width: '100%',
          alignSelf: 'center',
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-4 rounded-2xl border border-orange-100 bg-white p-4">
          <Field label="Tên">
            <TextInput
              className="h-12 rounded-xl border border-orange-50 bg-[#FFF8F2] px-3 text-base text-slate-900"
              value={draft.name}
              onChangeText={(v) => setMeta({ name: v })}
              placeholder="Ví dụ: Miu Miu"
              placeholderTextColor="#94A3B8"
            />
          </Field>

          <Field label="Tuổi (trong chuyện)">
            <TextInput
              className="h-12 rounded-xl border border-orange-50 bg-[#FFF8F2] px-3 text-base text-slate-900"
              value={draft.age}
              onChangeText={(v) => setMeta({ age: v })}
              placeholder="Ví dụ: 8"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
            />
          </Field>

          <Field label="Giới tính / cách gọi">
            <View className="flex-row flex-wrap gap-2">
              {GENDERS.map((g) => {
                const active = draft.gender === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setMeta({ gender: g })}
                    className={`rounded-full px-4 py-2.5 ${
                      active
                        ? 'bg-brand'
                        : 'border border-orange-100 bg-[#FFF8F2]'
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-bold ${
                        active ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      {g}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="Sinh nhật">
            <TextInput
              className="h-12 rounded-xl border border-orange-50 bg-[#FFF8F2] px-3 text-base text-slate-900"
              value={draft.birthday}
              onChangeText={(v) => setMeta({ birthday: v })}
              placeholder="dd/mm"
              placeholderTextColor="#94A3B8"
            />
          </Field>

          <Field label="Loài / loại">
            <TextInput
              className="h-12 rounded-xl border border-orange-50 bg-[#FFF8F2] px-3 text-base text-slate-900"
              value={draft.species}
              onChangeText={(v) => setMeta({ species: v })}
              placeholder="Mèo, robot, người..."
              placeholderTextColor="#94A3B8"
            />
          </Field>

          <Field label="Mô tả thêm">
            <TextInput
              className="min-h-[96px] rounded-xl border border-orange-50 bg-[#FFF8F2] px-3 py-3 text-base text-slate-900"
              value={draft.description}
              onChangeText={(v) => setMeta({ description: v })}
              placeholder="Tính cách, sở thích..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
            />
          </Field>
        </View>

        <Pressable
          onPress={() => router.push('/(app)/character/generate')}
          className="h-12 items-center justify-center rounded-2xl bg-brand"
        >
          <Text className="text-base font-extrabold text-white">
            Tiếp: tạo chi tiết →
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenChrome>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-semibold text-slate-700">
        {label}
      </Text>
      {children}
    </View>
  );
}
