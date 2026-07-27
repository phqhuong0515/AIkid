import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { billingApi } from '@/core/storymee';
import { useAuth } from '@/core/auth/useAuth';
import { GlobalHeader } from '@/components/GlobalHeader';

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const actor = useAuth((s) => s.actor);
  const [busy, setBusy] = useState<string | null>(null);
  const [voucher, setVoucher] = useState('');
  
  const summary = useQuery({ queryKey: ['billing', 'summary'], queryFn: () => billingApi.getAiSummary() });
  const plans = useQuery({ queryKey: ['billing', 'plans'], queryFn: () => billingApi.listPlans() });
  const packs = useQuery({ queryKey: ['billing', 'credit-packs'], queryFn: () => billingApi.listCreditPacks() });

  async function complete(id: string, action: () => Promise<unknown>) {
    if (actor === 'child') return;
    setBusy(id);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: ['billing'] });
      Alert.alert('Thành công', 'Số lượt và gói đã được cập nhật.');
    } catch (error) {
      Alert.alert('Không thể thanh toán', error instanceof Error ? error.message : 'Thử lại sau');
    } finally { setBusy(null); }
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../public/lobby-assets/images/bg-art.png')} style={styles.bgImage} resizeMode="cover">
        <View style={{ paddingTop: Math.max(20, insets.top), flex: 1 }}>
          <View style={{ paddingHorizontal: 16, zIndex: 10, paddingBottom: 16 }}>
            <GlobalHeader />
          </View>
          
          <View style={styles.mainCard}>
            <Text style={{ marginTop: 24, fontSize: 24, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>Gói AI & lượt thêm</Text>
            
            <ScrollView contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 60 }}>
              <View style={styles.summaryBox}>
                <Text style={{ fontWeight: 'bold', color: '#FED7AA' }}>{summary.data?.plan || 'free'}</Text>
                <Text style={{ marginTop: 8, fontSize: 30, fontWeight: '800', color: '#FFFFFF' }}>{summary.data?.remainingCreateCredits ?? 0} lượt</Text>
                <Text style={{ marginTop: 4, color: '#CBD5E1', fontSize: 13 }}>
                  Tháng: {summary.data?.monthlyRemainingCreateCredits ?? 0}/{summary.data?.monthlyCreateCredits ?? 0} · Mua thêm: {summary.data?.bonusCreateCredits ?? 0}
                </Text>
              </View>
              
              {actor === 'child' ? (
                <Text style={styles.childNotice}>Phụ huynh quản lý thanh toán của gia đình.</Text>
              ) : (
                <>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput 
                      value={voucher} 
                      onChangeText={setVoucher} 
                      placeholder="Mã voucher" 
                      autoCapitalize="characters" 
                      style={styles.input} 
                    />
                    <Pressable onPress={() => void complete('voucher', () => billingApi.redeemVoucher(voucher))} style={styles.voucherBtn}>
                      <Text style={{ fontWeight: 'bold', color: '#FFFFFF' }}>Áp dụng</Text>
                    </Pressable>
                  </View>
                  
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: 12 }}>Gói theo tháng</Text>
                  
                  {plans.isLoading ? (
                    <ActivityIndicator color="#FF7597" />
                  ) : (
                    plans.data?.map((plan) => (
                      <View key={plan.id} style={styles.itemCard}>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>{plan.name || plan.id}</Text>
                        <Text style={{ marginTop: 4, color: '#64748B' }}>
                          {plan.monthlyCreateCredits ?? 0} lượt/tháng · {(plan.amountMinor / 100).toLocaleString('vi-VN')} {plan.currency || 'VND'}
                        </Text>
                        <Pressable disabled={!!busy} onPress={() => void complete(plan.id, () => billingApi.checkoutPlan(plan.id))} style={styles.primaryBtn}>
                          <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' }}>
                            {busy === plan.id ? 'Đang xử lý…' : 'Chọn gói'}
                          </Text>
                        </Pressable>
                      </View>
                    ))
                  )}
                  
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: 12 }}>Mua lượt AI riêng</Text>
                  
                  {packs.data?.map((pack) => (
                    <View key={pack.id} style={styles.itemCard}>
                      <Text style={{ fontWeight: '800', color: '#0F172A', fontSize: 16 }}>{pack.name || pack.id} · +{pack.credits} lượt</Text>
                      <Pressable disabled={!!busy} onPress={() => void complete(pack.id, () => billingApi.checkoutCreditPack(pack.id))} style={styles.secondaryBtn}>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#FF7597' }}>Mua lượt</Text>
                      </Pressable>
                    </View>
                  ))}
                </>
              )}
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
  summaryBox: {
    borderRadius: 24,
    backgroundColor: '#0F172A',
    padding: 24,
  },
  childNotice: {
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    padding: 16,
    color: '#78350F',
    fontWeight: '500',
    textAlign: 'center',
  },
  input: {
    height: 52,
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  voucherBtn: {
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FF7597',
    paddingHorizontal: 20,
  },
  itemCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFF7ED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryBtn: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#FF7597',
    paddingVertical: 14,
  },
  secondaryBtn: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF7597',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
});
