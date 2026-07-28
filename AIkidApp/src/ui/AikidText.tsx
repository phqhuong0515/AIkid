/**
 * AikidText — Typography primitive
 *
 * Usage:
 *   <AikidText variant="heading">Xưởng Vẽ</AikidText>
 *   <AikidText variant="body" color="brand">Gợi ý AI</AikidText>
 */

import React from 'react';
import { Text, type TextStyle, type StyleProp } from 'react-native';

import { useAikidTemplate, type AikidTemplate } from '@/design-system';

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

function createVariantStyles(
  template: AikidTemplate,
): Record<TextVariant, TextStyle> {
  const { fonts, colors } = template;
  return {
  heading: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    lineHeight: 36,
    color: colors.text.heading,
    letterSpacing: 0.2,
  },
  title: {
    fontFamily: fonts.headingSemi,
    fontSize: 22,
    lineHeight: 30,
    color: colors.text.title,
  },
  label: {
    fontFamily: fonts.headingMed,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.heading,
  },
  body: {
    fontFamily: fonts.bodyReg,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.body,
  },
  bodyBold: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.heading,
  },
  hint: {
    fontFamily: fonts.bodyReg,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.placeholder,
  },
  brand: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.brand,
  },
  white: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text.white,
  },
  btnNav: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text.white,
    letterSpacing: 0.3,
  },
  btnFeature: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text.heading,
  },
  caption: {
    fontFamily: fonts.bodyReg,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text.body,
  },
  };
}

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
  const variantStyles = createVariantStyles(useAikidTemplate());
  return (
    <Text
      style={[variantStyles[variant], color ? { color } : undefined, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
