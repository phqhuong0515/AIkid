import { View } from 'react-native';
import { AikidPage, AikidText } from '@/ui';

export default function LibraryScreen() {
  return (
    <AikidPage scene="lobby" title="Thư viện" container="standard">
      <View className="flex-1 items-center justify-center p-6">
        <AikidText variant="body" style={{ textAlign: 'center', fontSize: 18 }}>
          Đang tải thư viện...
        </AikidText>
      </View>
    </AikidPage>
  );
}
