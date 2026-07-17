import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { extractErrorMessage } from '@/core/api/unwrap';
import { useAuth } from '@/core/auth/useAuth';
import {
  DELETE_ACCOUNT_WEB_URL,
  PRIVACY_POLICY_URL,
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
  TERMS_OF_SERVICE_URL,
} from '@/core/legal/links';
import { queryClient } from '@/core/query/queryClient';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { useProfile } from '@/features/account/api/accountHooks';
import { ageBandLabel } from '@/features/family/types';
import { useFamily } from '@/features/family/store/useFamily';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';

/**
 * Account — parent JWT + family children (MobileApp model).
 */
export default function AccountScreen() {
  const router = useRouter();
  const { user, logout, deleteAccount, isLoading: authBusy } = useAuth();
  const {
    workspaces,
    activeIpId,
    isLoading: wsLoading,
    error: wsError,
    selectWorkspace,
    loadWorkspaces,
  } = useWorkspace();

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useProfile();

  const {
    children,
    activeChildId,
    loadFamily,
    setActiveChild,
  } = useFamily();
  const setRecentScope = useRecentAiImages((s) => s.setScope);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const displayName =
    profileData?.profile?.name || user?.name || user?.email || 'Phụ huynh';
  const email =
    profileData?.profile?.email || (user?.email as string | undefined) || '—';

  useEffect(() => {
    void loadFamily();
  }, [loadFamily]);

  const handleLogout = useCallback(() => {
    Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất khỏi thiết bị này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            queryClient.clear();
            await logout();
            router.replace('/(auth)/login');
          })();
        },
      },
    ]);
  }, [logout, router]);

  const openDeleteFlow = useCallback(() => {
    Alert.alert(
      'Xóa tài khoản',
      'Toàn bộ dữ liệu tài khoản sẽ bị xóa và không khôi phục được. Bạn chắc chắn?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Tiếp tục',
          style: 'destructive',
          onPress: () => {
            setDeletePassword('');
            setDeleteError(null);
            setDeleteOpen(true);
          },
        },
      ],
    );
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Nhập mật khẩu để xác nhận');
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(deletePassword);
      queryClient.clear();
      setDeleteOpen(false);
      Alert.alert('Đã xóa tài khoản', 'Cảm ơn bạn đã dùng AIkid / StoryMee.');
      router.replace('/(auth)/login');
    } catch (err: unknown) {
      setDeleteError(
        extractErrorMessage(err, 'Không xóa được. Kiểm tra mật khẩu và thử lại.'),
      );
    } finally {
      setDeleting(false);
    }
  }, [deleteAccount, deletePassword, router]);

  const handleSelectWorkspace = useCallback(
    async (ipId: string) => {
      if (ipId === activeIpId) return;
      await selectWorkspace(ipId);
      void queryClient.invalidateQueries({ queryKey: ['media'] });
      void queryClient.invalidateQueries({ queryKey: ['account', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    [activeIpId, selectWorkspace],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FFF8F2]">
      <View className="flex-row items-center justify-between border-b border-orange-100 bg-white px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="rounded-full bg-orange-50 px-3 py-1.5"
          accessibilityRole="button"
        >
          <Text className="text-[14px] font-bold text-brand">← Về</Text>
        </Pressable>
        <Text className="text-[17px] font-extrabold text-slate-900">
          Tài khoản
        </Text>
        <View className="w-[72px]" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        {/* Identity */}
        <View className="mb-4 rounded-2xl border border-orange-100 bg-white p-4">
          <Text className="text-[12px] font-bold uppercase tracking-wide text-slate-400">
            Phụ huynh
          </Text>
          {profileLoading ? (
            <ActivityIndicator className="mt-3" color="#FF6B6B" />
          ) : (
            <>
              <Text className="mt-2 text-xl font-extrabold text-slate-900">
                {String(displayName)}
              </Text>
              <Text className="mt-1 text-[14px] text-slate-600">{email}</Text>
              {profileError ? (
                <Pressable onPress={() => void refetchProfile()} className="mt-2">
                  <Text className="text-[13px] font-semibold text-brand">
                    Không tải được profile · Thử lại
                  </Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>

        {/* Family children */}
        <View className="mb-4 rounded-2xl border border-orange-100 bg-white p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[12px] font-bold uppercase tracking-wide text-slate-400">
              Hồ sơ con
            </Text>
            <Pressable onPress={() => router.push('/(app)/family')}>
              <Text className="text-[12px] font-bold text-brand">Quản lý</Text>
            </Pressable>
          </View>
          {children.length === 0 ? (
            <Pressable
              onPress={() => router.push('/(app)/family/create-child')}
              className="rounded-xl border border-dashed border-orange-200 bg-orange-50 px-3 py-4"
            >
              <Text className="text-center text-[14px] font-bold text-brand">
                + Tạo hồ sơ con
              </Text>
              <Text className="mt-1 text-center text-[12px] text-slate-500">
                9–15 tuổi · không email riêng
              </Text>
            </Pressable>
          ) : (
            children.map((c) => {
              const on = c.id === activeChildId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    void (async () => {
                      await setActiveChild(c.id);
                      await setRecentScope(c.id);
                    })();
                  }}
                  className={`mb-2 rounded-xl border px-3 py-3 ${
                    on ? 'border-brand bg-orange-50' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <Text
                    className={`text-[15px] font-bold ${
                      on ? 'text-brand' : 'text-slate-800'
                    }`}
                  >
                    {c.name}
                    {on ? ' · đang chọn' : ''}
                  </Text>
                  <Text className="mt-0.5 text-[12px] text-slate-500">
                    {ageBandLabel(String(c.ageBand))} · AI{' '}
                    {c.consent.allowAiCreate ? 'bật' : 'tắt'}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>

        {/* Workspace */}
        <View className="mb-4 rounded-2xl border border-orange-100 bg-white p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[12px] font-bold uppercase tracking-wide text-slate-400">
              Workspace (ipId)
            </Text>
            <Pressable onPress={() => void loadWorkspaces()}>
              <Text className="text-[12px] font-bold text-brand">Làm mới</Text>
            </Pressable>
          </View>
          {wsError ? (
            <Text className="mb-2 text-[12px] text-red-500">{wsError}</Text>
          ) : null}
          {wsLoading && !workspaces.length ? (
            <ActivityIndicator color="#FF6B6B" />
          ) : workspaces.length === 0 ? (
            <Text className="text-[13px] text-slate-500">
              Chưa có workspace — dùng ipId mặc định khi gen ảnh.
            </Text>
          ) : (
            workspaces.map((ws) => {
              const active = ws.ipId === activeIpId;
              return (
                <Pressable
                  key={ws.ipId}
                  onPress={() => void handleSelectWorkspace(ws.ipId)}
                  className={`mb-2 rounded-xl border px-3 py-3 ${
                    active
                      ? 'border-brand bg-orange-50'
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <Text
                    className={`text-[15px] font-bold ${
                      active ? 'text-brand' : 'text-slate-800'
                    }`}
                  >
                    {ws.name || 'Workspace'}
                    {active ? ' · đang chọn' : ''}
                  </Text>
                  <Text className="mt-0.5 font-mono text-[11px] text-slate-400">
                    {ws.ipId}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>

        {/* Legal / support */}
        <View className="mb-4 rounded-2xl border border-orange-100 bg-white p-4">
          <Text className="mb-2 text-[12px] font-bold uppercase tracking-wide text-slate-400">
            Pháp lý & hỗ trợ
          </Text>
          <LinkRow
            label="Chính sách bảo mật"
            onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
          />
          <LinkRow
            label="Điều khoản sử dụng"
            onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)}
          />
          <LinkRow
            label={`Hỗ trợ · ${SUPPORT_EMAIL}`}
            onPress={() => void Linking.openURL(SUPPORT_MAILTO)}
          />
          <LinkRow
            label="Xóa tài khoản (web)"
            onPress={() => void Linking.openURL(DELETE_ACCOUNT_WEB_URL)}
          />
        </View>

        {/* Actions */}
        <Pressable
          onPress={handleLogout}
          disabled={authBusy}
          className="mb-3 h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white"
        >
          <Text className="text-[15px] font-bold text-slate-800">Đăng xuất</Text>
        </Pressable>

        <Pressable
          onPress={openDeleteFlow}
          className="h-12 items-center justify-center rounded-2xl bg-red-50"
        >
          <Text className="text-[15px] font-bold text-red-600">
            Xóa tài khoản
          </Text>
        </Pressable>
      </ScrollView>

      {/* Delete confirm modal */}
      <Modal visible={deleteOpen} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-md rounded-2xl bg-white p-5">
            <Text className="text-lg font-extrabold text-slate-900">
              Xác nhận xóa
            </Text>
            <Text className="mt-2 text-[13px] leading-5 text-slate-600">
              Nhập mật khẩu tài khoản phụ huynh để xóa vĩnh viễn (DELETE
              /internal/v1/account/me).
            </Text>
            <TextInput
              className="mt-4 h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-base text-slate-900"
              secureTextEntry
              placeholder="Mật khẩu"
              placeholderTextColor="#94A3B8"
              value={deletePassword}
              onChangeText={(v) => {
                setDeletePassword(v);
                setDeleteError(null);
              }}
            />
            {deleteError ? (
              <Text className="mt-2 text-[13px] font-medium text-red-600">
                {deleteError}
              </Text>
            ) : null}
            <View className="mt-4 flex-row gap-2">
              <Pressable
                onPress={() => setDeleteOpen(false)}
                className="h-11 flex-1 items-center justify-center rounded-xl border border-slate-200"
              >
                <Text className="font-bold text-slate-700">Huỷ</Text>
              </Pressable>
              <Pressable
                onPress={() => void confirmDelete()}
                disabled={deleting}
                className="h-11 flex-1 items-center justify-center rounded-xl bg-red-500"
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-bold text-white">Xóa</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="border-b border-slate-100 py-3 active:opacity-70"
    >
      <Text className="text-[14px] font-semibold text-slate-800">{label}</Text>
    </Pressable>
  );
}
