import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Image, ImageBackground, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Mask, Rect, Line, G } from 'react-native-svg';
import Slider from '@react-native-community/slider';

import { familyApi } from '@/core/storymee';
import { extractErrorMessage } from '@/core/api/unwrap';
import { useAuth } from '@/core/auth/useAuth';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { generateImageViaGateway } from '@/features/creative/generateImageViaGateway';
import { updateChild } from '@/features/family/api/familyApi';
import { useFamily } from '@/features/family/store/useFamily';
import { useInvalidateMediaAfterJob } from '@/features/jobs/api/jobHooks';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { useMeeDraft } from '@/features/mee';
import { HAIR_COLORS, MEE_OPTIONS } from '@/features/mee/assets';
import { MeeAssetPicker, MeeAssetPreview, type MeeAssetPreviewHandle } from '@/features/mee/MeeAssetPreview';
import { SKIN_TONE_COLORS } from '@/features/mee/skinTones';
import { uploadMeePreview } from '@/features/mee/preview';
import { uploadPickedImageAsPublicRef } from '@/features/media/api/mediaHooks';
import { GlobalHeader } from '@/components/GlobalHeader';
import { usePopSound } from '@/hooks/usePopSound';

const SHIRTS = ['#FB7185', '#38BDF8', '#A78BFA', '#34D399', '#FBBF24'];
const BACKGROUNDS = ['#FFF7ED', '#E0F2FE', '#F3E8FF', '#DCFCE7', '#FEF3C7'];
type Feedback = { tone: 'success' | 'error'; title: string; message: string };
type EditorGroupId = 'identity' | 'face' | 'hair' | 'shirt' | 'pants' | 'dress' | 'shoes' | 'accessories' | 'background' | 'actions';

const PantsIcon = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 512 512" fill={color} width={22} height={22}>
    <Path d="M432 32H80a16 16 0 0 0-16 16v432a16 16 0 0 0 16 16h112a16 16 0 0 0 16-16V304h96v176a16 16 0 0 0 16 16h112a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zm-208 80h-64V64h64zm128 0h-64V64h64z" />
  </Svg>
);

const DressIcon = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 384 512" fill={color} width={18} height={22}>
    <Path d="M128 32C128 14.3 142.3 0 160 0H224C241.7 0 256 14.3 256 32V64H384V160C384 177.7 369.7 192 352 192H320V448C320 483.3 291.3 512 256 512H128C92.7 512 64 483.3 64 448V192H32C14.3 192 0 177.7 0 160V64H128V32z" />
  </Svg>
);

const ShoesIcon = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 512 512" fill={color} width={24} height={24}>
    <Mask id="shoe-mask">
      <Rect x="-100" y="-100" width="712" height="712" fill="white" />
      <Path d="M216 156h64M216 196h64M216 236h64" stroke="black" strokeWidth="16" strokeLinecap="round" />
      <Line x1="48" y1="352" x2="464" y2="352" stroke="black" strokeWidth="16" />
      <Rect x="336" y="144" width="48" height="96" fill="black" rx="8" />
      <Path d="M256 256Q176 272 144 352" fill="none" stroke="black" strokeWidth="12" strokeLinecap="round" />
    </Mask>
    <G transform="translate(256, 256) scale(1.23) translate(-256, -256)">
      <G mask="url(#shoe-mask)">
        <Path d="M400 344H80c-17.7 0-32 14.3-32 32v16c0 17.7 14.3 32 32 32h288c17.7 0 32-14.3 32-32v-48z" />
        <Path d="M400 112H256v144H144c-44.2 0-80 35.8-80 80v16h336V112z" />
      </G>
    </G>
  </Svg>
);

const EDITOR_CATEGORIES: Array<{ id: EditorGroupId; label: string; icon: any; isCustomSvg?: boolean }> = [
  { id: 'identity', label: 'Nhân vật', icon: 'person' }, 
  { id: 'face', label: 'Khuôn mặt', icon: 'eye' },
  { id: 'hair', label: 'Tóc', icon: 'cut' }, 
  { id: 'shirt', label: 'Áo', icon: 'shirt' },
  { id: 'pants', label: 'Quần', icon: PantsIcon, isCustomSvg: true },
  { id: 'dress', label: 'Đầm/Bộ liền', icon: DressIcon, isCustomSvg: true },
  { id: 'shoes', label: 'Giày', icon: ShoesIcon, isCustomSvg: true },
  { id: 'accessories', label: 'Phụ kiện', icon: 'glasses' },
  { id: 'background', label: 'Phông nền', icon: 'image' }, 
  { id: 'actions', label: 'Lưu & AI', icon: 'save' },
];

function EditorPanel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <View className="mb-4">
    <View className="mb-3 px-1">
      <Text className="text-lg font-extrabold text-[#4a3728]">{title}</Text>
      {subtitle ? <Text className="mt-1 text-sm text-slate-500">{subtitle}</Text> : null}
    </View>
    <View>{children}</View>
  </View>;
}

import { MeteorLoadingOverlay } from '@/features/mee/MeteorLoadingOverlay';

export default function MeeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= 768;
  
  const { actor, token } = useAuth();
  const child = useFamily((s) => s.getActiveChild());
  const replaceChild = useFamily((s) => s.replaceChild);
  const ipId = useWorkspace((s) => s.getActiveIpId());
  
  const { draft, past, future, isHydrated, hydrate, setGender, setField, reset, undo, redo, randomize } = useMeeDraft();
  const invalidateMedia = useInvalidateMediaAfterJob();
  const { playPop } = usePopSound();
  
  const [busy, setBusy] = useState<'save' | 'ai' | 'avatar' | null>(null);
  const [aiStage, setAiStage] = useState<'rasterizing' | 'uploading' | 'generating' | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [editorGroup, setEditorGroup] = useState<EditorGroupId>('identity');
  
  const [useCustomSkin, setUseCustomSkin] = useState(false);
  const [skinR, setSkinR] = useState(255);
  const [skinG, setSkinG] = useState(231);
  const [skinB, setSkinB] = useState(230);

  const actionLock = useRef(false);
  const previewRef = useRef<MeeAssetPreviewHandle>(null);
  
  useEffect(() => { void hydrate(); }, [hydrate]);


  useEffect(() => {
    if (useCustomSkin) {
      const toHex = (c: number) => Math.round(c).toString(16).padStart(2, '0');
      const primaryHex = `#${toHex(skinR)}${toHex(skinG)}${toHex(skinB)}`;
      const shadowHex = `#${toHex(Math.max(0, skinR - 20))}${toHex(Math.max(0, skinG - 35))}${toHex(Math.max(0, skinB - 35))}`;
      setField('customPrimaryColor', primaryHex);
      setField('customShadowColor', shadowHex);
    } else {
      if (draft.customPrimaryColor !== null) {
        setField('customPrimaryColor', null);
        setField('customShadowColor', null);
      }
    }
  }, [useCustomSkin, skinR, skinG, skinB, setField]);

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
      setAiStage('rasterizing');
      let pngDataUrl: string;
      try {
        if (!previewRef.current) throw new Error('Bản xem trước chưa sẵn sàng');
        pngDataUrl = await previewRef.current.toPngDataUrl();
      } catch (error) { throw new Error(`Không chuyển Mee sang PNG: ${extractErrorMessage(error, 'Thử mở lại màn Mee.')}`); }
      let referenceUrl: string;
      setAiStage('uploading');
      try {
        referenceUrl = await uploadPickedImageAsPublicRef({ uri: pngDataUrl, fileName: `mee-ai-${child.id}-${Date.now()}.png`, mimeType: 'image/png', childId: child.id, ipId, assetType: 'uploaded', tags: 'mee-ai-reference' });
      } catch (error) { throw new Error(`Không tải được PNG của Mee: ${extractErrorMessage(error, 'Kiểm tra mạng và thử lại.')}`); }
      invalidateMedia();
      let result: Awaited<ReturnType<typeof generateImageViaGateway>>;
      setAiStage('generating');
      try {
        result = await generateImageViaGateway({ userPrompt: 'Turn this simple Mee avatar into a polished kid-friendly 3D cartoon profile portrait. Preserve skin, hair, clothing and background colors. Single centered character, head and shoulders, no text, no watermark.', referenceHttpsUrl: referenceUrl, childProfileId: child.id, ipId });
      } catch (error) { throw new Error(`Dịch vụ tạo Mee AI chưa phản hồi: ${extractErrorMessage(error, 'Thử lại sau.')}`); }
      setField('aiResultUrl', result.imageUrl);
      await useRecentAiImages.getState().setScope(child.id);
      useRecentAiImages.getState().add({ id: result.jobId, uri: result.imageUrl, driveUrl: result.imageUrl, assetType: 'ai-image', tags: [`child:${child.id}`, 'mee-ai'], createdAt: new Date().toISOString() });
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

  // Removed early return to allow MeteorLoadingOverlay to fade out gracefully over the rendered app

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const colorButton = (color: string, selected: boolean, onPress: () => void, rounded = true, label = color) => {
    return React.createElement(Pressable, {
      accessibilityRole: "button",
      accessibilityLabel: label,
      accessibilityState: { selected },
      onPress: () => { playPop(); onPress(); },
      className: `h-12 w-12 items-center justify-center ${rounded ? 'rounded-full' : 'rounded-2xl'}`,
      style: { backgroundColor: color, borderWidth: selected ? 3 : 1, borderColor: selected ? '#ff7597' : '#ebdcd0' }
    });
  };


  return (
    <View className="flex-1 bg-[#e8f4fa]">
      <MeteorLoadingOverlay isVisible={!isHydrated} />
      {!isHydrated ? null : (
      <>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ overflow: 'hidden' }}>

        <View className="z-10 px-4 pt-4">
          <GlobalHeader />
        </View>

        <View className={`flex-1 overflow-hidden ${desktop ? 'flex-row gap-5 px-6 pb-8' : 'flex-col px-4 pb-6 gap-3'}`} style={{ width: '100%', maxWidth: 1200, alignSelf: 'center' }}>
        
        <View className={`${desktop ? 'w-[360px]' : 'w-full h-[360px] shrink-0'} items-center justify-center`}>
          <View className={`w-full flex-1 overflow-hidden ${desktop ? 'rounded-[24px] border-[3px] border-white bg-[#fdfaf4] p-5 shadow-sm flex-col gap-4' : 'rounded-[32px] border-[3px] border-white bg-[#fdfaf4] p-4 shadow-lg flex-col gap-3'}`}>
            <View className={`flex-row items-center justify-between bg-transparent`}>
              <Pressable onPress={() => { playPop(); reset(); }} className={`flex-row items-center justify-center gap-2 px-3 py-2 rounded-full bg-white border border-[#ebdcd0]`} style={{ flex: 1, marginRight: 8 }}>
                <Ionicons name="refresh" size={14} color={'#4a3728'} />
                {desktop && <Text className="font-bold text-[#4a3728] text-[12px]">Đặt lại</Text>}
              </Pressable>
              <View className="flex-row gap-2" style={{ flex: 2 }}>
                <Pressable disabled={!canUndo} onPress={() => { playPop(); undo(); }} className={`flex-1 flex-row items-center justify-center gap-1 px-3 py-2 rounded-full bg-white border border-[#ebdcd0] ${canUndo ? '' : 'opacity-40'}`}>
                  <Ionicons name="arrow-undo" size={14} color={canUndo ? '#4a3728' : '#94A3B8'} />
                  {desktop && <Text className="font-bold text-[#4a3728] text-[12px]">Hoàn tác</Text>}
                </Pressable>
                <Pressable disabled={!canRedo} onPress={() => { playPop(); redo(); }} className={`flex-1 flex-row items-center justify-center gap-1 px-3 py-2 rounded-full bg-white border border-[#ebdcd0] ${canRedo ? '' : 'opacity-40'}`}>
                  {desktop && <Text className="font-bold text-[#4a3728] text-[12px]">Khôi phục</Text>}
                  <Ionicons name="arrow-redo" size={14} color={canRedo ? '#4a3728' : '#94A3B8'} />
                </Pressable>
              </View>
            </View>
            <View className={`flex-1 w-full overflow-hidden ${desktop ? 'bg-white rounded-[16px] border-[2px] border-dashed border-[#ebdcd0]' : ''}`}>
              <MeeAssetPreview ref={previewRef} draft={draft} compact={!desktop} />
            </View>
            <View className={`flex-row justify-center w-full`}>
              <Pressable onPress={() => { playPop(); randomize(); }} className={`flex-row items-center justify-center gap-2 px-6 py-3 rounded-[50px] w-full max-w-[200px] bg-[#ff7597] shadow-sm`} style={{ shadowColor: '#ff7597', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 }}>
                <Ionicons name="dice" size={18} color={'white'} />
                <Text className={`font-extrabold text-white text-sm`}>Ngẫu Nhiên</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className={`flex-1 overflow-hidden ${desktop ? 'flex-row rounded-[24px] border-[3px] border-white shadow-sm' : 'flex-col rounded-[32px] shadow-md'} bg-white`}>
          <View className={`${desktop ? 'w-[72px] items-center pt-4 bg-[#fdfaf4]' : 'bg-[#fdfaf4] px-2 py-3 rounded-t-[32px]'}`}>
            <ScrollView 
              horizontal={!desktop} 
              showsHorizontalScrollIndicator={false} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={desktop ? { gap: 12, paddingBottom: 20 } : { gap: 12, paddingHorizontal: 12 }}
            >
              {EDITOR_CATEGORIES.map((cat) => {
                const CustomIcon = cat.isCustomSvg ? cat.icon : null;
                const isActive = editorGroup === cat.id;
                return (
                  <Pressable 
                    key={cat.id} 
                    onPress={() => { playPop(); setEditorGroup(cat.id); }} 
                    className={`items-center justify-center rounded-[20px] ${desktop ? 'h-16 w-16' : 'h-16 w-[72px]'} ${isActive ? 'bg-[#ff7597] shadow-sm' : 'bg-transparent'}`}
                  >
                    {cat.isCustomSvg && CustomIcon ? (
                      <CustomIcon color={isActive ? 'white' : '#4a3728'} />
                    ) : (
                      <Ionicons name={cat.icon as any} size={22} color={isActive ? 'white' : '#4a3728'} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 60 }}>
            {editorGroup === 'identity' && (
              <EditorPanel title="Nhân vật" subtitle="Chọn giới tính và màu da cho Mee">
                <View className="mb-6 flex-row gap-4">
                  <Pressable 
                    onPress={() => { playPop(); setGender('male'); }}
                    className={`flex-1 items-center justify-center rounded-2xl border-2 p-3 ${draft.gender === 'male' ? 'border-[#ff7597] bg-white' : 'border-[#ebdcd0] bg-[#fdfaf4]'}`}
                  >
                    <Text className={`font-bold ${draft.gender === 'male' ? 'text-[#ff7597]' : 'text-[#4a3728]'}`}>Nam 👦</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => { playPop(); setGender('female'); }}
                    className={`flex-1 items-center justify-center rounded-2xl border-2 p-3 ${draft.gender === 'female' ? 'border-[#ff7597] bg-white' : 'border-[#ebdcd0] bg-[#fdfaf4]'}`}
                  >
                    <Text className={`font-bold ${draft.gender === 'female' ? 'text-[#ff7597]' : 'text-[#4a3728]'}`}>Nữ 👧</Text>
                  </Pressable>
                </View>
                
                <Text className="mb-3 text-sm font-extrabold text-[#4a3728]">Màu da</Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {Object.entries(SKIN_TONE_COLORS).slice(0, 10).map(([value, color]) => (
                    <View key={value}>{colorButton(color, !useCustomSkin && draft.skinTone === Number(value), () => { setUseCustomSkin(false); setField('skinTone', Number(value)); }, true, `Màu da ${value}`)}</View>
                  ))}
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-sm font-extrabold text-[#4a3728]">Tùy chọn màu da riêng</Text>
                  <Pressable 
                    onPress={() => { playPop(); setUseCustomSkin(!useCustomSkin); }}
                    className={`w-12 h-6 rounded-full justify-center px-1 ${useCustomSkin ? 'bg-[#ff7597]' : 'bg-[#ebdcd0]'}`}
                  >
                    <View className={`w-4 h-4 rounded-full bg-white ${useCustomSkin ? 'self-end' : 'self-start'}`} />
                  </Pressable>
                </View>
                {useCustomSkin && (
                  <View className="mt-4 gap-3 bg-[#fdfaf4] p-4 rounded-2xl border border-[#ebdcd0]">
                    <View>
                      <Text className="text-xs font-bold text-red-500 mb-1">Đỏ (R): {skinR}</Text>
                      <Slider
                        minimumValue={0} maximumValue={255} step={1} value={skinR} onValueChange={setSkinR}
                        minimumTrackTintColor="#ef4444" thumbTintColor="#ef4444"
                      />
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-green-500 mb-1">Lục (G): {skinG}</Text>
                      <Slider
                        minimumValue={0} maximumValue={255} step={1} value={skinG} onValueChange={setSkinG}
                        minimumTrackTintColor="#22c55e" thumbTintColor="#22c55e"
                      />
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-blue-500 mb-1">Lam (B): {skinB}</Text>
                      <Slider
                        minimumValue={0} maximumValue={255} step={1} value={skinB} onValueChange={setSkinB}
                        minimumTrackTintColor="#3b82f6" thumbTintColor="#3b82f6"
                      />
                    </View>
                  </View>
                )}
              </EditorPanel>
            )}

            {editorGroup === 'face' && (
              <EditorPanel title="Khuôn mặt" subtitle="Cá nhân hoá ngũ quan">
                <MeeAssetPicker title="Dáng mặt" kind="face" options={MEE_OPTIONS.faces} value={draft.face} draft={draft} onChange={(value) => { playPop(); setField('face', value); }} />
                <MeeAssetPicker title="Mắt" kind="eyes" options={MEE_OPTIONS.eyes} value={draft.eyes} draft={draft} onChange={(value) => { playPop(); setField('eyes', value); }} />
                <MeeAssetPicker title="Lông mày" kind="eyebrow" options={MEE_OPTIONS.eyebrows} value={draft.eyebrows} draft={draft} onChange={(value) => { playPop(); setField('eyebrows', value); }} />
                <MeeAssetPicker title="Miệng" kind="mouth" options={MEE_OPTIONS.mouths} value={draft.mouth} draft={draft} onChange={(value) => { playPop(); setField('mouth', value); }} />
              </EditorPanel>
            )}

            {editorGroup === 'hair' && (
              <EditorPanel title="Tóc" subtitle="Mái tóc thời trang">
                <MeeAssetPicker title="Tóc mái" kind="bang" options={MEE_OPTIONS.bangs} value={draft.bang} draft={draft} onChange={(value) => { playPop(); setField('bang', value); }} />
                <MeeAssetPicker title="Tóc phía sau" kind="behind" options={MEE_OPTIONS.behind} value={draft.behind} draft={draft} onChange={(value) => { playPop(); setField('behind', value); }} />
                <Text className="mt-4 mb-3 text-sm font-extrabold text-slate-700">Màu tóc</Text>
                <View className="flex-row flex-wrap gap-2">
                  {HAIR_COLORS.map(({ id, color }) => (
                    <View key={id}>{colorButton(color, draft.hairColor === id, () => setField('hairColor', id), true, `Màu tóc ${id}`)}</View>
                  ))}
                </View>
              </EditorPanel>
            )}

            {editorGroup === 'shirt' && (
              <EditorPanel title="Áo" subtitle="Trang phục năng động">
                <MeeAssetPicker title="Áo" kind="shirt" options={MEE_OPTIONS.shirts} value={draft.shirt} draft={draft} onChange={(value) => { playPop(); setField('shirt', value); }} />
                <Text className="mt-2 mb-3 text-sm font-extrabold text-slate-700">Màu áo</Text>
                <View className="mb-6 flex-row flex-wrap gap-2">
                  {SHIRTS.map((color, i) => (
                    <View key={`shirt-${color}`}>{colorButton(color, draft.shirtColor === i + 1, () => setField('shirtColor', i + 1), false, `Màu áo ${i + 1}`)}</View>
                  ))}
                </View>
              </EditorPanel>
            )}

            {editorGroup === 'pants' && (
              <EditorPanel title="Quần" subtitle="Trang phục năng động">
                <MeeAssetPicker title="Quần" kind="pants" options={MEE_OPTIONS.pants} value={draft.pants} draft={draft} onChange={(value) => { playPop(); setField('pants', value); }} />
                <Text className="mt-2 mb-3 text-sm font-extrabold text-slate-700">Màu quần</Text>
                <View className="flex-row flex-wrap gap-2">
                  {SHIRTS.map((color, i) => (
                    <View key={`pants-${color}`}>{colorButton(color, draft.pantsColor === i + 1, () => setField('pantsColor', i + 1), false, `Màu quần ${i + 1}`)}</View>
                  ))}
                </View>
              </EditorPanel>
            )}

            {editorGroup === 'background' && (
              <EditorPanel title="Phông nền" subtitle="Màu nền nổi bật">
                <View className="flex-row flex-wrap gap-2">
                  {BACKGROUNDS.map((color, i) => (
                    <View key={color}>{colorButton(color, draft.backgroundColor === color, () => setField('backgroundColor', color), false, `Phông nền ${i + 1}`)}</View>
                  ))}
                </View>
              </EditorPanel>
            )}

            {editorGroup === 'actions' && (
              <EditorPanel title="Lưu & dùng Mee" subtitle="Xuất bản tác phẩm">
                {draft.aiResultUrl ? <Image source={{ uri: draft.aiResultUrl }} className="mb-4 h-72 w-full rounded-3xl bg-slate-50" resizeMode="contain" /> : null}
                
                {feedback ? (
                  <View accessibilityRole="alert" className={`mb-4 rounded-2xl border p-4 ${feedback.tone === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                    <Text className={`font-extrabold ${feedback.tone === 'success' ? 'text-emerald-800' : 'text-red-700'}`}>{feedback.tone === 'success' ? '✓ ' : '⚠ '}{feedback.title}</Text>
                    <Text className="mt-1 text-sm text-slate-600">{feedback.message}</Text>
                    {feedback.tone === 'success' ? (
                      <Pressable onPress={() => router.push('/(app)/gallery')} className="mt-3 self-start rounded-xl bg-emerald-600 px-4 py-2">
                        <Text className="font-extrabold text-white">Mở Gallery</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
                
                {busy ? (
                  <View accessibilityRole="progressbar" className="mb-4 flex-row items-center justify-center gap-3 rounded-2xl bg-pink-50 p-4">
                    <ActivityIndicator color="#EC4899" />
                    <Text className="font-bold text-pink-700">
                      {busy === 'save' ? 'Đang lưu Mee...' : busy === 'ai' ? aiStage === 'rasterizing' ? 'Chuyển sang PNG...' : aiStage === 'uploading' ? 'Tải ảnh lên...' : 'AI đang tạo Mee...' : 'Cập nhật avatar...'}
                    </Text>
                  </View>
                ) : null}
                
                <View className="gap-3">
                  <Pressable accessibilityRole="button" disabled={!!busy} onPress={() => void savePreview()} className={`rounded-2xl bg-slate-900 py-4 ${busy ? 'opacity-50' : ''}`}>
                    <Text className="text-center text-[16px] font-extrabold text-white">Lưu vào Gallery</Text>
                  </Pressable>
                  
                  <Pressable accessibilityRole="button" disabled={!!busy} onPress={() => void createAiVersion()} className={`rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-[#EC4899] py-4 ${busy ? 'opacity-50' : ''}`}>
                    <Text className="text-center text-[16px] font-extrabold text-white">✨ Tạo Mee AI 3D</Text>
                  </Pressable>
                  
                  <Pressable accessibilityRole="button" disabled={!!busy || (!draft.aiResultUrl && !draft.savedMediaUrl)} onPress={() => void applyAvatar()} className={`rounded-2xl border-2 border-slate-200 bg-white py-4 ${busy || (!draft.aiResultUrl && !draft.savedMediaUrl) ? 'opacity-50' : ''}`}>
                    <Text className="text-center text-[16px] font-extrabold text-slate-700">Dùng làm Avatar</Text>
                  </Pressable>
                </View>
              </EditorPanel>
            )}
          </ScrollView>
        </View>

        </View>
      </SafeAreaView>

      {/* Floating Next Button */}
      <Pressable 
        onPress={() => { playPop(); router.push('/(app)/mee/next'); }}
        className="absolute bottom-8 right-8 w-[64px] h-[64px] bg-[#ff7597] rounded-full items-center justify-center border-[4px] border-[#FCF4DB]"
        style={{ shadowColor: '#ff7597', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Trang tiếp theo"
      >
        <Ionicons name="arrow-forward" size={32} color="white" />
      </Pressable>
      </>
      )}
    </View>
  );
}
