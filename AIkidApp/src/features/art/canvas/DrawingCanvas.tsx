import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 700;
const COLORS = ['#111827', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'];
const SIZES = [6, 14, 28] as const;

type Tool = 'pen' | 'eraser';
type Stroke = { id: string; d: string; color: string; width: number };

export type DrawingCanvasHandle = {
  exportPngDataUrl: () => Promise<string>;
  hasDrawing: () => boolean;
};

export type DrawingCanvasProps = {
  disabled?: boolean;
  onDrawingChange?: (hasDrawing: boolean) => void;
  onInteractionChange?: (isDrawing: boolean) => void;
};

function point(event: GestureResponderEvent, layout: { width: number; height: number }) {
  const x = Math.max(0, Math.min(VIEWBOX_WIDTH, event.nativeEvent.locationX * VIEWBOX_WIDTH / Math.max(1, layout.width)));
  const y = Math.max(0, Math.min(VIEWBOX_HEIGHT, event.nativeEvent.locationY * VIEWBOX_HEIGHT / Math.max(1, layout.height)));
  return { x: Math.round(x), y: Math.round(y) };
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas({ disabled = false, onDrawingChange, onInteractionChange }, ref) {
    const svgRef = useRef<Svg>(null);
    const [layout, setLayout] = useState({ width: 1, height: 1 });
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const strokesRef = useRef<Stroke[]>([]);
    const [active, setActive] = useState<Stroke | null>(null);
    const activeRef = useRef<Stroke | null>(null);
    const [tool, setTool] = useState<Tool>('pen');
    const [color, setColor] = useState(COLORS[0]);
    const [size, setSize] = useState<number>(SIZES[1]);
    const [notice, setNotice] = useState('Chạm và kéo để bắt đầu vẽ.');

    const applyStrokes = useCallback((next: Stroke[]) => {
      strokesRef.current = next;
      setStrokes(next);
      onDrawingChange?.(next.length > 0);
    }, [onDrawingChange]);

    function start(event: GestureResponderEvent) {
      if (disabled) return;
      if (tool === 'eraser' && !strokesRef.current.length) {
        setNotice('Bảng đang trống, chưa có nét để tẩy.');
        return;
      }
      const p = point(event, layout);
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
      const p = point(event, layout);
      const next = { ...activeRef.current, d: `${activeRef.current.d} L ${p.x} ${p.y}` };
      activeRef.current = next;
      setActive(next);
    }

    function finish() {
      const completed = activeRef.current;
      if (!completed) return;
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
      applyStrokes([]);
      activeRef.current = null;
      setActive(null);
      setNotice('Đã xoá bảng vẽ');
    }

    useImperativeHandle(ref, () => ({
      hasDrawing: () => strokesRef.current.length > 0,
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
      <View>
        <View className="mb-3 flex-row flex-wrap items-center" style={{ gap: 8 }}>
          <Pressable disabled={disabled} onPress={() => setTool('pen')} className={`rounded-xl px-3 py-2 ${tool === 'pen' ? 'bg-brand' : 'bg-orange-50'}`}>
            <Text className={`font-extrabold ${tool === 'pen' ? 'text-white' : 'text-orange-900'}`}>✏️ Bút</Text>
          </Pressable>
          <Pressable disabled={disabled} onPress={() => setTool('eraser')} className={`rounded-xl px-3 py-2 ${tool === 'eraser' ? 'bg-brand' : 'bg-orange-50'}`}>
            <Text className={`font-extrabold ${tool === 'eraser' ? 'text-white' : 'text-orange-900'}`}>🧽 Tẩy</Text>
          </Pressable>
          <Pressable disabled={disabled || !strokes.length} onPress={undo} className="rounded-xl bg-slate-100 px-3 py-2 disabled:opacity-40">
            <Text className="font-bold text-slate-700">↶ Hoàn tác</Text>
          </Pressable>
          <Pressable disabled={disabled || !strokes.length} onPress={clear} className="rounded-xl bg-red-50 px-3 py-2 disabled:opacity-40">
            <Text className="font-bold text-red-600">🗑 Xoá</Text>
          </Pressable>
        </View>

        <View className="mb-3 flex-row flex-wrap items-center" style={{ gap: 9 }}>
          {COLORS.map((item) => (
            <Pressable
              accessibilityLabel={`Màu ${item}`}
              key={item}
              disabled={disabled || tool === 'eraser'}
              onPress={() => { setColor(item); setTool('pen'); }}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: item, borderWidth: color === item && tool === 'pen' ? 4 : 1, borderColor: color === item && tool === 'pen' ? '#FB7185' : '#CBD5E1', opacity: tool === 'eraser' ? 0.45 : 1 }}
            />
          ))}
          <View className="ml-1 flex-row rounded-xl bg-slate-100 p-1" style={{ gap: 3 }}>
            {SIZES.map((item, index) => (
              <Pressable key={item} disabled={disabled} onPress={() => setSize(item)} className={`h-9 w-10 items-center justify-center rounded-lg ${size === item ? 'bg-white' : ''}`}>
                <View style={{ width: 5 + index * 5, height: 5 + index * 5, borderRadius: 10, backgroundColor: '#334155' }} />
              </Pressable>
            ))}
          </View>
        </View>

        <View
          onLayout={(event) => setLayout(event.nativeEvent.layout)}
          onStartShouldSetResponder={() => !disabled}
          onMoveShouldSetResponder={() => !disabled}
          onResponderGrant={start}
          onResponderMove={move}
          onResponderRelease={finish}
          onResponderTerminate={finish}
          onResponderTerminationRequest={() => false}
          style={{ width: '100%', aspectRatio: VIEWBOX_WIDTH / VIEWBOX_HEIGHT, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#FED7AA', backgroundColor: '#FFFFFF', touchAction: 'none', userSelect: 'none' }}
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
        </View>
        <Text className={`mt-2 text-center text-xs font-bold ${notice.startsWith('✓') ? 'text-emerald-600' : 'text-slate-500'}`}>{notice}</Text>
      </View>
    );
  },
);
