import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { GestureResponderEvent } from 'react-native';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 700;
const COLORS = ['#111827', '#EF4444', '#F97316', '#22C55E', '#3B82F6', '#8B5CF6'];
const SIZES = [6, 14, 28] as const;

type Tool = 'pen' | 'eraser';
export type DrawingStroke = { id: string; d: string; color: string; width: number };

export type DrawingCanvasHandle = {
  exportPngDataUrl: () => Promise<string>;
  hasDrawing: () => boolean;
  hasActiveStroke: () => boolean;
};

export type DrawingCanvasProps = {
  disabled?: boolean;
  fullscreen?: boolean;
  initialStrokes?: DrawingStroke[];
  onClose?: () => void;
  onDone?: () => void;
  doneDisabled?: boolean;
  saving?: boolean;
  onDrawingChange?: (hasDrawing: boolean) => void;
  onInteractionChange?: (isDrawing: boolean) => void;
  onStrokesChange?: (strokes: DrawingStroke[]) => void;
};

function point(event: GestureResponderEvent, layout: { width: number; height: number }) {
  // Svg's default preserveAspectRatio="xMidYMid meet" letterboxes the
  // 1000×700 viewBox inside a wide fullscreen canvas. Pointer coordinates
  // must use that rendered content rectangle, not the full host View.
  const scale = Math.max(0.001, Math.min(layout.width / VIEWBOX_WIDTH, layout.height / VIEWBOX_HEIGHT));
  const renderedWidth = VIEWBOX_WIDTH * scale;
  const renderedHeight = VIEWBOX_HEIGHT * scale;
  const offsetX = (layout.width - renderedWidth) / 2;
  const offsetY = (layout.height - renderedHeight) / 2;
  const x = Math.max(0, Math.min(VIEWBOX_WIDTH, (event.nativeEvent.locationX - offsetX) / scale));
  const y = Math.max(0, Math.min(VIEWBOX_HEIGHT, (event.nativeEvent.locationY - offsetY) / scale));
  return { x: Math.round(x), y: Math.round(y) };
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas({ disabled = false, fullscreen = false, initialStrokes = [], onClose, onDone, doneDisabled = false, saving = false, onDrawingChange, onInteractionChange, onStrokesChange }, ref) {
    const svgRef = useRef<Svg>(null);
    const layoutRef = useRef({ width: 1, height: 1 });
    const renderFrameRef = useRef<number | null>(null);
    const [strokes, setStrokes] = useState<DrawingStroke[]>(initialStrokes);
    const strokesRef = useRef<DrawingStroke[]>(initialStrokes);
    const [active, setActive] = useState<DrawingStroke | null>(null);
    const activeRef = useRef<DrawingStroke | null>(null);
    const [tool, setTool] = useState<Tool>('pen');
    const [color, setColor] = useState(COLORS[0]);
    const [size, setSize] = useState<number>(SIZES[1]);
    const [notice, setNotice] = useState('Chạm và kéo để bắt đầu vẽ.');

    useEffect(() => () => {
      if (renderFrameRef.current != null) cancelAnimationFrame(renderFrameRef.current);
      renderFrameRef.current = null;
      activeRef.current = null;
      onInteractionChange?.(false);
    }, [onInteractionChange]);

    const applyStrokes = useCallback((next: DrawingStroke[]) => {
      strokesRef.current = next;
      setStrokes(next);
      onDrawingChange?.(next.length > 0);
      onStrokesChange?.(next);
    }, [onDrawingChange, onStrokesChange]);

    function start(event: GestureResponderEvent) {
      if (disabled) return;
      if (tool === 'eraser' && !strokesRef.current.length) {
        setNotice('Bảng đang trống, chưa có nét để tẩy.');
        return;
      }
      const p = point(event, layoutRef.current);
      const next = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        d: `M ${p.x} ${p.y} L ${p.x + 0.1} ${p.y + 0.1}`,
        color: tool === 'eraser' ? '#FFFFFF' : color,
        width: tool === 'eraser' ? size * 2 : size,
      };
      activeRef.current = next;
      setActive(next);
      onInteractionChange?.(true);
      setNotice(tool === 'eraser' ? 'Đang tẩy…' : 'Đang vẽ…');
    }

    function move(event: GestureResponderEvent) {
      if (!activeRef.current || disabled) return;
      const p = point(event, layoutRef.current);
      const next = { ...activeRef.current, d: `${activeRef.current.d} L ${p.x} ${p.y}` };
      activeRef.current = next;
      if (renderFrameRef.current == null) {
        renderFrameRef.current = requestAnimationFrame(() => {
          renderFrameRef.current = null;
          setActive(activeRef.current);
        });
      }
    }

    function finish() {
      const completed = activeRef.current;
      if (!completed) return;
      if (renderFrameRef.current != null) cancelAnimationFrame(renderFrameRef.current);
      renderFrameRef.current = null;
      applyStrokes([...strokesRef.current, completed].slice(-80));
      activeRef.current = null;
      setActive(null);
      onInteractionChange?.(false);
      setNotice('✓ Đã lưu nét vẽ');
    }

    function undo() {
      if (disabled || !strokesRef.current.length) return;
      applyStrokes(strokesRef.current.slice(0, -1));
      activeRef.current = null;
      setActive(null);
      setNotice('↶ Đã hoàn tác nét cuối');
    }

    function clear() {
      if (disabled || !strokesRef.current.length) return;
      Alert.alert('Xoá toàn bộ bảng vẽ?', 'Thao tác này sẽ xoá tất cả nét hiện tại.', [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Xoá', style: 'destructive', onPress: () => {
          applyStrokes([]);
          activeRef.current = null;
          setActive(null);
          setNotice('Đã xoá bảng vẽ');
        } },
      ]);
    }

    function cycleSize() {
      const index = SIZES.indexOf(size as (typeof SIZES)[number]);
      setSize(SIZES[(index + 1) % SIZES.length]);
      setNotice(`Cỡ nét: ${index === 0 ? 'vừa' : index === 1 ? 'lớn' : 'nhỏ'}`);
    }

    useImperativeHandle(ref, () => ({
      hasDrawing: () => strokesRef.current.length > 0,
      hasActiveStroke: () => activeRef.current != null,
      exportPngDataUrl: () => new Promise<string>((resolve, reject) => {
        if (!strokesRef.current.length) {
          reject(new Error('Bé chưa vẽ nét nào trên bảng.'));
          return;
        }
        const timer = setTimeout(() => reject(new Error('Xuất tranh vẽ quá lâu')), 15_000);
        svgRef.current?.toDataURL((base64) => {
          clearTimeout(timer);
          if (!base64) reject(new Error('Không xuất được tranh vẽ'));
          else resolve(`data:image/png;base64,${base64}`);
        }, { width: 1200, height: 840 });
      }),
    }), []);

    return (
      <View style={fullscreen ? { flex: 1 } : undefined}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          style={{ flexGrow: 0, marginBottom: fullscreen ? 4 : 10 }}
          contentContainerStyle={{ alignItems: 'center', gap: 5, minWidth: '100%' }}
        >
          {onClose ? <Pressable accessibilityRole="button" accessibilityLabel="Đóng bảng vẽ" accessibilityState={{ disabled }} disabled={disabled} onPress={onClose} className="h-9 items-center justify-center rounded-lg bg-slate-100 px-3 disabled:opacity-40">
            <Text className="font-extrabold text-slate-700">✕</Text>
          </Pressable> : null}
          <Pressable accessibilityRole="button" accessibilityLabel="Chọn bút vẽ" accessibilityState={{ selected: tool === 'pen', disabled }} disabled={disabled} onPress={() => setTool('pen')} className={`h-9 items-center justify-center rounded-lg px-3 ${tool === 'pen' ? 'bg-brand' : 'bg-orange-50'}`}>
            <Text className={`font-extrabold ${tool === 'pen' ? 'text-white' : 'text-orange-900'}`}>✏️</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Chọn tẩy" accessibilityState={{ selected: tool === 'eraser', disabled }} disabled={disabled} onPress={() => setTool('eraser')} className={`h-9 items-center justify-center rounded-lg px-3 ${tool === 'eraser' ? 'bg-brand' : 'bg-orange-50'}`}>
            <Text className={`font-extrabold ${tool === 'eraser' ? 'text-white' : 'text-orange-900'}`}>🧽</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Hoàn tác nét cuối" accessibilityState={{ disabled: disabled || !strokes.length }} disabled={disabled || !strokes.length} onPress={undo} className="h-9 items-center justify-center rounded-lg bg-slate-100 px-3 disabled:opacity-40">
            <Text className="font-bold text-slate-700">↶</Text>
          </Pressable>
          {COLORS.map((item) => (
            <Pressable
              accessibilityLabel={`Màu ${item}`}
              accessibilityRole="button"
              accessibilityState={{ selected: color === item && tool === 'pen', disabled: disabled || tool === 'eraser' }}
              key={item}
              disabled={disabled || tool === 'eraser'}
              onPress={() => { setColor(item); setTool('pen'); }}
              style={{ width: 29, height: 29, borderRadius: 15, backgroundColor: item, borderWidth: color === item && tool === 'pen' ? 3 : 1, borderColor: color === item && tool === 'pen' ? '#FB7185' : '#CBD5E1', opacity: tool === 'eraser' ? 0.45 : 1 }}
            />
          ))}
          <Pressable accessibilityRole="button" accessibilityLabel="Đổi cỡ nét" accessibilityHint="Chạm để chuyển nhỏ, vừa và lớn" accessibilityState={{ disabled }} disabled={disabled} onPress={cycleSize} className="h-9 min-w-11 items-center justify-center rounded-lg bg-slate-100 px-2 disabled:opacity-40">
            <View style={{ width: size === SIZES[0] ? 6 : size === SIZES[1] ? 11 : 16, height: size === SIZES[0] ? 6 : size === SIZES[1] ? 11 : 16, borderRadius: 10, backgroundColor: '#334155' }} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Xoá toàn bộ bảng vẽ" accessibilityState={{ disabled: disabled || !strokes.length }} disabled={disabled || !strokes.length} onPress={clear} className="h-9 items-center justify-center rounded-lg bg-red-50 px-3 disabled:opacity-40">
            <Text className="font-bold text-red-600">🗑</Text>
          </Pressable>
          <View style={{ flex: 1, minWidth: 4 }} />
          {onDone ? <Pressable accessibilityRole="button" accessibilityLabel="Xác nhận xong bảng vẽ" accessibilityState={{ disabled: disabled || doneDisabled }} disabled={disabled || doneDisabled} onPress={onDone} className="h-9 min-w-20 items-center justify-center rounded-lg bg-emerald-500 px-4 disabled:opacity-40">
            {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text className="font-extrabold text-white">✓ Xong</Text>}
          </Pressable> : null}
        </ScrollView>

        <View
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            layoutRef.current = { width, height };
          }}
          onStartShouldSetResponder={() => !disabled}
          onMoveShouldSetResponder={() => !disabled}
          onResponderGrant={start}
          onResponderMove={move}
          onResponderRelease={finish}
          onResponderTerminate={finish}
          onResponderTerminationRequest={() => false}
          accessibilityRole="image"
          accessibilityLabel="Bảng vẽ của bé"
          style={{ width: '100%', ...(fullscreen ? { flex: 1 } : { aspectRatio: VIEWBOX_WIDTH / VIEWBOX_HEIGHT }), borderRadius: fullscreen ? 14 : 20, overflow: 'hidden', borderWidth: 2, borderColor: '#FED7AA', backgroundColor: '#FFFFFF', touchAction: 'none', userSelect: 'none' }}
        >
          <Svg
            ref={svgRef}
            pointerEvents="none"
            width="100%"
            height="100%"
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          >
            <Rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="#FFFFFF" />
            {strokes.map((stroke) => <Path key={stroke.id} d={stroke.d} fill="none" stroke={stroke.color} strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" />)}
            {active ? <Path d={active.d} fill="none" stroke={active.color} strokeWidth={active.width} strokeLinecap="round" strokeLinejoin="round" /> : null}
          </Svg>
          {!strokes.length && !active ? (
            <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
              <Text className="text-4xl">🎨</Text>
              <Text className="mt-2 font-bold text-slate-300">Vẽ điều bé tưởng tượng ở đây</Text>
            </View>
          ) : null}
          {notice !== 'Chạm và kéo để bắt đầu vẽ.' ? (
            <View pointerEvents="none" className="absolute bottom-2 self-center rounded-full bg-slate-900/70 px-3 py-1">
              <Text className="text-center text-xs font-bold text-white">{notice}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  },
);
