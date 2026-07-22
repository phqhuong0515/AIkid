import type { MeeDraft, MeeGender } from './types';

type SvgVariant = Record<number | 'default', string>;
type MeeAssetCatalog = {
  skinToneColors: Record<number, { primary: string; shadow: string }>;
  body: { clothes: Record<MeeGender, SvgVariant> };
  facial: {
    face: Record<number, SvgVariant>;
    eyes: Record<number, SvgVariant | string>;
    eyebrow: Record<number, string>;
    nose: Record<number, string>;
    mouth: Record<number, string>;
  };
  hair: {
    bang: Record<number, SvgVariant>;
    behind: Record<number, SvgVariant>;
  };
  outfit: {
    shirt: Record<MeeGender, Record<number, SvgVariant>>;
    pants: Record<MeeGender, Record<number, SvgVariant>>;
    dress: Record<MeeGender | 'unisex', Record<number, string>>;
  };
};

// The source catalog is generated from the original Illustrator exports. It is
// deliberately loaded lazily by Metro instead of duplicating 4.7 MB in app code.
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const MEE_ASSETS = require('../../../../SVG/assets.js') as MeeAssetCatalog;

export const MEE_OPTIONS = {
  faces: [1, 2, 3, 4, 5, 6],
  eyes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  eyebrows: [1, 2, 3, 4, 5, 6, 7],
  mouths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  bangs: [1, 2, 3, 4, 5, 6, 7, 8],
  behind: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  shirts: [0, 1, 2, 3, 4, 5, 6],
  pants: [0, 1, 2, 3],
} as const;

export const HAIR_COLORS = [
  { id: 11, color: '#000000' }, { id: 4, color: '#553A2C' },
  { id: 2, color: '#D9C092' }, { id: 3, color: '#F7DD7E' },
  { id: 17, color: '#1A4592' }, { id: 8, color: '#8F2F55' },
] as const;

function variant(value: SvgVariant | string | undefined, color: number): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[color] || value.default || value[1] || '';
}

export function meeAssetFor(
  kind: 'face' | 'eyes' | 'eyebrow' | 'mouth' | 'bang' | 'behind' | 'shirt' | 'pants',
  option: number,
  draft: MeeDraft,
): string {
  if (option === 0) return '';
  switch (kind) {
    case 'face': return variant(MEE_ASSETS.facial.face[option], draft.skinTone);
    case 'eyes': return variant(MEE_ASSETS.facial.eyes[option], draft.eyesColor);
    case 'eyebrow': return MEE_ASSETS.facial.eyebrow[option] || '';
    case 'mouth': return MEE_ASSETS.facial.mouth[option] || '';
    case 'bang': return variant(MEE_ASSETS.hair.bang[option], draft.hairColor);
    case 'behind': return variant(MEE_ASSETS.hair.behind[option], draft.hairColor);
    case 'shirt': return variant(MEE_ASSETS.outfit.shirt[draft.gender][option], draft.shirtColor);
    case 'pants': return variant(MEE_ASSETS.outfit.pants[draft.gender][option], draft.pantsColor);
  }
}
