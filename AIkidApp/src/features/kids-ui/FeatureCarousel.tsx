import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AikidTheme } from './theme';

type CarouselItem = {
  key: string;
  title: string;
  imageUri?: string;
  onPress: () => void;
};

export function FeatureCarousel({ items }: { items: CarouselItem[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 20, paddingVertical: 10 }}
    >
      {items.map((item) => (
        <CarouselCard key={item.key} item={item} />
      ))}
    </ScrollView>
  );
}

function CarouselCard({ item }: { item: CarouselItem }) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={item.onPress}
        style={{
          width: 220,
          backgroundColor: '#FDFAF4',
          borderRadius: 36,
          borderWidth: 6,
          borderColor: '#FFFFFF',
          overflow: 'hidden',
          shadowColor: '#4A3728',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <Image
          source={{ uri: item.imageUri }}
          style={{ width: '100%', height: 160, backgroundColor: '#f0f0f0' }}
          contentFit="cover"
        />
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: AikidTheme.fonts.main,
              fontSize: 20,
              color: '#4A3728',
              textAlign: 'center',
            }}
          >
            {item.title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
