import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ImageBackground, Modal, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { usePopSound } from '@/hooks/usePopSound';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalHeader } from '@/components/GlobalHeader';

const SEED_CHARACTERS = [
  { id: 'seed-yuu', name: 'Yuu', avatar: '🐼' },
  { id: 'seed-nori', name: 'Nori', avatar: '🐰' },
  { id: 'seed-bong', name: 'Bông', avatar: '🐑' }
];

const CONTEXT_CARDS = [
  { id: 'c1', name: 'Sáng sớm', icon: 'partly-sunny', colors: ['#FDBA74', '#F97316'] },
  { id: 'c2', name: 'Chiều tà', icon: 'sunset', colors: ['#F472B6', '#DB2777'] },
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

  const router = useRouter();
  const { genre } = useLocalSearchParams();
  const { playPop } = usePopSound();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleBack = () => {
    playPop();
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.canGoBack() ? router.back() : router.replace('/(app)/comic/genre-v2');
    }
  };

  const handleNext = () => {
    playPop();
    if (step < 3) {
      setStep(step + 1);
    } else {
      router.push('/(app)/comic/library-v2');
    }
  };

  const renderStep1 = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Nhân vật chính</Text>
      <Text style={styles.stepSubtitle}>Ai sẽ tham gia chuyến phiêu lưu này?</Text>
      
      <View style={styles.charSelectionArea}>
        {selectedChar ? (
          <View style={styles.selectedCharCard}>
            <Text style={styles.charAvatarLarge}>{selectedChar.avatar}</Text>
            <Text style={styles.charNameLarge}>{selectedChar.name}</Text>
            <TouchableOpacity 
              style={styles.changeCharBtn} 
              onPress={() => { playPop(); setSelectedChar(null); }}
            >
              <Text style={styles.changeCharBtnText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyCharCard}>
            <Ionicons name="person-add-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyCharText}>Chưa chọn nhân vật</Text>
          </View>
        )}

        <TouchableOpacity onPress={() => { playPop(); setShowCharModal(true); }}>
          <LinearGradient colors={['#FF9EB5', '#FF5E97']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.charLibraryBtn}>
            <Ionicons name="library" size={24} color="#FFF" />
            <Text style={styles.charLibraryBtnText}>Kho nhân vật</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.seedContainer}>
          <Text style={styles.seedTitle}>Hoặc chọn nhanh:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seedScroll}>
            {SEED_CHARACTERS.map(c => (
              <TouchableOpacity key={c.id} style={styles.seedPill} onPress={() => { playPop(); setSelectedChar(c); }}>
                <Text style={styles.seedPillAvatar}>{c.avatar}</Text>
                <Text style={styles.seedPillName}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => {
    const colCount = isMobile ? 2 : 3;
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
    const colCount = isMobile ? 2 : 4;
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
    <ImageBackground source={require('../../../public/lobby-assets/images/bg-art.png')} style={styles.container} resizeMode="cover">
      <View style={{ paddingTop: insets.top }}>
        <GlobalHeader />
        <TouchableOpacity onPress={handleBack} style={styles.backBtnWrapper}>
          <LinearGradient colors={['#FF9EB5', '#FF7597']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
            <Text style={styles.backBtnText}>Trở về</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mainCard}>
            
            {/* Header: Progress Bar */}
            <View style={styles.progressHeader}>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressText}>Bước {step}/3</Text>
                {genre && (
                  <View style={styles.genreBadge}>
                    <Text style={styles.genreBadgeText}>{genre}</Text>
                  </View>
                )}
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient 
                  colors={['#FDBA74', '#F97316']} 
                  start={{x:0,y:0}} end={{x:1,y:0}}
                  style={[styles.progressFill, { width: `${Math.round((step / 3) * 100)}%` }]} 
                />
              </View>
            </View>

            {/* Content */}
            <View style={styles.contentArea}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </View>

            {/* Footer */}
            <View style={styles.footerRow}>
              {step === 3 ? (
                <TouchableOpacity style={styles.draftBtn} onPress={() => playPop()}>
                  <Text style={styles.draftBtnText}>Lưu Nháp</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}
              
              <TouchableOpacity onPress={handleNext}>
                <LinearGradient colors={['#FF9EB5', '#FF5E97']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.nextBtn}>
                  <Text style={styles.nextBtnText}>{step === 3 ? 'Tạo Truyện ✨' : 'Tiếp Tục ➡'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showCharModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kho nhân vật</Text>
            <FlatList 
              data={SEED_CHARACTERS}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => {
                  setSelectedChar(item);
                  setShowCharModal(false);
                  playPop();
                }}>
                  <Text style={styles.modalItemAvatar}>{item.avatar}</Text>
                  <Text style={styles.modalItemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowCharModal(false)}>
              <Text style={styles.closeModalBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  selectedCharCard: {
    backgroundColor: '#FDFAF4',
    borderWidth: 2,
    borderColor: '#EADED5',
    borderStyle: 'dashed',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  charAvatarLarge: {
    fontSize: 64,
  },
  charNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 8,
  },
  changeCharBtn: {
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
    backgroundColor: '#FDFAF4',
    borderWidth: 2,
    borderColor: '#EADED5',
    borderStyle: 'dashed',
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  emptyCharText: {
    color: '#94A3B8',
    marginTop: 12,
    fontWeight: '500',
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
