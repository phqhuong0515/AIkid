/**
 * AikidCard — Frame/Khung primitive
 *
 * "Khung" trong design guide — nền cream, viền trắng dày, bo góc lớn, shadow mềm.
 *
 * Variants:
 *   raised   — Card nổi lên, shadow mạnh (màn hình chính)
 *   soft     — Card nhẹ, shadow nhỏ (panel trong)
 *   flat     — Không shadow (card trong list)
 *   dashed   — Viền nét đứt (step indicator, upload zone)
 *   outlined — Viền liền màu brand (selected state)
 *
 * Usage:
 *   <AikidCard variant="raised" style={{ margin: 16 }}>
 *     ...content...
 *   </AikidCard>
 */

import React from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';

import { useAikidTemplate, type AikidTemplate } from '@/design-system';

export type CardVariant = 'raised' | 'soft' | 'flat' | 'dashed' | 'outlined' | 'selected';

function createVariantStyles(
  template: AikidTemplate,
): Record<CardVariant, ViewStyle> {
  const { colors, radius, shadows } = template;
  return {
  raised: {
    backgroundColor: colors.frame.paper,
    borderWidth: 8,
    borderColor: colors.frame.white,
    borderRadius: radius.cardXl,
    ...shadows.raised,
  },
  soft: {
    backgroundColor: colors.frame.paper,
    borderWidth: 4,
    borderColor: colors.frame.white,
    borderRadius: radius.cardLg,
    ...shadows.card,
  },
  flat: {
    backgroundColor: colors.frame.paper,
    borderWidth: 2,
    borderColor: colors.frame.white,
    borderRadius: radius.card,
  },
  dashed: {
    backgroundColor: colors.frame.paper,
    borderWidth: 2,
    borderColor: '#EBDCD0',
    borderStyle: 'dashed',
    borderRadius: radius.cardLg,
    ...shadows.soft,
  },
  outlined: {
    backgroundColor: colors.frame.paper,
    borderWidth: 2,
    borderColor: '#E2D9CF',
    borderRadius: radius.card,
    ...shadows.soft,
  },
  selected: {
    backgroundColor: colors.brand.pinkLight,
    borderWidth: 2.5,
    borderColor: colors.brand.pink,
    borderRadius: radius.card,
    ...shadows.soft,
  },
  };
}

type AikidCardProps = {
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  /** Custom padding (default: 20) */
  padding?: number;
  /** Remove default padding */
  noPadding?: boolean;
};

export function AikidCard({
  variant = 'soft',
  style,
  children,
  padding = 20,
  noPadding = false,
}: AikidCardProps) {
  const variantStyles = createVariantStyles(useAikidTemplate());
  return (
    <View
      style={[
        variantStyles[variant],
        !noPadding && { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}
