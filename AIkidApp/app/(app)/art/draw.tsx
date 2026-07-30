import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { CategoryHub, categoryHubScreenStyles } from '@/features/kids-ui/CategoryHub';
import { usePopSound } from '@/hooks/usePopSound';
import { AikidPage } from '@/ui';

export default function DrawHubScreen() {
  const router = useRouter();
  const { playPop } = usePopSound();
  const open = (route: string) => {
    playPop();
    router.push(route as never);
  };

  return (
    <AikidPage scene="art" title="Vẽ tranh" backHref="/(app)/art" container="wide" scroll={false}>
      <ScrollView contentContainerStyle={categoryHubScreenStyles.scroll} showsVerticalScrollIndicator={false}>
        <CategoryHub
          icon="brush-outline"
          title="Bắt đầu vẽ tranh"
          description="Tạo một tác phẩm mới cùng trợ lý AI hoặc mở thư viện để xem lại những bức tranh của em."
          items={[
            {
              id: 'create',
              title: 'Tạo tranh mới',
              description: 'Chọn phong cách, tự tay phác hoạ rồi để trợ lý AI giúp em hoàn thiện tác phẩm.',
              icon: 'color-palette-outline',
              badge: 'BẮT ĐẦU',
              action: 'Bắt đầu sáng tạo',
              onPress: () => open('/(app)/art/style-v2'),
            },
            {
              id: 'library',
              title: 'Thư viện tranh',
              description: 'Xem lại tranh AI, ảnh đã tải lên và những tác phẩm em đã tạo trước đó.',
              icon: 'images-outline',
              badge: 'TIẾP TỤC',
              action: 'Mở thư viện tranh',
              accent: 'coral',
              onPress: () => open('/(app)/gallery'),
            },
          ]}
          hint="Tranh em hoàn thành sẽ được lưu lại để tiếp tục sử dụng trong các hoạt động sáng tạo."
        />
      </ScrollView>
    </AikidPage>
  );
}
