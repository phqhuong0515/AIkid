import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { CategoryHub, categoryHubScreenStyles } from '@/features/kids-ui/CategoryHub';
import { usePopSound } from '@/hooks/usePopSound';
import { AikidPage } from '@/ui';

export default function CharacterLobby() {
  const router = useRouter();
  const { playPop } = usePopSound();
  const open = (route: string) => {
    playPop();
    router.push(route as never);
  };

  return (
    <AikidPage scene="character" title="Nhân vật" backHref="/(app)/lobby" container="wide" scroll={false}>
      <ScrollView contentContainerStyle={categoryHubScreenStyles.scroll} showsVerticalScrollIndicator={false}>
        <CategoryHub
          icon="people-outline"
          title="Xây dựng nhân vật của em"
          description="Bắt đầu một thiết kế mới hoặc mở kho để tiếp tục phát triển nhân vật đã có."
          items={[
            { id: 'create', title: 'Tạo nhân vật mới', description: 'Biến mô tả hoặc ảnh phác hoạ thành nhân vật, sau đó bổ sung tính cách và hồ sơ.', icon: 'color-wand-outline', image: require('../../../public/hub-images/home-character-alien.jpeg'), badge: 'BẮT ĐẦU', action: 'Bắt đầu sáng tạo', onPress: () => open('/(app)/character/generate-v2') },
            { id: 'library', title: 'Kho nhân vật', description: 'Xem lại, chỉnh sửa và quản lý các nhân vật em đã tạo cho những câu chuyện tiếp theo.', icon: 'person-circle-outline', image: require('../../../public/hub-images/home-cast.png'), badge: 'TIẾP TỤC', action: 'Mở kho nhân vật', accent: 'coral', onPress: () => open('/(app)/character/storage-v2') },
          ]}
          hint="Nhân vật đã hoàn thiện sẽ sẵn sàng để dùng trong Xưởng sáng tạo."
        />
      </ScrollView>
    </AikidPage>
  );
}
