import type { ImageSourcePropType, ViewStyle } from 'react-native';

export type AikidScene =
  | 'lobby'
  | 'art'
  | 'character'
  | 'mee'
  | 'comic'
  | 'login';

export type AikidButtonVariant =
  | 'nav'
  | 'cta'
  | 'feature'
  | 'encourage'
  | 'discourage'
  | 'delete'
  | 'icon';

export type AikidTemplate = {
  id: string;
  name: string;
  colors: {
    text: {
      heading: string;
      title: string;
      body: string;
      placeholder: string;
      white: string;
      brand: string;
    };
    frame: {
      bgLight: string;
      paper: string;
      white: string;
    };
    brand: {
      pink: string;
      pinkLight: string;
      pinkMed: string;
      coral: string;
      green: string;
      greenLight: string;
      blueGray: string;
      blueGrayLight: string;
      red: string;
      redLight: string;
    };
  };
  fonts: {
    headingBold: string;
    headingSemi: string;
    headingMed: string;
    headingReg: string;
    bodyReg: string;
    bodyMed: string;
    bodySemi: string;
    bodyBold: string;
  };
  gradients: Record<AikidButtonVariant, readonly [string, string]>;
  radius: {
    pill: number;
    cardXl: number;
    cardLg: number;
    card: number;
    input: number;
    btn: number;
    sm: number;
    xs: number;
  };
  spacing: Record<'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl', number>;
  shadows: Record<'soft' | 'card' | 'raised' | 'modal', ViewStyle>;
  assets: Record<AikidScene, ImageSourcePropType>;
};
