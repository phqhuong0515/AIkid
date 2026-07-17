import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/core/auth/useAuth';
import {
  friendlyAuthError,
  validateRegisterInput,
} from '@/core/auth/validation';
import {
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from '@/core/legal/links';
import { useScreenOrientation } from '@/core/ui/useScreenOrientation';

/** Parent register — asParent + parentalConsent → core-account-api */
export default function RegisterScreen() {
  useScreenOrientation('all');

  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError =
    localError ?? (error ? friendlyAuthError(error, error) : null);

  async function handleRegister() {
    setLocalError(null);
    clearError();

    const validation = validateRegisterInput({
      name,
      email,
      password,
      confirmPassword,
      acceptedTerms,
    });
    if (validation) {
      setLocalError(validation);
      return;
    }

    try {
      await register({
        email: email.trim(),
        password,
        name: name.trim(),
        asParent: true,
        parentalConsentAccepted: acceptedTerms,
      });
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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-md self-center px-6 py-8">
            <View className="mb-8 items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-brand/40">
                <Text className="text-3xl font-bold text-white">A</Text>
              </View>
              <Text className="text-3xl font-bold tracking-tight text-slate-900">
                Tài khoản phụ huynh
              </Text>
              <Text className="mt-2 text-center text-[15px] text-slate-500">
                Đăng ký để mở Xưởng Sáng Tạo AIkid
              </Text>
            </View>

            <View className="rounded-[20px] border border-orange-100 bg-white p-5 shadow-md shadow-slate-900/5">
              <Text className="mb-2 text-[13px] font-semibold text-slate-700">
                Họ và tên
              </Text>
              <TextInput
                className="h-[52px] rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900"
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setLocalError(null);
                }}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                textContentType="name"
                autoComplete="name"
                returnKeyType="next"
                editable={!isLoading}
              />

              <Text className="mb-2 mt-4 text-[13px] font-semibold text-slate-700">
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
                  placeholder="Tối thiểu 8 ký tự"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  returnKeyType="next"
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

              <Text className="mb-2 mt-4 text-[13px] font-semibold text-slate-700">
                Xác nhận mật khẩu
              </Text>
              <TextInput
                className="h-[52px] rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900"
                value={confirmPassword}
                onChangeText={(v) => {
                  setConfirmPassword(v);
                  setLocalError(null);
                }}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={() => void handleRegister()}
                editable={!isLoading}
              />

              <Pressable
                onPress={() => {
                  setAcceptedTerms((v) => !v);
                  setLocalError(null);
                }}
                className="mt-5 flex-row items-start"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedTerms }}
              >
                <View
                  className={`mr-3 mt-0.5 h-5 w-5 items-center justify-center rounded-md border-2 ${
                    acceptedTerms
                      ? 'border-brand bg-brand'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {acceptedTerms ? (
                    <Text className="text-[11px] font-bold text-white">✓</Text>
                  ) : null}
                </View>
                <Text className="flex-1 text-[13px] leading-5 text-slate-600">
                  Tôi là phụ huynh/người giám hộ, đồng ý{' '}
                  <Text
                    className="font-semibold text-brand"
                    onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)}
                  >
                    Điều khoản
                  </Text>
                  {' · '}
                  <Text
                    className="font-semibold text-brand"
                    onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
                  >
                    Chính sách bảo mật
                  </Text>
                  .
                </Text>
              </Pressable>

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
                onPress={() => void handleRegister()}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Đăng ký"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-base font-bold text-white">
                    Tạo tài khoản
                  </Text>
                )}
              </Pressable>

              <View className="mt-4 flex-row justify-center">
                <Text className="text-[13px] text-slate-500">
                  Đã có tài khoản?{' '}
                </Text>
                <Pressable onPress={() => router.push('/(auth)/login')}>
                  <Text className="text-[13px] font-semibold text-brand">
                    Đăng nhập
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
