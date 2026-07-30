import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet, useWindowDimensions, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { usePopSound } from '@/hooks/usePopSound';
import { AikidButton, AikidIcon, AikidModal, AikidPage, AikidWizard } from '@/ui';
import { generateComicScriptViaGateway } from '@/features/comic/api/generateComicScript';
import { useComicDraft, type ComicCharacter } from '@/features/comic/store/useComicDraft';
import { useFamily } from '@/features/family/store/useFamily';
import { StoryFlowProgress } from '@/features/comic/components/StoryFlowProgress';
import { useCharacterDraft } from '@/features/character';

const SEED_CHARACTERS = [
  { id: 'seed-yuu', name: 'Yuu', avatar: '🐼', imageUrl: null, species: '' },
  { id: 'seed-nori', name: 'Nori', avatar: '🐰', imageUrl: null, species: '' },
  { id: 'seed-bong', name: 'Bông', avatar: '🐑', imageUrl: null, species: '' }
];

const CONTEXT_CARDS = [
  { id: 'c1', name: 'Sáng sớm', icon: 'partly-sunny', colors: ['#FDBA74', '#F97316'] },
  { id: 'c2', name: 'Chiều tà', icon: 'sunny-outline', colors: ['#F472B6', '#DB2777'] },
  { id: 'c3', name: 'Đêm trăng', icon: 'moon', colors: ['#818CF8', '#4F46E5'] },
  { id: 'c4', name: 'Cổ đại', icon: 'hourglass', colors: ['#D4D4D8', '#71717A'] },
  { id: 'c5', name: 'Tương lai', icon: 'rocket', colors: ['#6EE7B7', '#3B82F6'] },
  { id: 'c6', name: 'Biển cả', icon: 'water', colors: ['#38BDF8', '#0284C7'] },
];

const PLOT_CARDS = [
  { id: 'p1', name: 'Tìm bản đồ kho báu', icon: 'map', colors: ['#FDE047', '#CA8A04'] },
  { id: 'p2', name: 'Nhặt sinh vật lạ', icon: 'paw', colors: ['#93C5FD', '#2563EB'] },
  { id: 'p3', name: 'Cổng không gian', icon: 'planet', colors: ['#C084FC', '#7C3AED'] },
  { id: 'p4', name: 'Bé lạc vào rừng', icon: 'leaf', colors: ['#34D399', '#059669'] },
  { id: 'p5', name: 'Gặp người bạn mới', icon: 'people', colors: ['#FBCFE8', '#DB2777'] },
  { id: 'p6', name: 'Khám phá hành tinh', icon: 'telescope', colors: ['#818CF8', '#4F46E5'] },
  { id: 'p7', name: 'Nhận nhiệm vụ đặc biệt', icon: 'star', colors: ['#FDBA74', '#EA580C'] },
  { id: 'p8', name: 'Giúp đỡ người gặp nạn', icon: 'heart', colors: ['#FDA4AF', '#E11D48'] },
];

export default function IdeaV2Screen() {
  const [step, setStep] = useState(1);
  const [selectedChar, setSelectedChar] = useState<any>(null);
  const [showCharModal, setShowCharModal] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [customContext, setCustomContext] = useState('');
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const [customPlot, setCustomPlot] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  const router = useRouter();
  const { genre, mode } = useLocalSearchParams<{ genre?: string; mode?: string }>();
  const { playPop } = usePopSound();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const activeChild = useFamily((s) => s.getActiveChild());
  const project = useComicDraft((s) => s.project);
  const hydrated = useComicDraft((s) => s.hydrated);
  const hydrate = useComicDraft((s) => s.hydrate);
  const patchProject = useComicDraft((s) => s.patchProject);
  const updatePage = useComicDraft((s) => s.updatePage);
  const saveToLibrary = useComicDraft((s) => s.saveToLibrary);
  const savedCharacters = useCharacterDraft((s) => s.saved);
  const hydrateCharacters = useCharacterDraft((s) => s.hydrate);

  const availableCharacters = savedCharacters.length
    ? savedCharacters.map((character) => ({
        id: character.id,
        name: character.name,
        avatar: '✨',
        imageUrl: character.avatarUri || null,
        species: character.species || '',
      }))
    : SEED_CHARACTERS;

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrate, hydrated]);

  useEffect(() => {
    void hydrateCharacters();
  }, [hydrateCharacters]);

  const handleBack = () => {
    playPop();
    if (step > 1) {
      setStep(step - 1);
    } else {
      if (router.canGoBack()) router.back();
      else router.replace({ pathname: '/(app)/comic/genre-v2', params: { mode: mode || 'text' } });
    }
  };

  const handleNext = async () => {
    playPop();
    if (step < 3) {
      if (step === 1 && !selectedChar) {
        Alert.alert('Chọn nhân vật', 'Hãy chọn một nhân vật chính trước.');
        return;
      }
      if (step === 2 && !selectedContext && !customContext.trim()) {
        Alert.alert('Chọn bối cảnh', 'Hãy chọn hoặc nhập bối cảnh câu chuyện.');
        return;
      }
      setStep(step + 1);
    } else {
      if (isGenerating) return;
      const contextName = customContext.trim() || CONTEXT_CARDS.find((item) => item.id === selectedContext)?.name;
      const plotName = customPlot.trim() || PLOT_CARDS.find((item) => item.id === selectedPlot)?.name;
      if (!selectedChar || !contextName || !plotName) {
        Alert.alert('Thiếu ý tưởng', 'Hãy chọn nhân vật, bối cảnh và cốt truyện trước khi tạo.');
        return;
      }
      const page = project.pages[0];
      if (!page) {
        Alert.alert('Không thể tạo truyện', 'Bản nháp chưa sẵn sàng.');
        return;
      }
      const cast: ComicCharacter[] = [{
        id: selectedChar.id,
        sourceId: selectedChar.id,
        name: selectedChar.name,
        role: 'main',
        personality: 'đáng yêu, tò mò và dũng cảm',
        appearancePrompt: `${selectedChar.species || 'Nhân vật'} ${selectedChar.name}`,
        referenceImageUrl: selectedChar.imageUrl || null,
      }];
      const idea = `${selectedChar.name} trong bối cảnh ${contextName}: ${plotName}.`;
      setIsGenerating(true);
      setGenerationError('');
      try {
        const panels = await generateComicScriptViaGateway({
          pageId: page.id,
          idea,
          genre: typeof genre === 'string' ? genre : 'Phiêu lưu',
          panelCount: page.panelCount,
          cast,
          childProfileId: activeChild?.id,
        });
        patchProject({
          title: `${plotName} của ${selectedChar.name}`,
          genre: typeof genre === 'string' ? genre : 'Phiêu lưu',
          cast,
        });
        updatePage(page.id, { idea, title: plotName, panels, status: 'draft', error: null });
        await saveToLibrary();
        router.push('/(app)/comic/library-v2');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Vui lòng thử lại.';
        setGenerationError(message);
        Alert.alert('Không tạo được truyện', message);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleSaveDraft = async () => {
    playPop();
    await saveToLibrary();
    Alert.alert('Đã lưu nháp', 'Bản nháp đã được thêm vào thư viện.');
  };

  const renderStep1 = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Nhân vật chính</Text>
      <Text style={styles.stepSubtitle}>Ai sẽ tham gia chuyến phiêu lưu này?</Text>

      <View style={[styles.characterWorkspace, isMobile && styles.characterWorkspaceMobile]}>
        <View style={styles.characterPreviewPane}>
          <Text style={styles.characterPaneLabel}>NHÂN VẬT ĐANG CHỌN</Text>
          <View style={[styles.selectedCharCard, !selectedChar && styles.emptyCharCard]}>
            {selectedChar ? (
              <>
                {selectedChar.imageUrl ? (
                  <Image source={{ uri: selectedChar.imageUrl }} style={styles.selectedCharImage} resizeMode="contain" />
                ) : (
                  <Text style={styles.charAvatarLarge}>{selectedChar.avatar}</Text>
                )}
                <Text style={styles.charNameLarge}>{selectedChar.name}</Text>
                {selectedChar.species ? <Text style={styles.charSpecies}>{selectedChar.species}</Text> : null}
                <TouchableOpacity
                  style={styles.changeCharBtn}
                  onPress={() => { playPop(); setSelectedChar(null); }}
                >
                  <Ionicons name="close" size={15} color="#64748B" />
                  <Text style={styles.changeCharBtnText}>Bỏ chọn</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.emptyCharIcon}>
                  <Ionicons name="person-add-outline" size={38} color="#C0CBD9" />
                </View>
                <Text style={styles.emptyCharTitle}>Chưa chọn nhân vật</Text>
                <Text style={styles.emptyCharText}>Chọn một nhân vật trong danh sách bên cạnh.</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.characterLibraryPane}>
          <View style={styles.characterLibraryHeader}>
            <View>
              <Text style={styles.characterPaneLabel}>CHỌN NHANH TỪ KHO</Text>
              <Text style={styles.characterLibraryHint}>{availableCharacters.length} nhân vật sẵn sàng</Text>
            </View>
            <TouchableOpacity style={styles.openLibraryButton} onPress={() => { playPop(); setShowCharModal(true); }}>
              <Ionicons name="grid-outline" size={16} color="#FF5E97" />
              <Text style={styles.openLibraryText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.characterQuickScroll}
            contentContainerStyle={styles.characterQuickGrid}
            nestedScrollEnabled
            showsVerticalScrollIndicator={availableCharacters.length > 4}
          >
            <TouchableOpacity
              style={[styles.characterQuickCard, styles.createCharacterCard]}
              onPress={() => {
                playPop();
                router.push('/(app)/character/generate-v2');
              }}
            >
              <View style={styles.createCharacterIcon}>
                <Ionicons name="add" size={38} color="#FF5E97" />
              </View>
              <Text style={styles.createCharacterTitle}>Tạo nhân vật mới</Text>
              <Text style={styles.createCharacterHint}>Mở flow nhân vật</Text>
            </TouchableOpacity>
            {availableCharacters.map((character) => {
              const active = selectedChar?.id === character.id;
              return (
                <TouchableOpacity
                  key={character.id}
                  style={[styles.characterQuickCard, active && styles.characterQuickCardActive]}
                  onPress={() => { playPop(); setSelectedChar(character); }}
                >
                  <View style={styles.characterQuickImageBox}>
                    {character.imageUrl ? (
                      <Image source={{ uri: character.imageUrl }} style={styles.characterQuickImage} resizeMode="contain" />
                    ) : (
                      <Text style={styles.characterQuickEmoji}>{character.avatar}</Text>
                    )}
                  </View>
                  <Text style={[styles.characterQuickName, active && styles.characterQuickNameActive]} numberOfLines={1}>
                    {character.name}
                  </Text>
                  {active ? <Text style={styles.characterQuickSelected}>ĐANG CHỌN</Text> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => {
    return (
      <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Bối cảnh</Text>
        <Text style={styles.stepSubtitle}>Câu chuyện diễn ra ở đâu?</Text>
        
        <View style={styles.grid}>
          {CONTEXT_CARDS.map(c => {
            const isSelected = selectedContext === c.id;
            const cardWidth = isMobile ? '50%' : '33.33%';
            return (
              <TouchableOpacity 
                key={c.id} 
                style={[styles.cardItem, { width: cardWidth, padding: 8 }]}
                onPress={() => { playPop(); setSelectedContext(c.id); }}
              >
                <View style={[styles.cardInner, isSelected && styles.cardInnerSelected]}>
                  <LinearGradient colors={c.colors as [string, string]} style={styles.cardIconBox}>
                    <Ionicons name={c.icon as any} size={24} color="#FFF" />
                  </LinearGradient>
                  <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>{c.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.customInputContainer}>
          <Text style={styles.customInputLabel}>Bối cảnh khác:</Text>
          <TextInput 
            style={styles.textInput}
            placeholder="Nhập bối cảnh bạn muốn..."
            placeholderTextColor="#94A3B8"
            value={customContext}
            onChangeText={setCustomContext}
            onFocus={() => setSelectedContext(null)}
          />
        </View>
      </Animated.View>
    );
  };

  const renderStep3 = () => {
    return (
      <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Cốt truyện</Text>
        <Text style={styles.stepSubtitle}>Chuyện gì sẽ xảy ra?</Text>
        
        <View style={styles.grid}>
          {PLOT_CARDS.map(p => {
            const isSelected = selectedPlot === p.id;
            const cardWidth = isMobile ? '50%' : '25%';
            return (
              <TouchableOpacity 
                key={p.id} 
                style={[styles.cardItem, { width: cardWidth, padding: 8 }]}
                onPress={() => { playPop(); setSelectedPlot(p.id); }}
              >
                <View style={[styles.cardInner, isSelected && styles.cardInnerSelected]}>
                  <LinearGradient colors={p.colors as [string, string]} style={styles.cardIconBox}>
                    <Ionicons name={p.icon as any} size={24} color="#FFF" />
                  </LinearGradient>
                  <Text style={[styles.cardText, isSelected && styles.cardTextSelected, { textAlign: 'center' }]} numberOfLines={2}>{p.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.customInputContainer}>
          <Text style={styles.customInputLabel}>Cốt truyện khác:</Text>
          <TextInput 
            style={[styles.textInput, styles.textArea]}
            placeholder="Nhập cốt truyện bạn muốn..."
            placeholderTextColor="#94A3B8"
            value={customPlot}
            onChangeText={setCustomPlot}
            multiline
            numberOfLines={4}
            onFocus={() => setSelectedPlot(null)}
          />
        </View>
      </Animated.View>
    );
  };

  return (
    <AikidPage
      scene="comic"
      title="Tạo truyện"
      backHref="/(app)/comic/genre-v2"
      container="wide"
      keyboardAware
      scroll={false}
    >
      <StoryFlowProgress
        currentStep={step + 1}
        onStepPress={(target) => {
          playPop();
          if (target === 1) {
            router.replace({ pathname: '/(app)/comic/genre-v2', params: { mode: mode || 'text' } });
          } else if (target >= 2 && target < step + 1) {
            setStep(target - 1);
          }
        }}
      />
      <ScrollView
        style={styles.stepScroll}
        contentContainerStyle={styles.stepScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      <AikidWizard
          step={step}
          total={3}
          badge={typeof genre === 'string' ? genre : undefined}
          showProgress={false}
          footer={
            <>
              {step > 1 ? (
                <AikidButton variant="feature" onPress={handleBack} leftIcon={<AikidIcon name="arrow-left" size={18} />}>
                  Quay lại
                </AikidButton>
              ) : null}
              {step === 3 ? (
                <AikidButton variant="feature" onPress={() => void handleSaveDraft()} leftIcon={<AikidIcon name="save" size={18} />}>
                  Lưu nháp
                </AikidButton>
              ) : null}
              <AikidButton variant="nav" onPress={() => void handleNext()} loading={isGenerating}>
                {step === 3 ? 'Tạo truyện' : 'Tiếp tục'}
              </AikidButton>
            </>
          }
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {generationError ? (
            <View style={styles.generationError}>
              <Ionicons name="alert-circle-outline" size={18} color="#D64545" />
              <View style={styles.generationErrorCopy}>
                <Text style={styles.generationErrorTitle}>Chưa tạo được truyện</Text>
                <Text style={styles.generationErrorText}>{generationError}</Text>
              </View>
            </View>
          ) : null}
        </AikidWizard>
      </ScrollView>

      <AikidModal
        isOpen={showCharModal}
        onClose={() => setShowCharModal(false)}
        position="center"
        size="sm"
        title="Kho nhân vật"
      >
            <FlatList 
              data={availableCharacters}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => {
                  setSelectedChar(item);
                  setShowCharModal(false);
                  playPop();
                }}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.modalItemImage} resizeMode="contain" />
                  ) : (
                    <Text style={styles.modalItemAvatar}>{item.avatar}</Text>
                  )}
                  <Text style={styles.modalItemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
        <AikidButton variant="feature" fullWidth onPress={() => setShowCharModal(false)}>
          Đóng
        </AikidButton>
      </AikidModal>
    </AikidPage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepScroll: {
    flex: 1,
    width: '100%',
  },
  stepScrollContent: {
    paddingBottom: 20,
  },
  backBtnWrapper: {
    alignSelf: 'flex-start',
    marginLeft: 18,
    marginTop: 10,
    marginBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 14,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: '#FDFAF4',
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
    flex: 1,
  },
  progressHeader: {
    marginBottom: 20,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 16,
  },
  genreBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreBadgeText: {
    color: '#15803D',
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressTrack: {
    backgroundColor: '#E2E8F0',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  contentArea: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#8A7463',
    marginBottom: 20,
  },
  charSelectionArea: {
    alignItems: 'center',
  },
  characterWorkspace: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 18,
  },
  characterWorkspaceMobile: {
    flexDirection: 'column',
  },
  characterPreviewPane: {
    flex: 0.85,
    minWidth: 260,
    borderWidth: 1.5,
    borderColor: '#EBDCD0',
    borderRadius: 22,
    backgroundColor: '#FFFDFB',
    padding: 14,
  },
  characterLibraryPane: {
    flex: 1.15,
    minWidth: 0,
    borderRadius: 22,
    backgroundColor: '#FFF8F2',
    padding: 14,
  },
  characterPaneLabel: {
    color: '#8A7463',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.55,
  },
  selectedCharCard: {
    flex: 1,
    minHeight: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  charAvatarLarge: {
    fontSize: 64,
  },
  selectedCharImage: {
    width: '100%',
    maxWidth: 260,
    height: 220,
    borderRadius: 24,
    backgroundColor: '#FFF',
  },
  charNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 10,
    textAlign: 'center',
  },
  charSpecies: {
    color: '#8A7463',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
  changeCharBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  changeCharBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  emptyCharCard: {
    minHeight: 300,
    backgroundColor: '#FFFDFB',
    borderWidth: 1.5,
    borderColor: '#EBDCD0',
    borderStyle: 'dashed',
  },
  emptyCharIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F6FA',
  },
  emptyCharTitle: {
    color: '#64748B',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
  },
  emptyCharText: {
    color: '#94A3B8',
    marginTop: 5,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 230,
  },
  characterLibraryHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  characterLibraryHint: {
    color: '#8A7463',
    fontSize: 11,
    marginTop: 2,
  },
  openLibraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  openLibraryText: {
    color: '#FF5E97',
    fontSize: 11,
    fontWeight: '800',
  },
  characterQuickScroll: {
    maxHeight: 330,
  },
  characterQuickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 2,
  },
  characterQuickCard: {
    width: 150,
    minHeight: 180,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 8,
  },
  characterQuickCardActive: {
    borderColor: '#FF5E97',
    backgroundColor: '#FFF4F7',
  },
  characterQuickImageBox: {
    width: '100%',
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#FFF8F2',
  },
  characterQuickImage: {
    width: '100%',
    height: '100%',
  },
  characterQuickEmoji: {
    fontSize: 56,
  },
  characterQuickName: {
    maxWidth: '100%',
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 7,
  },
  characterQuickNameActive: {
    color: '#FF5E97',
  },
  characterQuickSelected: {
    color: '#FF5E97',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  createCharacterCard: {
    justifyContent: 'center',
    borderColor: '#F2B7C7',
    borderStyle: 'dashed',
    backgroundColor: '#FFF9FB',
  },
  createCharacterIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F3',
  },
  createCharacterTitle: {
    color: '#FF5E97',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 9,
  },
  createCharacterHint: {
    color: '#9A8790',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  generationError: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderWidth: 1,
    borderColor: '#F3B7B7',
    borderRadius: 14,
    backgroundColor: '#FFF1F1',
    padding: 12,
    marginTop: 14,
  },
  generationErrorCopy: {
    flex: 1,
  },
  generationErrorTitle: {
    color: '#B83434',
    fontSize: 12,
    fontWeight: '900',
  },
  generationErrorText: {
    color: '#8F4A4A',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  charLibraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    marginBottom: 24,
  },
  charLibraryBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  seedContainer: {
    width: '100%',
  },
  seedTitle: {
    color: '#8A7463',
    marginBottom: 12,
    fontWeight: '500',
  },
  seedScroll: {
    gap: 12,
  },
  seedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  seedPillAvatar: {
    fontSize: 20,
    marginRight: 8,
  },
  seedPillImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: '#FFF',
  },
  seedPillName: {
    color: '#475569',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  cardItem: {
    marginBottom: 16,
  },
  cardInner: {
    backgroundColor: '#FDFAF4',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#EADED5',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    height: '100%',
  },
  cardInnerSelected: {
    backgroundColor: '#FFEAEF',
    borderColor: '#FF7597',
    borderStyle: 'solid',
  },
  cardItemSelected: {},
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardText: {
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center',
  },
  cardTextSelected: {
    color: '#E11D48',
  },
  customInputContainer: {
    marginTop: 20,
  },
  customInputLabel: {
    color: '#8A7463',
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#475569',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  draftBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE047',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  draftBtnText: {
    color: '#854D0E',
    fontWeight: 'bold',
  },
  nextBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalItemAvatar: {
    fontSize: 32,
    marginRight: 16,
  },
  modalItemImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: '#FFF8F2',
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  closeModalBtn: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#64748B',
    fontWeight: 'bold',
  }
});
