import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { billingApi } from '@/core/storymee';
import { useAuth } from '@/core/auth/useAuth';

export default function PlansScreen() {
  const router = useRouter();
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

  return <SafeAreaView className="flex-1 bg-orange-50">
    <View className="flex-row items-center border-b border-orange-100 bg-white px-4 py-3">
      <Pressable onPress={() => router.back()}><Text className="font-bold text-brand">← Về</Text></Pressable>
      <Text className="flex-1 text-center text-lg font-extrabold">Gói AI & lượt thêm</Text><View className="w-10" />
    </View>
    <ScrollView contentContainerStyle={{ padding: 18, gap: 14, paddingBottom: 48 }}>
      <View className="rounded-2xl bg-slate-900 p-5">
        <Text className="font-bold text-orange-200">{summary.data?.plan || 'free'}</Text>
        <Text className="mt-2 text-3xl font-extrabold text-white">{summary.data?.remainingCreateCredits ?? 0} lượt</Text>
        <Text className="mt-1 text-slate-300">Tháng: {summary.data?.monthlyRemainingCreateCredits ?? 0}/{summary.data?.monthlyCreateCredits ?? 0} · Mua thêm: {summary.data?.bonusCreateCredits ?? 0}</Text>
      </View>
      {actor === 'child' ? <Text className="rounded-xl bg-amber-100 p-3 text-amber-900">Phụ huynh quản lý thanh toán của gia đình.</Text> : <>
        <View className="flex-row gap-2"><TextInput value={voucher} onChangeText={setVoucher} placeholder="Mã voucher" autoCapitalize="characters" className="h-12 flex-1 rounded-xl bg-white px-4" /><Pressable onPress={() => void complete('voucher', () => billingApi.redeemVoucher(voucher))} className="justify-center rounded-xl bg-brand px-4"><Text className="font-bold text-white">Áp dụng</Text></Pressable></View>
        <Text className="text-lg font-extrabold">Gói theo tháng</Text>
        {plans.isLoading ? <ActivityIndicator /> : plans.data?.map((plan) => <View key={plan.id} className="rounded-2xl bg-white p-4"><Text className="text-lg font-extrabold">{plan.name || plan.id}</Text><Text className="mt-1 text-slate-500">{plan.monthlyCreateCredits ?? 0} lượt/tháng · {(plan.amountMinor / 100).toLocaleString('vi-VN')} {plan.currency || 'VND'}</Text><Pressable disabled={!!busy} onPress={() => void complete(plan.id, () => billingApi.checkoutPlan(plan.id))} className="mt-3 rounded-xl bg-brand py-3"><Text className="text-center font-bold text-white">{busy === plan.id ? 'Đang xử lý…' : 'Chọn gói'}</Text></Pressable></View>)}
        <Text className="text-lg font-extrabold">Mua lượt AI riêng</Text>
        {packs.data?.map((pack) => <View key={pack.id} className="rounded-2xl bg-white p-4"><Text className="font-extrabold">{pack.name || pack.id} · +{pack.credits} lượt</Text><Pressable disabled={!!busy} onPress={() => void complete(pack.id, () => billingApi.checkoutCreditPack(pack.id))} className="mt-3 rounded-xl border border-brand py-3"><Text className="text-center font-bold text-brand">Mua lượt</Text></Pressable></View>)}
      </>}
    </ScrollView>
  </SafeAreaView>;
}
