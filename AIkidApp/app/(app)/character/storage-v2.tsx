import React, { useState } from 'react';
import {
  View, Text, ImageBackground, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Pressable, Image, Modal, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalHeader } from '@/components/GlobalHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePopSound } from '@/hooks/usePopSound';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Seed Data ─────────────────────────────────────────────────────────────────
const SEED_CHARS = [
  { id: '1', name: 'Yuu', age: 10, dob: '01/01', gender: 'Nam', bio: 'Bé Yuu năng động, thích khám phá thế giới xung quanh.', avatar: null },
  { id: '2', name: 'Nori', age: 8, dob: '15/05', gender: 'Nữ', bio: 'Nori rất thích vẽ tranh và nghe nhạc.', avatar: null },
  { id: '3', name: 'Bông', age: 5, dob: '20/10', gender: 'Nữ', bio: 'Bé Bông đáng yêu, thích ăn kẹo.', avatar: null },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function StorageV2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { playPop } = usePopSound();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [characters, setCharacters] = useState(SEED_CHARS);
  const [activeCharId, setActiveCharId] = useState(SEED_CHARS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('Tất cả');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // Mobile tab state
  const [activeTab, setActiveTab] = useState<'detail' | 'list'>('detail');

  const activeChar = characters.find(c => c.id === activeCharId) || characters[0];

  const toastTranslateY = useSharedValue(100);
  const toastStyle = useAnimatedStyle(() => ({ transform: [{ translateY: toastTranslateY.value }] }));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    toastTranslateY.value = withSpring(0);
    setTimeout(() => { toastTranslateY.value = withTiming(100); }, 2500);
  };

  const updateActiveChar = (field: string, value: any) => {
    setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, [field]: value } : c));
  };

  const handleSave = () => { playPop(); showToast('Lưu thành công! ✨'); };

  const handleDeleteConfirm = () => {
    playPop();
    const newChars = characters.filter(c => c.id !== activeCharId);
    setCharacters(newChars);
    if (newChars.length > 0) setActiveCharId(newChars[0].id);
    setShowDeleteModal(false);
    showToast('Đã xóa nhân vật');
  };

  const getFilteredChars = () => {
    let filtered = characters.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterOption === 'A-Z') filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (filterOption === 'Mới nhất') filtered = [...filtered].reverse();
    return filtered;
  };

  // Animated buttons
  const makeBtnAnim = () => {
    const scale = useSharedValue(1);
    return {
      style: useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] })),
      onPressIn: () => { scale.value = withSpring(0.92); },
      onPressOut: () => { scale.value = withSpring(1); },
    };
  };
  const btnDownload = makeBtnAnim();
  const btnGallery  = makeBtnAnim();
  const btnProfile  = makeBtnAnim();
  const btnEdit     = makeBtnAnim();
  const btnDelete   = makeBtnAnim();

  // ─── Sub-components ──────────────────────────────────────────────────────────

  const DetailContent = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={[styles.mobileCard, !isTablet && { margin: 0 }]}>
        {/* Avatar */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarBox}>
            {activeChar?.avatar
              ? <Image source={{ uri: activeChar.avatar }} style={styles.avatarImg} />
              : <Ionicons name="person" size={isTablet ? 80 : 56} color="#FFB6C1" />
            }
          </View>
        </View>

        {/* Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên nhân vật</Text>
          <View style={styles.inputIconWrapper}>
            <TextInput
              style={[styles.input, { paddingRight: 40 }]}
              value={activeChar?.name}
              onChangeText={t => updateActiveChar('name', t)}
            />
            <Ionicons name="pencil" size={18} color="#8A7463" style={styles.inputIcon} />
          </View>
        </View>

        {/* Age + DOB */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={[styles.formGroup, { flex: 1, zIndex: 100 }]}>
            <Text style={styles.label}>Tuổi</Text>
            <TouchableOpacity style={styles.pickerBox} onPress={() => { playPop(); setShowAgeDropdown(!showAgeDropdown); }}>
              <Text style={styles.pickerText}>{activeChar?.age}</Text>
              <Ionicons name="chevron-down" size={18} color="#8A7463" />
            </TouchableOpacity>
            {showAgeDropdown && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={{ maxHeight: 140 }} nestedScrollEnabled>
                  {Array.from({ length: 18 }, (_, i) => i + 1).map(age => (
                    <TouchableOpacity key={age} style={styles.dropdownItem} onPress={() => { updateActiveChar('age', age); setShowAgeDropdown(false); playPop(); }}>
                      <Text style={styles.dropdownText}>{age}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Ngày sinh</Text>
            <View style={styles.datePickerBox}>
              <TouchableOpacity onPress={() => playPop()}><Ionicons name="remove-circle" size={22} color="#FF9EB5" /></TouchableOpacity>
              <Text style={styles.pickerText}>{activeChar?.dob}</Text>
              <TouchableOpacity onPress={() => playPop()}><Ionicons name="add-circle" size={22} color="#FF9EB5" /></TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Gender */}
        <View style={[styles.formGroup, { zIndex: -1 }]}>
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.genderRow}>
            {['Nam', 'Nữ', 'Khác'].map(g => (
              <TouchableOpacity key={g} style={[styles.genderToggle, activeChar?.gender === g && styles.genderToggleActive]} onPress={() => { playPop(); updateActiveChar('gender', g); }}>
                <Text style={[styles.genderText, activeChar?.gender === g && styles.genderTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={[styles.formGroup, { zIndex: -1 }]}>
          <Text style={styles.label}>Tiểu sử</Text>
          <TextInput style={[styles.input, styles.textArea]} value={activeChar?.bio} onChangeText={t => updateActiveChar('bio', t)} multiline />
        </View>

        {/* Actions */}
        <View style={styles.detailActions}>
          <AnimatedPressable {...btnDownload} onPress={handleSave} style={[styles.btnAction, { backgroundColor: '#48BB78' }, btnDownload.style]}>
            <Ionicons name="download" size={20} color="#FFF" />
          </AnimatedPressable>
          <AnimatedPressable {...btnGallery} onPress={() => playPop()} style={[styles.btnAction, { backgroundColor: '#B794F4' }, btnGallery.style]}>
            <Ionicons name="images" size={20} color="#FFF" />
          </AnimatedPressable>
          <AnimatedPressable {...btnProfile} onPress={() => playPop()} style={[styles.btnAction, { backgroundColor: '#4299E1' }, btnProfile.style]}>
            <Ionicons name="person" size={20} color="#FFF" />
          </AnimatedPressable>
          <AnimatedPressable {...btnEdit} onPress={() => playPop()} style={[styles.btnAction, { backgroundColor: '#ED8936' }, btnEdit.style]}>
            <Ionicons name="pencil" size={20} color="#FFF" />
          </AnimatedPressable>
          <AnimatedPressable {...btnDelete} onPress={() => { playPop(); setShowDeleteModal(true); }} style={[styles.btnAction, { backgroundColor: '#E53E3E' }, btnDelete.style]}>
            <Ionicons name="trash" size={20} color="#FFF" />
          </AnimatedPressable>
        </View>
      </View>
    </ScrollView>
  );

  const cardW = isTablet ? 140 : (width - 16 * 2 - 12) / 2 - 6;

  const ListContent = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={[styles.mobileCard, !isTablet && { margin: 0 }]}>
        {/* Search + Filter */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, zIndex: 10 }}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#8A7463" />
            <TextInput style={styles.searchInput} placeholder="Tìm kiếm..." placeholderTextColor="#8A7463" value={searchQuery} onChangeText={setSearchQuery} />
          </View>
          <View style={{ position: 'relative', zIndex: 10 }}>
            <TouchableOpacity style={styles.filterSelectWrapper} onPress={() => { playPop(); setShowFilterDropdown(!showFilterDropdown); }}>
              <Ionicons name="funnel" size={16} color="#FF5E97" />
              <Text style={styles.filterValue}>{filterOption}</Text>
              <Ionicons name="chevron-down" size={14} color="#8A7463" />
            </TouchableOpacity>
            {showFilterDropdown && (
              <View style={styles.filterDropdownMenu}>
                {['Tất cả', 'Mới nhất', 'A-Z'].map(opt => (
                  <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => { setFilterOption(opt); setShowFilterDropdown(false); playPop(); }}>
                    <Text style={styles.dropdownText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Grid */}
        <View style={styles.characterGrid}>
          <TouchableOpacity style={[styles.charCard, styles.addNewCard, { width: cardW, height: cardW + 24 }]} onPress={() => playPop()}>
            <Ionicons name="add" size={42} color="#C8B5A7" />
          </TouchableOpacity>
          {getFilteredChars().map((char, i) => {
            const isActive = char.id === activeCharId;
            return (
              <TouchableOpacity key={char.id} style={[styles.charCard, isActive && styles.charCardActive, { width: cardW, height: cardW + 24 }]} onPress={() => { playPop(); setActiveCharId(char.id); if (!isTablet) setActiveTab('detail'); }}>
                <View style={[styles.charPlaceholder, isActive && { backgroundColor: 'transparent' }]}>
                  {char.avatar
                    ? <Image source={{ uri: char.avatar }} style={styles.charAvatar} />
                    : <Ionicons name="happy" size={isTablet ? 50 : 40} color={['#FFB6C1', '#87CEFA', '#98FB98', '#FFD700'][i % 4]} />
                  }
                </View>
                <Text style={[styles.charName, isActive && { color: '#FF5E97' }]} numberOfLines={1}>{char.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <ImageBackground
      source={require('../../../public/lobby-assets/images/bg-character-feature.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <GlobalHeader />
        <TouchableOpacity
          style={styles.backBtnWrapper}
          onPress={() => { playPop(); router.canGoBack() ? router.back() : router.replace('/(app)/character'); }}
        >
          <LinearGradient colors={['#FF9EB5', '#FF7597']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.backBtnGradient}>
            <Ionicons name="arrow-back" size={16} color="#FFF" />
            <Text style={styles.backBtnText}>Trở về</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {isTablet ? (
        /* ════ TABLET: 2 panel ngang ════ */
        <View style={[styles.workspaceWrapper, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.workspaceContainer}>

            {/* Panel Detail */}
            <View style={[styles.panel, { flex: 1.4 }]}>
              <View style={styles.panelHeader}>
                <View style={styles.panelTitle}>
                  <Ionicons name="information-circle" size={26} color="#FF5E97" />
                  <Text style={styles.titleText}>Thông tin nhân vật</Text>
                </View>
              </View>
              <DetailContent />
            </View>

            {/* Panel List */}
            <View style={[styles.panel, { flex: 1 }]}>
              <View style={styles.panelHeader}>
                <View style={styles.panelTitle}>
                  <Ionicons name="grid" size={26} color="#FF5E97" />
                  <Text style={styles.titleText}>Danh sách</Text>
                </View>
              </View>
              <ListContent />
            </View>
          </View>
        </View>
      ) : (
        /* ════ MOBILE: Tab-based single column ════ */
        <View style={{ flex: 1, paddingBottom: insets.bottom + 8 }}>
          {/* Tab Bar */}
          <View style={styles.tabBar}>
            {[
              { id: 'detail' as const, label: 'Thông tin', icon: 'information-circle' },
              { id: 'list' as const, label: 'Danh sách', icon: 'grid' },
            ].map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
                onPress={() => { playPop(); setActiveTab(tab.id); }}
              >
                <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.id ? '#FFF' : '#8A7463'} />
                <Text style={[styles.tabBtnText, activeTab === tab.id && styles.tabBtnTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[styles.mobileScroll, { paddingBottom: 24 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === 'detail' ? <DetailContent /> : <ListContent />}
          </ScrollView>
        </View>
      )}

      {/* Delete Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xóa nhân vật?</Text>
            <Text style={styles.modalDesc}>Bạn có chắc chắn muốn xóa nhân vật này không?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#E2E8F0' }]} onPress={() => setShowDeleteModal(false)}>
                <Text style={[styles.btnText, { color: '#4A5568' }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#E53E3E' }]} onPress={handleDeleteConfirm}>
                <Text style={styles.btnText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      <Animated.View style={[styles.toastContainer, toastStyle]}>
        <Ionicons name="checkmark-circle" size={22} color="#48BB78" />
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>
    </ImageBackground>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#fad698' },

  // Back button
  backBtnWrapper: {
    alignSelf: 'flex-start', marginLeft: 18, marginTop: 6,
    shadowColor: '#FF7597', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 8,
  },
  backBtnGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 9999 },
  backBtnText: { marginLeft: 6, fontSize: 14, fontWeight: 'bold', color: '#FFF' },

  // ── Tablet layout ──
  workspaceWrapper: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  workspaceContainer: { flex: 1, flexDirection: 'row', gap: 16 },

  panel: {
    backgroundColor: '#FDFAF4', borderRadius: 32, padding: 20,
    borderWidth: 6, borderColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 20, elevation: 6,
  },
  panelHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: '#EBDCD0', borderStyle: 'dashed',
    paddingBottom: 12, marginBottom: 16,
  },
  panelTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleText: { fontSize: 20, fontWeight: '900', color: '#475569' },

  // ── Mobile layout ──
  tabBar: {
    flexDirection: 'row', backgroundColor: '#FDFAF4', borderRadius: 18,
    margin: 12, padding: 4, borderWidth: 4, borderColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabBtnActive: { backgroundColor: '#FF5E97' },
  tabBtnText: { fontWeight: '700', color: '#8A7463', fontSize: 14 },
  tabBtnTextActive: { color: '#FFF' },

  mobileScroll: { paddingHorizontal: 12, gap: 10 },
  mobileCard: {
    backgroundColor: '#FDFAF4', borderRadius: 24, padding: 16, margin: 0,
    borderWidth: 5, borderColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4,
  },

  // Avatar
  avatarRow: { alignItems: 'center', marginBottom: 16 },
  avatarBox: {
    width: 100, height: 100, borderRadius: 28, backgroundColor: '#FFF0F5',
    borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3,
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 24 },

  // Form
  formGroup: { width: '100%', gap: 5, marginBottom: 10 },
  label: { fontWeight: '700', fontSize: 13, color: '#8A7463' },
  input: {
    backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 9, color: '#475569', fontSize: 15, fontWeight: '600',
  },
  inputIconWrapper: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', right: 14 },
  pickerBox: {
    backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 14,
    paddingHorizontal: 14, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  datePickerBox: {
    backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 14,
    paddingHorizontal: 10, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pickerText: { color: '#475569', fontSize: 15, fontWeight: '600' },
  dropdownMenu: {
    position: 'absolute', top: 74, left: 0, right: 0,
    backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 14,
    maxHeight: 140, zIndex: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  dropdownItem: { paddingVertical: 9, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#F0E6DF' },
  dropdownText: { color: '#475569', fontWeight: '600', fontSize: 14 },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderToggle: {
    flex: 1, paddingVertical: 9, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 14, alignItems: 'center',
  },
  genderToggleActive: { backgroundColor: '#FF5E97', borderColor: '#FF5E97' },
  genderText: { fontWeight: '700', color: '#8A7463', fontSize: 14 },
  genderTextActive: { color: '#FFF' },
  textArea: { height: 80, textAlignVertical: 'top' },

  // Action buttons
  detailActions: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 16 },
  btnAction: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },

  // Search
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderWidth: 2, borderColor: '#EBDCD0', borderRadius: 9999, paddingHorizontal: 14, height: 42,
  },
  searchInput: {
    flex: 1, marginLeft: 8, fontSize: 14, color: '#8A7463', fontWeight: '500',
    outlineStyle: 'none',
  } as any,
  filterSelectWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0E6DF',
    borderRadius: 9999, paddingHorizontal: 12, height: 42, gap: 5, minWidth: 100,
  },
  filterValue: { fontWeight: '700', color: '#8A7463', fontSize: 13, flex: 1 },
  filterDropdownMenu: {
    position: 'absolute', top: 48, right: 0, minWidth: 110,
    backgroundColor: '#FFF', borderRadius: 14, borderWidth: 2, borderColor: '#EBDCD0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, zIndex: 100,
  },

  // Character grid
  characterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  charCard: {
    backgroundColor: '#FFF', borderRadius: 20, borderWidth: 4, borderColor: '#FFF',
    alignItems: 'center', paddingTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1,
  },
  charCardActive: { borderColor: '#FF5E97', backgroundColor: '#FFF5F7' },
  charName: { marginTop: 6, fontWeight: '700', color: '#475569', fontSize: 13 },
  addNewCard: { backgroundColor: 'transparent', borderColor: '#C8B5A7', borderStyle: 'dashed', justifyContent: 'center', paddingTop: 0 },
  charPlaceholder: { width: 70, height: 70, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7FAFC', borderRadius: 18 },
  charAvatar: { width: '100%', height: '100%', borderRadius: 18 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 300, backgroundColor: '#FDFAF4', borderRadius: 24, padding: 22, alignItems: 'center', borderWidth: 4, borderColor: '#FFF' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 8 },
  modalDesc: { fontSize: 14, color: '#718096', textAlign: 'center', marginBottom: 18 },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBtn: { flex: 1, paddingVertical: 11, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Toast
  toastContainer: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 7,
  },
  toastText: { fontWeight: '700', color: '#2D3748', fontSize: 14 },
});
