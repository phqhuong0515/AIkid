import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

export interface CoverflowCard {
  href: any; // Using any for router path compatibility, or better a string type
  title: string;
  desc: string;
  image: string;
}

interface Props {
  items: CoverflowCard[];
}

export function CoverflowCarousel({ items }: Props) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  
  const ITEM_WIDTH = 280;
  const ITEM_HEIGHT = 380;
  
  // Calculate padding so the first and last items can be centered
  const paddingHorizontal = Math.max(0, (width - ITEM_WIDTH) / 2);
  
  const scrollX = useSharedValue(0);
  
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <Animated.FlatList
      data={items}
      keyExtractor={(item, index) => `${item.href}-${index}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_WIDTH}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      renderItem={({ item, index }) => (
        <CoverflowItem item={item} index={index} scrollX={scrollX} />
      )}
    />
  );
}

function CoverflowItem({
  item,
  index,
  scrollX,
}: {
  item: CoverflowCard;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const router = useRouter();
  const ITEM_WIDTH = 280;
  const ITEM_HEIGHT = 380;

  const inputRange = [
    (index - 1) * ITEM_WIDTH,
    index * ITEM_WIDTH,
    (index + 1) * ITEM_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[{ width: ITEM_WIDTH, height: ITEM_HEIGHT }, animatedStyle]}>
      <Pressable
        onPress={() => router.push(item.href)}
        className="flex-1 overflow-hidden rounded-[32px] bg-white border border-orange-100/50"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
        }}
        accessibilityRole="button"
        accessibilityLabel={item.title}
      >
        <Image
          source={{ uri: item.image }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
        {/* Gradient/Overlay to make text readable */}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.3)',
            top: '50%', // Fade from middle to bottom
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
          }}
        >
          <Text className="text-[24px] font-extrabold text-white" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="mt-1 text-[15px] font-medium text-white/90" numberOfLines={2}>
            {item.desc}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
