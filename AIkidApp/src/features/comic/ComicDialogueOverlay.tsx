import { StyleSheet, View } from 'react-native';
import Svg, { G, Path, Rect, Text as SvgText, TSpan } from 'react-native-svg';

export type BubbleCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type ComicBubble = {
  panelId: string;
  panelIndex: number;
  text: string;
  corner: BubbleCorner;
  /** Normalized page coordinates (0–1000), ready for the future drag editor. */
  x?: number;
  y?: number;
  /** Tail tip is stored separately so it can point at a character independently. */
  tailX?: number;
  tailY?: number;
};

/** Kept off until free-drag placement has completed product review. */
export const COMIC_BUBBLE_EDITOR_ENABLED = false;

const clampPageCoordinate = (value: number) => Math.max(0, Math.min(1000, value));

/** Coordinate update used by the future body-drag gesture. */
export function moveComicBubble(bubble: ComicBubble, x: number, y: number): ComicBubble {
  return { ...bubble, x: clampPageCoordinate(x), y: clampPageCoordinate(y) };
}

/** Independent coordinate update used by the future tail-tip drag gesture. */
export function pointComicBubbleTail(bubble: ComicBubble, tailX: number, tailY: number): ComicBubble {
  return {
    ...bubble,
    tailX: clampPageCoordinate(tailX),
    tailY: clampPageCoordinate(tailY),
  };
}

function panelBounds(count: number, index: number) {
  const columns = count === 2 ? 2 : 2;
  const rows = count === 2 ? 1 : count === 4 ? 2 : 3;
  const width = 1000 / columns;
  const height = 1000 / rows;
  return {
    x: (index % columns) * width,
    y: Math.floor(index / columns) * height,
    width,
    height,
  };
}

function wrapText(text: string, maxChars: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

export function ComicDialogueOverlay({
  bubbles,
  panelCount,
}: {
  bubbles: ComicBubble[];
  panelCount: number;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 1000 1000">
        {bubbles.filter((bubble) => bubble.text.trim()).map((bubble) => {
          const bounds = panelBounds(panelCount, bubble.panelIndex);
          const fontSize = panelCount === 6 ? 23 : panelCount === 4 ? 27 : 31;
          const bubbleWidth = bounds.width * 0.72;
          const maxChars = panelCount === 6 ? 22 : panelCount === 4 ? 25 : 30;
          const lines = wrapText(bubble.text, maxChars);
          const lineHeight = fontSize * 1.22;
          const bubbleHeight = Math.max(76, 30 + lines.length * lineHeight);
          const right = bubble.corner.endsWith('right');
          const bottom = bubble.corner.startsWith('bottom');
          const defaultX = right ? bounds.x + bounds.width - bubbleWidth - 28 : bounds.x + 28;
          const defaultY = bottom ? bounds.y + bounds.height - bubbleHeight - 28 : bounds.y + 28;
          const x = bubble.x ?? defaultX;
          const y = bubble.y ?? defaultY;
          const tailStartX = right ? x + bubbleWidth * 0.28 : x + bubbleWidth * 0.72;
          const tailStartY = bottom ? y : y + bubbleHeight;
          const tailTipX = bubble.tailX ?? (right ? bounds.x + bounds.width * 0.32 : bounds.x + bounds.width * 0.68);
          const tailTipY = bubble.tailY ?? (bottom ? y - 42 : y + bubbleHeight + 42);
          const tailPath = bottom
            ? `M ${tailStartX - 16} ${tailStartY + 2} L ${tailTipX} ${tailTipY} L ${tailStartX + 20} ${tailStartY + 2} Z`
            : `M ${tailStartX - 16} ${tailStartY - 2} L ${tailTipX} ${tailTipY} L ${tailStartX + 20} ${tailStartY - 2} Z`;
          return (
            <G key={bubble.panelId}>
              <Path d={tailPath} fill="#FFFFFF" stroke="#4B4250" strokeWidth={5} strokeLinejoin="round" />
              <Rect x={x} y={y} width={bubbleWidth} height={bubbleHeight} rx={bubbleHeight / 2} fill="#FFFFFF" stroke="#4B4250" strokeWidth={5} />
              <SvgText
                x={x + bubbleWidth / 2}
                y={y + 24 + fontSize}
                fill="#3F3743"
                fontSize={fontSize}
                fontWeight="700"
                textAnchor="middle"
              >
                {lines.map((line, index) => (
                  <TSpan key={`${bubble.panelId}-${index}`} x={x + bubbleWidth / 2} dy={index === 0 ? 0 : lineHeight}>
                    {line}
                  </TSpan>
                ))}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
