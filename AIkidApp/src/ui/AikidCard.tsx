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
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { AikidFrameColors, AikidRadius, AikidShadows, AikidBrandColors } from '@/features/kids-ui/theme';

export type CardVariant = 'raised' | 'soft' | 'flat' | 'dashed' | 'outlined' | 'selected';

const variantStyles: Record<CardVariant, ViewStyle> = {
  raised: {
    backgroundColor: AikidFrameColors.paper,
    borderWidth: 8,
    borderColor: AikidFrameColors.white,
    borderRadius: AikidRadius.cardXl,
    ...AikidShadows.raised,
  },
  soft: {
    backgroundColor: AikidFrameColors.paper,
    borderWidth: 4,
    borderColor: AikidFrameColors.white,
    borderRadius: AikidRadius.cardLg,
    ...AikidShadows.card,
  },
  flat: {
    backgroundColor: AikidFrameColors.paper,
    borderWidth: 2,
    borderColor: AikidFrameColors.white,
    borderRadius: AikidRadius.card,
  },
  dashed: {
    backgroundColor: AikidFrameColors.paper,
    borderWidth: 2,
    borderColor: '#EBDCD0',
    borderStyle: 'dashed',
    borderRadius: AikidRadius.cardLg,
    ...AikidShadows.soft,
  },
  outlined: {
    backgroundColor: AikidFrameColors.paper,
    borderWidth: 2,
    borderColor: '#E2D9CF',
    borderRadius: AikidRadius.card,
    ...AikidShadows.soft,
  },
  selected: {
    backgroundColor: AikidBrandColors.pinkLight,
    borderWidth: 2.5,
    borderColor: AikidBrandColors.pink,
    borderRadius: AikidRadius.card,
    ...AikidShadows.soft,
  },
};

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
