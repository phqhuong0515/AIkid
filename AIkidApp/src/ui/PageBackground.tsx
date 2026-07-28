/**
 * PageBackground — Per-screen background wrapper
 *
 * Wraps screen content in ImageBackground with the correct illustrated
 * background scene for each section of the app.
 *
 * Scenes (từ design guide backgrounds column):
 *   lobby      — Green hills / countryside (bg-home.png)
 *   art        — Clouds / sky (bg-art.png)
 *   character  — Indoor / cozy room (bg-character.png)
 *   mee        — Soft pastel (bg-mee.png)
 *   comic      — (tạm dùng bg-art.png — TODO: dedicated bg)
 *   login      — Login (bg-login.jpeg)
 *
 * Usage:
 *   <PageBackground scene="art">
 *     <GlobalHeader />
 *     ... screen content ...
 *   </PageBackground>
 */

import React from 'react';
import { ImageBackground, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AikidBgAssets } from '@/features/kids-ui/theme';

export type BgScene = 'lobby' | 'art' | 'character' | 'mee' | 'comic' | 'login';

const OVERLAY_OPACITY: Record<BgScene, number> = {
  lobby:     0.05,
  art:       0.05,
  character: 0.05,
  mee:       0.05,
  comic:     0.08,
  login:     0.10,
};

type PageBackgroundProps = {
  scene: BgScene;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Override overlay opacity (0-1) */
  overlayOpacity?: number;
};

export function PageBackground({
  scene,
  children,
  style,
  overlayOpacity,
}: PageBackgroundProps) {
  const src = AikidBgAssets[scene];
  const opacity = overlayOpacity ?? OVERLAY_OPACITY[scene];

  return (
    <ImageBackground
      source={src}
      style={[styles.root, style]}
      resizeMode="cover"
    >
      {/* Subtle white overlay to soften bg and keep text readable */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: `rgba(253,250,244,${opacity})` },
        ]}
        pointerEvents="none"
      />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
});
