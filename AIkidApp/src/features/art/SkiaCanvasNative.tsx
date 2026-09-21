import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, type LayoutChangeEvent } from 'react-native';
import {
  Canvas,
  Path,
  Rect,
  Skia,
  Image,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import type { SkiaCanvasProps, DrawTool } from './SkiaCanvasTypes';

export default function SkiaCanvasNative({
  tool,
  color,
  strokeWidth,
  activeStamp,
  canvasRef,
  onPathAdded,
  backgroundDataUrl,
  style,
  paths,
  setPaths,
}: SkiaCanvasProps) {
  const [canvasSize, setCanvasSize] = React.useState({ width: 1, height: 1 });
  const currentPath = useSharedValue<ReturnType<typeof Skia.Path.Make>>(Skia.Path.Make());
  const currentPathColor = useSharedValue<string>('#000000');
  const currentPathWidth = useSharedValue<number>(5);
  const currentPathOpacity = useSharedValue<number>(1);
  const currentPathTool = useSharedValue<DrawTool>('brush');

  // Decode picked images directly. CanvasKit on mobile browsers can fail to
  // resolve data/blob URLs through useImage even though the picker succeeded.
  const bgImage = useMemo(() => {
    if (!backgroundDataUrl?.startsWith('data:')) return null;
    const base64 = backgroundDataUrl.split(',', 2)[1];
    if (!base64) return null;
    try {
      return Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(base64));
    } catch {
      return null;
    }
  }, [backgroundDataUrl]);

  const commitPath = useCallback((p: ReturnType<typeof Skia.Path.Make>, c: string, w: number, t: DrawTool, op: number) => {
    setPaths((prev) => [...prev, { path: p, color: c, strokeWidth: w, tool: t, opacity: op }]);
    if (onPathAdded) onPathAdded();
  }, [setPaths, onPathAdded]);

  const commitStamp = useCallback((x: number, y: number, stamp: string) => {
    setPaths((prev) => [
      ...prev,
      { path: Skia.Path.Make(), color: 'transparent', strokeWidth: 0, tool: 'stamp' as DrawTool, opacity: 1, stamp, x, y },
    ]);
    if (onPathAdded) onPathAdded();
  }, [setPaths, onPathAdded]);

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      'worklet';
      if (tool === 'stamp') {
        runOnJS(commitStamp)(e.x, e.y, activeStamp);
        return;
      }
      const p = Skia.Path.Make();
      p.moveTo(e.x, e.y);
      currentPath.value = p;
      
      let finalWidth = strokeWidth;
      let finalOpacity = 1;
      let finalColor = color;
      if (tool === 'brush') {
        finalWidth = strokeWidth * 1.0;
        finalOpacity = 0.95;
      } else if (tool === 'pencil') {
        finalWidth = strokeWidth * 0.7;
        finalOpacity = 0.85;
      } else if (tool === 'eraser') {
        finalWidth = strokeWidth * 2.5;
        finalColor = '#FDFAF4';
      }
      
      currentPathColor.value = finalColor;
      currentPathWidth.value = finalWidth;
      currentPathOpacity.value = finalOpacity;
      currentPathTool.value = tool;
    })
    .onUpdate((e) => {
      'worklet';
      if (tool === 'stamp') return;
      currentPath.value.lineTo(e.x, e.y);
      currentPath.value = currentPath.value.copy();
    })
    .onEnd(() => {
      'worklet';
      if (tool !== 'stamp') {
        runOnJS(commitPath)(currentPath.value.copy(), currentPathColor.value, currentPathWidth.value, currentPathTool.value, currentPathOpacity.value);
      }
      currentPath.value = Skia.Path.Make();
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    if (tool === 'stamp') {
      runOnJS(commitStamp)(e.x, e.y, activeStamp);
    }
  });

  const composed = Gesture.Race(panGesture, tapGesture);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasSize({ width: Math.max(1, width), height: Math.max(1, height) });
  }, []);

  return (
    <View style={[styles.container, style]}>
      <GestureDetector gesture={composed}>
        <View style={styles.canvasWrapper} onLayout={handleLayout}>
          <Canvas ref={canvasRef} style={styles.canvas}>
            {/* Keep snapshots opaque. A transparent Skia surface is decoded as
                black by some provider upload pipelines. */}
            <Rect x={0} y={0} width={canvasSize.width} height={canvasSize.height} color="#FDFAF4" />
            {bgImage && (
              <Image
                image={bgImage}
                fit="contain"
                x={0}
                y={0}
                width={canvasSize.width}
                height={canvasSize.height}
              />
            )}
            {paths.map((p, i) => {
              if (p.tool === 'stamp' && p.stamp) {
                // Skia Text with emoji is tricky on some platforms, but we'll try to use RN Text overlay or draw it if possible.
                // For simplicity as a React Native fallback, we might just overlay them as Views over the canvas.
                return null; // Handle stamps in a RN layer
              }
              return (
                <Path
                  key={i}
                  path={p.path}
                  color={p.color}
                  style="stroke"
                  strokeWidth={p.strokeWidth}
                  strokeCap={p.tool === 'eraser' ? 'square' : 'round'}
                  strokeJoin="round"
                  opacity={p.opacity}
                />
              );
            })}
            <Path
              path={currentPath}
              color={currentPathColor}
              style="stroke"
              strokeWidth={currentPathWidth}
              strokeCap="round"
              strokeJoin="round"
              opacity={currentPathOpacity}
            />
          </Canvas>
          {/* Stamps Layer (Overlay) */}
          {paths.filter(p => p.tool === 'stamp').map((p, i) => (
            <Text key={`stamp-${i}`} style={{
              position: 'absolute',
              left: (p.x || 0) - 20,
              top: (p.y || 0) - 20,
              fontSize: 40,
            }}>
              {p.stamp}
            </Text>
          ))}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFAF4',
    overflow: 'hidden',
  },
  canvasWrapper: {
    flex: 1,
    position: 'relative',
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
