import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { usePopSound } from '@/hooks/usePopSound';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalHeader } from '@/components/GlobalHeader';

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
  onPress, 
  playPop 
}: { 
  style: any, 
  index: number, 
  activeIndex: number, 
  onPress: () => void, 
  playPop: () => void 
}) => {
  const d = Math.abs(index - activeIndex);
  const scale = getScaleForDistance(d);
  const opacity = getOpacityForDistance(d);
  const direction = index > activeIndex ? 1 : index < activeIndex ? -1 : 0;
  const translateX = direction * getCardOffset(d);
  const zIndex = 10 - d;
  const isActive = index === activeIndex;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withSpring(translateX, { damping: 20, stiffness: 90 }) },
        { scale: withSpring(scale, { damping: 20, stiffness: 90 }) },
        { translateY: withSpring(isActive ? -16 : 0, { damping: 20, stiffness: 90 }) }
      ],
      opacity: withTiming(opacity, { duration: 300 }),
      zIndex: zIndex,
    };
  }, [translateX, scale, isActive, opacity, zIndex]);

  const innerAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: withTiming(isActive ? 0.25 : 0.15, { duration: 300 }),
      shadowRadius: withTiming(isActive ? 60 : 45, { duration: 300 }),
      elevation: isActive ? 10 : 5,
    };
  }, [isActive]);

  return (
    <Animated.View 
      style={[
        { position: 'absolute', left: '50%', top: '50%', marginLeft: -150, marginTop: -175, width: 300, height: 350 },
        animatedStyle,
      ]}
      pointerEvents={opacity === 0 ? 'none' : 'auto'}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => { playPop(); onPress(); }}
        style={{ width: 300, height: 350 }}
      >
        <Animated.View 
          style={[innerAnimatedStyle, {
            width: 300, height: 350,
            backgroundColor: '#fff',
            borderRadius: 48,
            alignItems: 'center',
            borderWidth: 10,
            borderColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isActive ? 25 : 15 },
          }]}
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
          
          <View className={`absolute -top-6 px-6 py-2 rounded-full border-[4px] border-white z-10 bg-gradient-to-br ${style.from} ${style.to} ${isActive ? 'left-5' : 'left-8'}`}>
            <Text className="text-white font-bold text-xl uppercase tracking-wide" style={{ fontFamily: 'Mali' }}>{style.id}</Text>
          </View>
          <View style={{ width: '100%', height: '100%', borderRadius: 38, overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
            <Image source={style.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function StyleV2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { playPop } = usePopSound();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleStyleSelect = (id: string, index: number) => {
    setActiveIndex(index);
  };

  return (
    <ImageBackground 
      source={require('../../../public/lobby-assets/images/bg-art.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <View style={{ paddingTop: insets.top }}>
        <GlobalHeader />
        <TouchableOpacity
          style={styles.backBtnWrapper}
          onPress={() => { playPop(); router.canGoBack() ? router.back() : router.replace('/(app)/art'); }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF9EB5', '#FF7597']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.backBtnGradient}
          >
            <Ionicons name="arrow-back" size={16} color="#FFF" />
            <Text style={styles.backBtnText}>Trở về</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center z-10">
        <Text className="text-4xl font-bold text-gray-800 mb-8 shadow-sm" style={{ fontFamily: 'Mali' }}>CHỌN PHONG CÁCH VẼ</Text>
        
        <View style={{ height: 420, width: '100%', position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
          {STYLES.map((style, index) => (
            <StyleCard 
              key={style.id}
              index={index}
              activeIndex={activeIndex}
              style={style}
              onPress={() => handleStyleSelect(style.id, index)}
              playPop={playPop}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={{
            marginTop: 40,
            width: 200,
            height: 58,
            borderRadius: 35,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ff7597',
            shadowColor: '#ff7597',
            shadowOpacity: 0.35,
            shadowRadius: 35,
            shadowOffset: { width: 0, height: 12 },
            elevation: 8,
          }}
          activeOpacity={0.8}
          onPress={() => {
            playPop();
            router.push({ pathname: '/(app)/art/canvas', params: { style: STYLES[activeIndex].id } });
          }}
        >
          <Text className="text-white font-bold text-xl uppercase tracking-wider" style={{ fontFamily: 'Mali' }}>CHỌN</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backBtnWrapper: {
    alignSelf: 'flex-start', marginLeft: 18, marginTop: 2,
    shadowColor: '#FF7597', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 5,
  },
  backBtnGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 9999,
  },
  backBtnText: { marginLeft: 2, fontSize: 14, fontWeight: 'bold', color: '#FFF' },
});
