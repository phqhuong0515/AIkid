import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
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
import { mergeComicStories, parseRemoteComicStories } from '@/features/comic/api/comicRemoteLibrary';

type StoredComicStory = {
  id: string;
  title?: string;
  artStyle?: string;
  coverImageUrl?: string;
  pages?: { id?: string; imageUrl?: string; jobId?: string }[];
  panels?: { imageUrl?: string; jobId?: string }[];
};

const COMIC_STORY_KEY = 'aikid.comic.stories.v1';
const COMIC_IMAGE_JOB_IDS_KEY = 'aikid.comic.image-job-ids.v1';

export default function GalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const childId = useFamily((s) => s.activeChildId);
  const ipId = useWorkspace((s) => s.activeIpId);
  const recentAi = useRecentAiImages((s) => s.items);
  const setRecentScope = useRecentAiImages((s) => s.setScope);
  const { saved: allCharacters, hydrate: hydrateCharacters } = useCharacterDraft();
  const characters = allCharacters.filter(
    (character) => !character.childProfileId || character.childProfileId === childId,
  );
  const [section, setSection] = useState<'all' | 'ai' | 'characters' | 'comics'>('all');
  const [selectedCharacter, setSelectedCharacter] = useState<SavedCharacter | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{
    uri: string;
    title: string;
    typeLabel: string;
    createdAt?: string | null;
  } | null>(null);
  const [comicStories, setComicStories] = useState<StoredComicStory[]>([]);
  const [comicImageJobIds, setComicImageJobIds] = useState<string[]>([]);

  // Responsive column widths
  const mediaCardWidth = useMemo(() => {
    if (width >= 1200) return '18.5%';
    if (width >= 1024) return '23.5%';
    if (width >= 768) return '31.3%';
    return '48%';
  }, [width]);

  const comicCardWidth = useMemo(() => {
    if (width >= 1024) return '31.5%';
    if (width >= 640) return '48%';
    return '100%';
  }, [width]);

  const handleDownloadMedia = useCallback(async (uri: string, filename?: string) => {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename || `aikid_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(objectUrl);
        Alert.alert('Thành công! 🎉', 'Tác phẩm đã được tải về máy của con!');
      } else {
        await Linking.openURL(uri);
      }
    } catch {
      await Linking.openURL(uri);
    }
  }, []);

  const loadComicStories = useCallback(async () => {
    try {
      const [raw, rawJobIds] = await Promise.all([
        AsyncStorage.getItem(COMIC_STORY_KEY),
        AsyncStorage.getItem(COMIC_IMAGE_JOB_IDS_KEY),
      ]);
      const parsed = raw ? JSON.parse(raw) : [];
      const stories: StoredComicStory[] = Array.isArray(parsed)
        ? parsed.filter((story) => story?.id)
        : [];
      const storedJobIds = rawJobIds ? JSON.parse(rawJobIds) : [];
      const storyJobIds = stories.flatMap((story) => [
        ...(story.pages?.map((page) => page.jobId) || []),
        ...(story.panels?.map((panel) => panel.jobId) || []),
      ]).filter((id): id is string => Boolean(id));
      setComicStories(stories);
      setComicImageJobIds([
        ...new Set([
          ...(Array.isArray(storedJobIds) ? storedJobIds.filter((id): id is string => typeof id === 'string') : []),
          ...storyJobIds,
        ]),
      ]);
    } catch {
      setComicStories([]);
      setComicImageJobIds([]);
    }
  }, []);
  
  useEffect(() => { void hydrateCharacters(); }, [hydrateCharacters]);
  useEffect(() => { void loadComicStories(); }, [loadComicStories]);
  
  const query = useQuery({
    queryKey: ['media', 'gallery', childId, ipId],
    enabled: !!childId && !!ipId,
    queryFn: () => mediaApi.listGallery({ ipId: ipId!, tag: `child:${childId}`, limit: 48, offset: 0 }),
  });
  
  const aiQuery = useAiImages({ enabled: !!childId && !!ipId, childId, ipId });
  const refetchGallery = query.refetch;
  const refetchAi = aiQuery.refetch;
  
  useFocusEffect(useCallback(() => {
    if (!childId || !ipId) return;
    void setRecentScope(childId);
    void refetchGallery();
    void refetchAi();
    void loadComicStories();
  }, [childId, ipId, loadComicStories, refetchAi, refetchGallery, setRecentScope]));
  
  const remoteAi = aiQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const visibleComicStories = mergeComicStories(comicStories, parseRemoteComicStories(query.data?.items ?? [])) as StoredComicStory[];
  const allAiItems = [...recentAi, ...remoteAi]
    .map((item) => ({
      ...item,
      uri: resolveMediaUri(item.uri) || item.uri,
    }))
    .filter(
      (item, index, all) => all.findIndex((candidate) => candidate.id === item.id || candidate.uri === item.uri) === index,
    );
  const normalizeComparableUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '');
    } catch {
      return url.split('?')[0].replace(/\/+$/, '');
    }
  };
  const comicImageUrls = new Set(comicStories.flatMap((story) => [
    story.coverImageUrl,
    ...(story.pages?.map((page) => page.imageUrl) || []),
    ...(story.panels?.map((panel) => panel.imageUrl) || []),
  ].filter((url): url is string => Boolean(url)).map((u) => normalizeComparableUrl(resolveMediaUri(u) || u))));
  const aiItems = allAiItems.filter(
    (item) =>
      !comicImageJobIds.includes(item.id) &&
      !comicImageUrls.has(normalizeComparableUrl(item.uri)),
  );

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../public/lobby-assets/images/bg-art.png')} style={styles.bgImage} resizeMode="cover">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: Math.max(20, insets.top),
            paddingHorizontal: 16,
            paddingBottom: 60,
          }}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}
        >
          <View style={styles.pageWrapper}>
            <GlobalHeader />

            <View style={styles.galleryCard}>
              {!childId ? (
                <Text style={{ margin: 20, padding: 16, backgroundColor: '#FEF3C7', borderRadius: 12 }}>Chọn hồ sơ con trước khi xem ảnh.</Text>
              ) : query.isLoading ? (
                <ActivityIndicator style={{ marginVertical: 48 }} size="large" color="#FF7597" />
              ) : (
                <>
                  <View style={styles.tabContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      {([
                        ['all', 'Tất cả'],
                        ['ai', `Ảnh AI · ${aiItems.length}`],
                        ['characters', `Nhân vật · ${characters.length}`],
                        ['comics', `Truyện tranh · ${visibleComicStories.length}`],
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

                  <View style={styles.galleryCardBody}>
                    {(section === 'all' || section === 'characters') && characters.length ? (
                      <GallerySection title="Nhân vật" hint="Chạm vào ảnh để xem prompt">
                        <View style={styles.grid}>
                          {characters.map((character) => {
                            const avatarUri = resolveMediaUri(character.avatarUri) || character.avatarUri;
                            return (
                              <Pressable 
                                accessibilityRole="button" 
                                accessibilityLabel={`Xem nhân vật ${character.name}`} 
                                key={character.id} 
                                onPress={() => setSelectedCharacter({ ...character, avatarUri })} 
                                style={({ pressed, hovered }: any) => [
                                  styles.characterCard,
                                  { width: mediaCardWidth },
                                  pressed && styles.mediaCardPressed,
                                  hovered && styles.mediaCardHovered,
                                ]}
                              >
                                <View style={styles.imageWrapper}>
                                  {avatarUri ? (
                                    <GalleryMediaImage
                                      uri={avatarUri}
                                      style={styles.mediaImage}
                                      fallbackEmoji="🧸"
                                    />
                                  ) : (
                                    <View style={styles.emptyAvatar}>
                                      <Text style={{ fontSize: 36 }}>🧸</Text>
                                    </View>
                                  )}
                                </View>
                                <View style={{ padding: 10 }}>
                                  <Text style={{ fontWeight: '800', color: '#0F172A', fontSize: 13 }} numberOfLines={1}>
                                    {character.name}
                                  </Text>
                                  <Text style={{ marginTop: 2, fontSize: 11, color: '#94A3B8' }}>
                                    {character.source === 'ai' ? 'Nhân vật AI' : 'Bản nháp'}
                                  </Text>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      </GallerySection>
                    ) : null}

                    {(section === 'all' || section === 'ai') && aiItems.length ? (
                      <GallerySection title="Ảnh AI" hint="Ảnh đơn được tạo trong Xưởng vẽ · Chạm để xem lớn">
                        <View style={styles.grid}>
                          {aiItems.map((item, idx) => {
                            const uri = resolveMediaUri(item.uri) || item.uri;
                            return (
                              <Pressable
                                key={`ai-${item.id || idx}`}
                                onPress={() =>
                                  setSelectedMedia({
                                    uri,
                                    title: (item as any).title || `Ảnh AI #${idx + 1}`,
                                    typeLabel: 'Ảnh vẽ AI',
                                    createdAt: item.createdAt,
                                  })
                                }
                                style={({ pressed, hovered }: any) => [
                                  styles.mediaCard,
                                  { width: mediaCardWidth },
                                  pressed && styles.mediaCardPressed,
                                  hovered && styles.mediaCardHovered,
                                ]}
                                accessibilityRole="button"
                                accessibilityLabel={`Xem ảnh AI ${idx + 1}`}
                              >
                                <View style={styles.imageWrapper}>
                                  <GalleryMediaImage
                                    uri={uri}
                                    style={styles.mediaImage}
                                    fallbackEmoji="🎨"
                                  />
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      </GallerySection>
                    ) : null}

                    {(section === 'all' || section === 'comics') && visibleComicStories.length ? (
                      <GallerySection title="Truyện tranh" hint="Mỗi thẻ là một bộ truyện">
                        <View style={styles.comicGrid}>
                          {visibleComicStories.map((story) => {
                            const pages = story.pages?.filter((page) => page.imageUrl) || [];
                            const rawCover = story.coverImageUrl || pages[0]?.imageUrl;
                            const cover = resolveMediaUri(rawCover) || rawCover;
                            return (
                              <Pressable
                                key={story.id}
                                accessibilityRole="button"
                                accessibilityLabel={`Mở truyện ${story.title || 'Truyện của em'}`}
                                onPress={() => router.push({ pathname: '/(app)/comic/story-reader', params: { id: story.id, type: 'comic' } })}
                                style={({ pressed, hovered }: any) => [
                                  styles.comicCard,
                                  { width: comicCardWidth },
                                  pressed && styles.mediaCardPressed,
                                  hovered && styles.mediaCardHovered,
                                ]}
                              >
                                <View style={styles.comicCoverWrapper}>
                                  {cover ? (
                                    <GalleryMediaImage
                                      uri={cover}
                                      style={styles.comicCover}
                                      fallbackEmoji="📖"
                                    />
                                  ) : (
                                    <View style={styles.comicCoverEmpty}>
                                      <Text style={styles.comicCoverEmoji}>📖</Text>
                                    </View>
                                  )}
                                </View>
                                <View style={styles.comicInfo}>
                                  <View style={styles.comicInfoCopy}>
                                    <Text style={styles.comicTitle} numberOfLines={1}>{story.title || 'Truyện của em'}</Text>
                                    <Text style={styles.comicMeta}>{pages.length} trang · {story.artStyle || 'Nét vẽ tự do'}</Text>
                                  </View>
                                  <View style={styles.comicOpen}><Text style={styles.comicOpenText}>Mở truyện →</Text></View>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      </GallerySection>
                    ) : null}

                    {!aiItems.length && !characters.length && !visibleComicStories.length ? (
                      <Text style={{ paddingVertical: 64, textAlign: 'center', color: '#64748B' }}>Chưa có tác phẩm AI nào. Hãy tạo ảnh AI, nhân vật hoặc truyện tranh nhé!</Text>
                    ) : null}
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>

        <CharacterPromptModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onDownload={handleDownloadMedia}
        />
        <ImagePreviewModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onDownload={handleDownloadMedia}
        />
      </ImageBackground>
    </View>
  );
}

function GalleryMediaImage({
  uri,
  style,
  fallbackEmoji = '🎨',
  transition = 200,
}: {
  uri?: string | null;
  style: any;
  fallbackEmoji?: string;
  transition?: number;
}) {
  const [loadError, setLoadError] = useState(false);

  if (!uri || loadError) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: '#FDF4FF',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <Text style={{ fontSize: 32 }}>{fallbackEmoji}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      transition={transition}
      onError={() => setLoadError(true)}
    />
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

function CharacterPromptModal({
  character,
  onClose,
  onDownload,
}: {
  character: SavedCharacter | null;
  onClose: () => void;
  onDownload: (uri: string, filename?: string) => void;
}) {
  return (
    <Modal visible={Boolean(character)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} accessibilityLabel="Đóng chi tiết nhân vật" />
        {character ? (
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewTitleWrap}>
                <Text style={styles.previewTitle} numberOfLines={1}>{character.name}</Text>
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>{character.source === 'ai' ? 'Nhân vật AI' : 'Bản nháp'}</Text>
                </View>
              </View>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.previewCloseBtn}>
                <Text style={styles.previewCloseBtnText}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 460 }}>
              {character.avatarUri ? (
                <View style={styles.previewImageContainer}>
                  <GalleryMediaImage
                    uri={resolveMediaUri(character.avatarUri) || character.avatarUri}
                    style={styles.previewImage}
                    fallbackEmoji="🧸"
                  />
                </View>
              ) : null}
              <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, color: '#FF7597' }}>
                  Prompt tạo nhân vật
                </Text>
                <Text selectable style={{ marginTop: 8, borderRadius: 16, backgroundColor: '#F8FAFC', padding: 14, fontSize: 13, lineHeight: 22, color: '#334155' }}>
                  {character.userPrompt || 'Nhân vật này chưa có prompt được lưu.'}
                </Text>
                <Text style={{ marginTop: 10, fontSize: 12, color: '#94A3B8' }}>
                  Đã lưu {new Date(character.createdAt).toLocaleString('vi-VN')}
                </Text>
              </View>
            </ScrollView>
            {character.avatarUri ? (
              <View style={styles.previewFooter}>
                <Text style={styles.previewDate}>Nhân vật Mee</Text>
                <Pressable
                  style={({ pressed }: any) => [styles.downloadBtn, pressed && { opacity: 0.85 }]}
                  onPress={() => onDownload(resolveMediaUri(character.avatarUri) || character.avatarUri!, `${character.name}.png`)}
                >
                  <Text style={styles.downloadBtnText}>📥 Tải ảnh về máy</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function ImagePreviewModal({
  media,
  onClose,
  onDownload,
}: {
  media: { uri: string; title: string; typeLabel: string; createdAt?: string | null } | null;
  onClose: () => void;
  onDownload: (uri: string, filename?: string) => void;
}) {
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    setLoadError(false);
  }, [media?.uri]);

  if (!media) return null;
  const resolvedUri = resolveMediaUri(media.uri) || media.uri;

  return (
    <Modal visible={Boolean(media)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} accessibilityLabel="Đóng xem trước ảnh" />
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewTitleWrap}>
              <Text style={styles.previewTitle} numberOfLines={1}>{media.title}</Text>
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>{media.typeLabel}</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.previewCloseBtn}>
              <Text style={styles.previewCloseBtnText}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.previewImageContainer}>
            {resolvedUri && !loadError ? (
              <Image
                source={{ uri: resolvedUri }}
                style={styles.previewImage}
                contentFit="contain"
                transition={200}
                onError={() => setLoadError(true)}
              />
            ) : (
              <View style={[styles.previewImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDF4FF' }]}>
                <Text style={{ fontSize: 64 }}>🎨</Text>
              </View>
            )}
          </View>
          <View style={styles.previewFooter}>
            <Text style={styles.previewDate}>
              {media.createdAt ? `Đã lưu: ${new Date(media.createdAt).toLocaleDateString('vi-VN')}` : 'Tác phẩm sáng tạo'}
            </Text>
            <Pressable
              style={({ pressed }: any) => [styles.downloadBtn, pressed && { opacity: 0.85 }]}
              onPress={() => onDownload(resolvedUri, `${media.title || 'aikid_image'}.png`)}
            >
              <Text style={styles.downloadBtnText}>📥 Tải ảnh về máy</Text>
            </Pressable>
          </View>
        </View>
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
  pageWrapper: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    gap: 16,
    paddingBottom: 60,
  },
  topActionBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  galleryCard: {
    width: '100%',
    backgroundColor: '#FDFAF4',
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  galleryCardBody: {
    padding: 16,
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
    gap: 10,
  },
  mediaCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFF0F3',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  mediaCardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  mediaCardHovered: {
    transform: [{ scale: 1.02 }],
    borderColor: '#FFB8C9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  characterCard: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFF0F3',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyAvatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  comicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  comicCard: {
    minWidth: 260,
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F2DED2',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  comicCoverWrapper: {
    width: '100%',
    aspectRatio: 1.55,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  comicCover: {
    width: '100%',
    height: '100%',
  },
  comicCoverEmpty: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
  },
  comicCoverEmoji: {
    fontSize: 44,
  },
  comicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  comicInfoCopy: {
    flex: 1,
    minWidth: 0,
  },
  comicTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
  },
  comicMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 3,
  },
  comicOpen: {
    borderRadius: 999,
    backgroundColor: '#FFF0F4',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  comicOpenText: {
    color: '#FF5E97',
    fontSize: 10,
    fontWeight: '900',
  },
  // Modal Preview styles
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
    padding: 16,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  previewCard: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  previewTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 10,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  previewBadge: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF7597',
  },
  previewCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCloseBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: 'bold',
  },
  previewImageContainer: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 440,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  previewDate: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  downloadBtn: {
    backgroundColor: '#FF7597',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
