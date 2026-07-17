import type React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

type Props = {
  /** Path under Expo public/, e.g. /art/index.html */
  src: string;
  title: string;
  /** Message when not on web */
  nativeHint?: string;
};

/**
 * Full-viewport iframe for prototype HTML (Mee / Art / Comic).
 * Do not wrap with ScreenChrome — design uses fixed scaler artboards.
 */
export function HtmlEmbed({ src, title, nativeHint }: Props) {
  const router = useRouter();

  if (Platform.OS !== 'web') {
    return (
      <View className="flex-1 items-center justify-center bg-[#e8f4fa] px-6">
        <Text className="mb-2 text-center text-xl font-extrabold text-[#4a3728]">
          {title}
        </Text>
        <Text className="mb-6 text-center text-[15px] leading-6 text-[#8b7565]">
          {nativeHint ||
            'Màn hình này dùng giao diện web gốc. Mở trên trình duyệt để dùng đầy đủ.'}
        </Text>
        <Pressable
          onPress={() => router.replace('/(app)/lobby')}
          className="rounded-full bg-[#ff7597] px-8 py-3"
        >
          <Text className="font-bold text-white">← Về sảnh</Text>
        </Pressable>
      </View>
    );
  }

  const IFrame = 'iframe' as unknown as React.ElementType;
  const sep = src.includes('?') ? '&' : '?';
  const href = `${src}${sep}embed=1`;

  return (
    <View style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#e8f4fa' }}>
      <IFrame
        title={title}
        src={href}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          borderWidth: 0,
          backgroundColor: '#e8f4fa',
        }}
        allow="autoplay"
      />
    </View>
  );
}
