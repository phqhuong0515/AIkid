import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, useWindowDimensions, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePopSound } from '@/hooks/usePopSound';
import { FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { AikidButton, AikidPage, AikidPanel } from '@/ui';
import { StoryFlowProgress } from '@/features/comic/components/StoryFlowProgress';

type GenreType = {
  id: string;
  name: string;
  icon: string;
  colors: readonly [string, string, ...string[]];
  iconColor: string;
};

const GENRES: GenreType[] = [
  { id: 'Viễn Tưởng', name: 'Viễn Tưởng', icon: 'rocket', colors: ['#a1c4fd', '#c2e9fb'], iconColor: '#4a90e2' },
  { id: 'Phiêu Lưu', name: 'Phiêu Lưu', icon: 'compass', colors: ['#84fab0', '#8fd3f4'], iconColor: '#2bb673' },
  { id: 'Đời Thường', name: 'Đời Thường', icon: 'house-chimney', colors: ['#f6d365', '#fda085'], iconColor: '#e67e22' },
  { id: 'Hài Hước', name: 'Hài Hước', icon: 'face-grin-tears', colors: ['#ffecd2', '#fcb69f'], iconColor: '#d35400' },
  { id: 'Trinh Thám', name: 'Trinh Thám', icon: 'user-secret', colors: ['#cfd9df', '#e2ebf0'], iconColor: '#7f8c8d' },
  { id: 'Cổ Tích', name: 'Cổ Tích', icon: 'wand-magic-sparkles', colors: ['#a18cd1', '#fbc2eb'], iconColor: '#8e44ad' },
  { id: 'Kinh Dị', name: 'Kinh Dị', icon: 'ghost', colors: ['#30cfd0', '#330867'], iconColor: '#ffffff' },
  { id: 'Siêu Anh Hùng', name: 'Siêu Anh Hùng', icon: 'bolt-lightning', colors: ['#f093fb', '#f5576c'], iconColor: '#c0392b' },
  { id: 'Tình Cảm', name: 'Tình Cảm', icon: 'heart', colors: ['#ff9a9e', '#fecfef'], iconColor: '#e91e63' }
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const GenreCard = ({ 
  genre, 
  isSelected, 
  onSelect 
}: { 
  genre: typeof GENRES[0]; 
  isSelected: boolean; 
  onSelect: () => void 
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
  };

  return (
    <AnimatedTouchable
      style={[
        styles.genreCard,
        isSelected && styles.genreCardSelected,
        animatedStyle
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onSelect}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={genre.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.genreIconContainer}
      >
        <FontAwesome6 name={genre.icon} size={24} color={genre.iconColor} />
      </LinearGradient>
      <Text style={styles.genreText}>{genre.name}</Text>
    </AnimatedTouchable>
  );
};

export default function ComicGenreV2() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { playPop } = usePopSound();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleContinue = () => {
    playPop();
    if (!selectedGenre) {
      Alert.alert('Thông báo', 'Vui lòng chọn thể loại truyện!');
      return;
    }
    // Navigate to next screen with selected genre
    router.push({
      pathname: '/(app)/comic/idea-v2',
      params: { genre: selectedGenre, mode: typeof mode === 'string' ? mode : 'text' }
    });
  };

  return (
    <AikidPage
      scene="comic"
      title="Chọn thể loại"
      backHref="/(app)/comic/create-v2"
      container="wide"
      scroll={false}
    >
      <StoryFlowProgress
        currentStep={1}
      />
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentScrollInner} showsVerticalScrollIndicator={false}>
        <AikidPanel
          title="Thể loại cốt truyện"
          icon="grid"
          contentStyle={styles.panelContent}
        >
          <View style={[styles.grid, isTablet && styles.gridTablet]}>
            {GENRES.map((genre) => (
              <View key={genre.id} style={[styles.gridItem, isTablet && styles.gridItemTablet]}>
                <GenreCard
                  genre={genre}
                  isSelected={selectedGenre === genre.id}
                  onSelect={() => {
                    playPop();
                    setSelectedGenre(genre.id);
                  }}
                />
              </View>
            ))}
          </View>
          <View style={styles.mobileFooter}>
            <AikidButton variant="nav" onPress={handleContinue}>Tiếp tục</AikidButton>
          </View>
        </AikidPanel>
      </ScrollView>
    </AikidPage>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#FED7D7',
  },
  backBtnWrapper: {
    alignSelf: 'flex-start', marginLeft: 18, marginTop: 6,
    shadowColor: '#FF7597', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 5,
  },
  backBtnGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 9999,
  },
  backBtnText: { marginLeft: 2, fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  panelContent: { alignItems: 'center' },
  contentScroll: { flex: 1, width: '100%' },
  contentScrollInner: { paddingBottom: 20 },
  mainCard: {
    width: '100%',
    maxWidth: 960,
    backgroundColor: '#FDFAF4',
    borderWidth: 8,
    borderColor: '#FFFFFF',
    borderRadius: 40,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.08,
    shadowRadius: 50,
    elevation: 10,
  },
  mainCardTablet: {
    padding: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#475569',
    marginBottom: 30,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -10,
  },
  gridTablet: {
    justifyContent: 'center',
  },
  gridItem: {
    width: '100%',
    padding: 10,
  },
  gridItemTablet: {
    width: '33.33%',
  },
  genreCard: {
    backgroundColor: '#fffffe',
    borderWidth: 3,
    borderColor: '#EBDCD0',
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  genreCardSelected: {
    borderColor: '#ff7597',
    backgroundColor: '#FFF0F3',
    shadowColor: '#ff7597',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  genreIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5c4e4d',
    flex: 1,
  },
  continueButton: {
    marginTop: 30,
    shadowColor: '#ff7597',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  continueGradient: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 9999,
  },
  continueText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 20,
    textTransform: 'uppercase',
  },
  mobileFooter: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 20,
  },
});
