import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type AikidIconName =
  | 'brush'
  | 'pencil'
  | 'eraser'
  | 'stamp'
  | 'upload'
  | 'camera'
  | 'trash'
  | 'undo'
  | 'redo'
  | 'palette'
  | 'refresh'
  | 'download'
  | 'wand'
  | 'close'
  | 'info'
  | 'grid'
  | 'save'
  | 'image'
  | 'person'
  | 'arrow-right'
  | 'arrow-left';

type Props = {
  name: AikidIconName;
  size?: number;
  color?: string;
};

export function AikidIcon({ name, size = 20, color = '#334155' }: Props) {
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'brush' ? (
        <>
          <Path {...common} d="M14.7 4.3 19.7 9.3 9.2 19.8c-1.4 1.4-4.1 1.6-5.7.7 1.2-.5 1.7-1.5 1.7-2.8 0-1 .4-1.9 1.1-2.6L14.7 4.3Z" />
          <Path {...common} d="m13.3 5.7 5 5" />
        </>
      ) : name === 'pencil' ? (
        <>
          <Path {...common} d="m4 20 4.2-1 10.9-10.9a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
          <Path {...common} d="m14.8 6.4 3 3M5.2 16l2.8 2.8" />
        </>
      ) : name === 'eraser' ? (
        <>
          <Path {...common} d="m7.1 18.9-3-3a2 2 0 0 1 0-2.8l8.7-8.7a2 2 0 0 1 2.8 0l4 4a2 2 0 0 1 0 2.8L12 18.9H7.1Z" />
          <Path {...common} d="m10 7.2 6.8 6.8M7.1 18.9H21" />
        </>
      ) : name === 'stamp' ? (
        <>
          <Path {...common} d="M8 14h8l2 3v2H6v-2l2-3Z" />
          <Path {...common} d="M10 14v-3.2a4 4 0 1 1 4 0V14M5 21h14" />
        </>
      ) : name === 'upload' ? (
        <>
          <Path {...common} d="M12 16V4m0 0L8 8m4-4 4 4" />
          <Path {...common} d="M5 14v5h14v-5" />
        </>
      ) : name === 'camera' ? (
        <>
          <Path {...common} d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z" />
          <Circle {...common} cx="12" cy="13" r="3.5" />
        </>
      ) : name === 'trash' ? (
        <>
          <Path {...common} d="M5 7h14M9 7V4h6v3m2 0-1 14H8L7 7m3 4v6m4-6v6" />
        </>
      ) : name === 'undo' || name === 'redo' ? (
        <Path
          {...common}
          d={name === 'undo' ? 'M9 7 4 12l5 5M5 12h8a6 6 0 0 1 6 6' : 'm15 7 5 5-5 5m4-5h-8a6 6 0 0 0-6 6'}
        />
      ) : name === 'palette' ? (
        <>
          <Path {...common} d="M12 3a9 9 0 1 0 0 18h1.3a1.7 1.7 0 0 0 0-3.4H12a2 2 0 0 1 0-4h4.5A4.5 4.5 0 0 0 21 9.1C21 5.7 17 3 12 3Z" />
          <Circle cx="7.5" cy="9" r="1" fill={color} />
          <Circle cx="10.5" cy="6.5" r="1" fill={color} />
          <Circle cx="15" cy="7" r="1" fill={color} />
        </>
      ) : name === 'refresh' ? (
        <>
          <Path {...common} d="M20 7v5h-5M4 17v-5h5" />
          <Path {...common} d="M18.2 10A7 7 0 0 0 6.5 6.5L4 9m2 5a7 7 0 0 0 11.5 3.5L20 15" />
        </>
      ) : name === 'download' ? (
        <>
          <Path {...common} d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" />
        </>
      ) : name === 'info' ? (
        <>
          <Circle {...common} cx="12" cy="12" r="9" />
          <Path {...common} d="M12 11v6M12 7h.01" />
        </>
      ) : name === 'grid' ? (
        <>
          <Rect {...common} x="4" y="4" width="6" height="6" rx="1" />
          <Rect {...common} x="14" y="4" width="6" height="6" rx="1" />
          <Rect {...common} x="4" y="14" width="6" height="6" rx="1" />
          <Rect {...common} x="14" y="14" width="6" height="6" rx="1" />
        </>
      ) : name === 'save' ? (
        <>
          <Path {...common} d="M5 4h12l2 2v14H5V4Z" />
          <Path {...common} d="M8 4v6h8V4M8 20v-6h8v6" />
        </>
      ) : name === 'image' ? (
        <>
          <Rect {...common} x="3" y="5" width="18" height="14" rx="2" />
          <Circle {...common} cx="9" cy="10" r="1.5" />
          <Path {...common} d="m4 17 5-4 3 2 3-3 5 5" />
        </>
      ) : name === 'person' ? (
        <>
          <Circle {...common} cx="12" cy="8" r="4" />
          <Path {...common} d="M5 21a7 7 0 0 1 14 0" />
        </>
      ) : name === 'close' ? (
        <Path {...common} d="M6 6l12 12M18 6 6 18" />
      ) : name === 'arrow-right' ? (
        <Path {...common} d="m10 6 6 6-6 6M5 12h11" />
      ) : name === 'arrow-left' ? (
        <Path {...common} d="m14 6-6 6 6 6M8 12h11" />
      ) : (
        <>
          <Path {...common} d="m4 20 10.5-10.5M12 5l1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1ZM17 12l.8-1.7.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8Z" />
          <Rect x="3.5" y="17" width="5" height="3" rx="1" transform="rotate(-45 3.5 17)" fill={color} />
        </>
      )}
    </Svg>
  );
}
