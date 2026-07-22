import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { parse, SvgXml } from 'react-native-svg';

import { meeAssetFor } from './assets';
import { buildMeeAssetSvg } from './composer';
import type { MeeDraft } from './types';

export type MeeAssetPreviewHandle = { toPngDataUrl: () => Promise<string> };

export const MeeAssetPreview = forwardRef<MeeAssetPreviewHandle, { draft: MeeDraft; compact?: boolean }>(function MeeAssetPreview({ draft, compact = false }, ref) {
  const svgRef = useRef<Svg>(null);
  const ast = useMemo(() => parse(buildMeeAssetSvg(draft)), [draft]);
  useImperativeHandle(ref, () => ({
    toPngDataUrl: () => new Promise((resolve, reject) => {
      if (!svgRef.current) return reject(new Error('Bản xem trước Mee chưa sẵn sàng'));
      svgRef.current.toDataURL((base64) => {
        if (!base64) return reject(new Error('Không rasterize được Mee sang PNG'));
        resolve(base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`);
      }, { width: 768, height: 768 });
    }),
  }), []);
  return <View className={`w-full overflow-hidden rounded-[28px] border border-orange-100 ${compact ? 'h-[290px]' : 'h-[500px]'}`} style={{ backgroundColor: draft.backgroundColor }}>
    {ast ? <Svg ref={svgRef} {...ast.props} width="100%" height="100%">{ast.children}</Svg> : null}
  </View>;
});

type AssetPickerProps = {
  title: string;
  kind: Parameters<typeof meeAssetFor>[0];
  options: readonly number[];
  value: number;
  draft: MeeDraft;
  onChange: (value: number) => void;
};

export function MeeAssetPicker({ title, kind, options, value, draft, onChange }: AssetPickerProps) {
  return <View className="mb-4">
    <Text className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">{title}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 12 }}>
      {options.map((option) => {
        const xml = meeAssetFor(kind, option, draft);
        const selected = option === value;
        return <Pressable accessibilityRole="button" accessibilityLabel={`${title} ${option === 0 ? 'không dùng' : option}`} accessibilityState={{ selected }} key={`${kind}-${option}`} onPress={() => onChange(option)} className="h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl bg-orange-50" style={{ borderWidth: selected ? 3 : 1, borderColor: selected ? '#FB7185' : '#FED7AA' }}>
          {option === 0 ? <Text className="text-xs font-bold text-slate-400">Không</Text> : <SvgXml xml={xml} width="60" height="54" />}
        </Pressable>;
      })}
    </ScrollView>
  </View>;
}
