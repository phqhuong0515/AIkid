import { useWindowDimensions } from 'react-native';

export const AIKID_BREAKPOINTS = {
  compact: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export const AIKID_CONTAINERS = {
  reading: 720,
  standard: 1024,
  wide: 1200,
  workspace: 1512,
} as const;

export type ResponsiveMode = 'compact' | 'mobile' | 'tablet' | 'desktop' | 'wide';

export function useResponsiveLayout({ maxContent = 1100 } = {}) {
  const { width, height } = useWindowDimensions();
  const mode: ResponsiveMode =
    width < AIKID_BREAKPOINTS.compact
      ? 'compact'
      : width < AIKID_BREAKPOINTS.tablet
        ? 'mobile'
        : width < AIKID_BREAKPOINTS.desktop
          ? 'tablet'
          : width < AIKID_BREAKPOINTS.wide
            ? 'desktop'
            : 'wide';

  const compact = mode === 'compact';
  const isTabletUp = width >= AIKID_BREAKPOINTS.tablet;
  const isDesktopUp = width >= AIKID_BREAKPOINTS.desktop;
  const wide = isTabletUp;
  const gutter =
    mode === 'compact'
      ? 16
      : mode === 'mobile'
        ? 20
        : mode === 'tablet'
          ? 24
          : mode === 'desktop'
            ? 32
            : 40;
  const sidePad = Math.max(gutter, (width - maxContent) / 2);
  const gap = isTabletUp ? 24 : 16;
  const contentContainer = { width: '100%' as any, maxWidth: maxContent, alignSelf: 'center' as any };
  const innerW = width - sidePad * 2;
  const twoCol = isTabletUp;
  const colW = twoCol ? (innerW - gap) / 2 : innerW;

  return {
    width,
    height,
    mode,
    wide,
    compact,
    isCompact: compact,
    isTabletUp,
    isDesktopUp,
    gutter,
    sidePad,
    gap,
    maxContent,
    contentContainer,
    innerW,
    twoCol,
    colW,
  };
}
