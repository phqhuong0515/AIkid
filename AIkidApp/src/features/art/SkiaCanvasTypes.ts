import type { Skia, useCanvasRef } from '@shopify/react-native-skia';
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
  canvasRef: ReturnType<typeof useCanvasRef>;
  onPathAdded?: () => void;
  backgroundDataUrl?: string | null;
  style?: ViewStyle;
  paths: DrawPath[];
  setPaths: React.Dispatch<React.SetStateAction<DrawPath[]>>;
};
