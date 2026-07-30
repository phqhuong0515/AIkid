import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { CategoryHub, categoryHubScreenStyles } from '@/features/kids-ui/CategoryHub';
import { usePopSound } from '@/hooks/usePopSound';
import { AikidPage } from '@/ui';

export default function ArtLobby() {
  const router = useRouter();
  const { playPop } = usePopSound();
  const open = (route: string) => {
    playPop();
    router.push(route as never);
  };

  return (
    <AikidPage scene="art" title="Xưởng sáng tạo" backHref="/(app)/lobby" container="wide" scroll={false}>
      <ScrollView contentContainerStyle={categoryHubScreenStyles.scroll} showsVerticalScrollIndicator={false}>
        <CategoryHub
          icon="color-palette-outline"
          title="Chọn hoạt động sáng tạo"
          description="Vẽ một bức tranh, sáng tác câu chuyện hoặc khám phá những hình thức mới."
          items={[
            { id: 'draw', title: 'Vẽ tranh', description: 'Chọn nét vẽ, tạo hình cùng AI và lưu tác phẩm vào thư viện của em.', icon: 'brush-outline', image: require('../../../public/lobby-assets/images/art-comic.jpeg'), badge: 'SÁNG TẠO', action: 'Mở Xưởng vẽ', onPress: () => open('/(app)/art/draw') },
            { id: 'story', title: 'Sáng tác truyện', description: 'Tạo cốt truyện rồi phát triển thành truyện chữ hoặc một bộ truyện tranh.', icon: 'book-outline', image: require('../../../public/lobby-assets/images/art-image.jpeg'), badge: 'KỂ CHUYỆN', action: 'Mở Xưởng truyện', accent: 'coral', onPress: () => open('/(app)/comic') },
            { id: 'video', title: 'Làm video', description: 'Biến câu chuyện và nhân vật thành những đoạn phim sinh động.', icon: 'videocam-outline', image: require('../../../public/lobby-assets/images/art-video.jpeg'), badge: 'SẮP MỞ', action: 'Đang phát triển', accent: 'violet', disabled: true, onPress: () => undefined },
          ]}
          hint="Tác phẩm em hoàn thành sẽ được lưu lại để tiếp tục sử dụng ở các hoạt động khác."
        />
      </ScrollView>
    </AikidPage>
  );
}
