import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { useAuth } from '@/core/auth/useAuth';

export default function IndexScreen() {
  const { token, isHydrated } = useAuth();

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-orange-50 p-6">
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text className="mt-3 text-sm text-slate-500">Đang tải…</Text>
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(app)/lobby" />;
}
