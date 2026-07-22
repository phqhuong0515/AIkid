import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Image, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { familyApi } from '@/core/storymee';
import { extractErrorMessage } from '@/core/api/unwrap';
import { useAuth } from '@/core/auth/useAuth';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { generateImageViaGateway } from '@/features/creative/generateImageViaGateway';
import { updateChild } from '@/features/family/api/familyApi';
import { useFamily } from '@/features/family/store/useFamily';
import { useInvalidateMediaAfterJob } from '@/features/jobs/api/jobHooks';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';
import { ChoiceChip } from '@/features/kids-ui/CreativeKit';
import { useMeeDraft } from '@/features/mee';
import { HAIR_COLORS, MEE_OPTIONS } from '@/features/mee/assets';
import { MeeAssetPicker, MeeAssetPreview, type MeeAssetPreviewHandle } from '@/features/mee/MeeAssetPreview';
import { SKIN_TONE_COLORS } from '@/features/mee/skinTones';
import { uploadMeePreview } from '@/features/mee/preview';
import { uploadPickedImageAsPublicRef } from '@/features/media/api/mediaHooks';

const SHIRTS = ['#FB7185', '#38BDF8', '#A78BFA', '#34D399', '#FBBF24'];
const BACKGROUNDS = ['#FFF7ED', '#E0F2FE', '#F3E8FF', '#DCFCE7', '#FEF3C7'];
type Feedback = { tone: 'success' | 'error'; title: string; message: string };
type EditorGroupId = 'identity' | 'face' | 'hair' | 'outfit' | 'background' | 'actions';

const EDITOR_CATEGORIES: Array<{ id: EditorGroupId; label: string }> = [
  { id: 'identity', label: 'Nhân vật' }, { id: 'face', label: 'Khuôn mặt' },
  { id: 'hair', label: 'Tóc' }, { id: 'outfit', label: 'Trang phục' },
  { id: 'background', label: 'Phông nền' }, { id: 'actions', label: 'Lưu & AI' },
];

function EditorPanel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <View className="mb-3 overflow-hidden rounded-[24px] border border-orange-100 bg-white">
    <View className="min-h-14 flex-row items-center justify-between px-4 py-3">
      <View className="min-w-0 flex-1"><Text className="text-base font-extrabold text-slate-900">{title}</Text>{subtitle ? <Text className="mt-0.5 text-xs text-slate-500">{subtitle}</Text> : null}</View>
    </View>
    <View className="border-t border-orange-50 px-4 pb-1 pt-4">{children}</View>
  </View>;
}

export default function MeeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { actor, token } = useAuth();
  const child = useFamily((s) => s.getActiveChild());
  const replaceChild = useFamily((s) => s.replaceChild);
  const ipId = useWorkspace((s) => s.getActiveIpId());
  const { draft, isHydrated, hydrate, setGender, setField, reset } = useMeeDraft();
  const invalidateMedia = useInvalidateMediaAfterJob();
  const [busy, setBusy] = useState<'save' | 'ai' | 'avatar' | null>(null);
  const [aiStage, setAiStage] = useState<'rasterizing' | 'uploading' | 'generating' | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [activeCategory, setActiveCategory] = useState<EditorGroupId>('identity');
  const actionLock = useRef(false);
  const previewRef = useRef<MeeAssetPreviewHandle>(null);
  useEffect(() => { void hydrate(); }, [hydrate]);

  async function savePreview(): Promise<string | null> {
    if (!token || !child) { setFeedback({ tone: 'error', title: 'Chưa sẵn sàng', message: 'Đăng nhập và chọn hồ sơ con trước.' }); return null; }
    if (!ipId) { setFeedback({ tone: 'error', title: 'Thiếu workspace', message: 'Không tìm thấy workspace để lưu Mee.' }); return null; }
    if (actionLock.current) return null;
    actionLock.current = true;
    setFeedback(null);
    setBusy('save');
    try {
      const url = await uploadMeePreview(draft, { childId: child.id, ipId });
      setField('savedMediaUrl', url);
      invalidateMedia();
      setFeedback({ tone: 'success', title: 'Đã lưu Mee', message: 'Mee đã xuất hiện trong Gallery của bé.' });
      Alert.alert('Đã lưu Mee', 'Bản xem trước đã được lưu vĩnh viễn trong media của hồ sơ.');
      return url;
    } catch (error) { const message = error instanceof Error ? error.message : 'Thử lại sau'; setFeedback({ tone: 'error', title: 'Không lưu được Mee', message }); Alert.alert('Không lưu được Mee', message); return null; }
    finally { actionLock.current = false; setBusy(null); }
  }

  async function createAiVersion() {
    if (!token || !child) { setFeedback({ tone: 'error', title: 'Chưa sẵn sàng', message: 'Đăng nhập và chọn hồ sơ con trước.' }); return; }
    if (!child.consent.allowAiCreate) { setFeedback({ tone: 'error', title: 'AI đang tắt', message: 'Phụ huynh cần bật quyền tạo AI cho hồ sơ.' }); return; }
    if (!ipId) { setFeedback({ tone: 'error', title: 'Thiếu workspace', message: 'Không tìm thấy workspace để tạo Mee AI.' }); return; }
    if (actionLock.current) return;
    actionLock.current = true;
    setFeedback(null);
    setBusy('ai');
    try {
      // AI providers accept raster references, not the SVG kept in Gallery.
      setAiStage('rasterizing');
      let pngDataUrl: string;
      try {
        if (!previewRef.current) throw new Error('Bản xem trước chưa sẵn sàng');
        pngDataUrl = await previewRef.current.toPngDataUrl();
      } catch (error) {
        throw new Error(`Không chuyển Mee sang PNG: ${extractErrorMessage(error, 'Thử mở lại màn Mee.')}`);
      }
      let referenceUrl: string;
      setAiStage('uploading');
      try {
        referenceUrl = await uploadPickedImageAsPublicRef({
          uri: pngDataUrl,
          fileName: `mee-ai-${child.id}-${Date.now()}.png`,
          mimeType: 'image/png',
          childId: child.id,
          ipId,
          assetType: 'uploaded',
          tags: 'mee-ai-reference',
        });
      } catch (error) {
        throw new Error(`Không tải được PNG của Mee: ${extractErrorMessage(error, 'Kiểm tra mạng và thử lại.')}`);
      }
      invalidateMedia();
      let result: Awaited<ReturnType<typeof generateImageViaGateway>>;
      setAiStage('generating');
      try {
        result = await generateImageViaGateway({ userPrompt: 'Turn this simple Mee avatar into a polished kid-friendly 3D cartoon profile portrait. Preserve skin, hair, clothing and background colors. Single centered character, head and shoulders, no text, no watermark.', referenceHttpsUrl: referenceUrl, childProfileId: child.id, ipId });
      } catch (error) {
        throw new Error(`Dịch vụ tạo Mee AI chưa phản hồi: ${extractErrorMessage(error, 'Thử lại sau.')}`);
      }
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
      setFeedback({ tone: 'success', title: 'Mee AI đã sẵn sàng', message: 'Tác phẩm mới đã được lưu vào Gallery của bé.' });
    } catch (error) { const message = error instanceof Error ? error.message : 'Thử lại sau'; setFeedback({ tone: 'error', title: 'Không tạo được Mee AI', message }); Alert.alert('Không tạo được Mee AI', message); }
    finally { actionLock.current = false; setAiStage(null); setBusy(null); }
  }

  async function applyAvatar() {
    const avatarUrl = draft.aiResultUrl || draft.savedMediaUrl;
    if (!child || !avatarUrl) { setFeedback({ tone: 'error', title: 'Chưa có ảnh', message: 'Hãy lưu hoặc tạo Mee AI trước.' }); return; }
    if (!child.consent.allowPhoto) { setFeedback({ tone: 'error', title: 'Chưa được phép', message: 'Phụ huynh cần bật quyền ảnh cho hồ sơ.' }); return; }
    if (actionLock.current) return;
    actionLock.current = true;
    setFeedback(null);
    setBusy('avatar');
    try {
      const updated = actor === 'child' ? await familyApi.updateMyAvatar(avatarUrl) : await updateChild(child.id, { avatarUrl });
      replaceChild(updated as never);
      setFeedback({ tone: 'success', title: 'Đã cập nhật avatar', message: actor === 'child' ? 'Bé đã đổi avatar của chính mình.' : `Đã đổi avatar cho ${child.name}.` });
      Alert.alert('Đã cập nhật', actor === 'child' ? 'Bé đã đổi avatar của chính mình.' : `Đã đổi avatar cho ${child.name}.`);
    } catch (error) { const message = error instanceof Error ? error.message : 'Thử lại sau'; setFeedback({ tone: 'error', title: 'Không đổi được avatar', message }); Alert.alert('Không đổi được avatar', message); }
    finally { actionLock.current = false; setBusy(null); }
  }
  if (!isHydrated) return <ScreenChrome title="Tạo Mee"><View className="flex-1 items-center justify-center"><ActivityIndicator color="#F97316" /><Text className="mt-3 text-slate-500">Đang mở bản nháp…</Text></View></ScreenChrome>;
  const colorButton = (color: string, selected: boolean, onPress: () => void, rounded = true, label = color) => <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} className={`mr-3 mb-2 h-11 w-11 ${rounded ? 'rounded-full' : 'rounded-xl'}`} style={{ backgroundColor: color, borderWidth: selected ? 4 : 1, borderColor: selected ? '#F97316' : '#FED7AA' }} />;
  const categoryTabs = <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingHorizontal: 2, paddingVertical: 4 }}>
    {EDITOR_CATEGORIES.map(({ id, label }) => <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: activeCategory === id }} onPress={() => setActiveCategory(id)} className={`min-h-11 justify-center rounded-full border px-4 ${activeCategory === id ? 'border-brand bg-brand' : 'border-orange-100 bg-white'}`}><Text className={`text-sm font-extrabold ${activeCategory === id ? 'text-white' : 'text-slate-600'}`}>{label}</Text></Pressable>)}
  </ScrollView>;
  return <ScreenChrome title="Tạo Mee" subtitle="Chạm chọn · xem ngay · tự động lưu" backHref="/(app)/lobby" right={<Pressable accessibilityRole="button" disabled={!!busy} onPress={() => Alert.alert('Làm mới Mee?', 'Bản nháp hiện tại sẽ về mặc định.', [{ text: 'Huỷ' }, { text: 'Làm mới', style: 'destructive', onPress: reset }])}><Text className={`font-bold text-brand ${busy ? 'opacity-40' : ''}`}>Làm mới</Text></Pressable>}>
    <ScrollView contentContainerStyle={{ paddingHorizontal: desktop ? 24 : 12, paddingTop: 12, paddingBottom: 72 }}>
      <View style={{ width: '100%', maxWidth: 1280, alignSelf: 'center', flexDirection: desktop ? 'row' : 'column', gap: desktop ? 20 : 12, alignItems: 'flex-start' }}>
        <View style={[desktop ? { flexBasis: '40%', maxWidth: 500 } : { width: '100%' }, Platform.OS === 'web' ? ({ position: 'sticky', top: 12, zIndex: 2 } as never) : undefined]}>
          <View className="items-center overflow-hidden rounded-[30px] border border-orange-100 bg-white p-2 shadow-sm">
            <MeeAssetPreview ref={previewRef} draft={draft} compact={!desktop} />
            <View className="w-full flex-row items-center justify-between px-2 py-2"><Text className="text-[11px] font-bold text-slate-500">Mee của bé · SVG native</Text><Text className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700">✓ Đã tự lưu</Text></View>
          </View>
          {!desktop ? <View className="mt-2 rounded-2xl border border-orange-100 bg-[#FFF8F2]/95 p-1">{categoryTabs}</View> : null}
        </View>
        <View style={desktop ? { minWidth: 0, flex: 1 } : { width: '100%' }}>
          {desktop ? <View className="mb-3 rounded-2xl border border-orange-100 bg-[#FFF8F2] p-1">{categoryTabs}</View> : null}
          {activeCategory === 'identity' ? <EditorPanel title="Nhân vật" subtitle="Giới tính và màu da">
            <View className="mb-3 flex-row flex-wrap"><ChoiceChip label="Bạn nam" selected={draft.gender === 'male'} onPress={() => setGender('male')} /><ChoiceChip label="Bạn nữ" selected={draft.gender === 'female'} onPress={() => setGender('female')} /></View>
            <Text className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Màu da</Text><View className="flex-row flex-wrap">{Object.entries(SKIN_TONE_COLORS).slice(0, 6).map(([value, color]) => <View key={value}>{colorButton(color, draft.skinTone === Number(value), () => setField('skinTone', Number(value)), true, `Màu da ${value}`)}</View>)}</View>
          </EditorPanel> : null}
          {activeCategory === 'face' ? <EditorPanel title="Khuôn mặt" subtitle="Dáng mặt, mắt, lông mày và miệng">
            <MeeAssetPicker title="Dáng mặt" kind="face" options={MEE_OPTIONS.faces} value={draft.face} draft={draft} onChange={(value) => setField('face', value)} /><MeeAssetPicker title="Mắt" kind="eyes" options={MEE_OPTIONS.eyes} value={draft.eyes} draft={draft} onChange={(value) => setField('eyes', value)} /><MeeAssetPicker title="Lông mày" kind="eyebrow" options={MEE_OPTIONS.eyebrows} value={draft.eyebrows} draft={draft} onChange={(value) => setField('eyebrows', value)} /><MeeAssetPicker title="Miệng" kind="mouth" options={MEE_OPTIONS.mouths} value={draft.mouth} draft={draft} onChange={(value) => setField('mouth', value)} />
          </EditorPanel> : null}
          {activeCategory === 'hair' ? <EditorPanel title="Tóc" subtitle="Kiểu tóc trước, sau và màu tóc">
            <MeeAssetPicker title="Tóc mái" kind="bang" options={MEE_OPTIONS.bangs} value={draft.bang} draft={draft} onChange={(value) => setField('bang', value)} /><MeeAssetPicker title="Tóc phía sau" kind="behind" options={MEE_OPTIONS.behind} value={draft.behind} draft={draft} onChange={(value) => setField('behind', value)} /><Text className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Màu tóc</Text><View className="flex-row flex-wrap">{HAIR_COLORS.map(({ id, color }) => <View key={id}>{colorButton(color, draft.hairColor === id, () => setField('hairColor', id), true, `Màu tóc ${id}`)}</View>)}</View>
          </EditorPanel> : null}
          {activeCategory === 'outfit' ? <EditorPanel title="Trang phục" subtitle="Chọn áo, quần và màu riêng cho từng món">
            <MeeAssetPicker title="Áo" kind="shirt" options={MEE_OPTIONS.shirts} value={draft.shirt} draft={draft} onChange={(value) => setField('shirt', value)} /><Text className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Màu áo</Text><View className="mb-3 flex-row flex-wrap">{SHIRTS.map((color, i) => <View key={`shirt-${color}`}>{colorButton(color, draft.shirtColor === i + 1, () => setField('shirtColor', i + 1), false, `Màu áo ${i + 1}`)}</View>)}</View>
            <MeeAssetPicker title="Quần" kind="pants" options={MEE_OPTIONS.pants} value={draft.pants} draft={draft} onChange={(value) => setField('pants', value)} /><Text className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Màu quần</Text><View className="flex-row flex-wrap">{SHIRTS.map((color, i) => <View key={`pants-${color}`}>{colorButton(color, draft.pantsColor === i + 1, () => setField('pantsColor', i + 1), false, `Màu quần ${i + 1}`)}</View>)}</View>
          </EditorPanel> : null}
          {activeCategory === 'background' ? <EditorPanel title="Phông nền" subtitle="Chọn màu làm nổi bật Mee"><View className="flex-row flex-wrap">{BACKGROUNDS.map((color, i) => <View key={color}>{colorButton(color, draft.backgroundColor === color, () => setField('backgroundColor', color), false, `Phông nền ${i + 1}`)}</View>)}</View></EditorPanel> : null}
          {activeCategory === 'actions' ? <EditorPanel title="Lưu & dùng Mee" subtitle="Gallery, Mee AI và avatar">
        {draft.aiResultUrl ? <Image source={{ uri: draft.aiResultUrl }} className="mb-3 h-72 w-full rounded-2xl" resizeMode="contain" /> : null}
        {feedback ? <View accessibilityRole="alert" className={`mb-3 rounded-2xl border p-4 ${feedback.tone === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}><Text className={`font-extrabold ${feedback.tone === 'success' ? 'text-emerald-800' : 'text-red-700'}`}>{feedback.tone === 'success' ? '✓ ' : '⚠ '}{feedback.title}</Text><Text className="mt-1 text-sm text-slate-600">{feedback.message}</Text>{feedback.tone === 'success' ? <Pressable onPress={() => router.push('/(app)/gallery')} className="mt-3 self-start rounded-xl bg-emerald-600 px-4 py-2"><Text className="font-extrabold text-white">Mở Gallery</Text></Pressable> : null}</View> : null}
        {busy ? <View accessibilityRole="progressbar" className="mb-3 flex-row items-center justify-center gap-2 rounded-2xl bg-orange-50 p-4"><ActivityIndicator color="#F97316" /><Text className="font-bold text-slate-600">{busy === 'save' ? 'Đang lưu Mee vào Gallery…' : busy === 'ai' ? aiStage === 'rasterizing' ? 'Đang chuyển Mee sang PNG…' : aiStage === 'uploading' ? 'Đang tải ảnh PNG lên…' : 'AI đang tạo phiên bản Mee…' : 'Đang cập nhật avatar…'}</Text></View> : null}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!busy, busy: busy === 'save' }} disabled={!!busy} onPress={() => void savePreview()} className={`mb-3 rounded-2xl bg-emerald-500 py-4 ${busy ? 'opacity-50' : ''}`}><Text className="text-center font-extrabold text-white">{busy === 'save' ? 'Đang lưu Mee…' : 'Lưu Mee vào Gallery'}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!busy, busy: busy === 'ai' }} disabled={!!busy} onPress={() => void createAiVersion()} className={`mb-3 rounded-2xl bg-brand py-4 ${busy ? 'opacity-50' : ''}`}><Text className="text-center font-extrabold text-white">{busy === 'ai' ? 'AI đang tạo Mee…' : '✨ Tạo phiên bản Mee AI'}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!busy || (!draft.aiResultUrl && !draft.savedMediaUrl), busy: busy === 'avatar' }} disabled={!!busy || (!draft.aiResultUrl && !draft.savedMediaUrl)} onPress={() => void applyAvatar()} className={`rounded-2xl border border-orange-200 bg-orange-50 py-4 ${busy || (!draft.aiResultUrl && !draft.savedMediaUrl) ? 'opacity-50' : ''}`}><Text className="text-center font-extrabold text-orange-900">{busy === 'avatar' ? 'Đang cập nhật avatar…' : `Dùng làm avatar ${actor === 'child' ? 'của bé' : `cho ${child?.name || 'hồ sơ'}`}`}</Text></Pressable>
          </EditorPanel> : null}
        </View>
      </View>
    </ScrollView>
  </ScreenChrome>;
}
