import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  backHref?: string;
  right?: ReactNode;
};

export function ScreenChrome({
  title,
  subtitle,
  children,
  backHref,
  right,
}: Props) {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FFF8F2]">
      <View className="flex-row items-center justify-between border-b border-orange-100/80 bg-white/95 px-4 py-3.5">
        <View className="min-w-[80px]">
          {backHref ? (
            <Pressable
              onPress={() => router.push(backHref as never)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
              className="flex-row items-center self-start rounded-full bg-orange-50 px-3 py-1.5"
            >
              <Text className="text-[14px] font-bold text-brand">← Về</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              accessibilityRole="button"
              className="flex-row items-center self-start rounded-full bg-orange-50 px-3 py-1.5"
            >
              <Text className="text-[14px] font-bold text-brand">← Về</Text>
            </Pressable>
          )}
        </View>
        <View className="flex-1 items-center px-2">
          <Text className="text-center text-[17px] font-extrabold tracking-tight text-slate-900">
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-0.5 text-center text-[12px] font-medium text-slate-500">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View className="min-w-[80px] items-end">{right}</View>
      </View>
      {children}
    </SafeAreaView>
  );
}
