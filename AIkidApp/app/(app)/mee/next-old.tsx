import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { AikidButton } from '@/features/kids-ui/AikidButton';
import { AikidTheme } from '@/features/kids-ui/theme';
import Animated, { useSharedValue, withRepeat, withTiming, withSequence, useAnimatedStyle } from 'react-native-reanimated';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { useFamily } from '@/features/family/store/useFamily';

/**
 * Screen displayed after creating a character in the Mee HTML canvas.
 * Handles uploading the avatar base64 to the server and updating the active child's profile.
 */
export default function MeeNextScreen() {
  const router = useRouter();
  const activeIpId = useWorkspace((s) => s.activeIpId);
  const activeChild = useFamily((s) => s.getActiveChild());
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Mascot animation
  const floatY = useSharedValue(0);
  
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 1200 }),
        withTiming(0, { duration: 1200 })
      ),
      -1,
      true
    );
    
    // Read avatar from HTML localStorage
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      const savedMee = globalThis.localStorage.getItem('storymee_avatar');
      if (savedMee) {
        setAvatarUri(savedMee);
      }
    }
  }, []);

  const mascotStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: floatY.value }] };
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.mascotContainer, mascotStyle]}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
              contentFit="contain"
            />
          ) : (
            <Text style={styles.emojiMascot}>🎉</Text>
          )}
        </Animated.View>

        <Text style={styles.title}>Chúc mừng!</Text>
        <Text style={styles.subtitle}>
          Bạn đã tạo xong nhân vật {activeChild?.name || 'Mee'}!
        </Text>

        <View style={styles.buttonGroup}>
          <AikidButton
            label="Trở Về Sảnh"
            variant="primary"
            onPress={() => router.push('/(app)/lobby')}
            style={styles.btn}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AikidTheme.colors.creamSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: AikidTheme.colors.white,
    borderRadius: AikidTheme.radius.cardLg,
    padding: 40,
    alignItems: 'center',
    maxWidth: 500,
    width: '90%',
    ...AikidTheme.shadow.card,
  },
  mascotContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 6,
    borderColor: AikidTheme.colors.white,
    ...AikidTheme.shadow.soft,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  emojiMascot: {
    fontSize: 72,
  },
  title: {
    fontSize: 32,
    fontFamily: AikidTheme.fonts.bold,
    color: AikidTheme.colors.ink,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: AikidTheme.colors.inkMuted,
    fontFamily: AikidTheme.fonts.main,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 28,
  },
  buttonGroup: {
    width: '100%',
  },
  btn: {
    width: '100%',
  },
});
