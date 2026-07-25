import React, { Suspense } from 'react';
import { Platform, ViewStyle, Text } from 'react-native';
import { Skia, useCanvasRef } from '@shopify/react-native-skia';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

export type DrawTool = 'brush' | 'pencil' | 'eraser' | 'stamp';

export type DrawPath = {
  path: ReturnType<typeof Skia.Path.Make>;
  color: string;
  strokeWidth: number;
  tool: DrawTool;
  opacity: number;
  stamp?: string;
  x?: number;
  y?: number;
};

export type SkiaCanvasProps = {
  tool: DrawTool;
  color: string;
  strokeWidth: number;
  activeStamp: string;
  canvasRef: ReturnType<typeof useCanvasRef>;
  onPathAdded?: () => void;
  backgroundDataUrl?: string | null;
  style?: ViewStyle;
  paths: DrawPath[];
  setPaths: React.Dispatch<React.SetStateAction<DrawPath[]>>;
};

let SkiaCanvasNativeComp: any = null;
if (Platform.OS !== 'web') {
  SkiaCanvasNativeComp = require('./SkiaCanvasNative').default;
}

export function SkiaCanvas(props: SkiaCanvasProps) {
  if (Platform.OS === 'web') {
    return (
      <Suspense fallback={<Text>Loading Skia...</Text>}>
        <WithSkiaWeb 
          getComponent={() => import('./SkiaCanvasNative')} 
          componentProps={props} 
          opts={{ locateFile: (file) => `/${file}` }}
        />
      </Suspense>
    );
  }
  return <SkiaCanvasNativeComp {...props} />;
}

export function exportCanvasAsDataUrl(ref: ReturnType<typeof useCanvasRef>): string | null {
  if (Platform.OS === 'web') return null;
  try {
    const image = ref.current?.makeImageSnapshot();
    if (!image) return null;
    return `data:image/png;base64,${image.encodeToBase64()}`;
  } catch {
    return null;
  }
}
