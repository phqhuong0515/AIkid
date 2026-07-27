import React from 'react';
import { View, StyleSheet, Pressable, ImageBackground, useWindowDimensions, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalHeader } from '@/components/GlobalHeader';

export default function MeeNextPlaceholderScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isMobile = width <= 850;

  return (
    <ImageBackground 
      source={require('@/../public/lobby-assets/images/bg-mee.png')}
      style={styles.container}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <View style={{ paddingTop: Math.max(20, insets.top), width: '100%', paddingHorizontal: 16, zIndex: 10 }}>
        <GlobalHeader />
      </View>
      <View style={[styles.mainContent, isMobile && styles.mainContentMobile]}>
        
        {/* Left Back Button */}
        <Pressable 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(app)/lobby');
            }
          }}
          style={({ pressed }) => [
            styles.navBtn,
            styles.btnLeft,
            pressed && styles.navBtnPressed
          ]}
          accessibilityRole="button"
          accessibilityLabel="Quay lại Tạo Mee"
        >
          <Svg viewBox="0 0 24 24" width={24} height={24} fill="white" style={{ marginRight: 2 }}>
            <Path d="M16 5v14l-11-7z" />
          </Svg>
        </Pressable>

        {/* Right Placeholder Button */}
        <Pressable 
          onPress={() => {}}
          style={({ pressed }) => [
            styles.navBtn,
            styles.btnRight,
            pressed && styles.navBtnPressed
          ]}
          accessibilityRole="button"
          accessibilityLabel="Tiếp tục (Chưa có tính năng)"
        >
          <Svg viewBox="0 0 24 24" width={24} height={24} fill="white" style={{ marginLeft: 2 }}>
            <Path d="M8 5v14l11-7z" />
          </Svg>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  mainContentMobile: {
    // Mobile specific styles if needed
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3.5,
    borderColor: '#FCF4DB',
    backgroundColor: '#FF5C8A', // Base color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5C8A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 10,
    marginTop: -28,
  },
  navBtnPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#FF7096',
  },
  btnLeft: {
    left: '10%',
  },
  btnRight: {
    right: '10%',
  }
});
