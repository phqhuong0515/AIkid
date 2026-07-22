import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '@/core/storymee';
import { isValidEmail } from '@/core/auth/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit() {
    const value = email.trim();
    if (!isValidEmail(value)) return setError('Email phụ huynh không hợp lệ');
    setBusy(true); setError(null);
    try { await authApi.requestPasswordReset(value); setSent(true); }
    catch { setError('Không gửi được yêu cầu. Kiểm tra mạng và thử lại.'); }
    finally { setBusy(false); }
  }
  return <SafeAreaView className="flex-1 bg-orange-50"><KeyboardAvoidingView className="flex-1 justify-center px-6" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View className="w-full max-w-md self-center rounded-3xl bg-white p-6">
      <Text className="text-3xl font-extrabold text-slate-900">Quên mật khẩu</Text>
      <Text className="mt-2 leading-5 text-slate-500">Nhập email phụ huynh để nhận link đặt lại mật khẩu. Tài khoản child/classroom cần phụ huynh đặt lại.</Text>
      {sent ? <View className="mt-6 rounded-2xl bg-emerald-50 p-4"><Text className="font-bold text-emerald-800">Đã gửi yêu cầu</Text><Text className="mt-1 text-emerald-700">Nếu tài khoản tồn tại, email hướng dẫn sẽ được gửi trong vài phút.</Text></View> : <>
        <TextInput value={email} onChangeText={(value) => { setEmail(value); setError(null); }} autoCapitalize="none" keyboardType="email-address" placeholder="parent@email.com" className="mt-6 h-14 rounded-xl bg-slate-50 px-4 text-base" />
        {error ? <Text className="mt-2 text-red-600">{error}</Text> : null}
        <Pressable onPress={() => void submit()} disabled={busy} className="mt-4 h-14 items-center justify-center rounded-xl bg-brand">{busy ? <ActivityIndicator color="#fff" /> : <Text className="font-bold text-white">Gửi link đặt lại</Text>}</Pressable>
      </>}
      <Pressable onPress={() => router.replace('/(auth)/login')} className="mt-5 items-center"><Text className="font-bold text-brand">← Về đăng nhập</Text></Pressable>
    </View>
  </KeyboardAvoidingView></SafeAreaView>;
}
