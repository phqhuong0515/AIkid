/**
 * AIkid Design System — Design Tokens
 *
 * SOURCE: Design guide (Alkid.vn) — July 2026
 *
 * Font mapping:
 *   Heading/Title → Fredoka (700/600) — replaces Chiron GoRound TC
 *   Body          → Mali (400/500)
 *
 * Color naming follows design guide sections:
 *   text.*   → Typography colors
 *   frame.*  → Element khung colors
 *   btn.*    → Button gradient endpoints
 *   brand.*  → Primary brand palette
 */

import type { ViewStyle } from 'react-native';

// ─── Typography ────────────────────────────────────────────────────────────────

export const AikidFonts = {
  /** Heading / Title — Fredoka Bold (replace Chiron GoRound TC 700-800) */
  headingBold: 'Fredoka_700Bold',
  /** Sub-heading / Title medium */
  headingSemi: 'Fredoka_600SemiBold',
  /** Card label, nav label */
  headingMed: 'Fredoka_500Medium',
  /** Heading regular */
  headingReg: 'Fredoka_400Regular',
  /** Body text */
  bodyReg: 'Mali_400Regular',
  /** Body medium */
  bodyMed: 'Mali_500Medium',
  /** Body semibold */
  bodySemi: 'Mali_600SemiBold',
  /** Body bold */
  bodyBold: 'Mali_700Bold',
} as const;

// ─── Text Colors ───────────────────────────────────────────────────────────────
// From design guide "HEADING / TITLE" section

export const AikidTextColors = {
  /** #334155 — HEADING / TITLE: Tên các thể loại chọn / Văn bản nhập trực tiếp / Tiêu đề câu hỏi / Chữ trên button tính năng */
  heading: '#334155',
  /** #704E48 — Mô tả dưới Title / Văn bản hướng dẫn */
  title: '#704E48',
  /** #8C6F65 — Mô tả đuôi / Văn bản hướng dẫn phụ */
  body: '#8C6F65',
  /** #C3A69D — Gợi ý ở nhập liệu (aaser chen nhập) / Bổ đệm kỳ ký (0/50, 0/300..) */
  placeholder: '#C3A69D',
  /** #FFFFFF — Chữ trên button chuyển giữa các trang */
  white: '#FFFFFF',
  /** #FF7597 — Chữ trong các thẻ mang tính chất chú ý / gợi ý */
  brand: '#FF7597',
} as const;

// ─── Frame / Element Colors ────────────────────────────────────────────────────
// From design guide "Color" → "Element khung" section

export const AikidFrameColors = {
  /** #E2DCE2 — Nền nhạt element khung */
  bgLight: '#E2DCE2',
  /** #FDFAFA — Nền chính card / paper */
  paper: '#FDFAFA',
  /** #FFFFFF — Viền, bề mặt trắng */
  white: '#FFFFFF',
} as const;

// ─── Brand Palette ─────────────────────────────────────────────────────────────

export const AikidBrandColors = {
  /** Primary pink */
  pink: '#FF7597',
  /** Pink light (hover/fill) */
  pinkLight: '#FFEAEF',
  /** Pink medium */
  pinkMed: '#FF9EB5',
  /** Coral/orange accent */
  coral: '#FF9040',
  /** Green encourage */
  green: '#4CAF8A',
  /** Green light */
  greenLight: '#E8F5F0',
  /** Blue-gray discourage */
  blueGray: '#A4B5C4',
  /** Blue-gray light */
  blueGrayLight: '#EEF2F5',
  /** Red delete */
  red: '#E84040',
  /** Red light */
  redLight: '#FDEAEA',
} as const;

// ─── Button Gradient Definitions ───────────────────────────────────────────────
// 7 button types from design guide "Button" section, gradient 45°

export const AikidButtonGradients = {
  /** Button chuyển trang (text) — Hồng đơn */
  nav: ['#FF9EB5', '#FF7597'] as const,
  /** Button mang tính chất CTA (Đăng ký / Đăng nhập) — Hồng → Cam */
  cta: ['#FF7597', '#FF9040'] as const,
  /** Button tính năng — Trắng nhạt */
  feature: ['#FFFFFF', '#F0EDE8'] as const,
  /** Button mang tính chất khuyến khích — Xanh lá */
  encourage: ['#5DBEAA', '#4CAF8A'] as const,
  /** Button mang tính chất không khuyến khích — Xám xanh */
  discourage: ['#B8C9D4', '#A4B5C4'] as const,
  /** Button xóa — Đỏ */
  delete: ['#F06060', '#E84040'] as const,
  /** Button chuyển trang (icon) — Hồng tròn */
  navIcon: ['#FF9EB5', '#FF7597'] as const,
} as const;

// ─── Border Radius ─────────────────────────────────────────────────────────────

export const AikidRadius = {
  /** Pill / tag */
  pill: 999,
  /** Large card — main frame */
  cardXl: 40,
  /** Standard card */
  cardLg: 32,
  /** Medium card / modal section */
  card: 24,
  /** Input / small card */
  input: 16,
  /** Button */
  btn: 18,
  /** Small element */
  sm: 12,
  /** Tiny dot */
  xs: 8,
} as const;

// ─── Spacing ───────────────────────────────────────────────────────────────────

export const AikidSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

// ─── Shadows ───────────────────────────────────────────────────────────────────

export const AikidShadows = {
  soft: {
    shadowColor: '#8A7463',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  card: {
    shadowColor: '#8A7463',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle,
  raised: {
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  } as ViewStyle,
  modal: {
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,
} as const;

// ─── Background Assets (per-screen) ───────────────────────────────────────────

export const AikidBgAssets = {
  lobby: require('../../public/lobby-assets/images/bg-home.png'),
  art: require('../../public/lobby-assets/images/bg-art.png'),
  character: require('../../public/lobby-assets/images/bg-character.png'),
  mee: require('../../public/lobby-assets/images/bg-mee.png'),
  comic: require('../../public/lobby-assets/images/bg-art.png'), // TODO: bg-comic.png
  login: require('../../public/lobby-assets/images/bg-login.jpeg'),
} as const;

// ─── Legacy alias (backward compat) ───────────────────────────────────────────
// Keeps old code working while being migrated

export const AikidTheme = {
  colors: {
    // Frame
    creamSoft: AikidFrameColors.paper,
    cream: AikidFrameColors.paper,
    white: AikidFrameColors.white,
    // Brand
    brand: AikidBrandColors.pink,
    brandMain: AikidBrandColors.pink,
    pink: AikidBrandColors.pink,
    pinkDeep: '#E04A77',
    coral: AikidBrandColors.coral,
    // Text
    ink: AikidTextColors.heading,
    inkMuted: AikidTextColors.body,
    warmBrown: AikidTextColors.title,
    mutedBrown: AikidTextColors.body,
    placeholder: AikidTextColors.placeholder,
  },
  fonts: {
    main: AikidFonts.bodyReg,
    med: AikidFonts.bodyMed,
    semi: AikidFonts.bodySemi,
    bold: AikidFonts.bodyBold,
    heading: AikidFonts.headingBold,
    headingSemi: AikidFonts.headingSemi,
  },
  assets: {
    bgHome: AikidBgAssets.lobby,
    bgArt: AikidBgAssets.art,
    bgComic: AikidBgAssets.comic,
    bgCharacter: AikidBgAssets.character,
    bgMee: AikidBgAssets.mee,
    bgLogin: AikidBgAssets.login,
    bgCharacterFeature: require('../../public/lobby-assets/images/bg-character-feature.png'),
    titleHome: require('../../public/lobby-assets/images/title-home-vn.png'),
    logo: require('../../public/hub-images/logo.svg'),
  },
  radius: AikidRadius,
  shadow: AikidShadows,
  spacing: AikidSpacing,
} as const;
