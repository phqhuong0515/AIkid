import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { usePopSound } from '@/hooks/usePopSound';
import { FontAwesome5 } from '@expo/vector-icons';

import { AikidPage, AikidText } from '@/ui';
import { useComicDraft } from '@/features/comic/store/useComicDraft';

export default function ComicCreateV2() {
  const router = useRouter();
  const { playPop } = usePopSound();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const library = useComicDraft((state) => state.library);
  const project = useComicDraft((state) => state.project);
  const hydrated = useComicDraft((state) => state.hydrated);
  const hydrate = useComicDraft((state) => state.hydrate);
  const hasPlot = library.some((item) => item.pages.some((page) => page.idea.trim()))
    || project.pages.some((page) => page.idea.trim());

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrate, hydrated]);

  const handlePress = (route: string, mode?: string) => {
    playPop();
    router.push({ pathname: route as never, params: mode ? { mode } : undefined });
  };

  const OptionCard = ({ title, description, iconName, onPress }: { title: string; description: string; iconName: string; onPress: () => void }) => {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, isTablet && styles.cardTablet, pressed && styles.cardPressed]}
        onPress={onPress}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconBox}>
            <FontAwesome5 name={iconName} size={42} solid color="#FF6F79" />
          </View>
          <AikidText variant="heading" style={styles.cardTitle}>{title}</AikidText>
          <AikidText variant="body" style={styles.cardDescription}>{description}</AikidText>
          <View style={styles.cardAction}>
            <AikidText variant="brand" style={styles.cardActionText}>Chọn hình thức này</AikidText>
            <FontAwesome5 name="arrow-right" size={15} color="#FF5E97" />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <AikidPage
      scene="comic"
      title="Tạo truyện"
      backHref="/(app)/comic"
      container="wide"
      scroll={false}
    >
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentScrollInner} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.intro}>
            <AikidText variant="title" style={styles.introTitle}>Bắt đầu từ cốt truyện</AikidText>
            <AikidText variant="body" style={styles.introDescription}>
              Hoàn thiện ý tưởng nền trước, sau đó em có thể phát triển thành truyện chữ hoặc truyện tranh.
            </AikidText>
          </View>
          <View style={[styles.cardsWrapper, isTablet && styles.cardsWrapperTablet]}>
            <OptionCard
              title="Tạo cốt truyện"
              description="Chọn thể loại, nhân vật, bối cảnh và sự kiện chính để AI dựng cốt truyện."
              iconName="map"
              onPress={() => handlePress('/(app)/comic/genre-v2')}
            />
            <View style={styles.lockedColumn}>
              <Pressable
                disabled={!hasPlot}
                onPress={() => handlePress('/(app)/comic/story-text')}
                style={({ pressed }) => [styles.lockedCard, hasPlot && styles.unlockedCard, pressed && styles.cardPressed]}
              >
                <FontAwesome5 name="book" size={28} color="#A18D7F" />
                <View style={styles.lockedCopy}>
                  <AikidText variant="title" style={styles.lockedTitle}>Truyện chữ</AikidText>
                  <AikidText variant="body" style={styles.lockedText}>{hasPlot ? 'Chọn cốt truyện và bắt đầu viết truyện ngắn.' : 'Mở sau khi hoàn thành cốt truyện.'}</AikidText>
                </View>
                <FontAwesome5 name={hasPlot ? 'arrow-right' : 'lock'} size={16} color={hasPlot ? '#FF5E97' : '#A18D7F'} />
              </Pressable>
              <Pressable
                disabled={!hasPlot}
                onPress={() => handlePress('/(app)/comic/story-comic')}
                style={({ pressed }) => [styles.lockedCard, hasPlot && styles.unlockedCard, pressed && styles.cardPressed]}
              >
                <FontAwesome5 name="book-open" size={28} color={hasPlot ? '#FF6F79' : '#A18D7F'} />
                <View style={styles.lockedCopy}>
                  <AikidText variant="title" style={styles.lockedTitle}>Truyện tranh</AikidText>
                  <AikidText variant="body" style={styles.lockedText}>{hasPlot ? 'Chọn cốt truyện hoặc truyện chữ để chia thành các panel.' : 'Mở sau khi hoàn thành cốt truyện.'}</AikidText>
                </View>
                <FontAwesome5 name={hasPlot ? 'arrow-right' : 'lock'} size={16} color={hasPlot ? '#FF5E97' : '#A18D7F'} />
              </Pressable>
            </View>
          </View>
        </View>
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
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  contentScroll: {
    flex: 1,
    width: '100%',
  },
  contentScrollInner: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  intro: {
    alignItems: 'center',
    marginBottom: 20,
  },
  introTitle: {
    color: '#475569',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  introDescription: {
    color: '#6C7A91',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 5,
  },
  cardsWrapper: {
    flexDirection: 'column',
    gap: 30,
    width: '100%',
    maxWidth: 860,
    alignItems: 'center',
  },
  cardsWrapperTablet: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 50,
  },
  lockedColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 380,
    gap: 14,
  },
  lockedCard: {
    flex: 1,
    minHeight: 145,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 26,
    backgroundColor: 'rgba(253,250,244,0.88)',
    padding: 20,
  },
  unlockedCard: {
    borderColor: '#FFD5E1',
    backgroundColor: '#FFF7F9',
  },
  lockedCopy: {
    flex: 1,
  },
  lockedTitle: {
    color: '#6C625B',
    fontSize: 18,
    fontWeight: '900',
  },
  lockedText: {
    color: '#A18D7F',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    minHeight: 240,
    backgroundColor: '#FDFAF4',
    borderWidth: 10,
    borderColor: '#FFFFFF',
    borderRadius: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 45,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTablet: {
    flex: 1,
    minHeight: 320,
  },
  cardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  iconBox: {
    width: 82,
    height: 82,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F3',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardTitle: {
    fontWeight: '900',
    fontSize: 26,
    color: '#475569',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDescription: {
    color: '#6C7A91',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 280,
  },
  cardAction: {
    width: '100%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 14,
    marginTop: 6,
  },
  cardActionText: {
    color: '#FF5E97',
    fontSize: 12,
    fontWeight: '900',
  },
});
