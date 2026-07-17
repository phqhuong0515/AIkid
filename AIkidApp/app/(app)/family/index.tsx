import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/core/auth/useAuth';
import { ageBandLabel } from '@/features/family/types';
import { useFamily } from '@/features/family/store/useFamily';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';

const AVATAR_COLORS = [
  '#FF6B6B',
  '#FF8E53',
  '#4ECDC4',
  '#45B7D1',
  '#A78BFA',
  '#F472B6',
];

function avatarColor(id: string, name: string): string {
  let h = 0;
  const s = id || name;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 1)) % 997;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/**
 * Chọn / quản lý hồ sơ con — cùng model MobileApp (parent JWT + child_profiles).
 */
export default function FamilyPickerScreen() {
  const { width } = useWindowDimensions();
  const gap = 12;
  const pad = 16;
  const colW = Math.floor((Math.min(width, 720) - pad * 2 - gap) / 2);

  const router = useRouter();
  const { user } = useAuth();
  const {
    children,
    activeChildId,
    isLoading,
    isHydrated,
    loadFamily,
    setActiveChild,
    removeChild,
    error,
  } = useFamily();
  const setRecentScope = useRecentAiImages((s) => s.setScope);

  useEffect(() => {
    void loadFamily();
  }, [loadFamily]);

  const onSelect = useCallback(
    async (childId: string) => {
      await setActiveChild(childId);
      await setRecentScope(childId);
      router.replace('/(app)/lobby');
    },
    [setActiveChild, setRecentScope, router],
  );

  const onDelete = useCallback(
    (childId: string, name: string) => {
      Alert.alert('Xóa hồ sơ', `Xóa “${name}”? Không hoàn tác được.`, [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            void removeChild(childId).catch(() => {
              Alert.alert('Lỗi', 'Không xóa được hồ sơ.');
            });
          },
        },
      ]);
    },
    [removeChild],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FFF8F2]">
      <View className="flex-row items-end justify-between px-4 pb-2 pt-3">
        <View className="min-w-0 flex-1 pr-3">
          <Pressable onPress={() => router.back()} hitSlop={8} className="mb-2 self-start">
            <Text className="text-[14px] font-bold text-brand">← Về</Text>
          </Pressable>
          <Text className="text-[22px] font-extrabold text-slate-900">
            Hồ sơ con
          </Text>
          <Text className="mt-1 text-[13px] text-slate-500" numberOfLines={1}>
            {user?.name || 'Phụ huynh'} · chọn con để sáng tạo
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(app)/family/create-child')}
          className="h-10 items-center justify-center rounded-full bg-brand px-4"
        >
          <Text className="text-[13px] font-extrabold text-white">+ Thêm</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: pad, paddingBottom: 40 }}>
        {error ? (
          <Text className="mb-3 text-[13px] font-medium text-red-600">{error}</Text>
        ) : null}

        {!isHydrated || (isLoading && !children.length) ? (
          <ActivityIndicator className="mt-10" color="#FF6B6B" size="large" />
        ) : children.length === 0 ? (
          <View className="mt-6 items-center rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-10">
            <Text className="text-center text-lg font-extrabold text-slate-900">
              Chưa có hồ sơ con
            </Text>
            <Text className="mt-2 text-center text-[14px] leading-5 text-slate-500">
              Tạo hồ sơ 9–15 tuổi dưới tài khoản phụ huynh. Con không cần email
              riêng.
            </Text>
            <Pressable
              onPress={() => router.push('/(app)/family/create-child')}
              className="mt-6 h-12 items-center justify-center rounded-2xl bg-brand px-8"
            >
              <Text className="text-[15px] font-extrabold text-white">
                Tạo hồ sơ con
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row flex-wrap" style={{ gap }}>
            {children.map((child) => {
              const active = child.id === activeChildId;
              const color = avatarColor(child.id, child.name);
              const initial = (child.name || '?').trim().charAt(0).toUpperCase();
              return (
                <Pressable
                  key={child.id}
                  onPress={() => void onSelect(child.id)}
                  onLongPress={() => onDelete(child.id, child.name)}
                  style={{ width: colW }}
                  className={`rounded-2xl border-2 bg-white p-3 ${
                    active ? 'border-brand' : 'border-orange-100'
                  }`}
                >
                  <View
                    className="mb-3 h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: color }}
                  >
                    <Text className="text-xl font-extrabold text-white">
                      {initial}
                    </Text>
                  </View>
                  <Text
                    className="text-[15px] font-extrabold text-slate-900"
                    numberOfLines={1}
                  >
                    {child.name}
                  </Text>
                  <Text className="mt-0.5 text-[12px] text-slate-500">
                    {ageBandLabel(String(child.ageBand))}
                  </Text>
                  <Text className="mt-2 text-[11px] font-semibold text-slate-400">
                    AI: {child.consent.allowAiCreate ? 'bật' : 'tắt'}
                    {active ? ' · đang chọn' : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {children.length > 0 ? (
          <Text className="mt-6 text-center text-[12px] text-slate-400">
            Giữ lâu trên thẻ để xóa hồ sơ
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
