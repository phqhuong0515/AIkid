/**
 * GlobalHeader — Thanh header chuẩn AIkid
 *
 * Hiển thị trên mọi màn hình trong app (auth):
 *   LEFT  → Logo Alkid (→ về lobby khi tap)
 *   RIGHT → Chip lượt AI (→ mở chi tiết lượt AI) + Avatar circle (→ mở Account bottom sheet)
 *
 * Account bottom sheet:
 *   - Thông tin user / child
 *   - Số lượt AI còn lại
 *   - Quick actions: Tài khoản, Gallery, Gói AI, Hồ sơ học sinh
 *   - Đăng xuất
 */

import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
} from '@/features/kids-ui/theme';
import { AikidModal } from '@/ui/AikidModal';
import { AskParentCreditsModal } from '@/features/billing/components/AskParentCreditsModal';

function formatExpiry(value?: string | null) {
  if (!value) return 'Không giới hạn';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
}

// ─── Credits Detail Modal ──────────────────────────────────────────────────────

type CreditsDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAskParent: () => void;
  onGoPlans: () => void;
};

function CreditsDetailModal({
  isOpen,
  onClose,
  onAskParent,
  onGoPlans,
}: CreditsDetailModalProps) {
  const { actor } = useAuth();
  const summary = useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: () => billingApi.getAiSummary(),
    staleTime: 30_000,
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={creditModalStyles.overlay}>
        <Pressable style={creditModalStyles.backdrop} onPress={onClose} />
        <View style={creditModalStyles.card}>
          <View style={creditModalStyles.iconWrap}>
            <Text style={{ fontSize: 32 }}>⚡</Text>
          </View>

          <Text style={creditModalStyles.title}>Lượt Phép Thuật AI</Text>
          <Text style={creditModalStyles.sub}>
            {actor === 'child'
              ? 'Dùng để vẽ tranh AI và biến hóa nhân vật Mee'
              : 'Hạn mức tạo ảnh AI của tài khoản gia đình'}
          </Text>

          {/* Big number */}
          <View style={creditModalStyles.numberBox}>
            <Text style={creditModalStyles.bigNumber}>
              {summary.isLoading ? '...' : summary.data?.remainingCreateCredits ?? 0}
            </Text>
            <Text style={creditModalStyles.bigNumberLabel}>lượt còn lại</Text>
          </View>

          {/* Breakdowns */}
          <View style={creditModalStyles.breakdownBox}>
            <View style={creditModalStyles.breakdownRow}>
              <Text style={creditModalStyles.rowLabel}>Lượt theo tháng:</Text>
              <Text style={creditModalStyles.rowVal}>
                {summary.data?.monthlyRemainingCreateCredits ?? 0} / {summary.data?.monthlyCreateCredits ?? 0}
              </Text>
            </View>
            <View style={creditModalStyles.breakdownRow}>
              <Text style={creditModalStyles.rowLabel}>Lượt mua thêm:</Text>
              <Text style={creditModalStyles.rowVal}>
                {summary.data?.bonusCreateCredits ?? 0} lượt (không hết hạn)
              </Text>
            </View>
            <View style={[creditModalStyles.breakdownRow, { borderBottomWidth: 0 }]}>
              <Text style={creditModalStyles.rowLabel}>Gói hiện tại:</Text>
              <Text style={[creditModalStyles.rowVal, { color: '#FF7597', fontWeight: '800' }]}>
                {(summary.data?.plan || 'Miễn phí').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Actions */}
          {actor === 'child' ? (
            <TouchableOpacity
              style={creditModalStyles.actionBtnPrimary}
              onPress={() => {
                onClose();
                onAskParent();
              }}
              activeOpacity={0.85}
            >
              <Text style={creditModalStyles.actionBtnPrimaryText}>
                💌 Nhờ Phụ huynh nạp thêm
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={creditModalStyles.actionBtnPrimary}
              onPress={() => {
                onClose();
                onGoPlans();
              }}
              activeOpacity={0.85}
            >
              <Text style={creditModalStyles.actionBtnPrimaryText}>
                ⚡ Nạp thêm lượt / Nâng cấp gói
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={creditModalStyles.closeBtn} onPress={onClose}>
            <Text style={creditModalStyles.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
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
    (actor === 'child' ? activeChild?.name || 'Nhà sáng tạo nhí' : 'Phụ huynh'),
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

  const renderSheetContent = () => (
    <>
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
              <Text style={[sheet.actionBtnText, { color: '#334155' }]}>👨‍👩‍👧 Hồ sơ học sinh</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={sheet.logoutBtn} onPress={() => void handleLogout()}>
        <Text style={sheet.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </>
  );

  return Platform.OS === 'web' ? (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'transparent' }} onPress={onClose}>
        <View
          style={{
            position: 'absolute',
            top: 56,
            right: 16,
            width: 380,
            maxWidth: '92%',
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            borderWidth: 2,
            borderColor: '#F1F5F9',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 8,
            padding: 18,
            gap: 14,
          }}
          onStartShouldSetResponder={() => true}
        >
          {renderSheetContent()}
        </View>
      </Pressable>
    </Modal>
  ) : (
    <AikidModal isOpen={open} onClose={onClose} position="bottom" maxWidth={560} noPadding>
      <View style={sheet.inner}>
        {renderSheetContent()}
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
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [askParentOpen, setAskParentOpen] = useState(false);

  const summary = useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: () => billingApi.getAiSummary(),
    staleTime: 30_000,
  });

  const displayName = String(
    user?.name ||
    user?.email ||
    (actor === 'child' ? activeChild?.name || 'Nhà sáng tạo nhí' : 'Phụ huynh'),
  );
  const avatarUrl = typeof user?.avatarUrl === 'string' ? user.avatarUrl : null;
  const initial = displayName.trim().charAt(0).toUpperCase() || 'A';
  const remainingCredits = summary.data?.remainingCreateCredits ?? 0;

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

        {/* Right side: AI Credits Chip + Avatar */}
        <View style={styles.rightSection}>
          {/* AI Credits Chip */}
          <Pressable
            onPress={() => setCreditsOpen(true)}
            style={styles.creditsChip}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel={`Số lượt AI: ${remainingCredits} lượt`}
          >
            <Text style={styles.creditsChipIcon}>⚡</Text>
            <Text style={styles.creditsChipText}>
              {summary.isLoading ? '...' : `${remainingCredits} lượt`}
            </Text>
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
      </View>

      {/* Account Bottom Sheet */}
      <AccountSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      {/* Credits Detail Modal */}
      <CreditsDetailModal
        isOpen={creditsOpen}
        onClose={() => setCreditsOpen(false)}
        onAskParent={() => setAskParentOpen(true)}
        onGoPlans={() => router.push('/(app)/plans')}
      />

      {/* Ask Parent Credits Modal */}
      <AskParentCreditsModal
        isOpen={askParentOpen}
        onClose={() => setAskParentOpen(false)}
        studentName={activeChild?.name}
      />
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    // Pill-shaped frosted header
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  creditsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  creditsChipIcon: {
    fontSize: 14,
    color: '#D97706',
  },
  creditsChipText: {
    fontFamily: AikidFonts.headingBold,
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  avatarBtn: {
    width: 44,
    height: 44,
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
    fontSize: 18,
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

const creditModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    backgroundColor: '#FDFAF4',
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  numberBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
  },
  bigNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bigNumberLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  breakdownBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 18,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  rowVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  actionBtnPrimary: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FF7597',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 10,
  },
  actionBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    paddingVertical: 6,
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
});
