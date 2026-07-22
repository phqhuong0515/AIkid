import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useFamily } from '@/features/family/store/useFamily';
import { useCharacterDraft } from '@/features/character';
import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';

const ACTIONS = [
  {
    href: '/(app)/character/feature',
    title: 'Hồ sơ nhân vật',
    desc: 'Tên, tuổi, giới tính, mô tả',
    emoji: '🪪',
  },
  {
    href: '/(app)/character/generate',
    title: 'Tạo dáng & gen AI',
    desc: 'Hình dáng · mặt · tóc · trang phục · Gateway',
    emoji: '✨',
  },
  {
    href: '/(app)/gallery',
    title: 'Gallery nhân vật',
    desc: 'Ảnh AI · ảnh tải lên · hồ sơ và prompt',
    emoji: '🖼️',
  },
] as const;

/**
 * Character hub — product UI (no engineering banners).
 * Flow preserves the original character lobby intent in native UI.
 */
export default function CharacterHubScreen() {
  const router = useRouter();
  const { hydrate, isHydrated, draft, getUserPrompt } = useCharacterDraft();
  const activeChild = useFamily((s) => s.getActiveChild());

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const promptPreview = isHydrated ? getUserPrompt() : '';
  const childLabel = activeChild
    ? `${activeChild.name} · AI ${activeChild.consent.allowAiCreate ? 'bật' : 'tắt'}`
    : 'Chưa chọn hồ sơ con';

  return (
    <ScreenChrome
      title="Nhân vật AI"
      subtitle={childLabel}
      backHref="/(app)/lobby"
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {!activeChild ? (
          <Pressable
            onPress={() => router.push('/(app)/family')}
            className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"
          >
            <Text className="text-[14px] font-extrabold text-amber-900">
              Chọn hồ sơ con
            </Text>
            <Text className="mt-1 text-[13px] leading-5 text-amber-800">
              Gen AI gắn với hồ sơ con (parent quản lý). Bấm để tạo / chọn con.
            </Text>
          </Pressable>
        ) : null}

        <View className="gap-3">
          {ACTIONS.map((a) => (
            <Pressable
              key={a.href}
              onPress={() => router.push(a.href as never)}
              className="flex-row items-center rounded-2xl border border-orange-100 bg-white p-4 active:opacity-90"
              style={{
                shadowColor: '#FB923C',
                shadowOpacity: 0.08,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                <Text className="text-2xl">{a.emoji}</Text>
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-base font-extrabold text-slate-900">
                  {a.title}
                </Text>
                <Text className="mt-0.5 text-[13px] text-slate-500">{a.desc}</Text>
              </View>
              <Text className="ml-2 text-lg text-slate-300">›</Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-5 rounded-2xl border border-slate-100 bg-white p-4">
          <Text className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Draft hiện tại
          </Text>
          <Text className="mt-2 text-[15px] font-extrabold text-slate-800">
            {draft.name.trim() || 'Chưa đặt tên'}
          </Text>
          <Text
            className="mt-1 text-[12px] leading-5 text-slate-500"
            numberOfLines={4}
          >
            {promptPreview ||
              'Điền hồ sơ và chi tiết để xem tóm tắt prompt.'}
          </Text>
        </View>
      </ScrollView>
    </ScreenChrome>
  );
}
