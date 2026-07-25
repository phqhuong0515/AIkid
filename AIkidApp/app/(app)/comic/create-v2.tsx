import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Alert, useWindowDimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalHeader } from '@/components/GlobalHeader';
import { usePopSound } from '@/hooks/usePopSound';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ComicCreateV2() {
  const router = useRouter();
  const { playPop } = usePopSound();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handlePress = (route: string) => {
    playPop();
    if (route === 'coming_soon') {
      Alert.alert('Thông báo', 'Tính năng đang được phát triển!');
    } else {
      router.push(route as any);
    }
  };

  const GradientIcon = ({ name, solid = true }: { name: string; solid?: boolean }) => (
    <MaskedView
      style={{ width: 80, height: 80 }}
      maskElement={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <FontAwesome5 name={name} size={64} solid={solid} color="white" />
        </View>
      }
    >
      <LinearGradient
        colors={['#FF5E97', '#FF9EB5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      />
    </MaskedView>
  );

  const OptionCard = ({ title, iconName, onPress }: { title: string; iconName: string; onPress: () => void }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    };

    return (
      <AnimatedPressable
        style={[styles.card, isTablet && styles.cardTablet, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <View style={styles.cardContent}>
          <GradientIcon name={iconName} solid />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      </AnimatedPressable>
    );
  };

  return (
    <ImageBackground
      source={require('../../../public/lobby-assets/images/bg-art.png')}
      style={styles.background}
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

      {/* Center Content */}
      <View style={styles.container}>
        <View style={[styles.cardsWrapper, isTablet && styles.cardsWrapperTablet]}>
          <OptionCard
            title="Truyện Chữ"
            iconName="book"
            onPress={() => handlePress('/(app)/comic/genre-v2')}
          />
          <OptionCard
            title="Truyện Tranh"
            iconName="book-open"
            onPress={() => handlePress('coming_soon')}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#FED7D7',
  },
  backBtnWrapper: {
    alignSelf: 'flex-start', marginLeft: 18, marginTop: 6,
    shadowColor: '#FF7597', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 5,
  },
  backBtnGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 9999,
  },
  backBtnText: { marginLeft: 2, fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardsWrapper: {
    flexDirection: 'column',
    gap: 30,
    width: '100%',
    maxWidth: 860,
    alignItems: 'center',
  },
  cardsWrapperTablet: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 50,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    aspectRatio: 1,
    backgroundColor: '#FDFAF4',
    borderWidth: 10,
    borderColor: '#FFFFFF',
    borderRadius: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 45,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTablet: {
    flex: 1,
    aspectRatio: 0.8,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  cardTitle: {
    fontWeight: '900',
    fontSize: 26,
    color: '#475569',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
