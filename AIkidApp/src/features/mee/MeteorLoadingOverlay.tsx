import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, useWindowDimensions, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withDelay,
  Easing,
  interpolate,
  runOnJS,
  withSequence,
  SharedValue
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export function MeteorLoadingOverlay({ isVisible, onFadedOut }: { isVisible: boolean, onFadedOut?: () => void }) {
  const { width, height } = useWindowDimensions();
  const [isRendered, setIsRendered] = useState(isVisible);
  const opacity = useSharedValue(isVisible ? 1 : 0);

  const mainMeteorAnim = useSharedValue(0);
  const mini1Anim = useSharedValue(0);
  const mini2Anim = useSharedValue(0);
  const mini3Anim = useSharedValue(0);
  const dotsAnim = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
      opacity.value = withTiming(1, { duration: 400 });

      // Main meteor: 2.2s
      mainMeteorAnim.value = withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.bezier(0.25, 0.8, 0.25, 1) }),
        -1,
        false
      );

      // Mini meteors
      mini1Anim.value = withDelay(400, withRepeat(withTiming(1, { duration: 1600, easing: Easing.linear }), -1, false));
      mini2Anim.value = withDelay(900, withRepeat(withTiming(1, { duration: 1900, easing: Easing.linear }), -1, false));
      mini3Anim.value = withDelay(100, withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1, false));

      // Dots
      dotsAnim.value = withRepeat(withTiming(3, { duration: 1500, easing: Easing.linear }), -1, false);

    } else {
      opacity.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
          if (onFadedOut) runOnJS(onFadedOut)();
        }
      });
    }
  }, [isVisible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    display: opacity.value === 0 && !isVisible ? 'none' : 'flex'
  }));

  const mainMeteorStyle = useAnimatedStyle(() => {
    const translateX = interpolate(mainMeteorAnim.value, [0, 1], [width * 0.6, -width * 0.6]);
    const translateY = interpolate(mainMeteorAnim.value, [0, 1], [-height * 0.6, height * 0.6]);
    const op = interpolate(mainMeteorAnim.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return {
      opacity: op,
      transform: [
        { translateX },
        { translateY },
        { rotate: '150deg' }
      ]
    };
  });

  const getMiniMeteorStyle = (animValue: SharedValue<number>) => {
    return useAnimatedStyle(() => {
      const translateX = interpolate(animValue.value, [0, 1], [width * 0.6, -width * 0.6]);
      const translateY = interpolate(animValue.value, [0, 1], [-height * 0.6, height * 0.6]);
      const op = interpolate(animValue.value, [0, 0.15, 0.85, 1], [0, 0.6, 0.6, 0]);
      return {
        opacity: op,
        transform: [
          { translateX },
          { translateY },
          { rotate: '150deg' }
        ]
      };
    });
  };

  const mini1Style = getMiniMeteorStyle(mini1Anim);
  const mini2Style = getMiniMeteorStyle(mini2Anim);
  const mini3Style = getMiniMeteorStyle(mini3Anim);

  const dotsStyle = useAnimatedStyle(() => {
    // 0 -> 1 = ., 1 -> 2 = .., 2 -> 3 = ...
    return {};
  });

  if (!isRendered && !isVisible) return null;

  return (
    <Animated.View style={[styles.container, overlayStyle]}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53', '#FCE082']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Fallback pattern for stars could be added here */}
      
      {/* Mini Meteors */}
      <Animated.View style={[styles.miniMeteor, { top: '15%', left: '10%' }, mini1Style]} />
      <Animated.View style={[styles.miniMeteor, { top: '75%', left: '5%' }, mini2Style]} />
      <Animated.View style={[styles.miniMeteor, { top: '85%', left: '50%' }, mini3Style]} />

      {/* Main Meteor */}
      <Animated.View style={[styles.meteorContainer, mainMeteorStyle]}>
        <LinearGradient
          colors={['rgba(157, 28, 127, 0)', 'rgba(157, 28, 127, 0.25)', 'rgba(255, 94, 151, 0.75)', 'rgba(255, 240, 245, 0.95)']}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={styles.meteorTrail}
        />
        <View style={styles.meteorHead}>
          {/* Craters */}
          <View style={[styles.meteorCrater, { width: 14, height: 14, top: 22, left: 18 }]} />
          <View style={[styles.meteorCrater, { width: 20, height: 20, top: 32, left: 32 }]} />
          <View style={[styles.meteorCrater, { width: 12, height: 12, top: 18, left: 45 }]} />
          <View style={[styles.meteorCrater, { width: 10, height: 10, top: 48, left: 20 }]} />
        </View>
      </Animated.View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.loadingText}>
          Bé đợi chút nhé...
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  miniMeteor: {
    position: 'absolute',
    width: 160,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 9999,
  },
  meteorContainer: {
    position: 'absolute',
    width: 320,
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  meteorTrail: {
    width: 600,
    height: 70,
    borderRadius: 40,
    marginRight: -40,
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
  },
  meteorHead: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFB6C1', // Simple fallback color
    shadowColor: '#FF5E97',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 10,
  },
  meteorCrater: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 50,
  },
  textContainer: {
    marginTop: 50,
    zIndex: 20,
  },
  loadingText: {
    fontSize: 35, // Approx 2.2rem
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 94, 151, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  }
});
