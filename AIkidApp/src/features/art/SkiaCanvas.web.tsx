import React, { Suspense } from 'react';
import { Text } from 'react-native';
import type { CanvasRef } from '@shopify/react-native-skia';
import type { RefObject } from 'react';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import type { SkiaCanvasProps, DrawTool, DrawPath } from './SkiaCanvasTypes';

export type { SkiaCanvasProps, DrawTool, DrawPath };

export function SkiaCanvas(props: SkiaCanvasProps) {
  return (
    <Suspense fallback={<Text>Loading Skia...</Text>}>
      <WithSkiaWeb 
        getComponent={() => import('./SkiaCanvasNative')} 
        componentProps={props} 
        opts={{
          locateFile: (file: string) => {
            const base = process.env.EXPO_PUBLIC_WEB_BASE_URL?.replace(/\/$/, '') ?? '';
            return `${base}/${file}`;
          },
        }}
      />
    </Suspense>
  );
}

export function exportCanvasAsDataUrl(_ref: RefObject<CanvasRef | null>): string | null {
  try {
    const image = _ref.current?.makeImageSnapshot();
    if (!image) return null;
    return `data:image/png;base64,${image.encodeToBase64()}`;
  } catch {
    return null;
  }
}
