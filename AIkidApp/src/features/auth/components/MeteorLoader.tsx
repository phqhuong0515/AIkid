import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Meteor = ({ delay = 0, isMini = false, duration = 2200 }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [SCREEN_WIDTH * 0.6, -SCREEN_WIDTH * 0.6]
    );
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [-SCREEN_HEIGHT * 0.6, SCREEN_HEIGHT * 0.6]
    );
    const opacity = interpolate(
      progress.value,
      [0, 0.1, 0.9, 1],
      [0, isMini ? 0.6 : 1, isMini ? 0.6 : 1, 0]
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { rotate: '150deg' },
      ],
      opacity,
    };
  });

  if (isMini) {
    return (
      <Animated.View style={[styles.miniMeteor, animatedStyle]}>
        <LinearGradient
          colors={['rgba(255, 182, 193, 0)', 'rgba(255, 255, 255, 0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.meteorContainer, animatedStyle]}>
      <View style={styles.meteorTrail}>
        <LinearGradient
          colors={[
            'rgba(157, 28, 127, 0)',
            'rgba(157, 28, 127, 0.25)',
            'rgba(255, 94, 151, 0.75)',
            'rgba(255, 240, 245, 0.95)'
          ]}
          locations={[0, 0.35, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.meteorHead}>
        <View style={[styles.meteorCrater, styles.crater1]} />
        <View style={[styles.meteorCrater, styles.crater2]} />
        <View style={[styles.meteorCrater, styles.crater3]} />
        <View style={[styles.meteorCrater, styles.crater4]} />
      </View>
    </Animated.View>
  );
};

export const MeteorLoader = () => {
  return (
    <View style={styles.overlay} pointerEvents="none">
      <Meteor isMini delay={400} duration={1600} />
      <Meteor isMini delay={900} duration={1900} />
      <Meteor isMini delay={100} duration={1400} />
      
      <Meteor />
      
      <View style={styles.textContainer}>
        <Text style={styles.loadingText}>Bé đợi chút nhé...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  meteorContainer: {
    width: 320,
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
  },
  meteorHead: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFB6C1', // simplified
    shadowColor: '#FF5E97',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 10,
    position: 'relative',
  },
  meteorCrater: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 20,
  },
  crater1: { width: 14, height: 14, top: 22, left: 18 },
  crater2: { width: 20, height: 20, top: 32, left: 32 },
  crater3: { width: 12, height: 12, top: 18, left: 45 },
  crater4: { width: 10, height: 10, top: 48, left: 20 },
  meteorTrail: {
    width: 300,
    height: 70,
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
    marginRight: -40,
    overflow: 'hidden',
  },
  miniMeteor: {
    position: 'absolute',
    width: 160,
    height: 5,
    borderRadius: 5,
    overflow: 'hidden',
  },
  textContainer: {
    marginTop: 150,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 94, 151, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  }
});
