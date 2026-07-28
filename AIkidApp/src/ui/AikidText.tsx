/**
 * AikidText — Typography primitive
 *
 * Usage:
 *   <AikidText variant="heading">Xưởng Vẽ</AikidText>
 *   <AikidText variant="body" color="brand">Gợi ý AI</AikidText>
 */

import React from 'react';
import { Text, TextStyle, StyleSheet, StyleProp } from 'react-native';
import { AikidFonts, AikidTextColors } from '@/features/kids-ui/theme';

type TextVariant =
  | 'heading'    // Fredoka Bold 28 — #334155 — Tên tính năng, tiêu đề màn hình
  | 'title'      // Fredoka SemiBold 22 — #704E48 — Sub-heading, card title
  | 'label'      // Fredoka Medium 16 — #334155 — Label, nav text
  | 'body'       // Mali Regular 16 — #8C6F65 — Mô tả
  | 'bodyBold'   // Mali Bold 16 — #334155 — Nội dung nhấn
  | 'hint'       // Mali Regular 13 — #C3A69D — Placeholder text, đếm ký tự
  | 'brand'      // Mali SemiBold 15 — #FF7597 — Chú ý, gợi ý, link
  | 'white'      // Fredoka SemiBold 16 — #FFFFFF — Chữ trên button tối
  | 'btnNav'     // Fredoka Bold 18 — #FFFFFF — Text trên button chuyển trang
  | 'btnFeature' // Fredoka SemiBold 16 — #334155 — Text trên button tính năng
  | 'caption';   // Mali Regular 12 — #8C6F65 — Caption, timestamp

const variantStyles: Record<TextVariant, TextStyle> = {
  heading: {
    fontFamily: AikidFonts.headingBold,
    fontSize: 28,
    lineHeight: 36,
    color: AikidTextColors.heading,
    letterSpacing: 0.2,
  },
  title: {
    fontFamily: AikidFonts.headingSemi,
    fontSize: 22,
    lineHeight: 30,
    color: AikidTextColors.title,
  },
  label: {
    fontFamily: AikidFonts.headingMed,
    fontSize: 16,
    lineHeight: 24,
    color: AikidTextColors.heading,
  },
  body: {
    fontFamily: AikidFonts.bodyReg,
    fontSize: 15,
    lineHeight: 22,
    color: AikidTextColors.body,
  },
  bodyBold: {
    fontFamily: AikidFonts.bodyBold,
    fontSize: 15,
    lineHeight: 22,
    color: AikidTextColors.heading,
  },
  hint: {
    fontFamily: AikidFonts.bodyReg,
    fontSize: 13,
    lineHeight: 18,
    color: AikidTextColors.placeholder,
  },
  brand: {
    fontFamily: AikidFonts.bodySemi,
    fontSize: 15,
    lineHeight: 22,
    color: AikidTextColors.brand,
  },
  white: {
    fontFamily: AikidFonts.headingSemi,
    fontSize: 16,
    lineHeight: 22,
    color: AikidTextColors.white,
  },
  btnNav: {
    fontFamily: AikidFonts.headingBold,
    fontSize: 18,
    lineHeight: 24,
    color: AikidTextColors.white,
    letterSpacing: 0.3,
  },
  btnFeature: {
    fontFamily: AikidFonts.headingSemi,
    fontSize: 16,
    lineHeight: 22,
    color: AikidTextColors.heading,
  },
  caption: {
    fontFamily: AikidFonts.bodyReg,
    fontSize: 12,
    lineHeight: 16,
    color: AikidTextColors.body,
  },
};

type AikidTextProps = {
  variant?: TextVariant;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  children: React.ReactNode;
  /** Override color token */
  color?: string;
};

export function AikidText({
  variant = 'body',
  style,
  numberOfLines,
  children,
  color,
}: AikidTextProps) {
  return (
    <Text
      style={[variantStyles[variant], color ? { color } : undefined, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
