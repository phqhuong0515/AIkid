import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  withDelay,
} from 'react-native-reanimated';

import { useFamily } from '@/features/family/store/useFamily';
import { usePopSound } from '@/hooks/usePopSound';
import { GlobalHeader } from '@/components/GlobalHeader';

const Sparkle = ({ style, delay = 0, type }: { style: any; delay?: number; type: string }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    rotation.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(90, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(180, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    ));
    scale.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1.25, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    ));
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    ));
  }, []);

  const animStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const colors = {
    blue: ['#ffffff', '#4D94FF'],
    pink: ['#ffffff', '#FF5C8A'],
    yellow: ['#ffffff', '#FFD700'],
  };
  const color = colors[type as keyof typeof colors] || colors.blue;

  return (
    <Animated.View style={[style, animStyle, { overflow: 'hidden' }]}>
      <View style={{ flex: 1, backgroundColor: color[1], borderRadius: 100 }} />
    </Animated.View>
  );
};

export default function LobbyScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const activeChild = useFamily((state) => state.getActiveChild());
  const loadFamily = useFamily((state) => state.loadFamily);
  
  const { playPop } = usePopSound();

  useEffect(() => { void loadFamily(); }, [loadFamily]);

  const navigateTo = (path: any) => {
    playPop();
    setTimeout(() => {
      router.push(path);
    }, 150);
  };

  const isSmallScreen = width < 768;

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../public/hub-images/bg-home.png')} 
        style={styles.bgImage}
        resizeMode="cover"
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(20, insets.top), paddingBottom: Math.max(40, insets.bottom) }]} 
          showsVerticalScrollIndicator={false}
        >
          <GlobalHeader />

          {/* Hero Section (Title + Mascot) */}
          <View style={[styles.heroSection, isSmallScreen ? { flexDirection: 'column' } : { flexDirection: 'row' }]}>
            <View style={[styles.titleContainer, isSmallScreen ? { width: '100%', marginBottom: 20 } : { width: '55%' }]}>
              <Image source={require('../../public/hub-images/title-home-vn.png')} style={styles.titleImg} contentFit="contain" />
              <Sparkle style={styles.sparkle1} delay={200} type="blue" />
              <Sparkle style={styles.sparkle2} delay={800} type="pink" />
              <Sparkle style={styles.sparkle3} delay={1400} type="yellow" />
              <Sparkle style={styles.sparkle4} delay={2000} type="yellow" />
              <Sparkle style={styles.sparkle5} delay={500} type="pink" />
              <Sparkle style={styles.sparkle6} delay={1700} type="blue" />
            </View>

            <View style={[styles.mascotContainer, isSmallScreen ? { width: '100%', height: 250 } : { width: '45%' }]}>
              <Image source={require('../../public/hub-images/mascot.png')} style={styles.mascotImg} contentFit="contain" />
            </View>
          </View>

          {/* Intro Box */}
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              Chào mừng bé đến với vũ trụ sáng tạo diệu kỳ! Hãy tự tay thiết kế nhân vật Mee đáng yêu, sáng tác những cuốn truyện tranh đầy màu sắc và ghi lại hành trình thú vị của riêng mình nhé!
            </Text>
          </View>

          {/* Cards Section */}
          <View style={[styles.cardsContainer, isSmallScreen ? { flexDirection: 'column' } : { flexDirection: 'row', flexWrap: 'wrap' }]}>
            <Pressable style={[styles.card, isSmallScreen ? { width: '100%' } : { width: '48%' }]} onPress={() => navigateTo('/(app)/mee')}>
              <Image source={require('../../public/hub-images/card_mee.jpeg')} style={styles.cardImg} contentFit="cover" />
              <View style={[styles.cardLabel, { backgroundColor: 'rgba(77,148,255,0.7)' }]}>
                <Text style={styles.cardLabelText}>MEE</Text>
              </View>
            </Pressable>

            <Pressable style={[styles.card, isSmallScreen ? { width: '100%' } : { width: '48%' }]} onPress={() => navigateTo('/(app)/character')}>
              <Image source={require('../../public/hub-images/home-character.jpeg')} style={styles.cardImg} contentFit="cover" />
              <View style={[styles.cardLabel, { backgroundColor: 'rgba(255,180,0,0.7)' }]}>
                <Text style={styles.cardLabelText}>NHÂN VẬT</Text>
              </View>
            </Pressable>

            <Pressable style={[styles.card, isSmallScreen ? { width: '100%' } : { width: '48%' }]} onPress={() => navigateTo('/(app)/art')}>
              <Image source={require('../../public/hub-images/card_art.jpeg')} style={styles.cardImg} contentFit="cover" />
              <View style={[styles.cardLabel, { backgroundColor: 'rgba(215,55,71,0.7)' }]}>
                <Text style={styles.cardLabelText}>XƯỞNG SÁNG TẠO</Text>
              </View>
            </Pressable>

            <Pressable style={[styles.card, isSmallScreen ? { width: '100%' } : { width: '48%' }]} onPress={() => navigateTo('/(app)/comic/library-v2')}>
              <Image source={require('../../public/hub-images/home-explore.jpeg')} style={styles.cardImg} contentFit="cover" />
              <View style={[styles.cardLabel, { backgroundColor: 'rgba(62,210,17,0.7)' }]}>
                <Text style={styles.cardLabelText}>KHÁM PHÁ</Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  logo: {
    height: 40,
    width: 120,
  },
  heroSection: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  titleContainer: {
    position: 'relative',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleImg: {
    width: '100%',
    height: '100%',
  },
  sparkle1: { position: 'absolute', top: '10%', left: '10%', width: 20, height: 20 },
  sparkle2: { position: 'absolute', top: '20%', left: '80%', width: 25, height: 25 },
  sparkle3: { position: 'absolute', top: '70%', left: '90%', width: 30, height: 30 },
  sparkle4: { position: 'absolute', top: '80%', left: '15%', width: 25, height: 25 },
  sparkle5: { position: 'absolute', top: '5%', left: '50%', width: 15, height: 15 },
  sparkle6: { position: 'absolute', top: '65%', left: '45%', width: 20, height: 20 },
  mascotContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImg: {
    width: '100%',
    height: '100%',
  },
  descriptionBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 5,
    borderColor: '#FF5C8A',
    borderRadius: 30,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  descriptionText: {
    fontFamily: 'Mali_600SemiBold',
    fontSize: 18,
    lineHeight: 28,
    color: '#475569',
    textAlign: 'center',
  },
  cardsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 6,
    borderColor: '#FFFFFF',
    borderRadius: 30,
    height: 250,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    marginBottom: 10,
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  cardLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabelText: {
    color: '#FFFFFF',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
