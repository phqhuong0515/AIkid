import {
  AikidBgAssets,
  AikidBrandColors,
  AikidButtonGradients,
  AikidFonts,
  AikidFrameColors,
  AikidRadius,
  AikidShadows,
  AikidSpacing,
  AikidTextColors,
} from '@/features/kids-ui/theme';

import type { AikidTemplate } from '../types';

/** Default StoryMee skin. Other skins implement the same contract. */
export const storymeeTemplate: AikidTemplate = {
  id: 'storymee',
  name: 'StoryMee',
  colors: {
    text: AikidTextColors,
    frame: AikidFrameColors,
    brand: AikidBrandColors,
  },
  fonts: AikidFonts,
  gradients: {
    nav: AikidButtonGradients.nav,
    cta: AikidButtonGradients.cta,
    feature: AikidButtonGradients.feature,
    encourage: AikidButtonGradients.encourage,
    discourage: AikidButtonGradients.discourage,
    delete: AikidButtonGradients.delete,
    icon: AikidButtonGradients.navIcon,
  },
  radius: AikidRadius,
  spacing: AikidSpacing,
  shadows: AikidShadows,
  assets: AikidBgAssets,
};
