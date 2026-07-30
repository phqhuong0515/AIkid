import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAikidTemplate } from '@/design-system';
import { useComicDraft } from '@/features/comic/store/useComicDraft';
import { useResponsiveLayout } from '@/features/kids-ui/useResponsiveLayout';
import { usePopSound } from '@/hooks/usePopSound';
import { AikidPage, AikidPanel, AikidText } from '@/ui';

type LibraryTab = 'plot' | 'comic' | 'text';
type LibraryStory = {
  id: string;
  title: string;
  type: 'Cốt Truyện' | 'Truyện Tranh' | 'Truyện Chữ';
  tab: LibraryTab;
  cover?: string;
  createdAt: string;
  excerpt: string;
};

type StoredTextStory = {
  id: string;
  title?: string;
  content?: string;
  createdAt?: string;
};
type StoredComicStory = {
  id: string;
  title?: string;
  createdAt?: string;
  coverImageUrl?: string;
  pages?: { imageUrl?: string }[];
  panels?: { imageUrl?: string; content?: string }[];
};

const TEXT_STORY_KEY = 'aikid.comic.text-stories.v1';
const TABS: { id: LibraryTab; label: string; type: LibraryStory['type'] }[] = [
  { id: 'plot', label: 'Cốt Truyện', type: 'Cốt Truyện' },
  { id: 'comic', label: 'Truyện Tranh', type: 'Truyện Tranh' },
  { id: 'text', label: 'Truyện Chữ', type: 'Truyện Chữ' },
];

export default function LibraryV2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { playPop } = usePopSound();
  const template = useAikidTemplate();
  const responsive = useResponsiveLayout({ maxContent: 1512 });
  const hydrate = useComicDraft((state) => state.hydrate);
  const library = useComicDraft((state) => state.library);
  const project = useComicDraft((state) => state.project);
  const [textStories, setTextStories] = useState<StoredTextStory[]>([]);
  const [comicStories, setComicStories] = useState<StoredComicStory[]>([]);
  const [activeTab, setActiveTab] = useState<LibraryTab>(params.tab === 'text' || params.tab === 'comic' ? params.tab : 'plot');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'az'>('newest');

  useFocusEffect(useCallback(() => {
    void hydrate();
    void Promise.all([
      AsyncStorage.getItem(TEXT_STORY_KEY),
      AsyncStorage.getItem('aikid.comic.stories.v1'),
    ]).then(([textRaw, comicRaw]) => {
      try {
        const parsed = textRaw ? JSON.parse(textRaw) : [];
        setTextStories(Array.isArray(parsed) ? parsed : []);
      } catch { setTextStories([]); }
      try {
        const parsed = comicRaw ? JSON.parse(comicRaw) : [];
        setComicStories(Array.isArray(parsed) ? parsed : []);
      } catch { setComicStories([]); }
    });
  }, [hydrate]));

  const stories = useMemo<LibraryStory[]>(() => {
    const savedPlots = library.length
      ? library
      : project.pages.some((page) => page.idea.trim())
        ? [{ ...project, versionId: 'current-draft', version: 0, savedAt: project.updatedAt }]
        : [];
    const plotStories: LibraryStory[] = savedPlots
      .filter((item) => item.pages.some((page) => page.idea.trim()))
      .map((item) => {
        const page = item.pages[0];
        return {
          id: item.versionId,
          title: item.title || page?.title || 'Cốt truyện chưa đặt tên',
          type: 'Cốt Truyện',
          tab: 'plot',
          cover: item.cast.find((character) => character.role === 'main')?.referenceImageUrl || item.cast[0]?.referenceImageUrl || undefined,
          createdAt: item.savedAt || item.updatedAt,
          excerpt: page?.idea || 'Cốt truyện đã lưu',
        };
      });
    const writtenStories: LibraryStory[] = textStories.map((story) => ({
      id: story.id,
      title: story.title || 'Truyện chữ của em',
      type: 'Truyện Chữ',
      tab: 'text',
      createdAt: story.createdAt || '',
      excerpt: story.content || 'Truyện chữ đã lưu',
    }));
    const drawnStories: LibraryStory[] = comicStories.map((story) => ({
      id: story.id,
      title: story.title || 'Truyện tranh của em',
      type: 'Truyện Tranh',
      tab: 'comic',
      cover: story.coverImageUrl || story.pages?.find((page) => page.imageUrl)?.imageUrl || story.panels?.find((panel) => panel.imageUrl)?.imageUrl,
      createdAt: story.createdAt || '',
      excerpt: `${story.panels?.length || 0} panel · Truyện tranh đã lưu`,
    }));
    return [...plotStories, ...writtenStories, ...drawnStories];
  }, [comicStories, library, project, textStories]);

  const tabType = TABS.find((tab) => tab.id === activeTab)?.type;
  const filteredStories = stories
    .filter((story) => story.tab === activeTab)
    .filter((story) => story.title.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === 'az') return a.title.localeCompare(b.title);
      return sort === 'oldest'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt);
    });
  const storyWidth = responsive.isDesktopUp ? 240 : responsive.isTabletUp ? '47%' : '100%';

  return (
    <AikidPage scene="art" title="Thư viện truyện" backHref="/(app)/comic" container="workspace" scroll>
      <AikidPanel title="Thư viện truyện" icon="grid" style={styles.workspacePanel}>
        <View style={[styles.panelHeader, !responsive.isDesktopUp && styles.panelHeaderStack]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {TABS.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <TouchableOpacity key={tab.id} style={[styles.tab, active && styles.tabActive]} onPress={() => { playPop(); setActiveTab(tab.id); }}>
                  <AikidText variant="bodyBold" style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</AikidText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={[styles.filters, !responsive.isDesktopUp && styles.filtersFull]}>
            <TouchableOpacity style={styles.sortControl} onPress={() => { playPop(); setSort((value) => value === 'newest' ? 'oldest' : value === 'oldest' ? 'az' : 'newest'); }}>
              <AikidText variant="brand">Bộ lọc:</AikidText>
              <AikidText variant="bodyBold">{sort === 'newest' ? 'Mới nhất' : sort === 'oldest' ? 'Cũ nhất' : 'A-Z'}</AikidText>
              <Ionicons name="chevron-down" size={16} color={template.colors.text.body} />
            </TouchableOpacity>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={template.colors.text.body} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Tìm kiếm truyện..." placeholderTextColor={template.colors.text.placeholder} style={[styles.searchInput, { fontFamily: template.fonts.bodyReg, color: template.colors.text.heading }]} />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
          {filteredStories.length ? filteredStories.map((story, index) => (
            <Animated.View key={`${story.tab}-${story.id}`} entering={FadeInDown.delay(index * 80).duration(320)} style={[styles.storyCard, { width: storyWidth }]}>
              <TouchableOpacity
                onPress={() => {
                  playPop();
                  router.push({ pathname: '/(app)/comic/story-reader', params: { id: story.id, type: story.tab } });
                }}
                activeOpacity={0.86}
              >
                {story.cover ? (
                  <Image source={{ uri: story.cover }} style={styles.cover} contentFit="cover" />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Ionicons name={story.tab === 'text' ? 'document-text-outline' : 'map-outline'} size={54} color="#FF7A9E" />
                  </View>
                )}
                <View style={styles.storyInfo}>
                  <AikidText variant="bodyBold" numberOfLines={2}>{story.title}</AikidText>
                  <AikidText variant="caption" style={styles.storyType}>{story.type}</AikidText>
                  <AikidText variant="caption" style={styles.excerpt} numberOfLines={2}>{story.excerpt}</AikidText>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )) : (
            <Animated.View entering={FadeIn.duration(320)} style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={64} color={template.colors.text.placeholder} />
              <AikidText variant="title" style={styles.emptyTitle}>Chưa có {tabType?.toLowerCase()} nào</AikidText>
            </Animated.View>
          )}
        </ScrollView>
      </AikidPanel>
    </AikidPage>
  );
}

const styles = StyleSheet.create({
  workspacePanel: { minHeight: 420 },
  panelHeader: { minHeight: 64, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, borderBottomWidth: 1, borderBottomColor: '#EBDCD0', marginBottom: 20 },
  panelHeaderStack: { alignItems: 'stretch', flexDirection: 'column', paddingVertical: 12 },
  tabs: { alignItems: 'center', gap: 12 },
  tab: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 24, borderRadius: 999, borderWidth: 2, borderColor: '#EBDCD0', backgroundColor: 'transparent' },
  tabActive: { backgroundColor: '#FF5E97', borderColor: '#FF5E97' },
  tabText: { color: '#C8B5A7' },
  tabTextActive: { color: '#FFFFFF' },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filtersFull: { width: '100%' },
  sortControl: { minWidth: 180, height: 46, paddingHorizontal: 18, borderRadius: 999, backgroundColor: '#F0E6DF', flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchBox: { width: 280, maxWidth: '100%', height: 46, paddingHorizontal: 18, borderRadius: 999, borderWidth: 2, borderColor: '#EBDCD0', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 16, outlineStyle: 'none' } as never,
  grid: { flexGrow: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', gap: 20, paddingRight: 6 },
  storyCard: { minWidth: 200, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 3, borderColor: '#FFFFFF', overflow: 'hidden', shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cover: { width: '100%', height: 180, backgroundColor: '#F0E6DF' },
  coverPlaceholder: { width: '100%', height: 180, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF1F5' },
  storyInfo: { padding: 14, gap: 4 },
  storyType: { color: '#FF5E97', fontWeight: '800' },
  excerpt: { color: '#8A7463', lineHeight: 16, marginTop: 3 },
  emptyState: { width: '100%', flex: 1, minHeight: 400, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 16, color: '#A99586' },
});
