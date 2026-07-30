import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAikidTemplate } from '@/design-system';
import { useResponsiveLayout } from '@/features/kids-ui/useResponsiveLayout';
import { AikidMetrics } from '@/features/kids-ui/theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'surface' | 'panel' | 'quiet';
};

/**
 * Content boundary shared by forms, lists and feature panels.
 * It owns padding, radius, border and clipping so feature code does not.
 */
export function AikidSafeBox({
  children,
  style,
  variant = 'surface',
}: Props) {
  const template = useAikidTemplate();
  const { isCompact, isDesktopUp } = useResponsiveLayout();

  return (
    <View
      style={[
        styles.base,
        {
          padding: isCompact
            ? AikidMetrics.cardPadding.compact
            : AikidMetrics.cardPadding.regular,
          borderRadius: isCompact ? template.radius.card : template.radius.cardLg,
          backgroundColor:
            variant === 'quiet'
              ? `${template.colors.frame.paper}CC`
              : template.colors.frame.paper,
          borderColor:
            variant === 'panel'
              ? template.colors.frame.white
              : template.colors.frame.bgLight,
        },
        variant === 'surface' ? template.shadows.card : template.shadows.soft,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    minWidth: 0,
    borderWidth: AikidMetrics.borderWidth.card,
    overflow: 'hidden',
  },
});
