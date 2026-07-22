import { Pressable, ScrollView, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { meeAssetFor } from './assets';
import { buildMeeAssetSvg } from './composer';
import type { MeeDraft } from './types';

export function MeeAssetPreview({ draft }: { draft: MeeDraft }) {
  return <View className="h-[430px] w-full overflow-hidden rounded-[28px] border border-orange-100" style={{ backgroundColor: draft.backgroundColor }}>
    <SvgXml xml={buildMeeAssetSvg(draft)} width="100%" height="100%" />
  </View>;
}

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
        return <Pressable key={`${kind}-${option}`} onPress={() => onChange(option)} className="h-[82px] w-[82px] items-center justify-center overflow-hidden rounded-2xl bg-orange-50" style={{ borderWidth: selected ? 3 : 1, borderColor: selected ? '#FB7185' : '#FED7AA' }}>
          {option === 0 ? <Text className="text-xs font-bold text-slate-400">Không</Text> : <SvgXml xml={xml} width="68" height="62" />}
        </Pressable>;
      })}
    </ScrollView>
  </View>;
}
