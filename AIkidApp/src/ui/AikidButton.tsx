/**
 * AikidButton — Button primitive
 *
 * 7 variants from design guide:
 *   nav        — Chuyển trang (hồng gradient)
 *   cta        — CTA: Đăng ký / Đăng nhập (hồng → cam)
 *   feature    — Tính năng (trắng, viền nhạt)
 *   encourage  — Khuyến khích (xanh lá)
 *   discourage — Không khuyến khích (xám xanh)
 *   delete     — Xóa (đỏ)
 *   icon       — Chuyển trang icon (tròn hồng)
 *
 * Usage:
 *   <AikidButton variant="cta" onPress={...}>Đăng nhập</AikidButton>
 *   <AikidButton variant="nav" size="lg" onPress={...}>Tiếp tục →</AikidButton>
 *   <AikidButton variant="icon" icon={<Ionicons name="arrow-forward" size={22} color="#fff"/>} onPress={...} />
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AikidButtonGradients, AikidRadius, AikidShadows, AikidTextColors } from '@/features/kids-ui/theme';
import { AikidText } from './AikidText';

export type BtnVariant = 'nav' | 'cta' | 'feature' | 'encourage' | 'discourage' | 'delete' | 'icon';
export type BtnSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<BtnSize, { height: number; paddingH: number; fontSize: number; iconSize: number }> = {
  sm: { height: 40, paddingH: 16, fontSize: 14, iconSize: 38 },
  md: { height: 52, paddingH: 24, fontSize: 16, iconSize: 52 },
  lg: { height: 62, paddingH: 32, fontSize: 18, iconSize: 62 },
};

const GRADIENT_MAP: Record<BtnVariant, readonly string[]> = {
  nav:        AikidButtonGradients.nav,
  cta:        AikidButtonGradients.cta,
  feature:    AikidButtonGradients.feature,
  encourage:  AikidButtonGradients.encourage,
  discourage: AikidButtonGradients.discourage,
  delete:     AikidButtonGradients.delete,
  icon:       AikidButtonGradients.navIcon,
};

const TEXT_COLOR_MAP: Record<BtnVariant, string> = {
  nav:        AikidTextColors.white,
  cta:        AikidTextColors.white,
  feature:    AikidTextColors.heading,   // dark text on white bg
  encourage:  AikidTextColors.white,
  discourage: AikidTextColors.white,
  delete:     AikidTextColors.white,
  icon:       AikidTextColors.white,
};

// Shadow per variant
const SHADOW_MAP: Record<BtnVariant, ViewStyle> = {
  nav:        { shadowColor: '#FF7597', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 12, elevation: 5 },
  cta:        { shadowColor: '#FF7597', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 7 },
  feature:    { shadowColor: '#8A7463', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 2 },
  encourage:  { shadowColor: '#4CAF8A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 12, elevation: 5 },
  discourage: { shadowColor: '#A4B5C4', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 2 },
  delete:     { shadowColor: '#E84040', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 12, elevation: 5 },
  icon:       { shadowColor: '#FF7597', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 12, elevation: 5 },
};

type AikidButtonProps = {
  variant?: BtnVariant;
  size?: BtnSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Use for icon-only buttons (variant="icon") */
  icon?: React.ReactNode;
  /** Full-width button */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function AikidButton({
  variant = 'nav',
  size = 'md',
  onPress,
  disabled,
  loading,
  icon,
  fullWidth,
  style,
  children,
}: AikidButtonProps) {
  const sz = SIZE_MAP[size];
  const gradient = GRADIENT_MAP[variant];
  const textColor = TEXT_COLOR_MAP[variant];
  const shadow = SHADOW_MAP[variant];

  const isIcon = variant === 'icon';
  const btnRadius = isIcon ? AikidRadius.pill : AikidRadius.btn;
  const btnWidth = isIcon ? sz.iconSize : fullWidth ? '100%' : undefined;

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        isIcon
          ? { width: sz.iconSize, height: sz.iconSize }
          : { height: sz.height, alignSelf: fullWidth ? 'stretch' : 'flex-start' },
        style,
      ]}
    >
      <LinearGradient
        colors={isDisabled ? ['#D4CAC0', '#C0B8B0'] : (gradient as [string, string, ...string[]])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            borderRadius: btnRadius,
            paddingHorizontal: isIcon ? 0 : sz.paddingH,
            height: isIcon ? sz.iconSize : sz.height,
            width: btnWidth,
          },
          !isDisabled ? shadow : styles.shadowDisabled,
          // Feature button needs border
          variant === 'feature' && styles.featureBorder,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'feature' ? '#8A7463' : '#FFFFFF'}
          />
        ) : icon ? (
          icon
        ) : (
          <AikidText
            variant={variant === 'feature' ? 'btnFeature' : 'btnNav'}
            style={{ fontSize: sz.fontSize, color: isDisabled ? '#9A8F87' : textColor }}
          >
            {children}
          </AikidText>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  featureBorder: {
    borderWidth: 1.5,
    borderColor: '#E2D9CF',
  },
  shadowDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
});
