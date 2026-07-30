import type { CanvasRef, Skia } from '@shopify/react-native-skia';
import type { RefObject } from 'react';
import type { ViewStyle } from 'react-native';

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
  canvasRef: RefObject<CanvasRef | null>;
  onPathAdded?: () => void;
  backgroundDataUrl?: string | null;
  style?: ViewStyle;
  paths: DrawPath[];
  setPaths: React.Dispatch<React.SetStateAction<DrawPath[]>>;
};
