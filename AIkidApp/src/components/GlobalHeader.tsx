/**
 * GlobalHeader — Thanh header chuẩn AIkid
 *
 * Hiển thị trên mọi màn hình trong app (auth):
 *   LEFT  → Logo Alkid (→ về lobby khi tap)
 *   RIGHT → Avatar circle (→ mở Account bottom sheet)
 *
 * Account bottom sheet:
 *   - Thông tin user / child
 *   - Số lượt AI còn lại
 *   - Quick actions: Tài khoản, Gallery, Gói AI, Hồ sơ bé
 *   - Đăng xuất
 */

import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/core/auth/useAuth';
import { billingApi } from '@/core/storymee';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { useFamily } from '@/features/family/store/useFamily';
import {
  AikidBrandColors,
  AikidFonts,
  AikidFrameColors,
  AikidRadius,
  AikidShadows,
  AikidTextColors,
} from '@/ui';
import { AikidModal } from '@/ui/AikidModal';

function formatExpiry(value?: string | null) {
  if (!value) return 'Không giới hạn';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
}

// ─── Account Bottom Sheet ──────────────────────────────────────────────────────

function AccountSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user, actor, logout } = useAuth();
  const { activeIpId, workspaces, isHydrated } = useWorkspace();
  const activeChild = useFamily((state) => state.getActiveChild());

  const summary = useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: () => billingApi.getAiSummary(),
    staleTime: 30_000,
    enabled: open,
  });

  const displayName = String(
    user?.name ||
    user?.email ||
    (actor === 'child' ? activeChild?.name || 'Bé sáng tạo' : 'Phụ huynh'),
  );
  const avatarUrl = typeof user?.avatarUrl === 'string' ? user.avatarUrl : null;
  const initial = displayName.trim().charAt(0).toUpperCase() || 'A';
  const workspaceName =
    workspaces.find((w) => w.ipId === activeIpId)?.name ?? 'StoryMee';

  async function handleLogout() {
    onClose();
    await logout();
    router.replace('/(auth)/login');
  }

  function go(path: '/(app)/account' | '/(app)/plans' | '/(app)/gallery' | '/(app)/family') {
    onClose();
    router.push(path);
  }

  return (
    <AikidModal isOpen={open} onClose={onClose} position="bottom" maxWidth={560} noPadding>
      <View style={sheet.inner}>
        {/* Avatar + Name row */}
        <View style={sheet.profileRow}>
          <View style={sheet.avatarLg}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={sheet.avatarImg} contentFit="cover" />
            ) : (
              <View style={sheet.avatarFallback}>
                <Text style={sheet.avatarInitial}>{initial}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={sheet.profileName} numberOfLines={1}>{displayName}</Text>
            {actor !== 'child' ? (
              <Text style={sheet.profileSub} numberOfLines={1}>
                Tài khoản phụ huynh · {isHydrated ? workspaceName : '…'}
              </Text>
            ) : null}
          </View>
        </View>

        {/* AI Credits block */}
        <View style={sheet.creditsBlock}>
          {summary.isLoading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator color="#FDBA74" />
              <Text style={sheet.creditsMuted}>Đang tải số lượt AI…</Text>
            </View>
          ) : summary.isError ? (
            <View>
              <Text style={[sheet.creditsCount, { color: '#F87171' }]}>
                Không tải được số lượt AI
              </Text>
              <TouchableOpacity
                onPress={() => void summary.refetch()}
                style={sheet.retryBtn}
              >
                <Text style={sheet.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : actor === 'child' ? (
            <Text style={sheet.creditsCount}>
              ✨ {summary.data?.remainingCreateCredits ?? 0} lượt còn lại
            </Text>
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={sheet.planBadge}>GÓI {summary.data?.plan?.toUpperCase() || 'FREE'}</Text>
                <Text style={sheet.creditsMuted}>HH: {formatExpiry(summary.data?.expiresAt)}</Text>
              </View>
              <Text style={sheet.creditsCount}>
                {summary.data?.remainingCreateCredits ?? 0} lượt còn lại
              </Text>
              <Text style={sheet.creditsMuted}>
                Tháng: {summary.data?.monthlyRemainingCreateCredits ?? 0}/{summary.data?.monthlyCreateCredits ?? 0}
                {' · '}Mua thêm: {summary.data?.bonusCreateCredits ?? 0}
              </Text>
            </>
          )}
        </View>

        {/* Quick actions */}
        <View style={sheet.actionGrid}>
          <TouchableOpacity style={[sheet.actionBtn, { backgroundColor: '#FFF7ED' }]} onPress={() => go('/(app)/account')}>
            <Text style={[sheet.actionBtnText, { color: '#92400E' }]}>🧑 Tài khoản</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[sheet.actionBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => go('/(app)/gallery')}>
            <Text style={[sheet.actionBtnText, { color: '#334155' }]}>🖼️ Gallery</Text>
          </TouchableOpacity>
          {actor !== 'child' && (
            <>
              <TouchableOpacity style={[sheet.actionBtn, { backgroundColor: AikidBrandColors.pinkLight }]} onPress={() => go('/(app)/plans')}>
                <Text style={[sheet.actionBtnText, { color: AikidBrandColors.pink }]}>✨ Gói AI</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[sheet.actionBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => go('/(app)/family')}>
                <Text style={[sheet.actionBtnText, { color: '#334155' }]}>👨‍👩‍👧 Hồ sơ bé</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={sheet.logoutBtn} onPress={() => void handleLogout()}>
          <Text style={sheet.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </AikidModal>
  );
}

// ─── GlobalHeader ──────────────────────────────────────────────────────────────

type GlobalHeaderProps = {
  /** Tắt bottom padding mặc định */
  noMargin?: boolean;
};

export function GlobalHeader({ noMargin }: GlobalHeaderProps) {
  const router = useRouter();
  const { user, actor } = useAuth();
  const activeChild = useFamily((state) => state.getActiveChild());
  const [sheetOpen, setSheetOpen] = useState(false);

  const displayName = String(
    user?.name ||
    user?.email ||
    (actor === 'child' ? activeChild?.name || 'Bé sáng tạo' : 'Phụ huynh'),
  );
  const avatarUrl = typeof user?.avatarUrl === 'string' ? user.avatarUrl : null;
  const initial = displayName.trim().charAt(0).toUpperCase() || 'A';

  return (
    <>
      <View style={[styles.header, noMargin && { marginBottom: 0 }]}>
        {/* Logo → lobby */}
        <Pressable
          onPress={() => router.push('/(app)/lobby' as any)}
          style={styles.logoBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('../../public/hub-images/logo.svg')}
            style={styles.logo}
            contentFit="contain"
          />
        </Pressable>

        {/* Avatar → account */}
        <Pressable
          onPress={() => setSheetOpen(true)}
          style={styles.avatarBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImg}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <AccountSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 8,
    // Pill-shaped frosted header
    marginHorizontal: 12,
    backgroundColor: 'rgba(253,250,244,0.88)',
    borderRadius: AikidRadius.pill,
    borderWidth: 2,
    borderColor: AikidFrameColors.white,
    ...AikidShadows.soft,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  logoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 38,
  },
  avatarBtn: {
    width: 48,
    height: 48,
    borderRadius: AikidRadius.pill,
    backgroundColor: AikidFrameColors.white,
    borderWidth: 2.5,
    borderColor: AikidBrandColors.pink,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AikidBrandColors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: AikidBrandColors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: AikidFonts.headingBold,
    fontSize: 20,
    color: AikidTextColors.white,
  },
});

const sheet = StyleSheet.create({
  inner: {
    paddingHorizontal: 22,
    paddingTop: 4,
    gap: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLg: {
    width: 56,
    height: 56,
    borderRadius: AikidRadius.pill,
    backgroundColor: AikidBrandColors.pinkLight,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: AikidBrandColors.pink,
  },
  avatarImg: {
    width: 56,
    height: 56,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    backgroundColor: AikidBrandColors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: AikidFonts.headingBold,
    fontSize: 22,
    color: AikidTextColors.white,
  },
  profileName: {
    fontFamily: AikidFonts.headingBold,
    fontSize: 18,
    color: AikidTextColors.heading,
  },
  profileSub: {
    fontFamily: AikidFonts.bodyReg,
    fontSize: 12,
    color: AikidTextColors.body,
    marginTop: 2,
  },
  creditsBlock: {
    backgroundColor: '#1E293B',
    borderRadius: AikidRadius.card,
    padding: 16,
    gap: 6,
  },
  planBadge: {
    fontFamily: AikidFonts.headingMed,
    fontSize: 11,
    color: '#FDBA74',
    letterSpacing: 0.8,
  },
  creditsCount: {
    fontFamily: AikidFonts.headingBold,
    fontSize: 26,
    color: AikidFrameColors.white,
  },
  creditsMuted: {
    fontFamily: AikidFonts.bodyReg,
    fontSize: 12,
    color: '#94A3B8',
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: AikidRadius.sm,
    alignSelf: 'flex-start',
  },
  retryBtnText: {
    fontFamily: AikidFonts.bodySemi,
    fontSize: 13,
    color: AikidFrameColors.white,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    minWidth: '44%',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: AikidRadius.input,
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: AikidFonts.headingSemi,
    fontSize: 14,
  },
  logoutBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  logoutText: {
    fontFamily: AikidFonts.bodySemi,
    fontSize: 14,
    color: '#EF4444',
  },
});
