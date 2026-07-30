import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { CategoryHub, categoryHubScreenStyles } from '@/features/kids-ui/CategoryHub';
import { usePopSound } from '@/hooks/usePopSound';
import { AikidPage } from '@/ui';

export default function StoryHubScreen() {
  const router = useRouter();
  const { playPop } = usePopSound();
  const open = (route: string) => {
    playPop();
    router.push(route as never);
  };

  return (
    <AikidPage scene="comic" title="Sáng tác truyện" backHref="/(app)/art" container="wide" scroll={false}>
      <ScrollView contentContainerStyle={categoryHubScreenStyles.scroll} showsVerticalScrollIndicator={false}>
        <CategoryHub
          icon="book-outline"
          title="Câu chuyện của em"
          description="Bắt đầu một câu chuyện mới hoặc mở kho để đọc và tiếp tục những tác phẩm đã có."
          items={[
            { id: 'create', title: 'Tạo truyện mới', description: 'Tạo cốt truyện trước, sau đó phát triển thành truyện chữ hoặc truyện tranh.', icon: 'sparkles-outline', badge: 'BẮT ĐẦU', action: 'Bắt đầu sáng tác', onPress: () => open('/(app)/comic/create-v2') },
            { id: 'library', title: 'Kho truyện', description: 'Xem, chỉnh sửa và tiếp tục cốt truyện, truyện chữ hoặc truyện tranh em đã tạo.', icon: 'library-outline', badge: 'TIẾP TỤC', action: 'Mở kho truyện', accent: 'coral', onPress: () => open('/(app)/comic/library-v2') },
          ]}
          hint="Cốt truyện là nền tảng để em phát triển tiếp thành truyện chữ và truyện tranh."
        />
      </ScrollView>
    </AikidPage>
  );
}
