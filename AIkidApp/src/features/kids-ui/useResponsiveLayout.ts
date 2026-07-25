import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout({ maxContent = 1100 } = {}) {
  const { width, height } = useWindowDimensions();
  const wide = width > 768;
  const compact = width < 400;
  const sidePad = wide ? Math.max(20, (width - maxContent) / 2) : 20;
  const gap = wide ? 24 : 16;
  const contentContainer = { width: '100%' as any, maxWidth: maxContent, alignSelf: 'center' as any };
  const innerW = width - sidePad * 2;
  const twoCol = wide;
  const colW = twoCol ? (innerW - gap) / 2 : innerW;

  return { width, height, wide, compact, sidePad, gap, maxContent, contentContainer, innerW, twoCol, colW };
}


