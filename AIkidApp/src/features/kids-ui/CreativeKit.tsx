import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';

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
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} className={`items-center justify-center rounded-2xl bg-brand px-4 ${disabled ? 'opacity-60' : ''}`} style={{ minHeight: 54 }}>
    <Text className="text-[15px] font-extrabold text-white">{label}</Text>
  </Pressable>;
}

export type PromptField = {
  key: string;
  label: string;
  value: string;
  options: readonly string[];
  placeholder?: string;
  onChange: (value: string) => void;
  tone?: 'sky' | 'violet' | 'amber' | 'rose' | 'emerald';
};

const TOKEN_TONES = {
  sky: 'border-sky-200 bg-sky-50 text-sky-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
} as const;

/** A compact prompt preview whose tokens double as option pickers. */
export function PromptComposer({ eyebrow = 'Câu lệnh của em đang thành hình', lead, fields, tail, action, editor }: { eyebrow?: string; lead: string; fields: PromptField[]; tail?: string; action?: ReactNode; editor?: ReactNode }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const active = fields.find((field) => field.key === activeKey) ?? null;
  return <>
    <View className="rounded-[24px] border border-sky-100 bg-white p-4" style={{ shadowColor: '#38BDF8', shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } }}>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="min-w-0 flex-1 text-[11px] font-extrabold uppercase tracking-[1.4px] text-sky-600">✍️ {eyebrow}</Text>
        {action}
      </View>
      <View className="mt-3 flex-row flex-wrap items-center gap-1.5">
        <Text className="py-1 text-[15px] leading-7 text-slate-700">{lead}</Text>
        {fields.map((field, index) => <View key={field.key} className="flex-row items-center gap-1.5">
          <Pressable onPress={() => setActiveKey(field.key)} accessibilityRole="button" accessibilityLabel={`Chọn ${field.label}`} className={`rounded-xl border px-2.5 py-1.5 active:opacity-70 ${TOKEN_TONES[field.tone || 'sky']}`}>
            <Text className={`text-[14px] font-extrabold ${TOKEN_TONES[field.tone || 'sky'].split(' ').at(-1)}`}>{field.value.trim() || field.placeholder || field.label}</Text>
          </Pressable>
          {index < fields.length - 1 ? <Text className="text-slate-400">＋</Text> : null}
        </View>)}
        {tail ? <Text className="py-1 text-[15px] leading-7 text-slate-700">{tail}</Text> : null}
      </View>
      {editor ? <View className="mt-3">{editor}</View> : null}
      <Text className="mt-3 text-[11px] font-semibold text-slate-400">Chạm vào khối màu để đổi lựa chọn hoặc tự viết.</Text>
    </View>
    <OptionPicker field={active} onClose={() => setActiveKey(null)} />
  </>;
}

export function CompactOptionField({ field }: { field: PromptField }) {
  const [open, setOpen] = useState(false);
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`Chọn ${field.label}`} onPress={() => setOpen(true)} className="mb-2 flex-row items-center rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3 active:opacity-75">
      <View className="min-w-0 flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{field.label}</Text>
        <Text className="mt-0.5 text-[14px] font-extrabold text-slate-800" numberOfLines={1}>{field.value || field.placeholder || 'Chạm để chọn'}</Text>
      </View>
      <Text className="ml-2 text-lg text-slate-300">⌄</Text>
    </Pressable>
    <OptionPicker field={open ? field : null} onClose={() => setOpen(false)} />
  </>;
}

function OptionPicker({ field, onClose }: { field: PromptField | null; onClose: () => void }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 720;
  const [custom, setCustom] = useState('');
  if (!field) return null;
  const applyCustom = () => {
    const next = custom.trim();
    if (!next) return;
    field.onChange(next);
    setCustom('');
    onClose();
  };
  return <Modal visible transparent animationType="fade" onRequestClose={onClose}>
    <View className={`flex-1 bg-slate-950/35 px-3 ${desktop ? 'items-center justify-center' : 'justify-end'}`}>
      <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel="Đóng lựa chọn" />
      <View className={`w-full bg-white p-5 ${desktop ? 'max-w-[520px] rounded-[28px]' : 'rounded-t-[28px] pb-8'}`} style={{ shadowColor: '#0F172A', shadowOpacity: 0.22, shadowRadius: 28, shadowOffset: { width: 0, height: 12 } }}>
        {!desktop ? <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-slate-200" /> : null}
        <View className="flex-row items-center justify-between">
          <View className="min-w-0 flex-1"><Text className="text-[11px] font-bold uppercase tracking-wide text-brand">Chọn một gợi ý</Text><Text className="mt-1 text-xl font-extrabold text-slate-900">{field.label}</Text></View>
          <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Text className="text-xl text-slate-500">×</Text></Pressable>
        </View>
        <ScrollView className="mt-4 max-h-[310px]" contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} keyboardShouldPersistTaps="handled">
          {field.options.map((option) => {
            const selected = option.toLowerCase() === field.value.trim().toLowerCase();
            return <Pressable key={option} accessibilityRole="button" onPress={() => { field.onChange(option); onClose(); }} className={`rounded-full border px-4 py-2.5 ${selected ? 'border-brand bg-brand' : 'border-orange-100 bg-orange-50'}`}><Text className={`text-[13px] font-bold ${selected ? 'text-white' : 'text-orange-900'}`}>{selected ? '✓ ' : ''}{option}</Text></Pressable>;
          })}
        </ScrollView>
        <View className="mt-4 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 p-1.5 pl-3">
          <TextInput value={custom} onChangeText={setCustom} onSubmitEditing={applyCustom} placeholder={field.placeholder || 'Tự viết ý của em…'} placeholderTextColor="#94A3B8" className="h-11 min-w-0 flex-1 text-[14px] text-slate-900" />
          <Pressable onPress={applyCustom} className={`h-11 justify-center rounded-xl px-4 ${custom.trim() ? 'bg-slate-900' : 'bg-slate-200'}`} disabled={!custom.trim()}><Text className={`font-extrabold ${custom.trim() ? 'text-white' : 'text-slate-400'}`}>Dùng ý này</Text></Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}
