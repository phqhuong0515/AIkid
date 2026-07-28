/**
 * AIkid UI Primitives — Barrel export
 *
 * Import từ đây trong mọi màn hình:
 *   import { AikidButton, AikidCard, AikidText, AikidModal, PageBackground } from '@/ui';
 */

export { AikidText } from './AikidText';
export type {} from './AikidText';

export { AikidButton } from './AikidButton';
export type { BtnVariant, BtnSize } from './AikidButton';

export { AikidCard } from './AikidCard';
export type { CardVariant } from './AikidCard';

export { AikidModal } from './AikidModal';

export { PageBackground } from './PageBackground';
export type { BgScene } from './PageBackground';

// Re-export tokens for convenience
export {
  AikidFonts,
  AikidTextColors,
  AikidFrameColors,
  AikidBrandColors,
  AikidButtonGradients,
  AikidRadius,
  AikidSpacing,
  AikidShadows,
  AikidBgAssets,
  AikidTheme,
} from '@/features/kids-ui/theme';
