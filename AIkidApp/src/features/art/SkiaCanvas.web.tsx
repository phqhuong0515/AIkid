import React, { Suspense } from 'react';
import { Text } from 'react-native';
import { useCanvasRef } from '@shopify/react-native-skia';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import type { SkiaCanvasProps, DrawTool, DrawPath } from './SkiaCanvasTypes';

export type { SkiaCanvasProps, DrawTool, DrawPath };

export function SkiaCanvas(props: SkiaCanvasProps) {
  return (
    <Suspense fallback={<Text>Loading Skia...</Text>}>
      <WithSkiaWeb 
        getComponent={() => import('./SkiaCanvasNative')} 
        componentProps={props} 
        opts={{ locateFile: (file: string) => `/${file}` }}
      />
    </Suspense>
  );
}

export function exportCanvasAsDataUrl(ref: ReturnType<typeof useCanvasRef>): string | null {
  return null;
}
