import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/core/auth/useAuth';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { useFamily } from '@/features/family/store/useFamily';

const CARDS = [
  {
    href: '/(app)/mee' as const,
    title: 'Tạo Mee',
    desc: 'Người bạn đại diện · tùy chỉnh layer',
    image: '/lobby-assets/images/card_mee.jpeg',
  },
  {
    href: '/(app)/character' as const,
    title: 'Nhân vật AI',
    desc: 'Form chi tiết · gen ảnh Gateway',
    image: '/lobby-assets/images/home-character.jpeg',
  },
  {
    href: '/(app)/art' as const,
    title: 'Xưởng vẽ',
    desc: 'Chọn style · canvas · AI vẽ lại',
    image: '/lobby-assets/images/card_art.jpeg',
  },
  {
    href: '/(app)/comic' as const,
    title: 'Sáng tác truyện',
    desc: 'Truyện chữ & truyện tranh',
    image: '/lobby-assets/images/art-image.jpeg',
  },
];

export default function LobbyScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 880;
  const { user, logout } = useAuth();
  const { activeIpId, workspaces, isHydrated } = useWorkspace();
  const activeChild = useFamily((s) => s.getActiveChild());
  const loadFamily = useFamily((s) => s.loadFamily);

  useEffect(() => {
    void loadFamily();
  }, [loadFamily]);

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  const displayName = user?.name || user?.email || 'Phụ huynh';
  const wsName = workspaces.find((w) => w.ipId === activeIpId)?.name ?? '—';
  const gap = 16;
  const sidePad = wide ? 32 : 20;
  const cardW = wide ? Math.floor((Math.min(width, 1100) - sidePad * 2 - gap) / 2) : undefined;

  return (
    <SafeAreaView className="flex-1 bg-[#FFF8F2]">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sidePad,
          paddingTop: 16,
          paddingBottom: 48,
          maxWidth: 1100,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <View className="mb-6 flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-[12px] font-extrabold uppercase tracking-widest text-brand">
              AIkid Universe
            </Text>
            <Text
              className="mt-1 text-[26px] font-extrabold leading-8 text-slate-900"
              numberOfLines={1}
            >
              Xin chào, {String(displayName)}
            </Text>
            <Text className="mt-1 text-[14px] text-slate-500">
              Chọn xưởng để bắt đầu sáng tạo
            </Text>
            {isHydrated ? (
              <Text className="mt-2 text-[12px] text-slate-400" numberOfLines={1}>
                Workspace: {wsName}
              </Text>
            ) : null}
          </View>

          <View className="flex-row flex-wrap items-center justify-end gap-2">
            <Pressable
              onPress={() => router.push('/(app)/family')}
              className="rounded-full border border-orange-100 bg-white px-4 py-2.5"
              accessibilityRole="button"
              accessibilityLabel="Hồ sơ con"
            >
              <Text className="text-[13px] font-bold text-slate-700">
                {activeChild ? activeChild.name : 'Hồ sơ con'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(app)/account')}
              className="rounded-full border border-orange-100 bg-white px-4 py-2.5"
              accessibilityRole="button"
              accessibilityLabel="Tài khoản"
            >
              <Text className="text-[13px] font-bold text-slate-700">
                Tài khoản
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void handleLogout()}
              className="rounded-full bg-orange-50 px-4 py-2.5"
              accessibilityRole="button"
              accessibilityLabel="Đăng xuất"
            >
              <Text className="text-[13px] font-bold text-brand">Đăng xuất</Text>
            </Pressable>
          </View>
        </View>

        {!activeChild ? (
          <Pressable
            onPress={() => router.push('/(app)/family')}
            className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
          >
            <Text className="text-[14px] font-extrabold text-amber-900">
              Tạo / chọn hồ sơ con
            </Text>
            <Text className="mt-0.5 text-[12px] text-amber-800">
              Gen AI gắn hồ sơ con dưới tài khoản phụ huynh (như MobileApp)
            </Text>
          </Pressable>
        ) : null}

        <Text className="mb-3 text-lg font-extrabold text-slate-900">
          Khu vực sáng tạo
        </Text>

        <View
          style={{
            flexDirection: wide ? 'row' : 'column',
            flexWrap: wide ? 'wrap' : 'nowrap',
            gap,
          }}
        >
          {CARDS.map((card) => (
            <Pressable
              key={card.href}
              onPress={() => router.push(card.href)}
              className="overflow-hidden rounded-[24px] border border-orange-100/80 bg-white active:opacity-95"
              style={{
                width: wide && cardW ? cardW : '100%',
                shadowColor: '#FB923C',
                shadowOpacity: 0.1,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 6 },
              }}
              accessibilityRole="button"
              accessibilityLabel={card.title}
            >
              <View style={{ height: wide ? 176 : 156, width: '100%' }}>
                <Image
                  source={{ uri: card.image }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  contentPosition="top"
                  transition={200}
                />
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingHorizontal: 16,
                    paddingBottom: 14,
                    paddingTop: 48,
                    backgroundColor: 'rgba(15, 23, 42, 0.42)',
                  }}
                >
                  <Text className="text-[17px] font-extrabold text-white">
                    {card.title}
                  </Text>
                  <Text className="mt-0.5 text-[13px] font-medium text-white/90">
                    {card.desc}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
