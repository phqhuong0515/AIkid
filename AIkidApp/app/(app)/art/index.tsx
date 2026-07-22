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
import {
  DrawingCanvas,
  type DrawingCanvasHandle,
  type DrawingStroke,
} from '@/features/art/canvas/DrawingCanvas';
import { useArtDraft } from '@/features/art/store/useArtDraft';
import {
  buildArtRedrawPrompt,
  generateImageViaGateway,
} from '@/features/creative/generateImageViaGateway';
import { useFamily } from '@/features/family/store/useFamily';
import { useInvalidateMediaAfterJob } from '@/features/jobs/api/jobHooks';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { PrimaryButton, SectionCard } from '@/features/kids-ui/CreativeKit';
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
  const [canvasSaving, setCanvasSaving] = useState(false);
  const [canvasStrokes, setCanvasStrokes] = useState<DrawingStroke[]>([]);
  const [canvasRevision, setCanvasRevision] = useState(0);
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
  const cardWidth = useGrid ? Math.min(220, (width - 84) / 4) : 172;
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
        userPrompt: `${buildArtRedrawPrompt(selectedStyle.labelVi)} ${draft.prompt}`.trim(),
        referenceHttpsUrl: referenceUrl,
        provider: 'google-native',
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
      <ScrollView scrollEnabled={!busyStage} contentContainerStyle={{ padding: 16, paddingBottom: 64 }}>
        <SectionCard title="1. Tạo hoặc chọn tranh mẫu" hint="Bé có thể tự vẽ, chụp tranh giấy hoặc chọn ảnh. Tranh được lưu vào Gallery trước khi gửi AI.">
          <View className="mb-3 flex-row rounded-2xl bg-orange-50 p-1">
            <Pressable
              disabled={!!busyStage}
              onPress={() => { setReferenceMode('drawing'); patch({ uploadedReferenceUrl: null, resultUri: null, resultJobId: null }); }}
              className={`flex-1 rounded-xl py-3 ${referenceMode === 'drawing' ? 'bg-brand' : ''}`}
            >
              <Text className={`text-center font-extrabold ${referenceMode === 'drawing' ? 'text-white' : 'text-orange-900'}`}>🎨 Bé tự vẽ</Text>
            </Pressable>
            <Pressable
              disabled={!!busyStage}
              onPress={() => { setReferenceMode('photo'); patch({ uploadedReferenceUrl: null, resultUri: null, resultJobId: null }); }}
              className={`flex-1 rounded-xl py-3 ${referenceMode === 'photo' ? 'bg-brand' : ''}`}
            >
              <Text className={`text-center font-extrabold ${referenceMode === 'photo' ? 'text-white' : 'text-orange-900'}`}>📷 Ảnh có sẵn</Text>
            </Pressable>
          </View>

          {referenceMode === 'drawing' ? (
            <View className="overflow-hidden rounded-2xl border border-orange-100 bg-orange-50 p-3">
              {drawingPreviewUri ? (
                <Image source={{ uri: drawingPreviewUri }} style={{ width: '100%', height: 220, borderRadius: 14, backgroundColor: '#FFFFFF' }} contentFit="contain" />
              ) : (
                <View className="h-40 items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-white">
                  <Text className="text-4xl">🎨</Text>
                  <Text className="mt-2 font-bold text-slate-400">Bảng vẽ đang chờ bé</Text>
                </View>
              )}
              <Text className={`mt-3 text-center text-xs font-bold ${canvasHasUnconfirmedChanges ? 'text-amber-600' : hasCanvasDrawing ? 'text-emerald-600' : 'text-slate-500'}`}>
                {canvasHasUnconfirmedChanges ? 'Có nét mới chưa bấm Xong — nét vẫn đang được giữ' : hasCanvasDrawing ? '✓ Bảng vẽ đã sẵn sàng cho AI' : 'Mở toàn màn hình để bắt đầu vẽ'}
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Mở bảng vẽ toàn màn hình" disabled={!!busyStage} onPress={() => void openCanvas()} className="mt-3 rounded-2xl bg-brand py-4 disabled:opacity-50">
                <Text className="text-center text-base font-extrabold text-white">{hasCanvasDrawing ? '🎨 Mở lại bảng vẽ' : '🎨 Mở bảng vẽ'}</Text>
              </Pressable>
            </View>
          ) : null}

          {referenceMode === 'photo' ? <View>
            <View className="flex-row gap-2">
              <Pressable onPress={() => void choose(true)} disabled={!!busyStage} className="flex-1 rounded-2xl bg-orange-50 py-4">
                <Text className="text-center font-extrabold text-orange-900">📷 Chụp ảnh</Text>
              </Pressable>
              <Pressable onPress={() => void choose(false)} disabled={!!busyStage} className="flex-1 rounded-2xl bg-orange-50 py-4">
                <Text className="text-center font-extrabold text-orange-900">🖼️ Thư viện</Text>
              </Pressable>
            </View>
          {draft.referenceUri || draft.uploadedReferenceUrl ? (
            <View className="mt-3 overflow-hidden rounded-2xl bg-orange-50">
              <Image source={{ uri: draft.referenceUri ?? draft.uploadedReferenceUrl! }} style={{ width: '100%', height: 260 }} contentFit="contain" />
              <View className="flex-row items-center justify-between px-3 py-2">
                <Text className="text-xs font-bold text-emerald-700">
                  {draft.uploadedReferenceUrl ? '✓ Đã lưu ảnh mẫu' : 'Sẵn sàng tải lên'}
                </Text>
                <Pressable disabled={!!busyStage} onPress={() => patch({ referenceUri: null, referenceFileName: null, referenceMimeType: null, uploadedReferenceUrl: null, resultUri: null, resultJobId: null })}>
                  <Text className="text-xs font-bold text-red-500">Bỏ ảnh</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="mt-3 h-36 items-center justify-center rounded-2xl border border-dashed border-orange-200">
              <Text className="text-4xl">🖍️</Text>
              <Text className="mt-2 text-slate-400">Chọn bức vẽ bé muốn AI vẽ lại</Text>
            </View>
          )}</View> : null}
        </SectionCard>

        <SectionCard title="2. Bé thích phong cách nào?" hint="Chạm vào ảnh mẫu để xem và chọn phong cách.">
          {useGrid ? (
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {ART_STYLES.map((item) => <StyleCard key={item.id} item={item} selected={draft.styleId === item.id} width={cardWidth} onPress={() => patch({ styleId: item.id })} />)}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 8 }}>
              {ART_STYLES.map((item) => <StyleCard key={item.id} item={item} selected={draft.styleId === item.id} width={cardWidth} onPress={() => patch({ styleId: item.id })} />)}
            </ScrollView>
          )}
          <View className="mt-4 flex-row overflow-hidden rounded-2xl border-2 border-brand bg-rose-50">
            <Image source={selectedStyle.thumbnail} style={{ width: 112, minHeight: 104 }} contentFit="cover" />
            <View className="flex-1 justify-center p-3">
              <Text className="text-xs font-bold uppercase text-brand">Đang chọn</Text>
              <Text className="mt-1 text-lg font-extrabold text-slate-900">{selectedStyle.labelVi}</Text>
              <Text className="mt-1 text-xs leading-5 text-slate-600">{selectedStyle.descriptionVi}</Text>
            </View>
          </View>
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
          <View className="mb-4 items-center rounded-[24px] border border-orange-100 bg-white px-5 py-8">
            <ActivityIndicator size="large" color="#FF6670" />
            <Text className="mt-4 text-lg font-extrabold text-slate-900">
              {busyStage === 'preparing' ? 'Đang đóng khung nét vẽ…' : busyStage === 'uploading' ? 'Đang lưu tranh mẫu…' : `AI đang vẽ kiểu ${selectedStyle.labelVi}…`}
            </Text>
            <Text className="mt-2 text-center text-sm text-slate-500">
              {busyStage === 'preparing' ? 'Xưởng đang biến bảng vẽ thành ảnh PNG.' : busyStage === 'uploading' ? 'Ảnh sẽ xuất hiện trong Gallery của bé.' : 'Bức tranh có thể cần vài phút để hoàn thành.'}
            </Text>
            <View className="mt-5 h-3 w-full overflow-hidden rounded-full bg-orange-100">
              <View className={`h-full rounded-full bg-brand ${busyStage === 'preparing' ? 'w-1/4' : busyStage === 'uploading' ? 'w-1/2' : 'w-3/4'}`} />
            </View>
          </View>
        ) : (
          <PrimaryButton label="✨ AI vẽ lại bức tranh" disabled={referenceMode === 'drawing' ? !hasCanvasDrawing : !draft.referenceUri && !draft.uploadedReferenceUrl} onPress={() => void generate()} />
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
      </ScrollView>
    </ScreenChrome>
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
