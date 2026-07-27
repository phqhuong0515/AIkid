import React from 'react';
import SkiaCanvasNativeComp from './SkiaCanvasNative';
import { useCanvasRef } from '@shopify/react-native-skia';
import type { SkiaCanvasProps, DrawTool, DrawPath } from './SkiaCanvasTypes';

export type { SkiaCanvasProps, DrawTool, DrawPath };

export function SkiaCanvas(props: SkiaCanvasProps) {
  return <SkiaCanvasNativeComp {...props} />;
}

export function exportCanvasAsDataUrl(ref: ReturnType<typeof useCanvasRef>): string | null {
  try {
    const image = ref.current?.makeImageSnapshot();
    if (!image) return null;
    return `data:image/png;base64,${image.encodeToBase64()}`;
  } catch {
    return null;
  }
}
