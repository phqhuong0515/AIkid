/** Approximate skin palette for UI swatches (compose SVG later) */
export const SKIN_TONE_COLORS: Record<number, string> = {
  1: '#FFE0D1',
  2: '#F5C9A8',
  3: '#E8B48A',
  4: '#D4A574',
  5: '#C68642',
  6: '#A66B3A',
  7: '#8B5A2B',
  8: '#6F4E37',
  9: '#5C4033',
  10: '#3D2914',
};

export function skinToneLabel(n: number): string {
  if (n <= 2) return 'Sáng';
  if (n <= 4) return 'Vừa sáng';
  if (n <= 6) return 'Vừa';
  if (n <= 8) return 'Ngăm';
  return 'Đậm';
}
