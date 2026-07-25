import React, { useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Pressable, TextInput, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalHeader } from '@/components/GlobalHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePopSound } from '@/hooks/usePopSound';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

  const scaleBtn = useSharedValue(1);
  const animatedBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleBtn.value }] }));

  const toggleMode = () => { playPop(); setInputMode(prev => prev === 'image' ? 'text' : 'image'); };
  const handleAnswerChange = (index: number, text: string) => {
    setAnswers(prev => ({ ...prev, [activeCategory]: { ...prev[activeCategory], [index]: text } }));
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

  const ToggleBtn = () => (
    <TouchableOpacity style={styles.toggleBtn} onPress={toggleMode}>
      <Ionicons name="sync" size={16} color="#FFF" />
      <Text style={styles.toggleBtnText}>{inputMode === 'image' ? '📷  Hình ảnh' : '✏️  Văn bản'}</Text>
    </TouchableOpacity>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <ImageBackground
      source={require('../../../public/lobby-assets/images/bg-character-feature.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <GlobalHeader />
        <TouchableOpacity
          onPress={() => { playPop(); router.canGoBack() ? router.back() : router.replace('/(app)/character'); }}
          style={styles.backBtnWrapper}
        >
          <LinearGradient colors={['#FF9EB5', '#FF7597']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.backBtnGradient}>
            <Ionicons name="arrow-back" size={16} color="#FFF" />
            <Text style={styles.backBtnText}>Trở về</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {isTablet ? (
        /* ════════════════ TABLET: 2 panel ngang ════════════════ */
        <View style={[styles.tabletWrapper, { paddingBottom: insets.bottom + 16 }]}>

          {/* Left panel */}
          <View style={[styles.panel, { flex: 1.5 }]}>
            <View style={styles.panelHeaderRow}>
              <ToggleBtn />
            </View>

            {inputMode === 'image' ? (
              <View style={{ flex: 1, flexDirection: 'row', gap: 14 }}>
                {/* Ideas */}
                <View style={[styles.ideaFrame, { flex: 1 }]}>
                  <SectionHeader onReset={() => playPop()} />
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {[
                      { l: '1. MÔ TẢ HÌNH DÁNG', p: 'Ví dụ: con mèo màu cam tròn xoe...' },
                      { l: '2. TRANG PHỤC & PHỤ KIỆN', p: 'Ví dụ: đeo nơ màu hồng...' },
                      { l: '3. CẢM GIÁC TỔNG THỂ', p: 'Ví dụ: đáng yêu, mạnh mẽ...' },
                    ].map((q, i) => (
                      <View key={i} style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{q.l}</Text>
                        <TextInput style={styles.textInput} placeholder={q.p} placeholderTextColor="#A3A3A3" multiline />
                      </View>
                    ))}
                  </ScrollView>
                </View>
                {/* Upload */}
                <View style={{ flex: 1 }}>
                  <Pressable style={styles.uploadBox} onPress={() => playPop()}>
                    <Ionicons name="cloud-upload" size={52} color="#EBDCD0" />
                    <Text style={styles.uploadTitle}>Tải ảnh phác họa lên</Text>
                    <Text style={styles.uploadSub}>Click hoặc chạm để tải ảnh vào đây</Text>
                  </Pressable>
                </View>
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

            <View style={styles.promptBox}>
              <View style={styles.formulaBanner}>
                <Ionicons name="star" size={12} color="#FF5C8A" />
                <Text style={styles.formulaText}>Công thức: [Nhân vật] + [Hình dáng] + [Trang phục]</Text>
              </View>
              <Text style={[styles.promptDisplayText, { marginTop: 6 }]}>Bản vẽ thiết kế...</Text>
            </View>
          </View>

          {/* Right panel: AI */}
          <View style={[styles.panel, { flex: 1, maxWidth: 480 }]}>
            <View style={styles.panelHeaderRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => playPop()}>
                <Ionicons name="pencil" size={13} color="#4A3D3C" />
                <Text style={[styles.actionText, { marginLeft: 4 }]}>Sửa lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => playPop()}>
                <Ionicons name="download-outline" size={15} color="#4A3D3C" />
                <Text style={[styles.actionText, { marginLeft: 4 }]}>Tải về</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.aiViewport}>
              <View style={styles.aiPlaceholder}>
                <Ionicons name="color-wand" size={58} color="#FF5C8A" style={{ marginBottom: 16 }} />
                <Text style={styles.aiPlaceholderText}>
                  Hãy sáng tạo nhân vật rồi bấm{' '}
                  <Text style={{ fontWeight: 'bold', color: '#FF5C8A' }}>TẠO NHÂN VẬT</Text> nhé!
                </Text>
                <AnimatedPressable
                  onPressIn={() => { scaleBtn.value = withSpring(0.95); }}
                  onPressOut={() => { scaleBtn.value = withSpring(1); }}
                  onPress={() => playPop()}
                  style={[styles.magicBtn, animatedBtnStyle, { marginTop: 24 }]}
                >
                  <Ionicons name="color-wand" size={16} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.magicBtnText}>TẠO NHÂN VẬT</Text>
                </AnimatedPressable>
              </View>
            </View>
          </View>
        </View>
      ) : (
        /* ════════════════ MOBILE: ScrollView 1 cột ════════════════ */
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.mobileScroll, { paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Toggle btn */}
          <ToggleBtn />

          {/* Input card */}
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
                  <TextInput style={styles.textInput} placeholder={q.p} placeholderTextColor="#A3A3A3" multiline />
                </View>
              ))}
              <Pressable style={styles.uploadBoxMobile} onPress={() => playPop()}>
                <Ionicons name="cloud-upload" size={34} color="#EBDCD0" />
                <Text style={styles.uploadTitle}>Tải ảnh phác họa nhân vật lên</Text>
                <Text style={styles.uploadSub}>Chạm để tải ảnh của em vào đây</Text>
              </Pressable>
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
              <Text style={styles.formulaText}>Công thức: [Nhân vật] + [Hình dáng] + [Trang phục]</Text>
            </View>
            <Text style={[styles.promptDisplayText, { marginTop: 6 }]}>Bản vẽ thiết kế...</Text>
          </View>

          {/* AI panel */}
          <View style={styles.mobileCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 14 }}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => playPop()}>
                <Ionicons name="pencil" size={13} color="#4A3D3C" />
                <Text style={[styles.actionText, { marginLeft: 4 }]}>Sửa lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => playPop()}>
                <Ionicons name="download-outline" size={15} color="#4A3D3C" />
                <Text style={[styles.actionText, { marginLeft: 4 }]}>Tải về</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.aiViewportMobile}>
              <Ionicons name="color-wand" size={46} color="#FF5C8A" style={{ marginBottom: 10 }} />
              <Text style={styles.aiPlaceholderText}>
                Hãy sáng tạo nhân vật rồi bấm{' '}
                <Text style={{ fontWeight: 'bold', color: '#FF5C8A' }}>TẠO NHÂN VẬT</Text>{' '}
                để xem phép thuật nhé!
              </Text>
            </View>
            <AnimatedPressable
              onPressIn={() => { scaleBtn.value = withSpring(0.95); }}
              onPressOut={() => { scaleBtn.value = withSpring(1); }}
              onPress={() => playPop()}
              style={[styles.magicBtn, animatedBtnStyle, { marginTop: 14 }]}
            >
              <Ionicons name="color-wand" size={16} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.magicBtnText}>TẠO NHÂN VẬT</Text>
            </AnimatedPressable>
          </View>
        </ScrollView>
      )}
    </ImageBackground>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#fad698' },

  // Back button
  backBtnWrapper: {
    alignSelf: 'flex-start', marginLeft: 18, marginTop: 6,
    shadowColor: '#FF7597', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 8,
  },
  backBtnGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 9999 },
  backBtnText: { marginLeft: 6, fontSize: 14, fontWeight: 'bold', color: '#FFF' },

  // Tablet layout
  tabletWrapper: { flex: 1, flexDirection: 'row', gap: 14, paddingHorizontal: 18, paddingTop: 8 },

  // Mobile layout
  mobileScroll: { paddingHorizontal: 14, paddingTop: 8, gap: 12 },
  mobileCard: {
    backgroundColor: '#FDFAF4', borderRadius: 26, padding: 16,
    borderWidth: 5, borderColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },

  // Shared panel (tablet)
  panel: {
    backgroundColor: '#FDFAF4', borderRadius: 32, padding: 18,
    borderWidth: 6, borderColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 18, elevation: 5,
  },
  panelHeaderRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10, gap: 8 },

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
