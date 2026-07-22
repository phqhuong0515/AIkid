export type MeeGender = 'male' | 'female';

/** Offline draft — compose pipeline later (PR-07) */
export type MeeDraft = {
  schemaVersion: 1;
  gender: MeeGender;
  skinTone: number;
  face: number;
  eyes: number;
  eyesColor: number;
  eyebrows: number;
  eyebrowsColorIndex: number;
  syncEyebrowsColor: boolean;
  nose: number;
  mouth: number;
  bang: number;
  behind: number;
  hairColor: number;
  customPrimaryColor: string | null;
  customShadowColor: string | null;
  shirt: number;
  pants: number;
  dress: number;
  shirtColor: number;
  pantsColor: number;
  backgroundColor: string;
  backgroundType: 'light' | 'dark' | 'grid' | 'gingham' | 'upload';
  backgroundImageUrl?: string;
  savedMediaUrl?: string;
  aiResultUrl?: string;
  packVersion: string;
};

export function createDefaultMeeDraft(): MeeDraft {
  return {
    schemaVersion: 1,
    gender: 'male',
    skinTone: 1,
    face: 1,
    eyes: 1,
    eyesColor: 1,
    eyebrows: 1,
    eyebrowsColorIndex: 1,
    syncEyebrowsColor: true,
    nose: 1,
    mouth: 1,
    bang: 1,
    behind: 1,
    hairColor: 11,
    customPrimaryColor: null,
    customShadowColor: null,
    shirt: 0,
    pants: 0,
    dress: 0,
    shirtColor: 2,
    pantsColor: 3,
    backgroundColor: '#ffffff',
    backgroundType: 'light',
    packVersion: 'dev-fixture',
  };
}
