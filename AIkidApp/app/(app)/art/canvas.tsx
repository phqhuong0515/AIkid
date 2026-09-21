import React, { useState, useRef, useCallback } from 'react';
import { View, Alert, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { CanvasRef } from '@shopify/react-native-skia';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import type { ImagePickerAsset } from 'expo-image-picker';

import { ART_STYLES } from '@/features/art/constants';
import { useFamily } from '@/features/family/store/useFamily';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { generateImageViaGateway } from '@/features/creative/generateImageViaGateway';
import { buildArtRedrawPrompt } from '@/features/art/buildArtRedrawPrompt';
import { SkiaCanvas, exportCanvasAsDataUrl, DrawTool, DrawPath } from '@/features/art/SkiaCanvas';
import { DrawingToolbar } from '@/features/art/DrawingToolbar';
import { AiResultPanel } from '@/features/art/AiResultPanel';
import { useResponsiveLayout } from '@/features/kids-ui/useResponsiveLayout';
import { AikidButton, AikidIcon, AikidPage, AikidSafeBox } from '@/ui';
import { extractErrorMessage } from '@/core/api/unwrap';
import { AskParentCreditsModal } from '@/features/billing/components/AskParentCreditsModal';

export default function CanvasScreen() {
  const { style } = useLocalSearchParams<{ style: string }>();
  const router = useRouter();
  
  const activeChild = useFamily((s) => s.children.find(c => c.id === s.activeChildId));
  const displayName = activeChild?.name || 'Học sinh';
  const activeIpId = useWorkspace((s) => s.activeIpId);
  
  const layout = useResponsiveLayout();
  const isCompact = !layout.isTabletUp;

  // Canvas State
  // Do not import/use Skia runtime before WithSkiaWeb has loaded CanvasKit.
  const canvasRef = useRef<CanvasRef | null>(null);
  const [tool, setTool] = useState<DrawTool>('brush');
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(5);
  const [activeStamp, setActiveStamp] = useState<string>('⭐');
  const [backgroundDataUrl, setBackgroundDataUrl] = useState<string | null>(null);
  const [referenceDataUrl, setReferenceDataUrl] = useState<string | null>(null);
  
  // Path History
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const historyRef = useRef<DrawPath[][]>([]);
  const redoRef = useRef<DrawPath[][]>([]);
  
  const handlePathAdded = useCallback(() => {
    historyRef.current.push([...paths]);
    redoRef.current = [];
    if (historyRef.current.length > 30) {
      historyRef.current.shift();
    }
  }, [paths]);

  const handleUndo = useCallback(() => {
    if (historyRef.current.length > 0) {
      redoRef.current.push([...paths]);
      historyRef.current.pop();
      const prev = historyRef.current[historyRef.current.length - 1] || [];
      setPaths([...prev]);
    } else {
      setPaths([]);
    }
  }, [paths]);

  const handleRedo = useCallback(() => {
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push([...paths]);
    setPaths(next);
  }, [paths]);

  const handleClear = useCallback(() => {
    setPaths([]);
    historyRef.current = [];
    redoRef.current = [];
    setBackgroundDataUrl(null);
    setReferenceDataUrl(null);
  }, []);

  const assetToDataUrl = useCallback(async (asset: ImagePickerAsset) => {
    if (asset.base64) {
      return `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
    }
    if (Platform.OS === 'web') {
      // expo-image-picker exposes the original File on web. Reading it
      // directly is reliable on mobile browsers where temporary blob URLs may
      // be revoked as soon as the picker closes.
      const blob = asset.file || await (await fetch(asset.uri)).blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Không đọc được ảnh đã chọn'));
        reader.onload = () => resolve(String(reader.result || ''));
        reader.readAsDataURL(blob);
      });
    }
    return asset.uri;
  }, []);

  const applyPickedImage = useCallback(async (asset: ImagePickerAsset) => {
    const dataUrl = await assetToDataUrl(asset);
    setBackgroundDataUrl(dataUrl);
    setReferenceDataUrl(dataUrl);
    setPaths([]);
    historyRef.current = [];
    redoRef.current = [];
  }, [assetToDataUrl]);

  const handleUpload = useCallback(async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: Platform.OS !== 'web',
      quality: 0.8,
    });
    if (!r.canceled && r.assets[0]) {
      await applyPickedImage(r.assets[0]);
    }
  }, [applyPickedImage]);

  const handleCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền camera', 'Hãy cho phép truy cập camera để chụp ảnh.');
      return;
    }
    const r = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      base64: Platform.OS !== 'web',
      quality: 0.8,
    });
    if (!r.canceled && r.assets[0]) {
      await applyPickedImage(r.assets[0]);
    }
  }, [applyPickedImage]);

  const resolveReferenceDataUrl = useCallback(async () => {
    if (!referenceDataUrl) return null;
    if (referenceDataUrl.startsWith('data:')) return referenceDataUrl;
    if (Platform.OS !== 'web') return null;
    const response = await fetch(referenceDataUrl);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Không đọc được ảnh đã chọn'));
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(blob);
    });
  }, [referenceDataUrl]);

  // AI State
  const [aiState, setAiState] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [askParentOpen, setAskParentOpen] = useState(false);

  const styleConfig = ART_STYLES.find(s => s.id === style) ?? ART_STYLES[0];

  async function handleGenerate() {
    const dataUrl = exportCanvasAsDataUrl(canvasRef);
    if (!dataUrl && !referenceDataUrl) {
      Alert.alert('Canvas trống, hãy vẽ gì đó trước!');
      return;
    }
    setAiState('generating');
    try {
      const uploadedReference = await resolveReferenceDataUrl();
      const result = await generateImageViaGateway({
        userPrompt: buildArtRedrawPrompt(styleConfig, displayName),
        referenceDataUrl: uploadedReference || dataUrl,
        // Omit provider so the server-owned Admin route is the only authority.
        // The current default is GFlow first, then Vidtory SDK.
        childProfileId: activeChild?.id,
        ipId: activeIpId ?? undefined,
      });
      setAiImageUrl(result.imageUrl);
      setAiState('done');
    } catch (e: unknown) {
      setAiState('error');
      const err = extractErrorMessage(e, 'Không thể vẽ lại bằng AI. Vui lòng thử lại.');
      setErrorMsg(err);
      const lower = err.toLowerCase();
      if (lower.includes('lượt') || lower.includes('credit') || lower.includes('quota') || lower.includes('hết') || lower.includes('hạn mức')) {
        setAskParentOpen(true);
      }
    }
  }

  async function handleDownload() {
    if (!aiImageUrl) return;
    if (Platform.OS === 'web') {
      try {
        const response = await fetch(aiImageUrl);
        if (!response.ok) throw new Error('Không tải được ảnh');
        const blob = await response.blob();
        const extension = blob.type.includes('webp') ? 'webp' : blob.type.includes('jpeg') ? 'jpg' : 'png';
        const file = new File([blob], `aikid_${Date.now()}.${extension}`, {
          type: blob.type || 'image/png',
        });
        const shareData = { files: [file], title: 'Tác phẩm của con' };

        if (navigator.share && navigator.canShare?.(shareData)) {
          await navigator.share(shareData);
          return;
        }

        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = file.name;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      } catch (error) {
        // Closing the native share sheet is intentional; do not open another
        // download behind it.
        if (error instanceof DOMException && error.name === 'AbortError') return;
        window.open(aiImageUrl, '_blank');
      }
      return;
    }
    try {
      // Keep the native-only module out of the web route bundle.
      const MediaLibrary = await import('expo-media-library');
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') { 
        Alert.alert('Cần quyền lưu ảnh'); 
        return; 
      }
      const fileUri = `${FileSystem.documentDirectory}art_${Date.now()}.png`;
      await FileSystem.downloadAsync(aiImageUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('Đã lưu!', 'Ảnh đã lưu vào thư viện.');
    } catch { 
      Alert.alert('Lỗi tải ảnh'); 
    }
  }

  return (
    <AikidPage
      scene="art"
      title={displayName}
      backHref="/(app)/art/style-v2"
      container="workspace"
      scroll={isCompact}
    >
      <View style={[styles.workspace, isCompact && styles.workspaceCompact]}>
        <AikidSafeBox
          style={[
            styles.drawPanel,
            isCompact && styles.panelCompact,
          ]}
          variant="panel"
        >
          <View style={[styles.actionBar, isCompact && styles.actionBarCompact]}>
            <AikidButton fullWidth={isCompact} style={isCompact && styles.actionButtonCompact} variant="feature" size="sm" onPress={handleUpload} leftIcon={<AikidIcon name="upload" size={18} color="#704E48" />}>
              Tải lên
            </AikidButton>
            <AikidButton fullWidth={isCompact} style={isCompact && styles.actionButtonCompact} variant="feature" size="sm" onPress={handleCamera} leftIcon={<AikidIcon name="camera" size={18} color="#704E48" />}>
              Chụp ảnh
            </AikidButton>
            <AikidButton fullWidth={isCompact} style={isCompact && styles.actionButtonCompact} variant="feature" size="sm" onPress={handleClear} leftIcon={<AikidIcon name="trash" size={18} color="#704E48" />}>
              Xóa
            </AikidButton>
            <AikidButton fullWidth={isCompact} style={isCompact && styles.actionButtonCompact} variant="feature" size="sm" onPress={handleUndo} leftIcon={<AikidIcon name="undo" size={18} color="#704E48" />}>
              Hoàn tác
            </AikidButton>
            <AikidButton fullWidth={isCompact} style={isCompact && styles.actionButtonCompact} variant="feature" size="sm" onPress={handleRedo} leftIcon={<AikidIcon name="redo" size={18} color="#704E48" />}>
              Khôi phục
            </AikidButton>
          </View>

          <View style={[styles.editor, isCompact && styles.editorCompact]}>
            <DrawingToolbar
              orientation={isCompact ? 'horizontal' : 'vertical'}
              tool={tool}
              onToolChange={setTool}
              color={color}
              onColorChange={setColor}
              strokeWidth={strokeWidth}
              onStrokeWidthChange={setStrokeWidth}
              activeStamp={activeStamp}
              onStampChange={setActiveStamp}
            />
            <View
              style={[
                styles.canvasWrapper,
                isCompact && styles.canvasWrapperCompact,
                isCompact && { height: Math.max(280, layout.innerW - 32) },
              ]}
            >
            <SkiaCanvas
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              activeStamp={activeStamp}
              canvasRef={canvasRef}
              onPathAdded={handlePathAdded}
              backgroundDataUrl={backgroundDataUrl}
              paths={paths}
              setPaths={setPaths}
            />
          </View>
          </View>
        </AikidSafeBox>

        <AikidSafeBox style={[styles.resultPanel, isCompact && styles.panelCompact, isCompact && styles.resultPanelCompact]} variant="panel">
            <AiResultPanel
              styleName={styleConfig?.labelVi || 'Mặc định'}
              onGenerate={handleGenerate}
              aiState={aiState}
              aiImageUrl={aiImageUrl}
              onDownload={handleDownload}
              errorMessage={errorMsg}
              onChooseStyle={() => router.push('/(app)/art/style-v2')}
              onAskCredits={() => setAskParentOpen(true)}
            />
        </AikidSafeBox>
      </View>

      <AskParentCreditsModal
        isOpen={askParentOpen}
        onClose={() => setAskParentOpen(false)}
        studentName={displayName}
      />
    </AikidPage>
  );
}

const styles = StyleSheet.create({
  workspace: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
    minHeight: 0,
  },
  workspaceCompact: {
    flexDirection: 'column',
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
  },
  drawPanel: {
    flex: 1.05,
    padding: 16,
    minWidth: 0,
  },
  resultPanel: {
    flex: 0.95,
    padding: 0,
    minWidth: 0,
  },
  panelCompact: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: '100%',
  },
  resultPanelCompact: {
    minHeight: 460,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBDCD0',
  },
  actionBarCompact: {
    alignItems: 'stretch',
  },
  actionButtonCompact: {
    flexGrow: 1,
    flexBasis: '46%',
    alignSelf: 'stretch',
  },
  editor: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
  },
  editorCompact: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    flexDirection: 'column',
  },
  canvasWrapper: {
    flex: 1,
    backgroundColor: '#FDFAF4',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#EBDCD0',
  },
  canvasWrapperCompact: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: '100%',
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: '#D9BFAE',
    borderRadius: 14,
  },
});
