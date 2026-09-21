import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export type CharacterPickerItem = {
  id: string;
  name: string;
  imageUri?: string | null;
  subtitle?: string;
};

type Props = {
  characters: CharacterPickerItem[];
  selectedIds: string[];
  maxSelection?: number;
  onToggle: (id: string) => void;
  onCreate?: () => void;
  renderSelectedActions?: (character: CharacterPickerItem) => ReactNode;
};

export function CharacterPicker({
  characters,
  selectedIds,
  maxSelection = 4,
  onToggle,
  onCreate,
  renderSelectedActions,
}: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 700;
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase('vi');
  const filtered = useMemo(
    () => characters.filter((character) => (
      !normalizedQuery ||
      character.name.toLocaleLowerCase('vi').includes(normalizedQuery) ||
      character.subtitle?.toLocaleLowerCase('vi').includes(normalizedQuery)
    )),
    [characters, normalizedQuery],
  );

  return (
    <View style={styles.library}>
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9A897C" />
          <TextInput
            accessibilityLabel="Tìm nhân vật"
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm nhân vật..."
            placeholderTextColor="#A99586"
            style={styles.searchInput}
          />
          {query ? (
            <TouchableOpacity accessibilityLabel="Xóa tìm kiếm" onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#B8A79A" />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.selectionCount}>
          <Ionicons name="people" size={16} color="#FF5E97" />
          <Text style={styles.selectionCountText}>Đã chọn {selectedIds.length}/{maxSelection}</Text>
        </View>
      </View>

      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.map((character) => {
          const selected = selectedIds.includes(character.id);
          return (
            <View key={character.id} style={[styles.card, compact && styles.cardCompact, selected && styles.cardSelected]}>
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${selected ? 'Bỏ chọn' : 'Chọn'} ${character.name}`}
                onPress={() => onToggle(character.id)}
                style={styles.selectArea}
              >
                {character.imageUri ? (
                  <Image source={{ uri: character.imageUri }} style={styles.avatar} resizeMode="contain" />
                ) : (
                  <View style={styles.avatarEmpty}>
                    <Ionicons name="person-outline" size={34} color="#A58E7D" />
                  </View>
                )}
                <View style={[styles.check, selected && styles.checkSelected]}>
                  <Ionicons name={selected ? 'checkmark' : 'add'} size={16} color={selected ? '#FFF' : '#FF5E97'} />
                </View>
                <Text style={styles.name} numberOfLines={2}>{character.name}</Text>
                {character.subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{character.subtitle}</Text> : null}
              </TouchableOpacity>
              {selected ? renderSelectedActions?.(character) : null}
            </View>
          );
        })}

        {onCreate ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Tạo nhân vật mới"
            style={[styles.card, styles.createCard, compact && styles.cardCompact]}
            onPress={onCreate}
          >
            <Ionicons name="add-circle-outline" size={40} color="#FF5E97" />
            <Text style={styles.createText}>Tạo nhân vật mới</Text>
          </TouchableOpacity>
        ) : null}
        {!filtered.length && query ? (
          <View style={styles.noResult}>
            <Ionicons name="search-outline" size={30} color="#C8B5A7" />
            <Text style={styles.noResultText}>Không tìm thấy nhân vật phù hợp</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  library: { borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 20, backgroundColor: '#FFFDFB', overflow: 'hidden' },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: '#EFE3DA', backgroundColor: '#FFF9F6' },
  searchBox: { flex: 1, minWidth: 210, maxWidth: 430, height: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, borderWidth: 1.5, borderColor: '#EBDCD0', borderRadius: 14, backgroundColor: '#FFF' },
  searchInput: { flex: 1, height: '100%', color: '#475569', fontSize: 14, outlineStyle: 'none' } as never,
  selectionCount: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF0F4' },
  selectionCountText: { color: '#FF5E97', fontSize: 12, fontWeight: '900' },
  scroll: { maxHeight: 440 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: 12, padding: 14 },
  card: { position: 'relative', width: '23.5%', minWidth: 185, padding: 11, borderWidth: 2, borderColor: '#E9DED4', borderRadius: 18, backgroundColor: '#FFF' },
  cardCompact: { width: '47%', minWidth: 140 },
  cardSelected: { borderColor: '#FF7597', backgroundColor: '#FFF7F9' },
  selectArea: { alignItems: 'center' },
  avatar: { width: 76, height: 76, borderRadius: 16 },
  avatarEmpty: { width: 76, height: 76, borderRadius: 16, backgroundColor: '#F5EEE8', alignItems: 'center', justifyContent: 'center' },
  check: { position: 'absolute', top: 0, right: 0, width: 25, height: 25, borderRadius: 13, borderWidth: 1.5, borderColor: '#FFB0C6', backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  checkSelected: { borderColor: '#FF5E97', backgroundColor: '#FF5E97' },
  name: { color: '#475569', fontWeight: '900', marginTop: 8, textAlign: 'center' },
  subtitle: { color: '#9A897C', fontSize: 10, marginTop: 3, textAlign: 'center' },
  createCard: { minHeight: 143, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' },
  createText: { color: '#475569', fontWeight: '900', marginTop: 8, textAlign: 'center' },
  noResult: { width: '100%', minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 8 },
  noResultText: { color: '#9A897C', fontWeight: '700' },
});
