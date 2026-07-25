import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/core/auth/useAuth';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { ART_STYLES, type ArtStyle } from '@/features/art/constants';
import { buildArtRedrawPrompt } from '@/features/art/buildArtRedrawPrompt';
import {
  DrawingCanvas,
  type DrawingCanvasHandle,
  type DrawingStroke,
} from '@/features/art/canvas/DrawingCanvas';
import { useArtDraft } from '@/features/art/store/useArtDraft';
import { generateImageViaGateway } from '@/features/creative/generateImageViaGateway';
import { useFamily } from '@/features/family/store/useFamily';
import { useInvalidateMediaAfterJob } from '@/features/jobs/api/jobHooks';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { SectionCard } from '@/features/kids-ui/CreativeKit';
import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';
import { uploadPickedImageAsPublicRef } from '@/features/media/api/mediaHooks';

type BusyStage = 'preparing' | 'uploading' | 'generating' | null;
type ReferenceMode = 'photo' | 'drawing';

function StyleCard({
  item,
  selected,
  width,
  onPress,
}: {
  item: ArtStyle;
  selected: boolean;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.labelVi}: ${item.descriptionVi}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        width,
        borderWidth: selected ? 3 : 1,
        borderColor: selected ? '#FF6670' : '#FED7AA',
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <Image
        source={item.thumbnail}
        style={{ width: '100%', aspectRatio: 1.18, backgroundColor: '#FFF7ED' }}
        contentFit="cover"
        transition={180}
      />
      <View style={{ padding: 10 }}>
        <Text className="text-[14px] font-extrabold text-slate-900">
          {selected ? '✓ ' : ''}{item.labelVi}
        </Text>
        <Text className="mt-1 text-[11px] leading-4 text-slate-500" numberOfLines={2}>
          {item.descriptionVi}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ArtScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { token } = useAuth();
  const child = useFamily((state) => state.getActiveChild());
  const ipId = useWorkspace((state) => state.getActiveIpId());
  const { draft, hydrated, hydrate, patch } = useArtDraft();
  const invalidateMedia = useInvalidateMediaAfterJob();
  const [busyStage, setBusyStage] = useState<BusyStage>(null);
  const [referenceMode, setReferenceMode] = useState<ReferenceMode>('photo');
  const [hasCanvasDrawing, setHasCanvasDrawing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasModalVisible, setCanvasModalVisible] = useState(false);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [canvasSaving, setCanvasSaving] = useState(false);
  const [canvasStrokes, setCanvasStrokes] = useState<DrawingStroke[]>([]);
  const [canvasRevision, setCanvasRevision] = useState(0);
  const [styleGridWidth, setStyleGridWidth] = useState(0);
  const [confirmedCanvasRevision, setConfirmedCanvasRevision] = useState(0);
  const [drawingPreviewUri, setDrawingPreviewUri] = useState<string | null>(null);
  const drawingCanvasRef = useRef<DrawingCanvasHandle>(null);
  const generateLock = useRef(false);
  const previousOrientationLock = useRef<ScreenOrientation.OrientationLock | null>(null);
  const orientationWasManaged = useRef(false);
  const orientationRequest = useRef(0);
  const canvasOpenLock = useRef(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => () => {
    orientationRequest.current += 1;
    if (orientationWasManaged.current) {
      const previous = previousOrientationLock.current;
      void (previous == null
        ? ScreenOrientation.unlockAsync()
        : ScreenOrientation.lockAsync(previous)
      ).catch(() => undefined);
    }
  }, []);

  const selectedStyle = useMemo(
    () => ART_STYLES.find((style) => style.id === draft.styleId) ?? ART_STYLES[0],
    [draft.styleId],
  );
  const useGrid = width >= 760;
  const contentWidth = Math.min(Math.max(width - 32, 320), 1180);
  const styleInnerWidth = Math.max(styleGridWidth || contentWidth - 32, 288);
  const styleColumns = Math.min(5, Math.max(2, Math.floor((styleInnerWidth + 12) / 212)));
  const cardWidth = useGrid
    ? (styleInnerWidth - (styleColumns - 1) * 12) / styleColumns
    : 172;
  const canvasHasUnconfirmedChanges = canvasRevision !== confirmedCanvasRevision;

  async function openCanvas() {
    if (canvasOpenLock.current) return;
    canvasOpenLock.current = true;
    const request = ++orientationRequest.current;
    let shouldOpen = true;
    setReferenceMode('drawing');
    const isPhone = (Platform.OS === 'ios' || Platform.OS === 'android') && width < 760;
    if (isPhone) {
      try {
        const previous = await ScreenOrientation.getOrientationLockAsync();
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        if (orientationRequest.current !== request) {
          shouldOpen = false;
          try {
            await (previous === ScreenOrientation.OrientationLock.DEFAULT
              ? ScreenOrientation.unlockAsync()
              : ScreenOrientation.lockAsync(previous));
          } catch { /* best-effort restore after unmount */ }
        } else {
          previousOrientationLock.current = previous;
          orientationWasManaged.current = true;
        }
      } catch (error) {
        console.warn('[ArtCanvas] landscape lock unavailable', error);
        shouldOpen = orientationRequest.current === request;
      }
    }
    // Show only after the orientation request settles. This prevents a close
    // racing a late lockAsync completion and leaving the whole app landscape.
    canvasOpenLock.current = false;
    if (shouldOpen) setCanvasModalVisible(true);
  }

  async function restoreOrientation() {
    if (!orientationWasManaged.current) return;
    try {
      const previous = previousOrientationLock.current;
      previousOrientationLock.current = null;
      if (previous == null || previous === ScreenOrientation.OrientationLock.DEFAULT) {
        await ScreenOrientation.unlockAsync();
      } else {
        await ScreenOrientation.lockAsync(previous);
      }
    } catch (error) {
      console.warn('[ArtCanvas] orientation restore unavailable', error);
    } finally {
      orientationWasManaged.current = false;
    }
  }

  function closeCanvasKeepingWork() {
    setCanvasModalVisible(false);
    setIsDrawing(false);
    void restoreOrientation();
  }

  async function confirmCanvas() {
    if (isDrawing || drawingCanvasRef.current?.hasActiveStroke()) {
      Alert.alert('Nét vẽ chưa xong', 'Nhấc bút khỏi bảng rồi bấm Xong nhé.');
      return;
    }
    if (!drawingCanvasRef.current?.hasDrawing()) {
      Alert.alert('Bảng vẽ đang trống', 'Bé hãy vẽ ít nhất một nét trước.');
      return;
    }
    setCanvasSaving(true);
    try {
      const preview = await drawingCanvasRef.current.exportPngDataUrl();
      setDrawingPreviewUri(preview);
      setConfirmedCanvasRevision(canvasRevision);
      setHasCanvasDrawing(true);
      setReferenceMode('drawing');
      patch({ uploadedReferenceUrl: null, resultUri: null, resultJobId: null });
      closeCanvasKeepingWork();
    } catch (error) {
      Alert.alert('Không lưu được bảng vẽ', error instanceof Error ? error.message : 'Thử lại sau');
    } finally {
      setCanvasSaving(false);
    }
  }

  function requestCloseCanvas() {
    if (canvasSaving) return;
    if (isDrawing || drawingCanvasRef.current?.hasActiveStroke()) {
      Alert.alert('Bé vẫn đang vẽ', 'Nhấc bút khỏi bảng trước khi thoát.');
      return;
    }
    if (!canvasHasUnconfirmedChanges) {
      closeCanvasKeepingWork();
      return;
    }
    Alert.alert(
      'Bảng vẽ chưa bấm Xong',
      'Các nét vẫn được giữ khi đóng. Bấm Xong để cập nhật ảnh xem trước.',
      [
        { text: 'Vẽ tiếp', style: 'cancel' },
        { text: 'Đóng, vẫn giữ nét', onPress: closeCanvasKeepingWork },
        { text: 'Xong', onPress: () => void confirmCanvas() },
      ],
    );
  }

  async function choose(camera: boolean) {
    setPhotoPickerVisible(false);
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập ảnh', camera ? 'Hãy cho phép dùng camera.' : 'Hãy cho phép mở thư viện ảnh.');
      return;
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;
    setReferenceMode('photo');
    patch({
      referenceUri: asset.uri,
      referenceFileName: asset.fileName ?? null,
      referenceMimeType: asset.mimeType ?? 'image/jpeg',
      uploadedReferenceUrl: null,
      resultUri: null,
      resultJobId: null,
    });
  }

  async function generate() {
    if (!token || !child) {
      Alert.alert('Chưa sẵn sàng', 'Đăng nhập và chọn hồ sơ con trước.');
      return;
    }
    if (!child.consent.allowAiCreate) {
      Alert.alert('AI đang tắt', 'Phụ huynh cần bật quyền tạo AI cho hồ sơ.');
      return;
    }
    if (!ipId) {
      Alert.alert('Thiếu workspace', 'Không tìm thấy workspace để lưu tác phẩm.');
      return;
    }
    if (referenceMode === 'photo' && !draft.referenceUri && !draft.uploadedReferenceUrl) {
      Alert.alert('Thiếu ảnh mẫu', 'Chụp hoặc chọn một bức tranh trước.');
      return;
    }
    if (referenceMode === 'drawing' && !drawingCanvasRef.current?.hasDrawing()) {
      if (!hasCanvasDrawing) {
        Alert.alert('Bảng vẽ đang trống', 'Bé hãy vẽ ít nhất một nét trước.', [{ text: 'Mở bảng vẽ', onPress: () => void openCanvas() }]);
        return;
      }
    }
    if (referenceMode === 'drawing' && (canvasHasUnconfirmedChanges || !drawingPreviewUri)) {
      Alert.alert('Cần xác nhận bảng vẽ', 'Mở bảng vẽ và bấm Xong trước khi tạo ảnh AI.', [{ text: 'Mở bảng vẽ', onPress: () => void openCanvas() }]);
      return;
    }
    if (generateLock.current) return;
    generateLock.current = true;

    try {
      let referenceUrl = draft.uploadedReferenceUrl;
      if (!referenceUrl) {
        let localReferenceUri = draft.referenceUri;
        let fileName = draft.referenceFileName;
        let mimeType = draft.referenceMimeType;
        if (referenceMode === 'drawing') {
          localReferenceUri = drawingPreviewUri;
          fileName = `aikid-drawing-${Date.now()}.png`;
          mimeType = 'image/png';
        }
        if (!localReferenceUri) throw new Error('Không đọc được ảnh mẫu');
        setBusyStage('uploading');
        referenceUrl = await uploadPickedImageAsPublicRef({
          uri: localReferenceUri,
          fileName,
          mimeType,
          childId: child.id,
          ipId,
          assetType: 'uploaded',
        });
        patch({ uploadedReferenceUrl: referenceUrl });
        // The permanent reference is already a Gallery asset even if the AI
        // job later fails, so expose it to Gallery immediately.
        invalidateMedia();
      }
      if (!referenceUrl.startsWith('http')) {
        throw new Error('Ảnh mẫu chưa có URL công khai; job AI chưa được gửi.');
      }

      setBusyStage('generating');
      const result = await generateImageViaGateway({
        userPrompt: buildArtRedrawPrompt(selectedStyle, draft.prompt),
        referenceHttpsUrl: referenceUrl,
        childProfileId: child.id,
        ipId,
      });
      patch({ resultUri: result.imageUrl, resultJobId: result.jobId });
      await useRecentAiImages.getState().setScope(child.id);
      useRecentAiImages.getState().add({
        id: result.jobId,
        uri: result.imageUrl,
        driveUrl: result.imageUrl,
        assetType: 'ai-image',
        tags: [`child:${child.id}`, 'art-redraw'],
        createdAt: new Date().toISOString(),
      });
      invalidateMedia();
    } catch (error) {
      Alert.alert('Không tạo được ảnh', error instanceof Error ? error.message : 'Thử lại sau');
    } finally {
      generateLock.current = false;
      setBusyStage(null);
    }
  }

  if (!hydrated) {
    return (
      <ScreenChrome title="Xưởng vẽ">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF6670" />
          <Text className="mt-3 text-slate-500">Đang mở xưởng vẽ…</Text>
        </View>
      </ScreenChrome>
    );
  }

  return <>
    <ScreenChrome title="Xưởng vẽ AI" subtitle="Ảnh mẫu → chọn phong cách → AI vẽ lại" backHref="/(app)/lobby">
      <ScrollView scrollEnabled={!busyStage} contentContainerStyle={{ padding: 16, paddingBottom: 64, alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 1180 }}>
        <SectionCard title="1. Tạo hoặc chọn tranh mẫu" hint="Bé có thể tự vẽ, chụp tranh giấy hoặc chọn ảnh. Tranh được lưu vào Gallery trước khi gửi AI.">
          <View className="flex-row" style={{ gap: 12 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mở bảng để bé tự vẽ"
              accessibilityState={{ selected: referenceMode === 'drawing', disabled: !!busyStage }}
              disabled={!!busyStage}
              onPress={() => void openCanvas()}
              className="flex-1 overflow-hidden rounded-[22px] bg-orange-50 disabled:opacity-50"
              style={{ minHeight: useGrid ? 210 : 168, borderWidth: referenceMode === 'drawing' ? 3 : 1, borderColor: referenceMode === 'drawing' ? '#FF6670' : '#FED7AA' }}
            >
              {drawingPreviewUri ? <Image source={{ uri: drawingPreviewUri }} style={{ width: '100%', flex: 1, minHeight: 112, backgroundColor: '#FFFFFF' }} contentFit="cover" /> : <View className="flex-1 items-center justify-center px-3"><Text className="text-4xl">🎨</Text><Text className="mt-2 text-center text-sm font-extrabold text-orange-900">Bé tự vẽ</Text><Text className="mt-1 text-center text-[11px] text-slate-500">Chạm để mở bảng vẽ</Text></View>}
              {drawingPreviewUri ? <View className="px-3 py-2"><Text className="text-center text-xs font-extrabold text-orange-900">🎨 {canvasHasUnconfirmedChanges ? 'Có nét mới' : 'Bản vẽ của bé'}</Text></View> : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chụp ảnh hoặc chọn từ thư viện"
              accessibilityState={{ selected: referenceMode === 'photo', disabled: !!busyStage }}
              disabled={!!busyStage}
              onPress={() => { setReferenceMode('photo'); setPhotoPickerVisible(true); }}
              className="flex-1 overflow-hidden rounded-[22px] bg-orange-50 disabled:opacity-50"
              style={{ minHeight: useGrid ? 210 : 168, borderWidth: referenceMode === 'photo' ? 3 : 1, borderColor: referenceMode === 'photo' ? '#FF6670' : '#FED7AA' }}
            >
              {draft.referenceUri || draft.uploadedReferenceUrl ? <Image source={{ uri: draft.referenceUri ?? draft.uploadedReferenceUrl! }} style={{ width: '100%', flex: 1, minHeight: 112, backgroundColor: '#FFFFFF' }} contentFit="cover" /> : <View className="flex-1 items-center justify-center px-3"><Text className="text-4xl">📷</Text><Text className="mt-2 text-center text-sm font-extrabold text-orange-900">Ảnh có sẵn</Text><Text className="mt-1 text-center text-[11px] text-slate-500">Camera hoặc thư viện</Text></View>}
              {draft.referenceUri || draft.uploadedReferenceUrl ? <View className="px-3 py-2"><Text className="text-center text-xs font-extrabold text-orange-900">📷 Chạm để đổi ảnh</Text></View> : null}
            </Pressable>
          </View>
          <Text className={`mt-3 text-center text-xs font-bold ${referenceMode === 'drawing' && canvasHasUnconfirmedChanges ? 'text-amber-600' : 'text-emerald-600'}`}>
            {referenceMode === 'drawing' ? canvasHasUnconfirmedChanges ? 'Nét mới vẫn được giữ — mở bảng và bấm Xong để cập nhật' : hasCanvasDrawing ? '✓ Bản vẽ đã sẵn sàng' : 'Chọn “Bé tự vẽ” để bắt đầu' : draft.referenceUri || draft.uploadedReferenceUrl ? '✓ Ảnh mẫu đã sẵn sàng' : 'Chọn “Ảnh có sẵn” để thêm tranh mẫu'}
          </Text>
        </SectionCard>

        <SectionCard title="2. Bé thích phong cách nào?" hint="Chạm vào ảnh mẫu để xem và chọn phong cách.">
          <View className="mb-4 flex-row overflow-hidden rounded-[22px] border-2 border-brand bg-rose-50">
            <Image source={selectedStyle.thumbnail} style={{ width: useGrid ? 190 : 116, minHeight: useGrid ? 142 : 112 }} contentFit="cover" />
            <View className="flex-1 justify-center p-4">
              <View className="self-start rounded-full bg-brand px-3 py-1">
                <Text className="text-[10px] font-extrabold uppercase tracking-wide text-white">✓ Phong cách đang chọn</Text>
              </View>
              <Text className="mt-2 text-xl font-extrabold text-slate-900">{selectedStyle.labelVi}</Text>
              <Text className="mt-1 text-xs leading-5 text-slate-600" numberOfLines={useGrid ? 3 : 2}>{selectedStyle.descriptionVi}</Text>
            </View>
          </View>
          <Text className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Tất cả phong cách</Text>
          {useGrid ? (
            <View className="flex-row flex-wrap" style={{ gap: 12 }} onLayout={(event) => setStyleGridWidth(event.nativeEvent.layout.width)}>
              {ART_STYLES.map((item) => <StyleCard key={item.id} item={item} selected={draft.styleId === item.id} width={cardWidth} onPress={() => patch({ styleId: item.id })} />)}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={cardWidth + 12} decelerationRate="fast" contentContainerStyle={{ gap: 12, paddingRight: 8 }}>
              {ART_STYLES.map((item) => <StyleCard key={item.id} item={item} selected={draft.styleId === item.id} width={cardWidth} onPress={() => patch({ styleId: item.id })} />)}
            </ScrollView>
          )}
        </SectionCard>

        <SectionCard title="3. Điều mình muốn giữ lại" hint="Ví dụ: giữ nụ cười, chiếc mũ đỏ hoặc màu của chú mèo.">
          <TextInput
            value={draft.prompt}
            editable={!busyStage}
            onChangeText={(prompt) => patch({ prompt })}
            placeholder="Mình muốn giữ lại…"
            placeholderTextColor="#94A3B8"
            multiline
            className="min-h-24 rounded-2xl bg-slate-50 px-4 py-3 text-slate-900"
          />
        </SectionCard>

        {busyStage ? (
          <View className="mb-4 min-h-20 justify-center rounded-[22px] border border-rose-200 bg-white px-5 py-4">
            <View className="flex-row items-center justify-center" style={{ gap: 12 }}><ActivityIndicator color="#FF6670" />
            <Text className="text-base font-extrabold text-slate-900">
              {busyStage === 'preparing' ? 'Đang đóng khung nét vẽ…' : busyStage === 'uploading' ? 'Đang lưu tranh mẫu…' : `AI đang vẽ kiểu ${selectedStyle.labelVi}…`}
            </Text></View>
            <View className="mt-3 h-2 w-full overflow-hidden rounded-full bg-orange-100">
              <View className={`h-full rounded-full bg-brand ${busyStage === 'preparing' ? 'w-1/4' : busyStage === 'uploading' ? 'w-1/2' : 'w-3/4'}`} />
            </View>
          </View>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel={`AI vẽ lại theo phong cách ${selectedStyle.labelVi}`} disabled={referenceMode === 'drawing' ? !hasCanvasDrawing : !draft.referenceUri && !draft.uploadedReferenceUrl} onPress={() => void generate()} className="mb-4 min-h-16 w-full flex-row items-center justify-center rounded-[22px] bg-brand px-5 disabled:opacity-50" style={{ gap: 12, shadowColor: '#FF6670', shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 7 } }}>
            <Text className="text-2xl">✨</Text><Text className="text-base font-extrabold text-white">AI vẽ lại bức tranh</Text><Text className="text-lg text-white/80">→</Text>
          </Pressable>
        )}

        {draft.resultUri ? (
          <View className="mt-4 overflow-hidden rounded-[28px] border-2 border-emerald-200 bg-white p-4">
            <Text className="text-center text-xl font-extrabold text-slate-900">🎉 Tác phẩm mới của bé</Text>
            <Text className="mt-1 text-center text-xs text-emerald-700">Đã lưu trong hệ thống jobs và Gallery</Text>
            <Image source={{ uri: draft.resultUri }} style={{ width: '100%', height: 380, marginTop: 14, borderRadius: 20, backgroundColor: '#FFF7ED' }} contentFit="contain" />
            <View className="mt-3 flex-row gap-2">
              <Pressable onPress={() => router.push('/(app)/gallery')} className="flex-1 rounded-2xl bg-emerald-500 py-4">
                <Text className="text-center font-extrabold text-white">Xem Gallery</Text>
              </Pressable>
              <Pressable onPress={() => void generate()} className="flex-1 rounded-2xl bg-brand py-4">
                <Text className="text-center font-extrabold text-white">Vẽ lại lần nữa</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => patch({ referenceUri: null, referenceFileName: null, referenceMimeType: null, uploadedReferenceUrl: null, resultUri: null, resultJobId: null })} className="mt-2 py-3">
              <Text className="text-center text-sm font-bold text-slate-500">Chọn một tranh khác</Text>
            </Pressable>
          </View>
        ) : null}
        </View>
      </ScrollView>
    </ScreenChrome>
    <Modal transparent visible={photoPickerVisible} animationType="fade" onRequestClose={() => setPhotoPickerVisible(false)}>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng chọn nguồn ảnh" onPress={() => setPhotoPickerVisible(false)} className="flex-1 items-center justify-center bg-slate-950/40 px-5">
        <Pressable accessibilityRole="none" onPress={(event) => event.stopPropagation()} className="w-full max-w-md rounded-[28px] bg-white p-5" style={{ shadowColor: '#0F172A', shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } }}>
          <Text className="text-center text-xl font-extrabold text-slate-900">Thêm tranh mẫu</Text>
          <Text className="mt-1 text-center text-sm text-slate-500">Bé muốn dùng nguồn ảnh nào?</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Chụp ảnh bằng camera" onPress={() => void choose(true)} className="mt-5 min-h-14 flex-row items-center rounded-2xl bg-brand px-4" style={{ gap: 12 }}>
            <Text className="text-2xl">📷</Text><View className="flex-1"><Text className="font-extrabold text-white">Chụp ảnh</Text><Text className="text-xs text-white/80">Chụp tranh giấy ngay bây giờ</Text></View><Text className="text-white">→</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Chọn ảnh từ thư viện" onPress={() => void choose(false)} className="mt-3 min-h-14 flex-row items-center rounded-2xl border border-orange-100 bg-orange-50 px-4" style={{ gap: 12 }}>
            <Text className="text-2xl">🖼️</Text><View className="flex-1"><Text className="font-extrabold text-orange-900">Thư viện ảnh</Text><Text className="text-xs text-slate-500">Chọn ảnh đã có trên thiết bị</Text></View><Text className="text-orange-900">→</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Huỷ chọn ảnh" onPress={() => setPhotoPickerVisible(false)} className="mt-3 py-3"><Text className="text-center font-bold text-slate-500">Huỷ</Text></Pressable>
        </Pressable>
      </Pressable>
    </Modal>
    <Modal visible={canvasModalVisible} animationType="slide" presentationStyle="fullScreen" onRequestClose={requestCloseCanvas} supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}>
      <SafeAreaView className="flex-1 bg-orange-50" edges={['top', 'right', 'bottom', 'left']}>
        <View className="flex-1 p-1">
          <DrawingCanvas
            ref={drawingCanvasRef}
            fullscreen
            disabled={canvasSaving}
            saving={canvasSaving}
            doneDisabled={isDrawing || !hasCanvasDrawing}
            onClose={requestCloseCanvas}
            onDone={() => void confirmCanvas()}
            initialStrokes={canvasStrokes}
            onInteractionChange={setIsDrawing}
            onStrokesChange={(next) => {
              setCanvasStrokes(next);
              setHasCanvasDrawing(next.length > 0);
              setCanvasRevision((revision) => revision + 1);
              setReferenceMode('drawing');
              patch({ uploadedReferenceUrl: null, resultUri: null, resultJobId: null });
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  </>;
}
