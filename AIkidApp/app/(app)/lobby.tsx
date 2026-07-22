import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/core/auth/useAuth';
import { billingApi } from '@/core/storymee';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { useFamily } from '@/features/family/store/useFamily';

const CARDS = [
  { href: '/(app)/mee' as const, title: 'Tạo Mee', desc: 'Tạo người bạn đại diện của bé', image: require('../../public/hub-images/card_mee.jpeg') },
  { href: '/(app)/character' as const, title: 'Nhân vật AI', desc: 'Biến ý tưởng thành nhân vật', image: require('../../public/hub-images/home-character.jpeg') },
  { href: '/(app)/art' as const, title: 'Xưởng vẽ', desc: 'Vẽ, chụp và sáng tạo cùng AI', image: require('../../public/hub-images/card_art.jpeg') },
  { href: '/(app)/comic' as const, title: 'Sáng tác truyện', desc: 'Kể câu chuyện của riêng mình', image: require('../../public/hub-images/art-comic.jpeg') },
];

function formatExpiry(value?: string | null) {
  if (!value) return 'Không giới hạn';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
}

export default function LobbyScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const webGrid = width >= 760;
  const desktop = width >= 1040;
  const { user, actor, logout } = useAuth();
  const { activeIpId, workspaces, isHydrated } = useWorkspace();
  const activeChild = useFamily((state) => state.getActiveChild());
  const loadFamily = useFamily((state) => state.loadFamily);
  const [accountOpen, setAccountOpen] = useState(false);
  const summary = useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: () => billingApi.getAiSummary(),
    staleTime: 30_000,
  });

  useEffect(() => { void loadFamily(); }, [loadFamily]);

  const displayName = String(user?.name || user?.email || (actor === 'child' ? activeChild?.name || 'Bé sáng tạo' : 'Phụ huynh'));
  const avatarUrl = typeof user?.avatarUrl === 'string' ? user.avatarUrl : actor === 'child' ? activeChild?.avatarUrl : null;
  const initial = displayName.trim().charAt(0).toUpperCase() || 'A';
  const workspaceName = workspaces.find((workspace) => workspace.ipId === activeIpId)?.name ?? 'StoryMee';
  const contentWidth = Math.min(width, 1120);
  const sidePad = desktop ? 32 : 20;
  const gap = 16;
  const gridCardWidth = useMemo(() => Math.floor((contentWidth - sidePad * 2 - gap) / 2), [contentWidth, sidePad]);
  const carouselWidth = Math.min(width - 40, 360);

  async function handleLogout() {
    setAccountOpen(false);
    await logout();
    router.replace('/(auth)/login');
  }

  function go(path: '/(app)/account' | '/(app)/plans' | '/(app)/gallery' | '/(app)/family') {
    setAccountOpen(false);
    router.push(path);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FFF8F2]">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: sidePad, paddingTop: 12 }}>
          <View className="mb-5 flex-row items-center justify-between gap-3">
            <Text className="text-[13px] font-extrabold uppercase tracking-[2px] text-brand">AIkid Universe</Text>

            <Pressable onPress={() => setAccountOpen(true)} accessibilityRole="button" accessibilityLabel="Mở thông tin tài khoản" className="flex-row items-center rounded-full border border-orange-100 bg-white p-1.5 pr-3" style={{ shadowColor: '#FB923C', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
              <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand">
                {avatarUrl ? <Image source={{ uri: avatarUrl }} style={{ width: 40, height: 40 }} contentFit="cover" /> : <Text className="text-base font-extrabold text-white">{initial}</Text>}
              </View>
              <View className="ml-2 max-w-[112px]">
                <Text className="text-[12px] font-extrabold text-slate-900" numberOfLines={1}>{displayName}</Text>
                <Text className="text-[11px] font-bold text-brand">✨ {summary.isLoading ? '…' : summary.isError ? '—' : summary.data?.remainingCreateCredits ?? 0} lượt</Text>
              </View>
              <Text className="ml-1 text-slate-400">⌄</Text>
            </Pressable>
          </View>

          {!activeChild && actor !== 'child' ? (
            <Pressable onPress={() => go('/(app)/family')} className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3" accessibilityRole="button">
              <Text className="text-[14px] font-extrabold text-amber-900">Tạo hoặc chọn hồ sơ bé →</Text>
              <Text className="mt-0.5 text-[12px] text-amber-800">Tác phẩm AI sẽ được lưu đúng vào Gallery của bé.</Text>
            </Pressable>
          ) : null}

          <View className="mb-3 flex-row items-end justify-between">
            <View>
              <Text className="text-[20px] font-extrabold text-slate-900">Khu vực sáng tạo</Text>
              <Text className="mt-0.5 text-[12px] text-slate-500">{webGrid ? 'Chọn một xưởng để bắt đầu' : 'Vuốt ngang để khám phá các xưởng'}</Text>
            </View>
            {!webGrid ? <Text className="text-lg text-orange-300">‹  ›</Text> : null}
          </View>
        </View>

        {webGrid ? (
          <View style={{ width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: sidePad, flexDirection: 'row', flexWrap: 'wrap', gap }}>
            {CARDS.map((card, index) => (
              <Pressable key={card.href} onPress={() => router.push(card.href)} accessibilityRole="button" accessibilityLabel={card.title} className="overflow-hidden rounded-[26px] border border-orange-100 bg-white active:opacity-95" style={{ width: gridCardWidth, shadowColor: '#FB923C', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 7 } }}>
                <Image source={card.image} style={{ width: '100%', height: desktop && index < 2 ? 250 : 210 }} contentFit="cover" transition={180} />
                <View className="border-t border-orange-50 bg-white px-5 py-4">
                  <Text className="text-[18px] font-extrabold text-slate-900">{card.title}</Text>
                  <Text className="mt-1 text-[13px] text-slate-500">{card.desc}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={carouselWidth + 12} snapToAlignment="start" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}>
            {CARDS.map((card) => (
              <Pressable key={card.href} onPress={() => router.push(card.href)} accessibilityRole="button" accessibilityLabel={card.title} className="overflow-hidden rounded-[28px] border border-orange-100 bg-white active:opacity-95" style={{ width: carouselWidth, shadowColor: '#FB923C', shadowOpacity: 0.14, shadowRadius: 14, shadowOffset: { width: 0, height: 7 } }}>
                <Image source={card.image} style={{ width: '100%', height: 310 }} contentFit="cover" transition={180} />
                <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 78, height: 26, backgroundColor: 'rgba(15,23,42,0.16)' }} />
                <View className="min-h-[78px] justify-center bg-slate-900 px-5 py-3">
                  <Text className="text-[20px] font-extrabold text-white">{card.title}</Text>
                  <Text className="mt-1 text-[13px] text-slate-200">{card.desc}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      <Modal visible={accountOpen} transparent animationType="fade" onRequestClose={() => setAccountOpen(false)}>
        <View className="flex-1 justify-end bg-slate-950/35">
          <Pressable className="absolute inset-0" onPress={() => setAccountOpen(false)} accessibilityLabel="Đóng thông tin tài khoản" />
          <View className="w-full self-center rounded-t-[30px] bg-white px-5 pt-3" style={{ maxWidth: 560, paddingBottom: Math.max(insets.bottom, 18), shadowColor: '#0F172A', shadowOpacity: 0.22, shadowRadius: 24 }}>
            <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-slate-200" />
            <View className="flex-row items-center">
              <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-brand">
                {avatarUrl ? <Image source={{ uri: avatarUrl }} style={{ width: 56, height: 56 }} contentFit="cover" /> : <Text className="text-xl font-extrabold text-white">{initial}</Text>}
              </View>
              <View className="ml-3 min-w-0 flex-1">
                <Text className="text-lg font-extrabold text-slate-900" numberOfLines={1}>{displayName}</Text>
                {actor !== 'child' ? <Text className="mt-0.5 text-xs text-slate-500" numberOfLines={1}>Tài khoản phụ huynh · {isHydrated ? workspaceName : 'Đang tải…'}</Text> : null}
              </View>
              <Pressable onPress={() => setAccountOpen(false)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100" accessibilityRole="button"><Text className="text-lg text-slate-600">×</Text></Pressable>
            </View>

            <View className="mt-4 rounded-2xl bg-slate-900 p-4">
              {summary.isLoading ? <View className="flex-row items-center"><ActivityIndicator color="#FDBA74" /><Text className="ml-3 font-bold text-slate-300">Đang tải số lượt AI…</Text></View> : summary.isError ? <View><Text className="font-extrabold text-red-300">Không tải được số lượt AI</Text><Pressable onPress={() => void summary.refetch()} className="mt-2 self-start rounded-xl bg-white/10 px-3 py-2"><Text className="font-bold text-white">Thử lại</Text></Pressable></View> : actor === 'child' ? (
                <Text className="text-3xl font-extrabold text-white">✨ {summary.data?.remainingCreateCredits ?? 0} lượt còn lại</Text>
              ) : <>
                <View className="flex-row items-center justify-between"><Text className="font-bold uppercase tracking-wide text-orange-200">Gói {summary.data?.plan || 'free'}</Text><Text className="text-xs text-slate-400">Hết hạn: {formatExpiry(summary.data?.expiresAt)}</Text></View>
                <Text className="mt-2 text-3xl font-extrabold text-white">{summary.data?.remainingCreateCredits ?? 0} lượt còn lại</Text>
                <Text className="mt-1 text-xs text-slate-300">Tháng: {summary.data?.monthlyRemainingCreateCredits ?? 0}/{summary.data?.monthlyCreateCredits ?? 0} · Mua thêm: {summary.data?.bonusCreateCredits ?? 0}</Text>
              </>}
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              <Pressable onPress={() => go('/(app)/account')} className="basis-[48%] flex-1 rounded-2xl bg-orange-50 px-4 py-3"><Text className="text-center font-extrabold text-orange-900">Tài khoản</Text></Pressable>
              <Pressable onPress={() => go('/(app)/gallery')} className="basis-[48%] flex-1 rounded-2xl bg-slate-100 px-4 py-3"><Text className="text-center font-extrabold text-slate-800">Gallery</Text></Pressable>
              {actor !== 'child' ? <>
                <Pressable onPress={() => go('/(app)/plans')} className="basis-[48%] flex-1 rounded-2xl bg-brand px-4 py-3"><Text className="text-center font-extrabold text-white">Gói AI & lượt</Text></Pressable>
                <Pressable onPress={() => go('/(app)/family')} className="basis-[48%] flex-1 rounded-2xl bg-slate-100 px-4 py-3"><Text className="text-center font-extrabold text-slate-800">Hồ sơ bé</Text></Pressable>
              </> : null}
            </View>
            <Pressable onPress={() => void handleLogout()} className="mt-3 py-3" accessibilityRole="button"><Text className="text-center text-sm font-bold text-red-500">Đăng xuất</Text></Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
