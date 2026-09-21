import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Image, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { usePopSound } from '@/hooks/usePopSound';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { AikidButton, AikidIcon, AikidModal, AikidPage, AikidPanel, AikidText } from '@/ui';
import { listRemoteCharacters, mergeCharacterLibrary, useCharacterDraft } from '@/features/character';
import { useFamily } from '@/features/family/store/useFamily';
import { useWorkspace } from '@/core/workspace/useWorkspace';

type UiCharacter = {
  id: string;
  name: string;
  species: string;
  age: number;
  dob: string;
  gender: string;
  bio: string;
  avatar: string | null;
};

// ─── Component ─────────────────────────────────────────────────────────────────
export default function StorageV2() {
  const { playPop } = usePopSound();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const savedCharacters = useCharacterDraft((state) => state.saved);
  const hydrateCharacters = useCharacterDraft((state) => state.hydrate);
  const removeSavedCharacter = useCharacterDraft((state) => state.removeSaved);

  const childId = useFamily((state) => state.activeChildId);
  const ipId = useWorkspace((state) => state.activeIpId);
  const remoteCharacters = useQuery({
    queryKey: ['character-library', childId ?? null, ipId ?? null],
    enabled: Boolean(ipId),
    queryFn: () => listRemoteCharacters({ ipId: ipId!, childId }),
  });
  const [characters, setCharacters] = useState<UiCharacter[]>([]);
  const [activeCharId, setActiveCharId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('Tất cả');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // Mobile tab state
  const [activeTab, setActiveTab] = useState<'detail' | 'list'>('detail');

  useEffect(() => {
    void hydrateCharacters();
  }, [hydrateCharacters]);

  useEffect(() => {
    const merged = mergeCharacterLibrary(remoteCharacters.data ?? [], savedCharacters);
    const mapped: UiCharacter[] = merged.map((character) => ({
      id: character.id,
      name: character.name,
      species: character.species || '',
      age: Number(character.age) || 0,
      dob: character.birthday || '01/01',
      gender: character.gender || 'Khác',
      bio: character.description || '',
      avatar: character.avatarUri || null,
    }));
    setCharacters(mapped);
    setActiveCharId((current) => mapped.some((character) => character.id === current) ? current : mapped[0]?.id || '');
  }, [remoteCharacters.data, savedCharacters]);

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

  const handlePickAvatar = async () => {
    playPop();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    const uri = !result.canceled ? result.assets[0]?.uri : null;
    if (uri) {
      updateActiveChar('avatar', uri);
      showToast('Đã cập nhật ảnh nhân vật');
    }
  };

  const changeBirthdayDay = (delta: number) => {
    const [dayRaw, monthRaw] = String(activeChar?.dob || '01/01').split('/');
    const month = Math.min(12, Math.max(1, Number(monthRaw) || 1));
    const maxDay = new Date(2024, month, 0).getDate();
    const day = Math.min(maxDay, Math.max(1, (Number(dayRaw) || 1) + delta));
    updateActiveChar('dob', `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`);
    playPop();
  };

  const handleAddCharacter = () => {
    playPop();
    const id = `character-${Date.now()}`;
    setCharacters((current) => [
      ...current,
      { id, name: 'Nhân vật mới', species: '', age: 7, dob: '01/01', gender: 'Khác', bio: '', avatar: null },
    ]);
    setActiveCharId(id);
    setActiveTab('detail');
  };

  const handleDeleteConfirm = () => {
    playPop();
    const newChars = characters.filter(c => c.id !== activeCharId);
    setCharacters(newChars);
    if (savedCharacters.some((character) => character.id === activeCharId)) {
      void removeSavedCharacter(activeCharId);
    }
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

  // ─── Sub-components ──────────────────────────────────────────────────────────

  const DetailContent = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={[styles.mobileCard, !isTablet && { margin: 0 }]}>
        {/* Avatar */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarBox}>
            {activeChar?.avatar
              ? <Image source={{ uri: activeChar.avatar }} style={styles.avatarImg} resizeMode="contain" />
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Loài / kiểu nhân vật</Text>
          <TextInput
            style={styles.input}
            value={activeChar?.species}
            onChangeText={t => updateActiveChar('species', t)}
            placeholder="Ví dụ: mèo phi hành gia"
            placeholderTextColor="#A3A3A3"
          />
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
              <TouchableOpacity onPress={() => changeBirthdayDay(-1)}><Ionicons name="remove-circle" size={22} color="#FF9EB5" /></TouchableOpacity>
              <Text style={styles.pickerText}>{activeChar?.dob}</Text>
              <TouchableOpacity onPress={() => changeBirthdayDay(1)}><Ionicons name="add-circle" size={22} color="#FF9EB5" /></TouchableOpacity>
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
          <AikidButton variant="encourage" size="sm" onPress={handleSave} leftIcon={<AikidIcon name="save" size={18} color="#FFF" />}>
            Lưu
          </AikidButton>
          <AikidButton variant="feature" size="sm" onPress={() => void handlePickAvatar()} leftIcon={<AikidIcon name="image" size={18} />}>
            Ảnh
          </AikidButton>
          <AikidButton variant="feature" size="sm" onPress={() => router.push('/(app)/account')} leftIcon={<AikidIcon name="person" size={18} />}>
            Hồ sơ
          </AikidButton>
          <AikidButton variant="feature" size="sm" onPress={() => showToast('Các trường đã sẵn sàng để chỉnh sửa')} leftIcon={<AikidIcon name="pencil" size={18} />}>
            Sửa
          </AikidButton>
          <AikidButton variant="delete" size="sm" onPress={() => { playPop(); setShowDeleteModal(true); }} leftIcon={<AikidIcon name="trash" size={18} color="#FFF" />}>
            Xóa
          </AikidButton>
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
          <TouchableOpacity style={[styles.charCard, styles.addNewCard, { width: cardW, height: cardW + 38 }]} onPress={handleAddCharacter}>
            <Ionicons name="add" size={42} color="#C8B5A7" />
            <Text style={styles.addNewText}>Tạo nhân vật mới</Text>
          </TouchableOpacity>
          {getFilteredChars().map((char, i) => {
            const isActive = char.id === activeCharId;
            return (
              <TouchableOpacity key={char.id} style={[styles.charCard, isActive && styles.charCardActive, { width: cardW, height: cardW + 38 }]} onPress={() => { playPop(); setActiveCharId(char.id); if (!isTablet) setActiveTab('detail'); }}>
                <View style={[styles.charPlaceholder, isActive && { backgroundColor: 'transparent' }]}>
                  {char.avatar
                    ? <Image source={{ uri: char.avatar }} style={styles.charAvatar} resizeMode="contain" />
                    : <Ionicons name="happy" size={isTablet ? 50 : 40} color={['#FFB6C1', '#87CEFA', '#98FB98', '#FFD700'][i % 4]} />
                  }
                </View>
                <Text style={[styles.charName, isActive && { color: '#FF5E97' }]} numberOfLines={1}>{char.name}</Text>
                {isActive ? <Text style={styles.selectedText}>ĐANG CHỌN</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <AikidPage
      scene="character"
      title="Nhân vật của con"
      backHref="/(app)/character"
      container="wide"
      scroll={false}
    >
      {isTablet ? (
        /* ════ TABLET: 2 panel ngang ════ */
        <View style={styles.workspaceWrapper}>
          <View style={styles.workspaceContainer}>

            {/* Panel Detail */}
            <AikidPanel title="Thông tin nhân vật" icon="info" style={[styles.panel, { flex: 1.4 }]}>
              <DetailContent />
            </AikidPanel>

            {/* Panel List */}
            <AikidPanel title="Danh sách" icon="grid" style={[styles.panel, { flex: 1 }]}>
              <ListContent />
            </AikidPanel>
          </View>
        </View>
      ) : (
        /* ════ MOBILE: Tab-based single column ════ */
        <View style={{ flex: 1 }}>
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
      <AikidModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        position="center"
        size="sm"
        title="Xóa nhân vật?"
      >
        <AikidText variant="body" style={styles.modalDesc}>
          Bạn có chắc chắn muốn xóa nhân vật này không?
        </AikidText>
        <View style={styles.modalActions}>
          <AikidButton variant="feature" fullWidth onPress={() => setShowDeleteModal(false)}>
            Hủy
          </AikidButton>
          <AikidButton variant="delete" fullWidth onPress={handleDeleteConfirm}>
            Xóa
          </AikidButton>
        </View>
      </AikidModal>

      {/* Toast */}
      <Animated.View style={[styles.toastContainer, toastStyle]}>
        <Ionicons name="checkmark-circle" size={22} color="#48BB78" />
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>
    </AikidPage>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Tablet layout ──
  workspaceWrapper: { flex: 1 },
  workspaceContainer: { flex: 1, flexDirection: 'row', gap: 16 },

  panel: {
    minWidth: 0,
  },

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
    width: 124, height: 124, borderRadius: 30, backgroundColor: '#FFF8F2',
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
  detailActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 },

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
    alignItems: 'center', padding: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1,
  },
  charCardActive: { borderColor: '#FF5E97', backgroundColor: '#FFF5F7' },
  charName: { marginTop: 7, fontWeight: '800', color: '#475569', fontSize: 13, textAlign: 'center' },
  selectedText: { color: '#FF5E97', fontSize: 9, fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },
  addNewCard: { backgroundColor: '#FFFDF9', borderColor: '#C8B5A7', borderStyle: 'dashed', justifyContent: 'center' },
  addNewText: { color: '#8A7463', fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  charPlaceholder: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
  },
  charAvatar: { width: '100%', height: '100%' },

  // Modal
  modalDesc: { textAlign: 'center', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
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
