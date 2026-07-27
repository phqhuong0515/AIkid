import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/core/auth/useAuth';
import { ageBandLabel } from '@/features/family/types';
import { useFamily } from '@/features/family/store/useFamily';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { GlobalHeader } from '@/components/GlobalHeader';

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

export default function FamilyPickerScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      <ImageBackground source={require('../../../public/lobby-assets/images/bg-art.png')} style={styles.bgImage} resizeMode="cover">
        <View style={{ paddingTop: Math.max(20, insets.top), flex: 1 }}>
          <View style={{ paddingHorizontal: 16, zIndex: 10, paddingBottom: 16 }}>
            <GlobalHeader />
          </View>

          <View style={styles.mainCard}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Hồ sơ con</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {user?.name || 'Phụ huynh'} · chọn con để sáng tạo
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(app)/family/create-child')}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnText}>+ Thêm</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: pad, paddingBottom: 60 }}>
              {error ? (
                <Text style={{ marginBottom: 12, fontSize: 13, fontWeight: '500', color: '#DC2626' }}>{error}</Text>
              ) : null}

              {!isHydrated || (isLoading && !children.length) ? (
                <ActivityIndicator style={{ marginTop: 40 }} color="#FF7597" size="large" />
              ) : children.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>Chưa có hồ sơ con</Text>
                  <Text style={styles.emptySubtitle}>
                    Tạo hồ sơ 9–15 tuổi dưới tài khoản phụ huynh. Con không cần email riêng.
                  </Text>
                  <Pressable
                    onPress={() => router.push('/(app)/family/create-child')}
                    style={styles.createBtn}
                  >
                    <Text style={styles.createBtnText}>Tạo hồ sơ con</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={[styles.grid, { gap }]}>
                  {children.map((child) => {
                    const active = child.id === activeChildId;
                    const color = avatarColor(child.id, child.name);
                    const initial = (child.name || '?').trim().charAt(0).toUpperCase();
                    return (
                      <Pressable
                        key={child.id}
                        onPress={() => void onSelect(child.id)}
                        onLongPress={() => onDelete(child.id, child.name)}
                        style={[
                          styles.childCard,
                          { width: colW },
                          active ? styles.childCardActive : styles.childCardInactive,
                        ]}
                      >
                        <View style={[styles.avatarBox, { backgroundColor: color }]}>
                          <Text style={styles.avatarText}>{initial}</Text>
                        </View>
                        <Text style={styles.childName} numberOfLines={1}>
                          {child.name}
                        </Text>
                        <Text style={styles.childAge}>
                          {ageBandLabel(String(child.ageBand))}
                        </Text>
                        <Text style={styles.childMeta}>
                          AI: {child.consent.allowAiCreate ? 'bật' : 'tắt'}
                          {active ? ' · đang chọn' : ''}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {children.length > 0 ? (
                <Text style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>
                  Giữ lâu trên thẻ để xóa hồ sơ
                </Text>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </ImageBackground>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },
  addBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FF7597',
    paddingHorizontal: 16,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyBox: {
    marginTop: 24,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FED7AA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  createBtn: {
    marginTop: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FF7597',
    paddingHorizontal: 32,
  },
  createBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  childCard: {
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  childCardActive: {
    borderColor: '#FF7597',
  },
  childCardInactive: {
    borderColor: '#FFEDD5',
  },
  avatarBox: {
    marginBottom: 12,
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  childName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  childAge: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
  },
  childMeta: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
