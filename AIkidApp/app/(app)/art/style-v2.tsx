import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { usePopSound } from '@/hooks/usePopSound';
import { AikidPage } from '@/ui';

const STYLES = [
  { id: 'Màu Nước', image: require('../../../public/art-styles/art-style-watercolor.jpeg'), from: 'from-[#FF8E53]', to: 'to-[#FF2E93]' },
  { id: 'Hoạt Hình', image: require('../../../public/art-styles/art-style-cartoon.jpeg'), from: 'from-[#00C6FF]', to: 'to-[#0072FF]' },
  { id: 'Bút Sáp', image: require('../../../public/art-styles/art-style-crayon.jpeg'), from: 'from-[#11998e]', to: 'to-[#38ef7d]' },
  { id: 'Anime', image: require('../../../public/art-styles/art-style-anime.jpeg'), from: 'from-[#FF9966]', to: 'to-[#FF5E62]' },
  { id: 'Manga', image: require('../../../public/art-styles/art-style-manga.jpeg'), from: 'from-[#7F00FF]', to: 'to-[#E100FF]' },
  { id: 'Truyện Tranh', image: require('../../../public/art-styles/art-style-comic.jpeg'), from: 'from-[#F857A6]', to: 'to-[#FF5858]' },
  { id: 'Tranh Chì', image: require('../../../public/art-styles/art-style-sketch.jpeg'), from: 'from-[#4da0b0]', to: 'to-[#d39d38]' },
  { id: '3D', image: require('../../../public/art-styles/art-style-3D.jpeg'), from: 'from-[#1A2980]', to: 'to-[#26D0CE]' },
  { id: 'Pixel', image: require('../../../public/art-styles/art-style-pixel.jpeg'), from: 'from-[#f12711]', to: 'to-[#f5af19]' },
  { id: 'Chibi', image: require('../../../public/art-styles/art-style-chibi.jpeg'), from: 'from-[#FF8E53]', to: 'to-[#FF2E93]' },
  { id: 'Đất Sét', image: require('../../../public/art-styles/art-style-clay.jpeg'), from: 'from-[#00C6FF]', to: 'to-[#0072FF]' },
  { id: 'Vải Nỉ', image: require('../../../public/art-styles/art-style-farbic.jpeg'), from: 'from-[#11998e]', to: 'to-[#38ef7d]' },
  { id: 'Manhwa', image: require('../../../public/art-styles/art-style-manhwa.jpeg'), from: 'from-[#FF9966]', to: 'to-[#FF5E62]' },
  { id: 'Bán Tả Thực', image: require('../../../public/art-styles/art-style-semirealistic.jpeg'), from: 'from-[#7F00FF]', to: 'to-[#E100FF]' },
];

const baseWidth = 300;
const activeScale = 1.08;
const d1Scale = 0.88;
const d2Scale = 0.76;
const g1 = 36;
const g2 = 24;
const swipeStep = 190;
const springConfig = { damping: 22, stiffness: 180, mass: 0.75 };
const distanceInput = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
const offsetOutput = distanceInput.map((distance) => {
  const direction = distance > 0 ? 1 : distance < 0 ? -1 : 0;
  return direction * getCardOffset(Math.abs(distance));
});
const scaleOutput = distanceInput.map((distance) => getScaleForDistance(Math.abs(distance)));
const opacityOutput = distanceInput.map((distance) => getOpacityForDistance(Math.abs(distance)));

function getScaleForDistance(distance: number) {
  if (distance === 0) return activeScale;
  if (distance === 1) return d1Scale;
  if (distance === 2) return d2Scale;
  return Math.max(0.5, d2Scale - (distance - 2) * 0.05);
}

function getOpacityForDistance(distance: number) {
  if (distance === 0) return 1.0;
  if (distance === 1) return 0.75;
  if (distance === 2) return 0.65;
  if (distance === 3) return 0.2;
  return 0.0;
}

function getCardOffset(d: number) {
  if (d === 0) return 0;
  let x = 0;
  x += (baseWidth * activeScale) / 2 + g1;
  x += (baseWidth * d1Scale) / 2;
  for (let i = 2; i <= d; i++) {
    x += (baseWidth * getScaleForDistance(i - 1)) / 2;
    x += g2;
    x += (baseWidth * getScaleForDistance(i)) / 2;
  }
  return x;
}

const StyleCard = ({ 
  style, 
  index, 
  activeIndex, 
  carouselPosition,
  onPress, 
  playPop 
}: { 
  style: any, 
  index: number, 
  activeIndex: number, 
  carouselPosition: SharedValue<number>,
  onPress: () => void, 
  playPop: () => void 
}) => {
  const d = Math.abs(index - activeIndex);
  const opacity = getOpacityForDistance(d);
  const isActive = index === activeIndex;

  const animatedStyle = useAnimatedStyle(() => {
    const distance = index - carouselPosition.value;
    const absoluteDistance = Math.abs(distance);

    return {
      transform: [
        {
          translateX: interpolate(
            distance,
            distanceInput,
            offsetOutput,
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            distance,
            distanceInput,
            scaleOutput,
            Extrapolation.CLAMP,
          ),
        },
        {
          translateY: interpolate(
            absoluteDistance,
            [0, 1],
            [-16, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
      opacity: interpolate(
        distance,
        distanceInput,
        opacityOutput,
        Extrapolation.CLAMP,
      ),
      zIndex: Math.max(0, 20 - Math.round(absoluteDistance * 2)),
    };
  }, [carouselPosition, index]);

  return (
    <Animated.View 
      style={[
        { position: 'absolute', left: '50%', top: '50%', marginLeft: -150, marginTop: -160, width: 300, height: 350 },
        animatedStyle,
      ]}
      pointerEvents={opacity === 0 ? 'none' : 'auto'}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => { playPop(); onPress(); }}
        style={{ width: 300, height: 350 }}
      >
        <View
          style={{
            width: 300, height: 350,
            backgroundColor: '#fff',
            borderRadius: 48,
            alignItems: 'center',
            borderWidth: 10,
            borderColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isActive ? 25 : 15 },
            shadowOpacity: isActive ? 0.2 : 0.1,
            shadowRadius: isActive ? 35 : 20,
            elevation: isActive ? 10 : 5,
          }}
        >
          {isActive && (
            <View 
              style={{
                position: 'absolute',
                top: -6, left: -6, right: -6, bottom: -6,
                borderWidth: 6,
                borderColor: 'rgba(255, 255, 255, 0.45)',
                borderRadius: 54,
              }}
              pointerEvents="none"
            />
          )}

          <View style={{ width: '100%', height: '100%', borderRadius: 38, overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
            <Image source={style.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
          
          <View style={{ 
            position: 'absolute', 
            bottom: -20,
            alignSelf: 'center',
            paddingHorizontal: 16, 
            paddingVertical: 6, 
            borderRadius: 20, 
            borderWidth: 3, 
            borderColor: '#fff',
            backgroundColor: '#FF7597',
            zIndex: 20,
            // Thêm shadow nhẹ cho label để nổi lên
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
          }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>{style.id}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function StyleV2() {
  const router = useRouter();
  const { playPop } = usePopSound();
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselPosition = useSharedValue(0);
  const gestureStartPosition = useSharedValue(0);

  const handleStyleSelect = (_id: string, index: number) => {
    setActiveIndex(index);
    carouselPosition.value = withSpring(index, springConfig);
  };

  // Swipe gesture to navigate styles
  const panGesture = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-24, 24])
    .onBegin(() => {
      gestureStartPosition.value = carouselPosition.value;
    })
    .onUpdate((event) => {
      carouselPosition.value = Math.max(
        0,
        Math.min(
          STYLES.length - 1,
          gestureStartPosition.value - event.translationX / swipeStep,
        ),
      );
    })
    .onEnd((e) => {
      const projectedPosition = Math.max(
        gestureStartPosition.value - 2,
        Math.min(
          gestureStartPosition.value + 2,
          carouselPosition.value - e.velocityX / 5000,
        ),
      );
      const nextIndex = Math.max(
        0,
        Math.min(STYLES.length - 1, Math.round(projectedPosition)),
      );
      carouselPosition.value = withSpring(nextIndex, springConfig);
      runOnJS(setActiveIndex)(nextIndex);
    });

  return (
    <AikidPage
      scene="art"
      title="Chọn phong cách vẽ"
      backHref="/(app)/art"
      container="wide"
      scroll={false}
    >
      <View className="flex-1 items-center justify-center z-10">
        <GestureDetector gesture={panGesture}>
          <View style={{ height: 420, width: '100%', position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
            {STYLES.map((style, index) => (
              <StyleCard 
                key={style.id}
                index={index}
                activeIndex={activeIndex}
                carouselPosition={carouselPosition}
                style={style}
                onPress={() => handleStyleSelect(style.id, index)}
                playPop={playPop}
              />
            ))}
          </View>
        </GestureDetector>

        <TouchableOpacity 
          style={{
            marginTop: 40,
            width: 200,
            height: 58,
            borderRadius: 35,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FF5E97',
            shadowColor: '#FF5E97',
            shadowOpacity: 0.35,
            shadowRadius: 35,
            shadowOffset: { width: 0, height: 12 },
            elevation: 12,
          }}
          activeOpacity={0.8}
          onPress={() => {
            playPop();
            router.push({ pathname: '/(app)/art/canvas', params: { style: STYLES[activeIndex].id } });
          }}
        >
          <Text className="text-white text-xl uppercase tracking-wider" style={{ fontFamily: 'Mali_600SemiBold' }}>CHỌN</Text>
        </TouchableOpacity>
      </View>
    </AikidPage>
  );
}
