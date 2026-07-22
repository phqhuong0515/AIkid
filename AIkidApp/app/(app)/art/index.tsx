import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/core/auth/useAuth';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { ART_STYLES } from '@/features/art/constants';
import { useArtDraft } from '@/features/art/store/useArtDraft';
import { buildArtRedrawPrompt, generateImageViaGateway } from '@/features/creative/generateImageViaGateway';
import { useFamily } from '@/features/family/store/useFamily';
import { ChoiceChip, PrimaryButton, SectionCard } from '@/features/kids-ui/CreativeKit';
import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';

export default function ArtScreen() {
  const { token } = useAuth(); const child = useFamily((s) => s.getActiveChild()); const ipId = useWorkspace((s) => s.getActiveIpId());
  const { draft, hydrated, hydrate, patch } = useArtDraft(); const [busy, setBusy] = useState(false);
  useEffect(() => { void hydrate(); }, [hydrate]);
  async function choose(camera: boolean) { const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) return Alert.alert('Cần quyền truy cập ảnh'); const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: .85, base64: true }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: .85, base64: true }); const asset = result.canceled ? null : result.assets[0]; if (asset) patch({ referenceUri: asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri }); }
  async function generate() { if (!token || !child) return Alert.alert('Chưa sẵn sàng', 'Đăng nhập và chọn hồ sơ con trước.'); if (!child.consent.allowAiCreate) return Alert.alert('AI đang tắt', 'Phụ huynh cần bật quyền tạo AI cho hồ sơ.'); if (!draft.referenceUri) return Alert.alert('Thiếu ảnh mẫu', 'Chụp hoặc chọn một bức tranh trước.'); setBusy(true); try { const style = ART_STYLES.find((s) => s.id === draft.styleId)!; const result = await generateImageViaGateway({ userPrompt: `${buildArtRedrawPrompt(style.labelVi)} ${draft.prompt}`.trim(), referenceDataUrl: draft.referenceUri.startsWith('data:') ? draft.referenceUri : null, referenceHttpsUrl: draft.referenceUri.startsWith('http') ? draft.referenceUri : null, childProfileId: child.id, ipId }); patch({ resultUri: result.imageUrl }); } catch (e) { Alert.alert('Không tạo được ảnh', e instanceof Error ? e.message : 'Thử lại sau'); } finally { setBusy(false); } }
  if (!hydrated) return <ScreenChrome title="Xưởng vẽ"><View className="flex-1 items-center justify-center"><ActivityIndicator /></View></ScreenChrome>;
  return <ScreenChrome title="Xưởng vẽ AI" subtitle="Camera · thư viện · StoryMee jobs" backHref="/(app)/lobby"><ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
    <SectionCard title="1. Chọn tranh mẫu" hint="Ảnh chỉ được upload khi bạn bấm tạo."><View className="flex-row gap-2"><Pressable onPress={() => void choose(true)} className="flex-1 rounded-2xl bg-orange-50 py-4"><Text className="text-center font-extrabold text-orange-900">📷 Chụp ảnh</Text></Pressable><Pressable onPress={() => void choose(false)} className="flex-1 rounded-2xl bg-orange-50 py-4"><Text className="text-center font-extrabold text-orange-900">🖼️ Thư viện</Text></Pressable></View>{draft.referenceUri ? <Image source={{ uri: draft.referenceUri }} className="mt-3 h-56 w-full rounded-2xl" resizeMode="contain" /> : <View className="mt-3 h-36 items-center justify-center rounded-2xl border border-dashed border-orange-200"><Text className="text-slate-400">Chưa có tranh mẫu</Text></View>}</SectionCard>
    <SectionCard title="2. Chọn phong cách"><View className="flex-row flex-wrap">{ART_STYLES.map((s) => <ChoiceChip key={s.id} label={s.labelVi} selected={draft.styleId === s.id} onPress={() => patch({ styleId: s.id })} />)}</View></SectionCard>
    <SectionCard title="3. Điều mình muốn giữ lại"><TextInput value={draft.prompt} onChangeText={(prompt) => patch({ prompt })} multiline placeholder="Ví dụ: giữ nụ cười và chiếc mũ đỏ…" placeholderTextColor="#94A3B8" className="min-h-20 rounded-2xl bg-slate-50 px-4 py-3 text-slate-900" /></SectionCard>
    <PrimaryButton label={busy ? 'Đang vẽ lại…' : '✨ Vẽ lại bằng AI'} disabled={busy} onPress={() => void generate()} />
    {draft.resultUri ? <SectionCard title="Tác phẩm mới"><Image source={{ uri: draft.resultUri }} className="h-80 w-full rounded-2xl" resizeMode="contain" /><Text className="mt-2 text-center text-xs text-slate-500">Đã lưu trong hệ thống jobs/media</Text></SectionCard> : null}
  </ScrollView></ScreenChrome>;
}
