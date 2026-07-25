import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/core/auth/useAuth';
import { billingApi } from '@/core/storymee';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { useFamily } from '@/features/family/store/useFamily';

function formatExpiry(value?: string | null) {
  if (!value) return 'Không giới hạn';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
}

export function GlobalHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { user, actor, logout } = useAuth();
  const { activeIpId, workspaces, isHydrated } = useWorkspace();
  const activeChild = useFamily((state) => state.getActiveChild());
  
  const [accountOpen, setAccountOpen] = useState(false);
  const summary = useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: () => billingApi.getAiSummary(),
    staleTime: 30_000,
  });

  const displayName = String(user?.name || user?.email || (actor === 'child' ? activeChild?.name || 'Bé sáng tạo' : 'Phụ huynh'));
  const avatarUrl = typeof user?.avatarUrl === 'string' ? user.avatarUrl : actor === 'child' ? activeChild?.avatarUrl : null;
  const initial = displayName.trim().charAt(0).toUpperCase() || 'A';
  const workspaceName = workspaces.find((w) => w.ipId === activeIpId)?.name ?? 'StoryMee';

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
    <>
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/(app)/lobby' as any)} style={styles.logoContainer}>
          <Image source={require('../../public/hub-images/logo.svg')} style={styles.logo} contentFit="contain" />
        </Pressable>
        
        <Pressable onPress={() => setAccountOpen(true)} style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>{initial}</Text>
            </View>
          )}
        </Pressable>
      </View>

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
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 70,
    backgroundColor: 'rgba(253, 250, 244, 0.8)',
    borderRadius: 35,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    maxWidth: 1200,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: 40,
    width: 120,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#ff7597',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff7597',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FF5C8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});
