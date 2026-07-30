import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, TextInput, ScrollView, useWindowDimensions, Image, Platform, Alert, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { AikidButton, AikidIcon, AikidPage, AikidSafeBox } from '@/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePopSound } from '@/hooks/usePopSound';
import { buildCharacterJobPrompt, generateImageViaGateway } from '@/features/creative/generateImageViaGateway';
import { useFamily } from '@/features/family/store/useFamily';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { useRouter } from 'expo-router';
import { useCharacterDraft, type CharacterCategoryId } from '@/features/character';
import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '@/core/storymee';
import { resolveMediaUri } from '@/features/media/api/mediaHooks';

// ─── Data ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'shape',   label: 'Hình dáng' },
  { id: 'parts',   label: 'Bộ phận' },
  { id: 'face',    label: 'Đầu & mặt' },
  { id: 'hair',    label: 'Tóc & lông' },
  { id: 'clothes', label: 'Trang phục' },
];

const CATEGORY_QUESTIONS: Record<string, { label: string; placeholder: string }[]> = {
  shape: [
    { label: '1. HÌNH DÁNG', placeholder: 'Ví dụ: dáng vẻ tròn xoe, cao gầy, mũm mĩm...' },
    { label: '2. KẾT CẤU CƠ THỂ', placeholder: 'Ví dụ: tay chân ngắn, bụng tròn, lưng cong...' },
    { label: '3. KÍCH THƯỚC', placeholder: 'Ví dụ: tí hon, khổng lồ, cỡ vừa...' },
    { label: '4. DÁI TAI / ĐUÔI', placeholder: 'Ví dụ: tai thỏ dài, đuôi bông trắng...' },
    { label: '5. MÀU SẮC CƠ BẢN', placeholder: 'Ví dụ: màu cam, màu đen trắng pha...' },
    { label: '6. CHẤT LIỆU LÔNG DA', placeholder: 'Ví dụ: lông xù mềm mại, da mịn bóng...' },
  ],
  parts: [
    { label: '1. BỘ PHẬN ĐẶC TRƯNG', placeholder: 'Ví dụ: sừng nhọn, cánh bướm, vây cá...' },
    { label: '2. TAY VÀ CỬ CHỈ', placeholder: 'Ví dụ: tay ngắn có vuốt nhọn, tay dài nhỏ...' },
    { label: '3. CHÂN VÀ DI CHUYỂN', placeholder: 'Ví dụ: chân ếch nhỏ, chân to như gấu...' },
    { label: '4. PHỤ KIỆN ĐẶC BIỆT', placeholder: 'Ví dụ: túi marsupial, ba lô mini, đuôi phát sáng...' },
    { label: '5. ĐẶC ĐIỂM NỔI BẬT', placeholder: 'Ví dụ: có đốm, sọc vằn, vết thương anh hùng...' },
    { label: '6. CẢM GIÁC TỔNG THỂ', placeholder: 'Ví dụ: dễ thương, oai phong, bí ẩn, vui vẻ...' },
  ],
  face: [
    { label: '1. HÌNH DÁNG MẶT', placeholder: 'Ví dụ: mặt tròn, mặt trái xoan...' },
    { label: '2. ĐÔI MẮT', placeholder: 'Ví dụ: mắt to tròn lấp lánh, mắt híp...' },
    { label: '3. CÁI MŨI', placeholder: 'Ví dụ: mũi nhỏ xinh, mũi to buồn cười...' },
    { label: '4. CÁI MIỆNG', placeholder: 'Ví dụ: cười toe toét, miệng trái tim...' },
    { label: '5. LÔNG MÀY', placeholder: 'Ví dụ: lông mày cong đáng yêu, mày rậm...' },
    { label: '6. BIỂU CẢM', placeholder: 'Ví dụ: lúc nào cũng cười, mặt ngây thơ...' },
  ],
  hair: [
    { label: '1. KIỂU TÓC', placeholder: 'Ví dụ: tóc ngắn xoăn, tóc dài thẳng...' },
    { label: '2. MÀU TÓC', placeholder: 'Ví dụ: tóc vàng ánh mặt trời, tóc xanh ocean...' },
    { label: '3. ĐỘ DÀI TÓC', placeholder: 'Ví dụ: tóc ngắn trên cổ, dài chấm lưng...' },
    { label: '4. CHI TIẾT TÓC', placeholder: 'Ví dụ: tóc có highlight, tóc buộc nơ hồng...' },
    { label: '5. LÔNG CƠ THỂ', placeholder: 'Ví dụ: lông bụng trắng, lông mịn màu kem...' },
    { label: '6. ĐẦU VÀ TAI', placeholder: 'Ví dụ: tai nhọn, tai tròn mềm mại...' },
  ],
  clothes: [
    { label: '1. TRANG PHỤC CHÍNH', placeholder: 'Ví dụ: váy công chúa, áo siêu nhân...' },
    { label: '2. MÀU SẮC TRANG PHỤC', placeholder: 'Ví dụ: màu hồng phấn, xanh navy...' },
    { label: '3. PHỤ KIỆN', placeholder: 'Ví dụ: nơ hồng, khăn quàng, mũ phép thuật...' },
    { label: '4. GIÀY DÉP', placeholder: 'Ví dụ: giày thể thao, dép đi biển...' },
    { label: '5. HOẠ TIẾT', placeholder: 'Ví dụ: hoa nhỏ, sao, kẻ sọc...' },
    { label: '6. PHONG CÁCH', placeholder: 'Ví dụ: đáng yêu Kawaii, cổ trang, hiện đại...' },
  ],
};

// ─── Component ─────────────────────────────────────────────────────────────────
export default function GenerateV2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { playPop } = usePopSound();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [inputMode, setInputMode] = useState<'image' | 'text'>('image');
  const [activeCategory, setActiveCategory] = useState('shape');
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({
    shape: {}, parts: {}, face: {}, hair: {}, clothes: {},
  });
  const [quickAnswers, setQuickAnswers] = useState(['', '', '']);
  const [referenceDataUrl, setReferenceDataUrl] = useState<string | null>(null);
  const [referenceLabel, setReferenceLabel] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generateState, setGenerateState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [flowStep, setFlowStep] = useState<'compose' | 'result' | 'details' | 'profile'>('compose');
  const activeChild = useFamily((s) => s.getActiveChild());
  const ipId = useWorkspace((s) => s.getActiveIpId());
  const {
    draft,
    hydrate,
    setMeta,
    setAnswer,
    setIdeaShape,
    setGeneratedImageUri,
    saveCurrentToStorage,
  } = useCharacterDraft();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }, [flowStep]);

  const galleryQuery = useQuery({
    queryKey: ['character-reference-gallery', activeChild?.id, ipId],
    enabled: galleryOpen && Boolean(ipId),
    queryFn: () => mediaApi.listGallery({
      ipId,
      tag: activeChild?.id ? `child:${activeChild.id}` : undefined,
      limit: 40,
      offset: 0,
    }),
  });

  const galleryItems = (galleryQuery.data?.items ?? [])
    .map((item) => {
      const record = item as Record<string, unknown>;
      const uri = resolveMediaUri(String(record.imageUrl || record.previewUrl || record.driveUrl || record.url || ''));
      return uri ? { id: String(record.id || uri), uri } : null;
    })
    .filter((item): item is { id: string; uri: string } => item !== null);

  const toggleMode = () => { playPop(); setInputMode(prev => prev === 'image' ? 'text' : 'image'); };
  const handleAnswerChange = (index: number, text: string) => {
    setAnswers(prev => ({ ...prev, [activeCategory]: { ...prev[activeCategory], [index]: text } }));
  };

  const handleUpload = async () => {
    playPop();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: Platform.OS !== 'web',
      quality: 0.7,
    });
    const asset = !result.canceled ? result.assets[0] : null;
    if (asset) {
      setReferenceDataUrl(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
      setReferenceLabel(asset.fileName || 'Ảnh từ thiết bị');
    }
  };

  const resolveReferenceDataUrl = async () => {
    if (!referenceDataUrl) return null;
    if (referenceDataUrl.startsWith('data:')) return referenceDataUrl;
    if (Platform.OS !== 'web') return null;
    const response = await fetch(referenceDataUrl);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Không đọc được ảnh phác họa'));
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(blob);
    });
  };

  const getPromptParts = () => {
    const detailed = Object.values(answers)
      .flatMap((group) => Object.values(group))
      .map((value) => value.trim())
      .filter(Boolean);
    return inputMode === 'image'
      ? quickAnswers.map((value) => value.trim()).filter(Boolean)
      : detailed;
  };

  const buildPromptPreview = () => {
    const parts = getPromptParts();
    return parts.length
      ? `Thiết kế nhân vật thiếu nhi theo mô tả: ${parts.join('. ')}`
      : '';
  };

  const buildPrompt = () => {
    const preview = buildPromptPreview();
    return buildCharacterJobPrompt(
      preview || 'Thiết kế một nhân vật thiếu nhi đáng yêu, thân thiện và giàu biểu cảm.',
    );
  };

  const handleGenerate = async () => {
    if (generateState === 'loading') return;
    playPop();
    setGenerateState('loading');
    try {
      const resolvedReference = await resolveReferenceDataUrl();
      const result = await generateImageViaGateway({
        userPrompt: buildPrompt(),
        referenceDataUrl: resolvedReference?.startsWith('data:') ? resolvedReference : undefined,
        referenceHttpsUrl: resolvedReference?.startsWith('http') ? resolvedReference : undefined,
        childProfileId: activeChild?.id,
        ipId: ipId ?? undefined,
      });
      setGeneratedImageUrl(result.imageUrl);
      setGeneratedImageUri(result.imageUrl);
      if (inputMode === 'image') {
        setIdeaShape(quickAnswers.filter(Boolean).join('. '));
      } else {
        Object.entries(answers).forEach(([category, group]) => {
          Object.entries(group).forEach(([index, value]) => {
            if (value.trim()) setAnswer(category as CharacterCategoryId, Number(index), value);
          });
        });
      }
      setGenerateState('idle');
      setFlowStep('result');
    } catch (error) {
      setGenerateState('error');
      Alert.alert('Không tạo được nhân vật', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    }
  };

  const handleDownload = async () => {
    playPop();
    if (!generatedImageUrl) {
      Alert.alert('Chưa có ảnh', 'Hãy tạo nhân vật trước khi tải về.');
      return;
    }
    if (Platform.OS === 'web') {
      window.open(generatedImageUrl, '_blank');
      return;
    }
    try {
      const MediaLibrary = await import('expo-media-library');
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Cần quyền lưu ảnh', 'Hãy cho phép truy cập thư viện ảnh.');
        return;
      }
      const fileUri = `${FileSystem.documentDirectory}character-${Date.now()}.png`;
      await FileSystem.downloadAsync(generatedImageUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('Đã tải về', 'Nhân vật đã được lưu vào thư viện ảnh.');
    } catch {
      Alert.alert('Không tải được ảnh', 'Vui lòng thử lại.');
    }
  };

  const handleEditResult = () => {
    playPop();
    if (generatedImageUrl) {
      setReferenceDataUrl(generatedImageUrl);
      setReferenceLabel('Kết quả vừa tạo');
    }
    setFlowStep('compose');
    setGenerateState('idle');
  };

  const handleSaveCharacter = async () => {
    if (!draft.name.trim()) {
      Alert.alert('Chưa có tên', 'Bé hãy đặt tên cho nhân vật trước khi lưu nhé!');
      return;
    }
    playPop();
    await saveCurrentToStorage(activeChild?.id);
    router.replace('/(app)/character/storage-v2');
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const TabsRow = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsBar}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeCategory === tab.id && styles.tabActive]}
          onPress={() => { playPop(); setActiveCategory(tab.id); }}
        >
          <Text style={[styles.tabText, activeCategory === tab.id && styles.tabTextActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const SectionHeader = ({ onReset }: { onReset: () => void }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitle}>
        <Ionicons name="bulb" size={16} color="#FF7597" />
        <Text style={styles.sectionTitleText}>Ý TƯỞNG CỦA EM</Text>
      </View>
      <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
        <Ionicons name="refresh" size={13} color="#4A3D3C" />
        <Text style={styles.resetBtnText}>Làm lại</Text>
      </TouchableOpacity>
    </View>
  );

  const ModeSelector = () => (
    <View style={styles.modeSelector}>
      <View style={styles.modeHeading}>
        <Text style={styles.modeTitle}>Cách tạo nhân vật</Text>
        <Text style={styles.modeHint}>Chọn một cách để bắt đầu ý tưởng</Text>
      </View>
      <View style={styles.modeOptions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: inputMode === 'image' }}
          onPress={() => {
            if (inputMode !== 'image') toggleMode();
          }}
          style={[styles.modeOption, inputMode === 'image' && styles.modeOptionActive]}
        >
          <AikidIcon name="image" size={17} color={inputMode === 'image' ? '#FFF' : '#8A7463'} />
          <Text style={[styles.modeOptionText, inputMode === 'image' && styles.modeOptionTextActive]}>Ảnh tham khảo</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: inputMode === 'text' }}
          onPress={() => {
            if (inputMode !== 'text') toggleMode();
          }}
          style={[styles.modeOption, inputMode === 'text' && styles.modeOptionActive]}
        >
          <AikidIcon name="pencil" size={17} color={inputMode === 'text' ? '#FFF' : '#8A7463'} />
          <Text style={[styles.modeOptionText, inputMode === 'text' && styles.modeOptionTextActive]}>Mô tả chi tiết</Text>
        </Pressable>
      </View>
    </View>
  );

  const ReferencePicker = () => (
    <View style={styles.referenceBox}>
      <View style={styles.referenceHeader}>
        <View>
          <Text style={styles.referenceTitle}>Ảnh tham khảo</Text>
          <Text style={styles.referenceHint}>Chọn một nguồn ảnh để định hướng thiết kế</Text>
        </View>
        {referenceDataUrl ? (
          <Pressable
            onPress={() => {
              setReferenceDataUrl(null);
              setReferenceLabel(null);
            }}
          >
            <Text style={styles.referenceRemove}>Xóa ảnh</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.referenceSources}>
        <Pressable
          disabled={!generatedImageUrl}
          onPress={() => {
            if (!generatedImageUrl) return;
            playPop();
            setReferenceDataUrl(generatedImageUrl);
            setReferenceLabel('Kết quả vừa tạo');
          }}
          style={[styles.referenceSource, !generatedImageUrl && styles.referenceSourceDisabled]}
        >
          <Ionicons name="sparkles-outline" size={19} color="#FF5E97" />
          <Text style={styles.referenceSourceText}>Kết quả hiện tại</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            playPop();
            setGalleryOpen(true);
          }}
          style={styles.referenceSource}
        >
          <Ionicons name="images-outline" size={19} color="#FF5E97" />
          <Text style={styles.referenceSourceText}>Gallery</Text>
        </Pressable>
        <Pressable onPress={() => void handleUpload()} style={styles.referenceSource}>
          <Ionicons name="cloud-upload-outline" size={19} color="#FF5E97" />
          <Text style={styles.referenceSourceText}>Tải từ máy</Text>
        </Pressable>
      </View>
      {referenceDataUrl ? (
        <View style={styles.referencePreview}>
          <Image source={{ uri: referenceDataUrl }} style={styles.referencePreviewImage} resizeMode="contain" />
          <View style={styles.referencePreviewInfo}>
            <Text style={styles.referenceSelected}>ĐÃ CHỌN</Text>
            <Text style={styles.referenceFileName} numberOfLines={1}>{referenceLabel || 'Ảnh tham khảo'}</Text>
            <Text style={styles.referencePreviewHint}>Ảnh này sẽ được dùng cho phiên bản tiếp theo.</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.referenceEmpty}>Chưa chọn ảnh tham khảo. Bạn vẫn có thể tạo nhân vật chỉ bằng mô tả.</Text>
      )}
    </View>
  );

  const FlowProgress = () => {
    const steps = [
      ['compose', 'Ý tưởng', 'Mô tả ngoại hình và phong cách nhân vật'],
      ['result', 'Tạo hình', 'Xem kết quả và điều chỉnh thiết kế'],
      ['details', 'Đặc điểm', 'Bổ sung tên, tính cách và thông tin'],
      ['profile', 'Hồ sơ', 'Kiểm tra và lưu nhân vật'],
    ] as const;
    const currentIndex = steps.findIndex(([id]) => id === flowStep);
    return (
      <View style={styles.flowNavigator}>
        <View style={styles.flowProgress}>
          {steps.map(([id, label], index) => {
            const completed = index < currentIndex;
            const active = index === currentIndex;
            const accessible = index <= currentIndex;
            return (
              <Pressable
                key={id}
                disabled={!accessible}
                accessibilityRole="button"
                accessibilityState={{ disabled: !accessible, selected: active }}
                accessibilityLabel={`Bước ${index + 1}: ${label}`}
                onPress={() => {
                  if (!accessible || id === flowStep) return;
                  playPop();
                  setFlowStep(id);
                }}
                style={styles.flowProgressItem}
              >
                <View style={[styles.flowDot, completed && styles.flowDotCompleted, active && styles.flowDotActive]}>
                  {completed ? (
                    <Ionicons name="checkmark" size={17} color="#FFF" />
                  ) : (
                    <Text style={[styles.flowDotText, active && styles.flowDotTextActive]}>{index + 1}</Text>
                  )}
                </View>
                <Text style={[styles.flowLabel, completed && styles.flowLabelCompleted, active && styles.flowLabelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.currentStepCard}>
          <Text style={styles.currentStepEyebrow}>BƯỚC {currentIndex + 1}/4 · {steps[currentIndex][1].toUpperCase()}</Text>
          <Text style={styles.currentStepDescription}>{steps[currentIndex][2]}</Text>
        </View>
      </View>
    );
  };

  const ResultFlow = () => (
    <ScrollView contentContainerStyle={styles.flowScroll} showsVerticalScrollIndicator={false}>
      <AikidSafeBox variant="panel" style={styles.flowCard}>
        {flowStep === 'result' ? (
          <>
            <View style={styles.stageHeader}>
              <View style={styles.stageIcon}>
                <Ionicons name="sparkles" size={22} color="#FF5E97" />
              </View>
              <View style={styles.stageHeaderText}>
                <Text style={styles.flowTitle}>Thiết kế nhân vật</Text>
                <Text style={styles.flowDescription}>Kiểm tra kết quả, điều chỉnh ý tưởng nếu cần hoặc tiếp tục hoàn thiện nhân vật.</Text>
              </View>
            </View>
            <View style={[styles.resultWorkspace, !isTablet && styles.resultWorkspaceMobile]}>
              <View style={styles.resultPreviewPanel}>
                <Text style={styles.resultSectionLabel}>KẾT QUẢ TẠO HÌNH</Text>
                {generatedImageUrl ? <Image source={{ uri: generatedImageUrl }} style={styles.flowImage} resizeMode="contain" /> : null}
              </View>
              <View style={styles.resultDecisionPanel}>
                <Text style={styles.resultDecisionTitle}>Bạn muốn làm gì tiếp theo?</Text>
                <Text style={styles.resultDecisionDescription}>
                  Điều chỉnh mô tả để tạo lại, hoặc giữ thiết kế này và bổ sung thông tin nhân vật.
                </Text>
                <View style={styles.resultChecklist}>
                  <Text style={styles.resultChecklistItem}>✓ Ngoại hình phù hợp với ý tưởng</Text>
                  <Text style={styles.resultChecklistItem}>✓ Nhân vật hiển thị rõ ràng</Text>
                  <Text style={styles.resultChecklistItem}>✓ Sẵn sàng bổ sung đặc điểm</Text>
                </View>
                <View style={styles.resultActions}>
                  <AikidButton fullWidth variant="feature" onPress={handleEditResult} leftIcon={<AikidIcon name="pencil" size={18} />}>Điều chỉnh thiết kế</AikidButton>
                  <AikidButton fullWidth variant="cta" onPress={() => { playPop(); setFlowStep('details'); }}>Bổ sung đặc điểm</AikidButton>
                </View>
              </View>
            </View>
          </>
        ) : null}

        {flowStep === 'details' ? (
          <>
            <View style={styles.stageHeader}>
              <View style={styles.stageIcon}>
                <Ionicons name="person-circle-outline" size={24} color="#FF5E97" />
              </View>
              <View style={styles.stageHeaderText}>
                <Text style={styles.flowTitle}>Đặc điểm nhân vật</Text>
                <Text style={styles.flowDescription}>Quan sát thiết kế và bổ sung thông tin để nhân vật có cá tính nhất quán.</Text>
              </View>
            </View>
            <View style={[styles.detailsWorkspace, !isTablet && styles.detailsWorkspaceMobile]}>
              <View style={styles.detailsPreviewPanel}>
                <Text style={styles.resultSectionLabel}>NHÂN VẬT ĐANG HOÀN THIỆN</Text>
                {generatedImageUrl ? (
                  <Image source={{ uri: generatedImageUrl }} style={styles.detailsImage} resizeMode="contain" />
                ) : (
                  <View style={styles.detailsImageEmpty}>
                    <Ionicons name="image-outline" size={42} color="#C8B5A7" />
                    <Text style={styles.referenceEmpty}>Chưa có ảnh tạo hình</Text>
                  </View>
                )}
                <View style={styles.detailsObservation}>
                  <Ionicons name="eye-outline" size={17} color="#FF5E97" />
                  <Text style={styles.detailsObservationText}>
                    Quan sát ngoại hình để đặt tên, tính cách và câu chuyện phù hợp.
                  </Text>
                </View>
              </View>
              <View style={styles.detailsFormPanel}>
                <Text style={styles.detailsFormTitle}>Thông tin nhân vật</Text>
                <View style={styles.detailsField}>
                  <Text style={styles.detailsFieldLabel}>TÊN NHÂN VẬT</Text>
                  <TextInput style={styles.detailsInput} value={draft.name} onChangeText={(name) => setMeta({ name })} placeholder="Ví dụ: Mèo Mây" placeholderTextColor="#A3A3A3" />
                </View>
                <View style={styles.detailsField}>
                  <Text style={styles.detailsFieldLabel}>LOÀI / KIỂU NHÂN VẬT</Text>
                  <TextInput style={styles.detailsInput} value={draft.species} onChangeText={(species) => setMeta({ species })} placeholder="Ví dụ: mèo phép thuật" placeholderTextColor="#A3A3A3" />
                </View>
                <View style={styles.flowFieldRow}>
                  <View style={[styles.flowField, styles.detailsField]}>
                    <Text style={styles.detailsFieldLabel}>TUỔI</Text>
                    <TextInput style={styles.detailsInput} value={draft.age} onChangeText={(age) => setMeta({ age })} placeholder="Ví dụ: 8" placeholderTextColor="#A3A3A3" keyboardType="number-pad" />
                  </View>
                  <View style={[styles.flowField, styles.detailsField]}>
                    <Text style={styles.detailsFieldLabel}>NGÀY SINH</Text>
                    <TextInput style={styles.detailsInput} value={draft.birthday} onChangeText={(birthday) => setMeta({ birthday })} placeholder="DD/MM" placeholderTextColor="#A3A3A3" />
                  </View>
                  <View style={[styles.flowField, styles.detailsField]}>
                    <Text style={styles.detailsFieldLabel}>GIỚI TÍNH</Text>
                    <TextInput style={styles.detailsInput} value={draft.gender} onChangeText={(gender) => setMeta({ gender })} placeholder="Nam, Nữ hoặc Khác" placeholderTextColor="#A3A3A3" />
                  </View>
                </View>
                <View style={styles.detailsField}>
                  <Text style={styles.detailsFieldLabel}>TÍNH CÁCH & SỞ THÍCH</Text>
                  <TextInput style={[styles.detailsInput, styles.detailsTextArea]} value={draft.description} onChangeText={(description) => setMeta({ description })} placeholder="Ví dụ: vui vẻ, dũng cảm, thích khám phá..." placeholderTextColor="#A3A3A3" multiline />
                </View>
                <View style={styles.detailsActions}>
                  <AikidButton fullWidth variant="feature" onPress={() => setFlowStep('result')}>Quay lại Tạo hình</AikidButton>
                  <AikidButton fullWidth variant="cta" onPress={() => { playPop(); setFlowStep('profile'); }}>Xem hồ sơ</AikidButton>
                </View>
              </View>
            </View>
          </>
        ) : null}

        {flowStep === 'profile' ? (
          <>
            <View style={styles.stageHeader}>
              <View style={styles.stageIcon}>
                <Ionicons name="id-card-outline" size={23} color="#FF5E97" />
              </View>
              <View style={styles.stageHeaderText}>
                <Text style={styles.flowTitle}>Hồ sơ nhân vật</Text>
                <Text style={styles.flowDescription}>Kiểm tra thông tin lần cuối trước khi lưu nhân vật vào kho.</Text>
              </View>
            </View>
            <View style={styles.profileCard}>
              <Text style={styles.profileEyebrow}>NHÂN VẬT CỦA EM</Text>
              <View style={styles.profileImageFrame}>
                {generatedImageUrl ? (
                  <Image source={{ uri: generatedImageUrl }} style={styles.profileImage} resizeMode="contain" />
                ) : (
                  <Ionicons name="image-outline" size={48} color="#C8B5A7" />
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{draft.name || 'Nhân vật chưa đặt tên'}</Text>
                <View style={styles.profileMetaBadge}>
                  <Text style={styles.profileMeta}>
                    {[draft.species, draft.gender, draft.age ? `${draft.age} tuổi` : '', draft.birthday ? `Sinh ${draft.birthday}` : ''].filter(Boolean).join(' · ') || 'Nhân vật mới'}
                  </Text>
                </View>
                {draft.description ? (
                  <View style={styles.profileDescriptionBox}>
                    <Ionicons name="sparkles-outline" size={17} color="#FF5E97" />
                    <Text style={styles.profileDescription}>{draft.description}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.profileActions}>
                <AikidButton variant="feature" onPress={() => setFlowStep('details')}>Chỉnh thông tin</AikidButton>
                <AikidButton variant="cta" onPress={() => void handleSaveCharacter()} leftIcon={<AikidIcon name="save" size={18} color="#FFF" />}>Lưu vào kho</AikidButton>
              </View>
              <AikidButton variant="feature" size="sm" onPress={() => router.replace('/(app)/character')}>Thoát không lưu</AikidButton>
            </View>
          </>
        ) : null}
      </AikidSafeBox>
    </ScrollView>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <AikidPage
      scene="character"
      title="Tạo nhân vật"
      backHref="/(app)/character"
      container="workspace"
      scroll={false}
      keyboardAware
      backgroundSource={require('../../../public/lobby-assets/images/bg-character-feature.png')}
      backgroundOverlayOpacity={0}
    >
      <FlowProgress />
      {flowStep !== 'compose' ? (
        ResultFlow()
      ) : isTablet ? (
        /* ════════════════ TABLET: 2 panel ngang ════════════════ */
        <View style={[styles.tabletWrapper, { paddingBottom: insets.bottom + 16 }]}>

          {/* Left panel */}
          <AikidSafeBox variant="panel" style={[styles.panel, styles.panelDraw]}>
            <ModeSelector />
            {inputMode === 'image' ? (
              <View style={{ flex: 1, gap: 14 }}>
                {/* Ideas */}
                <View>
                  <SectionHeader onReset={() => playPop()} />
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {[
                      { l: '1. MÔ TẢ HÌNH DÁNG', p: 'Ví dụ: con mèo màu cam tròn xoe...' },
                      { l: '2. TRANG PHỤC & PHỤ KIỆN', p: 'Ví dụ: đeo nơ màu hồng...' },
                      { l: '3. CẢM GIÁC TỔNG THỂ', p: 'Ví dụ: đáng yêu, mạnh mẽ...' },
                    ].map((q, i) => (
                      <View key={i} style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{q.l}</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder={q.p}
                          placeholderTextColor="#A3A3A3"
                          multiline
                          value={quickAnswers[i]}
                          onChangeText={(value) => setQuickAnswers((current) => current.map((item, index) => index === i ? value : item))}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
                <ReferencePicker />
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <SectionHeader onReset={() => { playPop(); setAnswers({ shape: {}, parts: {}, face: {}, hair: {}, clothes: {} }); }} />
                <TabsRow />
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      {CATEGORY_QUESTIONS[activeCategory].slice(0, 3).map((q, i) => (
                        <View key={i} style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>{q.label}</Text>
                          <TextInput style={styles.textInput} placeholder={q.placeholder} placeholderTextColor="#A3A3A3" multiline value={answers[activeCategory]?.[i] || ''} onChangeText={t => handleAnswerChange(i, t)} />
                        </View>
                      ))}
                    </View>
                    <View style={{ flex: 1 }}>
                      {CATEGORY_QUESTIONS[activeCategory].slice(3, 6).map((q, i) => (
                        <View key={i + 3} style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>{q.label}</Text>
                          <TextInput style={styles.textInput} placeholder={q.placeholder} placeholderTextColor="#A3A3A3" multiline value={answers[activeCategory]?.[i + 3] || ''} onChangeText={t => handleAnswerChange(i + 3, t)} />
                        </View>
                      ))}
                    </View>
                  </View>
                </ScrollView>
              </View>
            )}

          </AikidSafeBox>

          {/* Right panel: AI */}
          <AikidSafeBox variant="panel" style={[styles.panel, styles.panelAi]}>
            <View style={styles.panelHeaderRow}>
              <AikidButton variant="feature" size="sm" onPress={() => void handleDownload()} leftIcon={<AikidIcon name="download" size={18} />}>
                Tải về
              </AikidButton>
            </View>

            <View style={[styles.promptBox, { marginTop: 0, marginBottom: 14 }]}>
              <View style={styles.formulaBanner}>
                <Ionicons name="star" size={12} color="#FF5C8A" />
                <Text style={styles.formulaText}>
                  {inputMode === 'image'
                    ? 'Tổng hợp: [Hình dáng] + [Trang phục] + [Cảm giác]'
                    : 'Tổng hợp: [Hình dáng] + [Bộ phận] + [Khuôn mặt] + [Tóc/lông] + [Trang phục]'}
                </Text>
              </View>
              <Text style={[styles.promptDisplayText, { marginTop: 6 }]}>
                {buildPromptPreview() || 'Prompt sẽ được tổng hợp tự động từ nội dung bạn nhập.'}
              </Text>
            </View>

            <View style={styles.aiViewport}>
              {generatedImageUrl ? (
                <Image source={{ uri: generatedImageUrl }} style={styles.generatedImage} resizeMode="contain" />
              ) : (
              <View style={styles.aiPlaceholder}>
                <Ionicons name="color-wand" size={58} color="#FF5C8A" style={{ marginBottom: 16 }} />
                <Text style={styles.aiPlaceholderText}>
                  {generatedImageUrl ? 'Điều chỉnh mô tả hoặc ảnh tham khảo rồi tạo một phiên bản mới.' : 'Hoàn thiện ý tưởng rồi tạo nhân vật đầu tiên.'}
                </Text>
              </View>
              )}
            </View>
            <View style={styles.editFlowActions}>
              <AikidButton
                variant="cta"
                size="lg"
                onPress={handleGenerate}
                loading={generateState === 'loading'}
                leftIcon={<AikidIcon name="wand" size={20} color="#FFF" />}
                fullWidth
              >
                {generatedImageUrl ? 'TẠO PHIÊN BẢN MỚI' : 'TẠO NHÂN VẬT'}
              </AikidButton>
              {generatedImageUrl ? (
                <AikidButton
                  variant="encourage"
                  size="lg"
                  fullWidth
                  onPress={() => {
                    playPop();
                    setFlowStep('details');
                  }}
                >
                  GIỮ THIẾT KẾ NÀY · TIẾP TỤC
                </AikidButton>
              ) : null}
            </View>
          </AikidSafeBox>
        </View>
      ) : (
        /* ════════════════ MOBILE: ScrollView 1 cột ════════════════ */
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.mobileScroll, { paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Input card */}
          <View style={styles.modeCard}>
            <ModeSelector />
          </View>
          {inputMode === 'image' ? (
            <View style={styles.mobileCard}>
              <SectionHeader onReset={() => playPop()} />
              {[
                { l: '1. MÔ TẢ HÌNH DÁNG CỦA NHÂN VẬT', p: 'Ví dụ: con mèo màu cam tròn xoe...' },
                { l: '2. TRANG PHỤC & PHỤ KIỆN', p: 'Ví dụ: đeo nơ màu hồng, mặc đồ siêu nhân...' },
                { l: '3. TỔNG THỂ NHÂN VẬT TẠO CẢM GIÁC GÌ?', p: 'Ví dụ: đáng yêu, mạnh mẽ, tinh nghịch...' },
              ].map((q, i) => (
                <View key={i} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{q.l}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={q.p}
                    placeholderTextColor="#A3A3A3"
                    multiline
                    value={quickAnswers[i]}
                    onChangeText={(value) => setQuickAnswers((current) => current.map((item, index) => index === i ? value : item))}
                  />
                </View>
              ))}
              <ReferencePicker />
            </View>
          ) : (
            <View style={styles.mobileCard}>
              <SectionHeader onReset={() => { playPop(); setAnswers({ shape: {}, parts: {}, face: {}, hair: {}, clothes: {} }); }} />
              <TabsRow />
              {CATEGORY_QUESTIONS[activeCategory].map((q, i) => (
                <View key={i} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{q.label}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={q.placeholder}
                    placeholderTextColor="#A3A3A3"
                    multiline
                    value={answers[activeCategory]?.[i] || ''}
                    onChangeText={t => handleAnswerChange(i, t)}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Prompt box */}
          <View style={styles.promptBoxMobile}>
            <View style={styles.formulaBanner}>
              <Ionicons name="star" size={12} color="#FF5C8A" />
              <Text style={styles.formulaText}>
                {inputMode === 'image'
                  ? 'Tổng hợp: [Hình dáng] + [Trang phục] + [Cảm giác]'
                  : 'Tổng hợp: [Hình dáng] + [Bộ phận] + [Khuôn mặt] + [Tóc/lông] + [Trang phục]'}
              </Text>
            </View>
            <Text style={[styles.promptDisplayText, { marginTop: 6 }]}>
              {buildPromptPreview() || 'Prompt sẽ được tổng hợp tự động từ nội dung bạn nhập.'}
            </Text>
          </View>

          {/* AI panel */}
          <View style={styles.mobileCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 14 }}>
              <AikidButton variant="feature" size="sm" onPress={() => void handleDownload()} leftIcon={<AikidIcon name="download" size={18} />}>
                Tải về
              </AikidButton>
            </View>
            <View style={styles.aiViewportMobile}>
              {generatedImageUrl ? (
                <Image source={{ uri: generatedImageUrl }} style={styles.generatedImage} resizeMode="contain" />
              ) : (
                <>
              <Ionicons name="color-wand" size={46} color="#FF5C8A" style={{ marginBottom: 10 }} />
              <Text style={styles.aiPlaceholderText}>
                {generatedImageUrl ? 'Điều chỉnh mô tả hoặc ảnh tham khảo rồi tạo một phiên bản mới.' : 'Hoàn thiện ý tưởng rồi tạo nhân vật đầu tiên.'}
              </Text>
                </>
              )}
            </View>
            <View style={styles.editFlowActions}>
              <AikidButton
                variant="cta"
                size="lg"
                onPress={handleGenerate}
                loading={generateState === 'loading'}
                leftIcon={<AikidIcon name="wand" size={20} color="#FFF" />}
                fullWidth
              >
                {generatedImageUrl ? 'TẠO PHIÊN BẢN MỚI' : 'TẠO NHÂN VẬT'}
              </AikidButton>
              {generatedImageUrl ? (
                <AikidButton
                  variant="encourage"
                  size="lg"
                  fullWidth
                  onPress={() => {
                    playPop();
                    setFlowStep('details');
                  }}
                >
                  GIỮ THIẾT KẾ NÀY · TIẾP TỤC
                </AikidButton>
              ) : null}
            </View>
          </View>
        </ScrollView>
      )}
      <Modal visible={galleryOpen} transparent animationType="fade" onRequestClose={() => setGalleryOpen(false)}>
        <View style={styles.galleryOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setGalleryOpen(false)} />
          <View style={styles.galleryModal}>
            <View style={styles.galleryModalHeader}>
              <View>
                <Text style={styles.galleryModalTitle}>Chọn ảnh từ Gallery</Text>
                <Text style={styles.galleryModalDescription}>Ảnh được dùng làm tham khảo, không thay đổi bản gốc.</Text>
              </View>
              <Pressable onPress={() => setGalleryOpen(false)} style={styles.galleryClose}>
                <Ionicons name="close" size={22} color="#475569" />
              </Pressable>
            </View>
            {galleryQuery.isLoading ? (
              <ActivityIndicator size="large" color="#FF5E97" style={{ marginVertical: 48 }} />
            ) : galleryItems.length ? (
              <ScrollView contentContainerStyle={styles.galleryGrid}>
                {galleryItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      playPop();
                      setReferenceDataUrl(item.uri);
                      setReferenceLabel('Ảnh từ Gallery');
                      setGalleryOpen(false);
                    }}
                    style={styles.galleryItem}
                  >
                    <Image source={{ uri: item.uri }} style={styles.galleryImage} resizeMode="cover" />
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.galleryEmpty}>
                <Ionicons name="images-outline" size={42} color="#C8B5A7" />
                <Text style={styles.galleryEmptyTitle}>Gallery chưa có ảnh</Text>
                <Text style={styles.galleryEmptyDescription}>Bạn có thể tải ảnh từ thiết bị để tiếp tục.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </AikidPage>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#fad698' },

  flowScroll: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingBottom: 32,
  },
  flowNavigator: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    marginBottom: 14,
    zIndex: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(255,250,245,0.96)',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: '#8A7463',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 8,
      } as any,
      default: {},
    }),
  },
  flowProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: 4,
  },
  flowProgressItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  flowDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBDCD0',
  },
  flowDotActive: { backgroundColor: '#FF5E97' },
  flowDotCompleted: { backgroundColor: '#48BB78' },
  flowDotText: { color: '#8A7463', fontWeight: '800' },
  flowDotTextActive: { color: '#FFF' },
  flowLabel: { color: '#8A7463', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  flowLabelActive: { color: '#FF5E97' },
  flowLabelCompleted: { color: '#2F855A' },
  currentStepCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3D9DF',
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  currentStepEyebrow: {
    color: '#FF5E97',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  currentStepDescription: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 2,
  },
  flowCard: {
    width: '100%',
    alignItems: 'stretch',
    padding: 22,
  },
  stageHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EBDCD0',
  },
  stageIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F3',
  },
  stageHeaderText: {
    flex: 1,
  },
  flowTitle: {
    color: '#475569',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'left',
    marginBottom: 6,
  },
  flowDescription: {
    color: '#8A7463',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'left',
  },
  resultWorkspace: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 18,
  },
  resultWorkspaceMobile: {
    flexDirection: 'column',
  },
  resultPreviewPanel: {
    flex: 1.35,
    minWidth: 0,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#EBDCD0',
    backgroundColor: '#FFF',
    padding: 12,
  },
  resultSectionLabel: {
    color: '#8A7463',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 9,
  },
  resultDecisionPanel: {
    flex: 0.85,
    minWidth: 230,
    borderRadius: 22,
    backgroundColor: '#FFF8F2',
    padding: 18,
    justifyContent: 'center',
  },
  resultDecisionTitle: {
    color: '#475569',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 7,
  },
  resultDecisionDescription: {
    color: '#8A7463',
    fontSize: 13,
    lineHeight: 19,
  },
  resultChecklist: {
    gap: 7,
    marginTop: 16,
  },
  resultChecklistItem: {
    color: '#4A6B5A',
    fontSize: 12,
    fontWeight: '700',
  },
  resultActions: {
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  detailsWorkspace: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 18,
  },
  detailsWorkspaceMobile: {
    flexDirection: 'column',
  },
  detailsPreviewPanel: {
    flex: 0.85,
    minWidth: 240,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#EBDCD0',
    backgroundColor: '#FFF',
    padding: 12,
  },
  detailsImage: {
    width: '100%',
    height: 360,
    borderRadius: 18,
    backgroundColor: '#FFF8F2',
  },
  detailsImageEmpty: {
    height: 250,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF8F2',
  },
  detailsObservation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    borderRadius: 13,
    backgroundColor: '#FFF0F3',
    padding: 10,
    marginTop: 10,
  },
  detailsObservationText: {
    flex: 1,
    color: '#704E48',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  detailsFormPanel: {
    flex: 1.15,
    minWidth: 0,
    borderRadius: 22,
    backgroundColor: '#FFF8F2',
    padding: 18,
  },
  detailsFormTitle: {
    color: '#475569',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 13,
  },
  detailsField: {
    width: '100%',
    gap: 6,
    marginBottom: 12,
  },
  detailsFieldLabel: {
    color: '#8A7463',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  detailsInput: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: '#EBDCD0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
    textAlignVertical: 'center',
  },
  detailsTextArea: {
    minHeight: 112,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  detailsActions: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  flowImage: {
    width: '100%',
    height: 390,
    borderRadius: 24,
    backgroundColor: '#FFF',
  },
  flowActions: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  flowTextArea: {
    minHeight: 100,
    marginBottom: 12,
  },
  flowFieldRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 12,
  },
  flowField: {
    flex: 1,
    minWidth: 180,
  },
  profileCard: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EBDCD0',
    borderRadius: 28,
    backgroundColor: '#FFF8F2',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  profileEyebrow: {
    color: '#A18D7F',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  profileImageFrame: {
    width: 250,
    maxWidth: '100%',
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: '#FFFFFF',
    borderRadius: 34,
    backgroundColor: '#FFF',
    shadowColor: '#8A7463',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
  },
  profileName: {
    color: '#475569',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 34,
  },
  profileMetaBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 8,
  },
  profileMeta: {
    color: '#FF5E97',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
  },
  profileDescriptionBox: {
    width: '100%',
    maxWidth: 500,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginTop: 14,
  },
  profileDescription: {
    flexShrink: 1,
    color: '#8A7463',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  profileActions: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 10,
  },

  // Back button
  backBtnWrapper: {
    alignSelf: 'flex-start', marginLeft: 18, marginTop: 6,
    shadowColor: '#FF7597', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 8,
  },
  backBtnGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 9999 },
  backBtnText: { marginLeft: 6, fontSize: 14, fontWeight: 'bold', color: '#FFF' },

  // Tablet layout
  tabletWrapper: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    alignSelf: 'center',
  },

  // Mobile layout
  mobileScroll: { paddingHorizontal: 14, paddingTop: 8, gap: 12 },
  mobileCard: {
    backgroundColor: '#FDFAF4', borderRadius: 26, padding: 16,
    borderWidth: 5, borderColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  modeCard: {
    backgroundColor: '#FDFAF4',
    borderRadius: 20,
    padding: 12,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  modeSelector: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EBDCD0',
    backgroundColor: '#FFF',
    padding: 10,
    marginBottom: 12,
    gap: 9,
  },
  modeHeading: {
    paddingHorizontal: 3,
  },
  modeTitle: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '900',
  },
  modeHint: {
    color: '#8A7463',
    fontSize: 11,
    marginTop: 1,
  },
  modeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  modeOption: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EBDCD0',
    backgroundColor: '#F8F3EF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  modeOptionActive: {
    borderColor: '#FF7597',
    backgroundColor: '#FF7597',
  },
  modeOptionText: {
    color: '#8A7463',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  modeOptionTextActive: {
    color: '#FFF',
  },

  // Shared panel (tablet)
  panel: {
    minWidth: 0,
  },
  panelDraw: { flex: 1 },
  panelAi: { flex: 1 },
  panelHeaderRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10, gap: 8 },
  generatedImage: { width: '100%', height: '100%', borderRadius: 20 },

  // Section header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: '#E5D9CE', borderStyle: 'dashed',
    paddingBottom: 8, marginBottom: 10,
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sectionTitleText: { fontSize: 14, fontWeight: '900', color: '#475569' },

  // Toggle
  toggleBtn: {
    backgroundColor: '#FF7597', borderWidth: 2.5, borderColor: '#FFF', borderRadius: 9999,
    paddingVertical: 9, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 7,
    alignSelf: 'flex-end',
    shadowColor: '#FF7597', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10,
  },
  toggleBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // Reset
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 14, borderWidth: 2, borderColor: '#EBDCD0' },
  resetBtnText: { fontSize: 12, fontWeight: 'bold', color: '#4A3D3C' },

  // Tabs
  tabsBar: { marginBottom: 10, flexGrow: 0 },
  tab: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 11, marginRight: 7, backgroundColor: '#F5EDE8' },
  tabActive: { backgroundColor: '#FF5E97' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#8A7463' },
  tabTextActive: { color: '#FFF' },

  // Idea frame (tablet image mode)
  ideaFrame: { backgroundColor: '#F5EDE6', borderWidth: 3, borderColor: '#E5D9CE', borderRadius: 22, padding: 14 },

  // Inputs
  inputGroup: { marginBottom: 9 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#8A7463', marginBottom: 3 },
  textInput: {
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#EDE5DE', borderRadius: 13,
    paddingHorizontal: 13, paddingVertical: 8, fontSize: 13, color: '#4A3D3C',
    minHeight: 54, textAlignVertical: 'top',
  },

  // Upload
  uploadBox: {
    flex: 1, borderWidth: 2, borderColor: '#EBDCD0', borderStyle: 'dashed', borderRadius: 18,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', padding: 14, minHeight: 150,
  },
  uploadBoxMobile: {
    borderWidth: 2, borderColor: '#EBDCD0', borderStyle: 'dashed', borderRadius: 18,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', padding: 14,
    marginTop: 8, height: 110,
  },
  uploadTitle: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginTop: 7, textAlign: 'center' },
  uploadSub: { fontSize: 11, color: '#C8B5A7', marginTop: 3, textAlign: 'center' },
  referenceBox: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EBDCD0',
    backgroundColor: '#FFF',
    padding: 12,
    gap: 10,
  },
  referenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  referenceTitle: { color: '#475569', fontSize: 13, fontWeight: '900' },
  referenceHint: { color: '#8A7463', fontSize: 11, marginTop: 2 },
  referenceRemove: { color: '#E84040', fontSize: 12, fontWeight: '800' },
  referenceSources: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  referenceSource: {
    flex: 1,
    minWidth: 110,
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F3D9DF',
    backgroundColor: '#FFF8FA',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 7,
  },
  referenceSourceDisabled: { opacity: 0.38 },
  referenceSourceText: { color: '#475569', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  referencePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    backgroundColor: '#FFF8F2',
    padding: 8,
  },
  referencePreviewImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#FFF' },
  referencePreviewInfo: { flex: 1, minWidth: 0 },
  referenceSelected: { color: '#48A06A', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  referenceFileName: { color: '#475569', fontSize: 13, fontWeight: '800', marginTop: 2 },
  referencePreviewHint: { color: '#8A7463', fontSize: 11, marginTop: 2 },
  referenceEmpty: { color: '#A18D7F', fontSize: 11, lineHeight: 16 },
  galleryOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.42)',
    padding: 16,
  },
  galleryModal: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '82%',
    borderRadius: 26,
    backgroundColor: '#FDFAF4',
    padding: 18,
    borderWidth: 5,
    borderColor: '#FFF',
  },
  galleryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  galleryModalTitle: { color: '#475569', fontSize: 22, fontWeight: '900' },
  galleryModalDescription: { color: '#8A7463', fontSize: 12, marginTop: 3 },
  galleryClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 10 },
  galleryItem: {
    width: 130,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  galleryImage: { width: '100%', height: '100%' },
  galleryEmpty: { alignItems: 'center', paddingVertical: 46 },
  galleryEmptyTitle: { color: '#475569', fontSize: 18, fontWeight: '900', marginTop: 10 },
  galleryEmptyDescription: { color: '#8A7463', fontSize: 12, marginTop: 4 },

  // Prompt
  promptBox: {
    marginTop: 10, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EBDCD0',
    borderStyle: 'dashed', borderRadius: 18, padding: 12,
  },
  promptBoxMobile: {
    backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EBDCD0',
    borderStyle: 'dashed', borderRadius: 18, padding: 12,
  },
  formulaBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F3',
    borderWidth: 1.5, borderColor: '#FFCCD5', borderRadius: 11,
    paddingHorizontal: 10, paddingVertical: 5, gap: 5, alignSelf: 'flex-start',
  },
  formulaText: { fontSize: 11, fontWeight: 'bold', color: '#FF5C8A' },
  promptDisplayText: { fontSize: 13, color: '#4A3D3C', fontWeight: '500' },

  // AI result
  aiViewport: {
    flex: 1, borderWidth: 2, borderColor: '#EBDCD0', borderStyle: 'dashed', borderRadius: 18,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  aiViewportMobile: {
    borderWidth: 2, borderColor: '#EBDCD0', borderStyle: 'dashed', borderRadius: 18,
    backgroundColor: '#FFF', alignItems: 'center', padding: 16, minHeight: 120,
    justifyContent: 'center',
  },
  aiPlaceholder: { alignItems: 'center', paddingHorizontal: 20 },
  aiPlaceholderText: { fontSize: 13, color: '#718096', textAlign: 'center', lineHeight: 20 },
  createButton: {
    alignSelf: 'center',
    minWidth: 250,
    marginTop: 20,
  },
  editFlowActions: {
    width: '100%',
    gap: 10,
    marginTop: 14,
  },

  // Action btns
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: 14, borderWidth: 2, borderColor: '#EBDCD0', backgroundColor: '#FFF',
  },
  actionText: { fontWeight: 'bold', color: '#4A3D3C', fontSize: 12 },

  // Magic btn
  magicBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF7597', paddingHorizontal: 30, paddingVertical: 13,
    borderRadius: 30, alignSelf: 'center',
    shadowColor: '#FF7597', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.32, shadowRadius: 18,
  },
  magicBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});
