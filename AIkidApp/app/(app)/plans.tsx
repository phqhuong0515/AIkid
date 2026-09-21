import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';

import { billingApi } from '@/core/storymee';
import { useAuth } from '@/core/auth/useAuth';
import { useFamily } from '@/features/family/store/useFamily';
import { GlobalHeader } from '@/components/GlobalHeader';
import { ParentGateModal } from '@/components/ParentGateModal';
import { AskParentCreditsModal } from '@/features/billing/components/AskParentCreditsModal';
import { VietQrPaymentModal } from '@/features/billing/components/VietQrPaymentModal';

type SelectedPayment = {
  amount: number;
  planName: string;
  paymentCode: string;
};

const MEMBERSHIP_PLANS = [
  {
    id: 'creative',
    name: 'Gói Sáng Tạo',
    tag: 'Phổ biến',
    price: 79000,
    priceLabel: '79.000 đ',
    period: '/tháng',
    credits: 150,
    features: [
      '150 lượt tạo tranh AI mỗi tháng',
      'Mở khóa toàn bộ phong cách nghệ thuật',
      'Lưu trữ Cloud 500MB an toàn',
      'Không giới hạn nét vẽ trên bảng vẽ',
    ],
  },
  {
    id: 'vip',
    name: 'Gói VIP Siêu Sao',
    tag: 'Được yêu thích nhất 🔥',
    price: 149000,
    priceLabel: '149.000 đ',
    period: '/tháng',
    credits: 350,
    features: [
      '350 lượt tạo tranh AI mỗi tháng',
      'Ưu tiên xử lý nhanh vượt trội',
      'Mở khóa kho trang trí & phụ kiện VIP',
      'Hỗ trợ học tập và gia đình 24/7',
    ],
  },
];

const QUICK_PACKS = [
  {
    id: 'pack_25',
    credits: 25,
    price: 50000,
    priceLabel: '50.000 đ',
    tag: null,
  },
  {
    id: 'pack_60',
    credits: 60,
    price: 100000,
    priceLabel: '100.000 đ',
    tag: 'Phổ biến nhất 🔥',
  },
  {
    id: 'pack_150',
    credits: 150,
    price: 200000,
    priceLabel: '200.000 đ',
    tag: 'Tiết kiệm 20% ⭐',
  },
];

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTabletUp = width >= 768;
  const queryClient = useQueryClient();
  const { actor } = useAuth();
  const activeChild = useFamily((s) => s.getActiveChild());

  const [busy, setBusy] = useState<string | null>(null);
  const [voucher, setVoucher] = useState('');
  const [askParentOpen, setAskParentOpen] = useState(false);
  const [parentGateOpen, setParentGateOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<SelectedPayment | null>(null);

  const summary = useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: () => billingApi.getAiSummary(),
  });

  const handleOpenVietQr = useCallback((planName: string, amount: number) => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const paymentCode = `AIKID${randomSuffix}`;
    setPaymentConfig({
      planName,
      amount,
      paymentCode,
    });
  }, []);

  const handleRedeemVoucher = async () => {
    const trimmed = voucher.trim();
    if (!trimmed) {
      Alert.alert('Chưa nhập mã', 'Vui lòng nhập mã voucher hoặc quà tặng.');
      return;
    }
    setBusy('voucher');
    try {
      await billingApi.redeemVoucher(trimmed);
      await queryClient.invalidateQueries({ queryKey: ['billing'] });
      setVoucher('');
      Alert.alert('Thành công! 🎉', 'Mã voucher đã được kích hoạt và cộng vào tài khoản.');
    } catch (error) {
      Alert.alert('Không thể áp dụng', error instanceof Error ? error.message : 'Mã không hợp lệ hoặc đã hết hạn.');
    } finally {
      setBusy(null);
    }
  };

  const storageUsed = summary.data?.storageBytesUsed ?? 0;
  const storageLimit = summary.data?.storageBytesLimit || 500 * 1024 * 1024;
  const storagePercent = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../public/lobby-assets/images/bg-art.png')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <View style={{ paddingTop: Math.max(20, insets.top), flex: 1 }}>
          <View style={{ paddingHorizontal: 16, zIndex: 10, paddingBottom: 16 }}>
            <GlobalHeader />
          </View>

          <View style={styles.mainCard}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>
                {actor === 'child' ? 'Ví Phép Thuật AI' : 'Trung Tâm Gói Cước & Lượt AI'}
              </Text>
              <Text style={styles.subTitleText}>
                {actor === 'child'
                  ? 'Theo dõi lượt vẽ diệu kỳ của con'
                  : 'Nâng cấp trải nghiệm sáng tạo cho học sinh'}
              </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Wallet Summary Card */}
              <View style={styles.walletBox}>
                <View style={styles.walletHeader}>
                  <View style={styles.planPill}>
                    <Text style={styles.planPillText}>
                      GÓI {(summary.data?.plan || 'Miễn phí').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.cloudBadge}>Cloud: 500 MB ({storagePercent}%)</Text>
                </View>

                <View style={styles.creditsDisplayRow}>
                  <Text style={styles.totalCreditsNumber}>
                    {summary.data?.remainingCreateCredits ?? 0}
                  </Text>
                  <Text style={styles.totalCreditsLabel}>lượt AI khả dụng</Text>
                </View>

                <View style={styles.walletGrid}>
                  <View style={styles.walletSubItem}>
                    <Text style={styles.walletSubLabel}>Lượt theo tháng</Text>
                    <Text style={styles.walletSubValue}>
                      {summary.data?.monthlyRemainingCreateCredits ?? 0} / {summary.data?.monthlyCreateCredits ?? 0}
                    </Text>
                  </View>
                  <View style={styles.walletDivider} />
                  <View style={styles.walletSubItem}>
                    <Text style={styles.walletSubLabel}>Lượt mua thêm</Text>
                    <Text style={styles.walletSubValue}>
                      {summary.data?.bonusCreateCredits ?? 0} lượt
                    </Text>
                  </View>
                </View>
              </View>

              {/* CHILD ACTOR VIEW */}
              {actor === 'child' ? (
                <View style={styles.childContainer}>
                  <View style={styles.childCard}>
                    <View style={styles.magicIconWrap}>
                      <Text style={{ fontSize: 40 }}>🎨✨</Text>
                    </View>
                    <Text style={styles.childCardTitle}>Góc Nhỏ Của Học Sinh</Text>
                    <Text style={styles.childCardDesc}>
                      Toàn bộ thanh toán và gói cước do Phụ huynh quản lý để đảm bảo an toàn cho con.
                      Khi cần thêm lượt phép thuật để vẽ tranh, con chỉ cần gửi một lời nhắn yêu thương nhé!
                    </Text>

                    <TouchableOpacity
                      style={styles.askParentBtn}
                      onPress={() => setAskParentOpen(true)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.askParentBtnText}>💌 Nhờ Phụ huynh nạp thêm lượt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.parentHereLink}
                      onPress={() => setParentGateOpen(true)}
                    >
                      <Text style={styles.parentHereLinkText}>
                        👨‍👩‍👧 Phụ huynh đang ở đây? Nhập mã mở cổng
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* PARENT ACTOR VIEW */
                <>
                  {/* Voucher Section */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🎁 Mã Quà Tặng / Voucher</Text>
                  </View>
                  <View style={styles.voucherContainer}>
                    <TextInput
                      value={voucher}
                      onChangeText={setVoucher}
                      placeholder="Nhập mã ưu đãi hoặc thẻ quà tặng..."
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="characters"
                      style={styles.voucherInput}
                    />
                    <TouchableOpacity
                      disabled={busy === 'voucher'}
                      onPress={handleRedeemVoucher}
                      style={styles.voucherBtn}
                      activeOpacity={0.85}
                    >
                      {busy === 'voucher' ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.voucherBtnText}>Áp dụng</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Monthly Subscription Plans */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🌟 Gói Hội Viên Tháng</Text>
                    <Text style={styles.sectionHint}>Cộng lượt tự động vào ngày 1 hàng tháng</Text>
                  </View>

                  <View style={styles.plansList}>
                    {MEMBERSHIP_PLANS.map((plan) => (
                      <View
                        key={plan.id}
                        style={[
                          styles.planCard,
                          isTabletUp ? styles.planCardTablet : { width: '100%' },
                        ]}
                      >
                        <View>
                          {plan.tag ? (
                            <View style={styles.planBadge}>
                              <Text style={styles.planBadgeText}>{plan.tag}</Text>
                            </View>
                          ) : null}

                          <View style={styles.planCardHeader}>
                            <Text style={styles.planName}>{plan.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                              <Text style={styles.planPrice}>{plan.priceLabel}</Text>
                              <Text style={styles.planPeriod}>{plan.period}</Text>
                            </View>
                          </View>

                          <Text style={styles.planCredits}>{plan.credits} lượt vẽ AI / tháng</Text>

                          <View style={styles.featuresList}>
                            {plan.features.map((feat, idx) => (
                              <View key={idx} style={styles.featureItem}>
                                <FontAwesome6 name="circle-check" size={14} color="#10B981" />
                                <Text style={styles.featureText}>{feat}</Text>
                              </View>
                            ))}
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.selectPlanBtn}
                          onPress={() => handleOpenVietQr(plan.name, plan.price)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.selectPlanBtnText}>
                            Quét VietQR ({plan.priceLabel})
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  {/* Fast Add-on Packs */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>⚡ Gói Nạp Lượt Nhanh (Không Hết Hạn)</Text>
                    <Text style={styles.sectionHint}>Lượt cộng ngay vào ví mua thêm và dùng mãi mãi</Text>
                  </View>

                  <View style={styles.packsGrid}>
                    {QUICK_PACKS.map((pack) => (
                      <View
                        key={pack.id}
                        style={[
                          styles.packCard,
                          width < 500 && { minWidth: '45%' },
                        ]}
                      >
                        <View style={{ alignItems: 'center', width: '100%' }}>
                          {pack.tag ? (
                            <View style={styles.packBadge}>
                              <Text style={styles.packBadgeText}>{pack.tag}</Text>
                            </View>
                          ) : null}

                          <Text style={styles.packCredits}>+{pack.credits} LƯỢT</Text>
                          <Text style={styles.packPrice}>{pack.priceLabel}</Text>
                        </View>

                        <TouchableOpacity
                          style={styles.packBuyBtn}
                          onPress={() => handleOpenVietQr(`Gói Nạp ${pack.credits} Lượt AI`, pack.price)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.packBuyBtnText}>Nạp ngay</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </ImageBackground>

      {/* Ask Parent Modal for Child */}
      <AskParentCreditsModal
        isOpen={askParentOpen}
        onClose={() => setAskParentOpen(false)}
        studentName={activeChild?.name}
        onParentUnlocked={() => {
          setAskParentOpen(false);
          void queryClient.invalidateQueries({ queryKey: ['billing'] });
        }}
      />

      {/* Parent Gate Modal */}
      <ParentGateModal
        isOpen={parentGateOpen}
        onClose={() => setParentGateOpen(false)}
        onSuccess={() => {
          setParentGateOpen(false);
          void queryClient.invalidateQueries({ queryKey: ['billing'] });
        }}
        title="Cổng Quản Lý Phụ Huynh"
        subtitle="Mở khóa các gói cước và phương thức thanh toán"
      />

      {/* VietQR Payment Modal */}
      {paymentConfig ? (
        <VietQrPaymentModal
          isOpen={Boolean(paymentConfig)}
          onClose={() => setPaymentConfig(null)}
          amount={paymentConfig.amount}
          planName={paymentConfig.planName}
          paymentCode={paymentConfig.paymentCode}
          onSuccess={() => {
            void queryClient.invalidateQueries({ queryKey: ['billing'] });
          }}
        />
      ) : null}
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
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    backgroundColor: '#FDFAF4',
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  titleRow: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFF1E8',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  subTitleText: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    gap: 18,
    paddingBottom: 60,
  },
  walletBox: {
    borderRadius: 24,
    backgroundColor: '#0F172A',
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planPill: {
    backgroundColor: '#F59E0B',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  planPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  cloudBadge: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  creditsDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  totalCreditsNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  totalCreditsLabel: {
    fontSize: 16,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  walletGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 12,
  },
  walletSubItem: {
    flex: 1,
    alignItems: 'center',
  },
  walletDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  walletSubLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  walletSubValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  childContainer: {
    marginTop: 8,
  },
  childCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FED7AA',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  magicIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#FFEDD5',
  },
  childCardTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#7C2D12',
    marginBottom: 8,
  },
  childCardDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#78350F',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  askParentBtn: {
    width: '100%',
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FF7597',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  askParentBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  parentHereLink: {
    marginTop: 14,
    paddingVertical: 6,
  },
  parentHereLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  sectionHeader: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  voucherContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  voucherInput: {
    height: 50,
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  voucherBtn: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FF7597',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  plansList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  planCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFE4E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  planCardTablet: {
    flex: 1,
    minWidth: 280,
  },
  planBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#FFF0F3',
    borderWidth: 1,
    borderColor: '#FFB5C8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E11D48',
  },
  planCardHeader: {
    marginBottom: 6,
  },
  planName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  planPrice: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '900',
    color: '#FF7597',
  },
  planPeriod: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
  planCredits: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 14,
  },
  featuresList: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  selectPlanBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FF7597',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  selectPlanBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  packsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  packCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  packBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FACC15',
  },
  packBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#854D0E',
  },
  packCredits: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  packPrice: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
  },
  packBuyBtn: {
    width: '100%',
    height: 38,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF7597',
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  packBuyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF7597',
  },
});
