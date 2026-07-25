import { Text, View } from 'react-native';

import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';

export default function LibraryScreen() {
  return (
    <ScreenChrome title="Thư viện">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center text-lg font-medium text-slate-500">
          Đang tải thư viện...
        </Text>
      </View>
    </ScreenChrome>
  );
}
