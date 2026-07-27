import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { useFamily } from '@/features/family/store/useFamily';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { resolveMediaUri, useAiImages } from '@/features/media/api/mediaHooks';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { mediaApi } from '@/core/storymee';
import { useCharacterDraft } from '@/features/character';
import type { SavedCharacter } from '@/features/character/types';
import { GlobalHeader } from '@/components/GlobalHeader';

export default function GalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const childId = useFamily((s) => s.activeChildId);
  const ipId = useWorkspace((s) => s.activeIpId);
  const recentAi = useRecentAiImages((s) => s.items);
  const setRecentScope = useRecentAiImages((s) => s.setScope);
  const { saved: allCharacters, hydrate: hydrateCharacters } = useCharacterDraft();
  const characters = allCharacters.filter(
    (character) => !character.childProfileId || character.childProfileId === childId,
  );
  const [section, setSection] = useState<'all' | 'ai' | 'uploads' | 'characters'>('all');
  const [selectedCharacter, setSelectedCharacter] = useState<SavedCharacter | null>(null);
  
  useEffect(() => { void hydrateCharacters(); }, [hydrateCharacters]);
  
  const query = useQuery({
    queryKey: ['media', 'gallery', childId, ipId],
    enabled: !!childId && !!ipId,
    queryFn: () => mediaApi.listGallery({ ipId: ipId!, tag: `child:${childId}`, limit: 100, offset: 0 }),
  });
  
  const aiQuery = useAiImages({ enabled: !!childId && !!ipId, childId, ipId });
  
  useFocusEffect(useCallback(() => {
    if (!childId || !ipId) return;
    void setRecentScope(childId);
    void query.refetch();
    void aiQuery.refetch();
  }, [childId, ipId, setRecentScope]));
  
  const remoteAi = aiQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const aiItems = [...recentAi, ...remoteAi].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.id === item.id || candidate.uri === item.uri) === index,
  );

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../public/lobby-assets/images/bg-art.png')} style={styles.bgImage} resizeMode="cover">
        <View style={{ paddingTop: Math.max(20, insets.top), flex: 1 }}>
          <View style={{ paddingHorizontal: 16, zIndex: 10, paddingBottom: 10 }}>
            <GlobalHeader />
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, marginBottom: 10 }}>
            <Pressable onPress={() => router.push('/(app)/capture')} style={styles.captureButton}>
              <Text style={styles.captureButtonText}>+ Thêm Ảnh</Text>
            </Pressable>
          </View>
          
          <View style={styles.mainCard}>
            {!childId ? (
              <Text style={{ margin: 20, padding: 16, backgroundColor: '#FEF3C7', borderRadius: 12 }}>Chọn hồ sơ con trước khi xem ảnh.</Text>
            ) : query.isLoading ? (
              <ActivityIndicator style={{ marginTop: 48 }} size="large" color="#FF7597" />
            ) : (
              <>
                <View style={styles.tabContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {([
                      ['all', 'Tất cả'], ['ai', `AI · ${aiItems.length}`], ['uploads', `Tải lên · ${query.data?.items.length ?? 0}`], ['characters', `Nhân vật · ${characters.length}`],
                    ] as const).map(([id, label]) => (
                      <Pressable 
                        accessibilityRole="button" 
                        accessibilityState={{ selected: section === id }} 
                        key={id} 
                        onPress={() => setSection(id)} 
                        style={[styles.tabButton, section === id ? styles.tabButtonActive : styles.tabButtonInactive]}
                      >
                        <Text style={[styles.tabText, section === id ? styles.tabTextActive : styles.tabTextInactive]}>{label}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
                <ScrollView 
                  refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />} 
                  contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
                >
                  {(section === 'all' || section === 'characters') && characters.length ? (
                    <GallerySection title="Nhân vật" hint="Chạm vào ảnh để xem prompt">
                      <View style={styles.grid}>
                        {characters.map((character) => (
                          <Pressable 
                            accessibilityRole="button" 
                            accessibilityLabel={`Xem nhân vật ${character.name}`} 
                            key={character.id} 
                            onPress={() => setSelectedCharacter(character)} 
                            style={styles.characterCard}
                          >
                            {character.avatarUri ? (
                              <Image source={{ uri: character.avatarUri }} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" />
                            ) : (
                              <View style={styles.emptyAvatar}>
                                <Text style={{ fontSize: 36 }}>🧸</Text>
                              </View>
                            )}
                            <View style={{ padding: 12 }}>
                              <Text style={{ fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>{character.name}</Text>
                              <Text style={{ marginTop: 2, fontSize: 11, color: '#94A3B8' }}>{character.source === 'ai' ? 'Nhân vật AI' : 'Bản nháp'}</Text>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    </GallerySection>
                  ) : null}
                  {(section === 'all' || section === 'ai') && aiItems.length ? (
                    <GallerySection title="Ảnh AI">
                      <View style={styles.grid}>
                        {aiItems.map((item) => (
                          <Image key={`ai-${item.id}`} source={{ uri: item.uri }} style={styles.mediaImage} contentFit="cover" />
                        ))}
                      </View>
                    </GallerySection>
                  ) : null}
                  {(section === 'all' || section === 'uploads') ? (
                    <GallerySection title="Ảnh tải lên">
                      <View style={styles.grid}>
                        {query.data?.items.map((item, index) => { 
                          const uri = resolveMediaUri(String(item.url || item.imageUrl || item.previewUrl || '')); 
                          return uri ? <Image key={`upload-${item.id || `${uri}-${index}`}`} source={{ uri }} style={styles.mediaImage} contentFit="cover" /> : null; 
                        })}
                      </View>
                    </GallerySection>
                  ) : null}
                  {!query.data?.items.length && !aiItems.length && !characters.length ? (
                    <Text style={{ paddingVertical: 64, textAlign: 'center', color: '#64748B' }}>Chưa có ảnh. Chụp, chọn ảnh từ thư viện hoặc tạo ảnh AI.</Text>
                  ) : null}
                </ScrollView>
                <CharacterPromptModal character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />
              </>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

function GallerySection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>{title}</Text>
        {hint ? <Text style={{ fontSize: 11, color: '#94A3B8' }}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function CharacterPromptModal({ character, onClose }: { character: SavedCharacter | null; onClose: () => void }) {
  return (
    <Modal visible={Boolean(character)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2, 6, 23, 0.4)', padding: 16 }}>
        <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={onClose} accessibilityLabel="Đóng chi tiết nhân vật" />
        {character ? (
          <View style={{ maxHeight: '86%', width: '100%', maxWidth: 620, overflow: 'hidden', borderRadius: 28, backgroundColor: '#FFFFFF' }}>
            <ScrollView>
              <View style={{ position: 'relative' }}>
                {character.avatarUri ? <Image source={{ uri: character.avatarUri }} style={{ width: '100%', aspectRatio: 1.35 }} contentFit="contain" /> : null}
                <Pressable accessibilityRole="button" onPress={onClose} style={{ position: 'absolute', right: 12, top: 12, height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)' }}>
                  <Text style={{ fontSize: 20, color: '#475569' }}>×</Text>
                </Pressable>
              </View>
              <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>{character.name}</Text>
                <Text style={{ marginTop: 4, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, color: '#FF7597' }}>Prompt tạo nhân vật</Text>
                <Text selectable style={{ marginTop: 12, borderRadius: 16, backgroundColor: '#F8FAFC', padding: 16, fontSize: 14, lineHeight: 24, color: '#334155' }}>
                  {character.userPrompt || 'Nhân vật này chưa có prompt được lưu.'}
                </Text>
                <Text style={{ marginTop: 12, fontSize: 12, color: '#94A3B8' }}>Đã lưu {new Date(character.createdAt).toLocaleString('vi-VN')}</Text>
              </View>
            </ScrollView>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#FDFAF4',
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  captureButton: {
    backgroundColor: '#FF7597',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFF7ED',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tabButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabButtonActive: {
    backgroundColor: '#0F172A',
  },
  tabButtonInactive: {
    backgroundColor: '#FFF7ED',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#334155',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  characterCard: {
    width: '48%',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFF7ED',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  emptyAvatar: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
  },
  mediaImage: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 14,
    marginBottom: 8,
  },
});
