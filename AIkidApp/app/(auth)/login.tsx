import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/core/auth/useAuth';
import {
  friendlyAuthError,
  validateLoginInput,
} from '@/core/auth/validation';
import {
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from '@/core/legal/links';
import { useScreenOrientation } from '@/core/ui/useScreenOrientation';

/** Parent login — Gateway → core-account-api */
export default function LoginScreen() {
  useScreenOrientation('all');

  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError =
    localError ?? (error ? friendlyAuthError(error, error) : null);

  async function handleLogin() {
    setLocalError(null);
    clearError();

    const validation = validateLoginInput(email, password);
    if (validation) {
      setLocalError(validation);
      return;
    }

    try {
      await login({ email: email.trim(), password });
      router.replace('/(app)/lobby');
    } catch {
      // error in useAuth
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="w-full max-w-md flex-1 justify-center self-center px-6">
          <View className="mb-9 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-brand/40">
              <Text className="text-3xl font-bold text-white">A</Text>
            </View>
            <Text className="text-3xl font-bold tracking-tight text-slate-900">
              AIkid
            </Text>
            <Text className="mt-2 text-center text-[15px] leading-5 text-slate-500">
              Đăng nhập tài khoản phụ huynh StoryMee{'\n'}
              (cùng hệ thống app Family · Gateway)
            </Text>
          </View>

          <View className="rounded-[20px] border border-orange-100 bg-white p-5 shadow-md shadow-slate-900/5">
            <Text className="mb-2 text-[13px] font-semibold text-slate-700">
              Email
            </Text>
            <TextInput
              className="h-[52px] rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setLocalError(null);
              }}
              placeholder="ban@storymee.com"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
              editable={!isLoading}
            />

            <Text className="mb-2 mt-4 text-[13px] font-semibold text-slate-700">
              Mật khẩu
            </Text>
            <View className="relative">
              <TextInput
                className="h-[52px] rounded-xl border border-slate-200 bg-slate-50 px-4 pr-16 text-base text-slate-900"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setLocalError(null);
                }}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                textContentType="password"
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={() => void handleLogin()}
                editable={!isLoading}
              />
              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-0 h-[52px] justify-center"
                hitSlop={8}
              >
                <Text className="text-[13px] font-semibold text-brand">
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </Text>
              </Pressable>
            </View>

            {displayError ? (
              <Text
                className="mt-3.5 text-[13px] font-medium text-red-600"
                accessibilityRole="alert"
              >
                {displayError}
              </Text>
            ) : null}

            <Pressable
              className={`mt-5 h-[52px] items-center justify-center rounded-[14px] bg-brand active:opacity-90 ${
                isLoading ? 'opacity-70' : ''
              }`}
              onPress={() => void handleLogin()}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Đăng nhập"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">Đăng nhập</Text>
              )}
            </Pressable>

            <View className="mt-4 flex-row justify-center">
              <Text className="text-[13px] text-slate-500">
                Chưa có tài khoản?{' '}
              </Text>
              <Pressable onPress={() => router.push('/(auth)/register')}>
                <Text className="text-[13px] font-semibold text-brand">
                  Đăng ký ngay
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-6 flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Pressable onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}>
              <Text className="text-[12px] font-medium text-slate-500 underline">
                Chính sách bảo mật
              </Text>
            </Pressable>
            <Text className="text-[12px] text-slate-300">·</Text>
            <Pressable onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)}>
              <Text className="text-[12px] font-medium text-slate-500 underline">
                Điều khoản
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
