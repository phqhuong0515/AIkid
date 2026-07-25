import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { usePopSound } from '@/hooks/usePopSound';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalHeader } from '@/components/GlobalHeader';

const MOCK_STORIES = [
  { id: '1', title: 'Chuyến Phiêu Lưu Của Yuu', type: 'Truyện Tranh', cover: 'https://picsum.photos/400/600?random=1' },
  { id: '2', title: 'Khu Rừng Kỳ Bí', type: 'Truyện Chữ', cover: 'https://picsum.photos/400/600?random=2' },
  { id: '3', title: 'Bí Mật Dưới Đáy Biển', type: 'Cốt Truyện', cover: 'https://picsum.photos/400/600?random=3' },
  { id: '4', title: 'Nori Đi Học', type: 'Truyện Tranh', cover: 'https://picsum.photos/400/600?random=4' },
];

const TABS = [
  { id: 'comic', label: 'Truyện Tranh', type: 'Truyện Tranh' },
  { id: 'text', label: 'Truyện Chữ', type: 'Truyện Chữ' },
  { id: 'plot', label: 'Cốt Truyện', type: 'Cốt Truyện' },
];

export default function LibraryV2Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { playPop } = usePopSound();
  const [activeTab, setActiveTab] = useState('comic');

  const filteredStories = MOCK_STORIES.filter(story => {
    const tabType = TABS.find(t => t.id === activeTab)?.type;
    return story.type === tabType;
  });

  return (
    <ImageBackground
      source={require('../../../public/lobby-assets/images/bg-art.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* ── Header ── */}
      <View style={{ paddingTop: insets.top }}>
        <GlobalHeader />
        <TouchableOpacity
          style={styles.backBtnWrapper}
          onPress={() => { playPop(); router.canGoBack() ? router.back() : router.replace('/(app)/comic/idea-v2'); }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF9EB5', '#FF7597']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.backBtnGradient}
          >
            <Ionicons name="arrow-back" size={16} color="#FFF" />
            <Text style={styles.backBtnText}>Trở về</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Main Card ── */}
      <View style={[styles.mainCard]}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Ionicons name="library" size={24} color="#FF5E97" />
          <Text style={styles.titleText}>THƯ VIỆN TRUYỆN</Text>
          <TouchableOpacity onPress={() => playPop()} style={styles.searchBtn}>
            <Ionicons name="search" size={20} color="#8A7463" />
          </TouchableOpacity>
        </View>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
              onPress={() => { playPop(); setActiveTab(tab.id); }}
            >
              <Text style={[styles.tabBtnText, activeTab === tab.id && styles.tabBtnTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Story grid */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
          {filteredStories.length > 0 ? (
            filteredStories.map((story, index) => (
              <Animated.View
                key={story.id}
                entering={FadeInDown.delay(index * 100).duration(400)}
                style={styles.storyCard}
              >
                <TouchableOpacity onPress={() => playPop()} activeOpacity={0.85}>
                  <Image source={{ uri: story.cover }} style={styles.storyCover} resizeMode="cover" />
                  <View style={styles.storyInfo}>
                    <Text style={styles.storyTitle} numberOfLines={2}>{story.title}</Text>
                    <Text style={styles.storyType}>{story.type}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
              <Ionicons name="book-outline" size={60} color="#EBDCD0" />
              <Text style={styles.emptyText}>
                Chưa có {activeTab === 'comic' ? 'truyện tranh' : activeTab === 'text' ? 'truyện chữ' : 'cốt truyện'} nào
              </Text>
            </Animated.View>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#FED7D7' },

  backBtnWrapper: {
    alignSelf: 'flex-start', marginLeft: 18, marginTop: 6,
    shadowColor: '#FF7597', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 5,
  },
  backBtnGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 9999,
  },
  backBtnText: { marginLeft: 2, fontSize: 14, fontWeight: 'bold', color: '#FFF' },

  mainCard: {
    flex: 1,
    backgroundColor: '#FDFAF4',
    borderRadius: 40,
    margin: 14,
    marginTop: 10,
    padding: 20,
    borderWidth: 6,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 6,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#EBDCD0',
    borderStyle: 'dashed',
    paddingBottom: 14,
  },
  titleText: { flex: 1, fontSize: 20, fontWeight: '900', color: '#475569', letterSpacing: 1 },
  searchBtn: {
    width: 40, height: 40, backgroundColor: '#F0E6DF', borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },

  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999,
    backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EBDCD0',
  },
  tabBtnActive: { backgroundColor: '#FF5E97', borderColor: '#FF5E97' },
  tabBtnText: { fontWeight: '700', color: '#8A7463', fontSize: 13 },
  tabBtnTextActive: { color: '#FFF' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 8 },
  storyCard: {
    width: '47%', backgroundColor: '#FFF',
    borderRadius: 20, borderWidth: 3, borderColor: '#FFF',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  storyCover: { width: '100%', height: 160, backgroundColor: '#F0E6DF' },
  storyInfo: { padding: 12 },
  storyTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 4 },
  storyType: { fontSize: 12, fontWeight: '600', color: '#A99586' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, width: '100%' },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#A99586', marginTop: 16 },
});
