import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { familyApi } from '@/core/storymee';
import { useAuth } from '@/core/auth/useAuth';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { generateImageViaGateway } from '@/features/creative/generateImageViaGateway';
import { updateChild } from '@/features/family/api/familyApi';
import { useFamily } from '@/features/family/store/useFamily';
import { useInvalidateMediaAfterJob } from '@/features/jobs/api/jobHooks';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';
import { ChoiceChip, SectionCard } from '@/features/kids-ui/CreativeKit';
import { useMeeDraft } from '@/features/mee';
import { HAIR_COLORS, MEE_OPTIONS } from '@/features/mee/assets';
import { MeeAssetPicker, MeeAssetPreview } from '@/features/mee/MeeAssetPreview';
import { SKIN_TONE_COLORS } from '@/features/mee/skinTones';
import { uploadMeePreview } from '@/features/mee/preview';

const SHIRTS = ['#FB7185', '#38BDF8', '#A78BFA', '#34D399', '#FBBF24'];
const BACKGROUNDS = ['#FFF7ED', '#E0F2FE', '#F3E8FF', '#DCFCE7', '#FEF3C7'];

export default function MeeScreen() {
  const { actor, token } = useAuth();
  const child = useFamily((s) => s.getActiveChild());
  const replaceChild = useFamily((s) => s.replaceChild);
  const ipId = useWorkspace((s) => s.getActiveIpId());
  const { draft, isHydrated, hydrate, setGender, setField, reset } = useMeeDraft();
  const invalidateMedia = useInvalidateMediaAfterJob();
  const [busy, setBusy] = useState<'save' | 'ai' | 'avatar' | null>(null);
  useEffect(() => { void hydrate(); }, [hydrate]);

  async function savePreview(): Promise<string | null> {
    if (!token || !child) { Alert.alert('Chưa sẵn sàng', 'Đăng nhập và chọn hồ sơ con trước.'); return null; }
    setBusy('save');
    try {
      const url = await uploadMeePreview(draft, { childId: child.id, ipId });
      setField('savedMediaUrl', url);
      invalidateMedia();
      Alert.alert('Đã lưu Mee', 'Bản xem trước đã được lưu vĩnh viễn trong media của hồ sơ.');
      return url;
    } catch (error) { Alert.alert('Không lưu được Mee', error instanceof Error ? error.message : 'Thử lại sau'); return null; }
    finally { setBusy(null); }
  }

  async function createAiVersion() {
    if (!token || !child) return Alert.alert('Chưa sẵn sàng', 'Đăng nhập và chọn hồ sơ con trước.');
    if (!child.consent.allowAiCreate) return Alert.alert('AI đang tắt', 'Phụ huynh cần bật quyền tạo AI.');
    setBusy('ai');
    try {
      const referenceUrl = draft.savedMediaUrl || await uploadMeePreview(draft, { childId: child.id, ipId });
      if (!draft.savedMediaUrl) setField('savedMediaUrl', referenceUrl);
      const result = await generateImageViaGateway({ userPrompt: 'Turn this simple Mee avatar into a polished kid-friendly 3D cartoon profile portrait. Preserve skin, hair, clothing and background colors. Single centered character, head and shoulders, no text, no watermark.', referenceHttpsUrl: referenceUrl, childProfileId: child.id, ipId });
      setField('aiResultUrl', result.imageUrl);
      await useRecentAiImages.getState().setScope(child.id);
      useRecentAiImages.getState().add({
        id: result.jobId,
        uri: result.imageUrl,
        driveUrl: result.imageUrl,
        assetType: 'ai-image',
        tags: [`child:${child.id}`, 'mee-ai'],
        createdAt: new Date().toISOString(),
      });
      invalidateMedia();
    } catch (error) { Alert.alert('Không tạo được Mee AI', error instanceof Error ? error.message : 'Thử lại sau'); }
    finally { setBusy(null); }
  }

  async function applyAvatar() {
    const avatarUrl = draft.aiResultUrl || draft.savedMediaUrl;
    if (!child || !avatarUrl) return Alert.alert('Chưa có ảnh', 'Hãy lưu hoặc tạo Mee AI trước.');
    if (!child.consent.allowPhoto) return Alert.alert('Chưa được phép', 'Phụ huynh cần bật quyền ảnh cho hồ sơ.');
    setBusy('avatar');
    try {
      const updated = actor === 'child' ? await familyApi.updateMyAvatar(avatarUrl) : await updateChild(child.id, { avatarUrl });
      replaceChild(updated as never);
      Alert.alert('Đã cập nhật', actor === 'child' ? 'Bé đã đổi avatar của chính mình.' : `Đã đổi avatar cho ${child.name}.`);
    } catch (error) { Alert.alert('Không đổi được avatar', error instanceof Error ? error.message : 'Thử lại sau'); }
    finally { setBusy(null); }
  }
  if (!isHydrated) return <ScreenChrome title="Tạo Mee"><View className="flex-1 items-center justify-center"><Text>Đang mở bản nháp…</Text></View></ScreenChrome>;
  return <ScreenChrome title="Tạo Mee" subtitle="Expo native · tự động lưu" backHref="/(app)/lobby" right={<Pressable onPress={() => Alert.alert('Làm mới Mee?', 'Bản nháp hiện tại sẽ về mặc định.', [{ text: 'Huỷ' }, { text: 'Làm mới', style: 'destructive', onPress: reset }])}><Text className="font-bold text-brand">Làm mới</Text></Pressable>}>
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <View className="mb-4 items-center rounded-[32px] border border-orange-100 p-3" style={{ backgroundColor: draft.backgroundColor }}>
        <MeeAssetPreview draft={draft} />
        <Text className="mt-3 rounded-full bg-white/80 px-4 py-2 text-[12px] font-bold text-slate-600">SVG gốc · Expo native · tự động lưu</Text>
      </View>
      <SectionCard title="Nhân vật" hint="Mọi thay đổi được lưu trên thiết bị."><View className="flex-row flex-wrap"><ChoiceChip label="Bạn nam" selected={draft.gender === 'male'} onPress={() => setGender('male')} /><ChoiceChip label="Bạn nữ" selected={draft.gender === 'female'} onPress={() => setGender('female')} /></View></SectionCard>
      <SectionCard title="Màu da"><View className="flex-row flex-wrap">{Object.entries(SKIN_TONE_COLORS).slice(0, 6).map(([value, color]) => <Pressable key={value} onPress={() => setField('skinTone', Number(value))} className="mr-3 mb-2 h-11 w-11 rounded-full" style={{ backgroundColor: color, borderWidth: draft.skinTone === Number(value) ? 4 : 1, borderColor: draft.skinTone === Number(value) ? '#F97316' : '#FED7AA' }} />)}</View></SectionCard>
      <SectionCard title="Khuôn mặt" hint="Chạm vào hình thật để xem ngay trên Mee.">
        <MeeAssetPicker title="Dáng mặt" kind="face" options={MEE_OPTIONS.faces} value={draft.face} draft={draft} onChange={(value) => setField('face', value)} />
        <MeeAssetPicker title="Mắt" kind="eyes" options={MEE_OPTIONS.eyes} value={draft.eyes} draft={draft} onChange={(value) => setField('eyes', value)} />
        <MeeAssetPicker title="Lông mày" kind="eyebrow" options={MEE_OPTIONS.eyebrows} value={draft.eyebrows} draft={draft} onChange={(value) => setField('eyebrows', value)} />
        <MeeAssetPicker title="Miệng" kind="mouth" options={MEE_OPTIONS.mouths} value={draft.mouth} draft={draft} onChange={(value) => setField('mouth', value)} />
      </SectionCard>
      <SectionCard title="Tóc" hint="Tóc sau → cơ thể → khuôn mặt → tóc mái, đúng thứ tự layer gốc.">
        <MeeAssetPicker title="Tóc mái" kind="bang" options={MEE_OPTIONS.bangs} value={draft.bang} draft={draft} onChange={(value) => setField('bang', value)} />
        <MeeAssetPicker title="Tóc phía sau" kind="behind" options={MEE_OPTIONS.behind} value={draft.behind} draft={draft} onChange={(value) => setField('behind', value)} />
        <Text className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Màu tóc</Text>
        <View className="flex-row flex-wrap">{HAIR_COLORS.map(({ id, color }) => <Pressable key={id} onPress={() => setField('hairColor', id)} className="mr-3 mb-2 h-10 w-10 rounded-full" style={{ backgroundColor: color, borderWidth: draft.hairColor === id ? 4 : 1, borderColor: '#F97316' }} />)}</View>
      </SectionCard>
      <SectionCard title="Trang phục">
        <MeeAssetPicker title="Áo" kind="shirt" options={MEE_OPTIONS.shirts} value={draft.shirt} draft={draft} onChange={(value) => setField('shirt', value)} />
        <MeeAssetPicker title="Quần" kind="pants" options={MEE_OPTIONS.pants} value={draft.pants} draft={draft} onChange={(value) => setField('pants', value)} />
        <Text className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Màu trang phục</Text>
        <View className="flex-row flex-wrap">{SHIRTS.map((color, i) => <Pressable key={color} onPress={() => setField('shirtColor', i + 1)} className="mr-3 mb-2 h-10 w-10 rounded-xl" style={{ backgroundColor: color, borderWidth: draft.shirtColor === i + 1 ? 4 : 1, borderColor: '#F97316' }} />)}</View>
      </SectionCard>
      <SectionCard title="Phông nền"><View className="flex-row flex-wrap">{BACKGROUNDS.map((color) => <Pressable key={color} onPress={() => setField('backgroundColor', color)} className="mr-3 mb-2 h-10 w-10 rounded-xl" style={{ backgroundColor: color, borderWidth: draft.backgroundColor === color ? 4 : 1, borderColor: '#F97316' }} />)}</View></SectionCard>
      <SectionCard title="Lưu & dùng Mee" hint="Preview được lưu permanent qua SDK media; AI dùng đúng jobs của StoryMee.">
        {draft.aiResultUrl ? <Image source={{ uri: draft.aiResultUrl }} className="mb-3 h-72 w-full rounded-2xl" resizeMode="contain" /> : null}
        {busy ? <View className="mb-3 flex-row items-center justify-center gap-2"><ActivityIndicator color="#F97316" /><Text className="font-bold text-slate-500">Đang xử lý…</Text></View> : null}
        <Pressable disabled={!!busy} onPress={() => void savePreview()} className="mb-3 rounded-2xl bg-emerald-500 py-4"><Text className="text-center font-extrabold text-white">Lưu Mee vào Gallery</Text></Pressable>
        <Pressable disabled={!!busy} onPress={() => void createAiVersion()} className="mb-3 rounded-2xl bg-brand py-4"><Text className="text-center font-extrabold text-white">✨ Tạo phiên bản Mee AI</Text></Pressable>
        <Pressable disabled={!!busy || (!draft.aiResultUrl && !draft.savedMediaUrl)} onPress={() => void applyAvatar()} className="rounded-2xl border border-orange-200 bg-orange-50 py-4"><Text className="text-center font-extrabold text-orange-900">Dùng làm avatar {actor === 'child' ? 'của bé' : `cho ${child?.name || 'hồ sơ'}`}</Text></Pressable>
      </SectionCard>
    </ScrollView>
  </ScreenChrome>;
}
