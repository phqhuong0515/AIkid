import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

export function SectionCard({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return <View className="mb-4 rounded-[24px] border border-orange-100 bg-white p-4" style={{ shadowColor: '#FB923C', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } }}>
    <Text className="text-[16px] font-extrabold text-slate-900">{title}</Text>
    {hint ? <Text className="mt-1 text-[12px] leading-5 text-slate-500">{hint}</Text> : null}
    <View className="mt-3">{children}</View>
  </View>;
}

export function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} className={`mr-2 mb-2 rounded-full px-4 py-2 ${selected ? 'bg-brand' : 'border border-orange-100 bg-orange-50'}`}>
    <Text className={`text-[13px] font-bold ${selected ? 'text-white' : 'text-orange-900'}`}>{label}</Text>
  </Pressable>;
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} className={`h-13 items-center justify-center rounded-2xl bg-brand px-4 ${disabled ? 'opacity-60' : ''}`}>
    <Text className="text-[15px] font-extrabold text-white">{label}</Text>
  </Pressable>;
}
