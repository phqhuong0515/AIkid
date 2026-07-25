import { Pressable, Text, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AikidTheme } from './theme';

export function AikidButton({
  title,
  label,
  onPress,
  loading = false,
  variant = 'primary',
  size = 'md',
  style,
  disabled,
}: {
  title?: string;
  label?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}) {
  const displayTitle = title || label || '';

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg = variant === 'primary' ? AikidTheme.colors.brandMain : '#E2E8F0';
  const color = variant === 'primary' ? '#FFF' : '#4A3728';

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={loading ? undefined : onPress}
        style={{
          backgroundColor: bg,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#4A3728',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {loading ? (
          <ActivityIndicator color={color} />
        ) : (
          <Text style={{ fontFamily: AikidTheme.fonts.bold, fontSize: 16, color }}>{displayTitle}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
