import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { GATEWAY_BASE_URL } from '@/core/api/config';
import { setChildProfileIdResolver } from '@/core/api/client';
import { onSessionInvalidated } from '@/core/auth/sessionEvents';
import { useAuth } from '@/core/auth/useAuth';
import { queryClient } from '@/core/query/queryClient';
import { useFamily } from '@/features/family/store/useFamily';
import { Platform } from 'react-native';

/**
 * Auth gate: hydrate JWT, redirect login ↔ lobby.
 * parent_only mode (v1) — no family picker yet.
 */
function AuthCheck({ children }: { children: ReactNode }) {
  const { token, isHydrated, hydrate, resetSessionLocal } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // X-Child-Profile-Id on all API calls when child selected (MobileApp pattern)
  useEffect(() => {
    setChildProfileIdResolver(
      () => useFamily.getState().activeChildId,
    );
  }, []);

  /** Expose Gateway base for HTML embeds (art canvas gen script) */
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      globalThis.localStorage?.setItem('aikid.api_url', GATEWAY_BASE_URL);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    return onSessionInvalidated(() => {
      resetSessionLocal();
      queryClient.clear();
    });
  }, [resetSessionLocal]);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (token && inAuthGroup) {
      router.replace('/(app)/lobby');
      return;
    }

    if (token && !inAuthGroup && !inAppGroup) {
      router.replace('/(app)/lobby');
    }
  }, [token, isHydrated, segments, router]);

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-orange-50">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthCheck>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFF7ED' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(app)" />
        </Stack>
      </AuthCheck>
    </QueryClientProvider>
  );
}
