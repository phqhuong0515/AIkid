import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { familyApi, mediaApi, profileApi } from '@/core/storymee';
import { ageBandLabel } from '@/features/family/types';
import { useFamily } from '@/features/family/store/useFamily';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { GlobalHeader } from '@/components/GlobalHeader';

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, actor, logout, deleteAccount, isLoading: authBusy } = useAuth();
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
  } = useProfile({ enabled: actor === 'parent' });

  const {
    children,
    activeChildId,
    loadFamily,
    setActiveChild,
    replaceChild,
  } = useFamily();
  const setRecentScope = useRecentAiImages((s) => s.setScope);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const activeChild = children.find((child) => child.id === activeChildId);

  const changeAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Cần quyền truy cập thư viện');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;
    setAvatarBusy(true);
    try {
      const form = new FormData();
      form.append('file', { uri: asset.uri, name: asset.fileName || 'avatar.jpg', type: asset.mimeType || 'image/jpeg' } as unknown as Blob);
      const upload = await mediaApi.upload(form, { ipId: activeIpId || undefined, assetType: 'avatar', permanent: 'true', tags: actor === 'child' && activeChildId ? `child:${activeChildId}` : undefined });
      const avatarUrl = String(upload.url || upload.imageUrl || upload.urls?.[0] || '');
      if (!avatarUrl) throw new Error('Upload không trả URL ảnh');
      if (actor === 'child') replaceChild(await familyApi.updateMyAvatar(avatarUrl) as never);
      else await profileApi.updateProfile({ avatarUrl });
      if (actor === 'parent') await refetchProfile();
    } catch (error) { Alert.alert('Không đổi được avatar', error instanceof Error ? error.message : 'Thử lại sau'); }
    finally { setAvatarBusy(false); }
  }, [activeChildId, activeIpId, actor, refetchProfile, replaceChild]);

  const displayName =
    profileData?.profile?.name || user?.name || user?.email || 'Phụ huynh';
  const email =
    profileData?.profile?.email || (user?.email as string | undefined) || '—';

  useEffect(() => {
    if (actor === 'parent') void loadFamily();
  }, [actor, loadFamily]);

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
    <View style={styles.container}>
      <ImageBackground source={require('../../public/lobby-assets/images/bg-art.png')} style={styles.bgImage} resizeMode="cover">
        <View style={{ paddingTop: Math.max(20, insets.top), flex: 1 }}>
          <View style={{ paddingHorizontal: 16, zIndex: 10, paddingBottom: 16 }}>
            <GlobalHeader />
          </View>
          
          <View style={styles.mainCard}>
            <Text style={{ marginTop: 24, fontSize: 24, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>Tài khoản</Text>
            
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 16 }}>
              {/* Identity */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionSubtitle}>
                  {actor === 'child' ? 'Tài khoản bé' : 'Phụ huynh'}
                </Text>
                {profileLoading ? (
                  <ActivityIndicator style={{ marginTop: 12 }} color="#FF7597" />
                ) : (
                  <>
                    <Text style={styles.titleText}>{String(displayName)}</Text>
                    <Text style={styles.subtitleText}>{email}</Text>
                    {profileError ? (
                      <Pressable onPress={() => void refetchProfile()} style={{ marginTop: 8 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#FF7597' }}>
                          Không tải được profile · Thử lại
                        </Text>
                      </Pressable>
                    ) : null}
                  </>
                )}
                <Pressable onPress={() => void changeAvatar()} disabled={avatarBusy} style={styles.actionBtn}>
                  {(actor === 'child' ? activeChild?.avatarUrl : profileData?.profile.avatarUrl) ? (
                    <Image source={{ uri: String(actor === 'child' ? activeChild?.avatarUrl : profileData?.profile.avatarUrl) }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                  ) : (
                    <View style={{ height: 48, width: 48, borderRadius: 24, backgroundColor: '#FED7AA' }} />
                  )}
                  <Text style={styles.actionBtnText}>{avatarBusy ? 'Đang tải…' : 'Đổi ảnh đại diện'}</Text>
                </Pressable>
              </View>

              {/* Family children */}
              {actor === 'parent' ? (
                <View style={styles.sectionCard}>
                  <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.sectionSubtitle}>Hồ sơ con</Text>
                    <Pressable onPress={() => router.push('/(app)/family')}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FF7597' }}>Quản lý</Text>
                    </Pressable>
                  </View>
                  {children.length === 0 ? (
                    <Pressable
                      onPress={() => router.push('/(app)/family/create-child')}
                      style={styles.dashedBtn}
                    >
                      <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#FF7597' }}>
                        + Tạo hồ sơ con
                      </Text>
                      <Text style={{ marginTop: 4, textAlign: 'center', fontSize: 12, color: '#64748B' }}>
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
                          style={[styles.itemRow, on ? styles.itemRowActive : styles.itemRowInactive]}
                        >
                          <Text style={[styles.itemRowTitle, on ? styles.itemRowTitleActive : styles.itemRowTitleInactive]}>
                            {c.name}
                            {on ? ' · đang chọn' : ''}
                          </Text>
                          <Text style={styles.itemRowSubtitle}>
                            {ageBandLabel(String(c.ageBand))} · AI{' '}
                            {c.consent.allowAiCreate ? 'bật' : 'tắt'}
                          </Text>
                        </Pressable>
                      );
                    })
                  )}
                </View>
              ) : null}

              {/* Workspace */}
              <View style={styles.sectionCard}>
                <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.sectionSubtitle}>Workspace (ipId)</Text>
                  <Pressable onPress={() => void loadWorkspaces()}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FF7597' }}>Làm mới</Text>
                  </Pressable>
                </View>
                {wsError ? (
                  <Text style={{ marginBottom: 8, fontSize: 12, color: '#EF4444' }}>{wsError}</Text>
                ) : null}
                {wsLoading && !workspaces.length ? (
                  <ActivityIndicator color="#FF7597" />
                ) : workspaces.length === 0 ? (
                  <Text style={{ fontSize: 13, color: '#64748B' }}>
                    Chưa có workspace — dùng ipId mặc định khi gen ảnh.
                  </Text>
                ) : (
                  workspaces.map((ws) => {
                    const active = ws.ipId === activeIpId;
                    return (
                      <Pressable
                        key={ws.ipId}
                        onPress={() => void handleSelectWorkspace(ws.ipId)}
                        style={[styles.itemRow, active ? styles.itemRowActive : styles.itemRowInactive]}
                      >
                        <Text style={[styles.itemRowTitle, active ? styles.itemRowTitleActive : styles.itemRowTitleInactive]}>
                          {ws.name || 'Workspace'}
                          {active ? ' · đang chọn' : ''}
                        </Text>
                        <Text style={{ marginTop: 2, fontFamily: 'monospace', fontSize: 11, color: '#94A3B8' }}>
                          {ws.ipId}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </View>

              {/* Legal / support */}
              <View style={styles.sectionCard}>
                <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>Pháp lý & hỗ trợ</Text>
                <LinkRow label="Chính sách bảo mật" onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)} />
                <LinkRow label="Điều khoản sử dụng" onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)} />
                <LinkRow label={`Hỗ trợ · ${SUPPORT_EMAIL}`} onPress={() => void Linking.openURL(SUPPORT_MAILTO)} />
                <LinkRow label="Xóa tài khoản (web)" onPress={() => void Linking.openURL(DELETE_ACCOUNT_WEB_URL)} />
              </View>

              {/* Actions */}
              <Pressable
                onPress={handleLogout}
                disabled={authBusy}
                style={styles.logoutBtn}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>Đăng xuất</Text>
              </Pressable>

              {actor === 'parent' ? (
                <Pressable
                  onPress={openDeleteFlow}
                  style={styles.deleteBtn}
                >
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#DC2626' }}>Xóa tài khoản</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </ImageBackground>

      {/* Delete confirm modal */}
      <Modal visible={deleteOpen} transparent animationType="fade">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 24 }}>
          <View style={{ width: '100%', maxWidth: 400, borderRadius: 24, backgroundColor: '#FFFFFF', padding: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>Xác nhận xóa</Text>
            <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 20, color: '#475569' }}>
              Nhập mật khẩu tài khoản phụ huynh để xóa vĩnh viễn (DELETE /api/v1/account/me).
            </Text>
            <TextInput
              style={{ marginTop: 16, height: 48, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', paddingHorizontal: 16, fontSize: 16, color: '#0F172A' }}
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
              <Text style={{ marginTop: 8, fontSize: 13, fontWeight: '500', color: '#DC2626' }}>{deleteError}</Text>
            ) : null}
            <View style={{ marginTop: 24, flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setDeleteOpen(false)}
                style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' }}
              >
                <Text style={{ fontWeight: 'bold', color: '#334155' }}>Huỷ</Text>
              </Pressable>
              <Pressable
                onPress={() => void confirmDelete()}
                disabled={deleting}
                style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#EF4444' }}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: '#FFFFFF' }}>Xóa</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 14 }}
    >
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#FDFAF4',
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#94A3B8',
  },
  titleText: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitleText: {
    marginTop: 4,
    fontSize: 14,
    color: '#475569',
  },
  actionBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    padding: 12,
  },
  actionBtnText: {
    fontWeight: 'bold',
    color: '#FF7597',
  },
  dashedBtn: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  itemRow: {
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  itemRowActive: {
    borderColor: '#FF7597',
    backgroundColor: '#FFF7ED',
  },
  itemRowInactive: {
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  itemRowTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemRowTitleActive: {
    color: '#FF7597',
  },
  itemRowTitleInactive: {
    color: '#1E293B',
  },
  itemRowSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
  },
  logoutBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  deleteBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
  },
});
