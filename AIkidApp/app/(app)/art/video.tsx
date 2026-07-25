import { Text, View } from 'react-native';
import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';

export default function ArtVideoScreen() {
  return (
    <ScreenChrome title="Stories/Video">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center text-lg font-medium text-slate-500">
          Đang phát triển tính năng Video...
        </Text>
      </View>
    </ScreenChrome>
  );
}
