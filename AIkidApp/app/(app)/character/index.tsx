import React from 'react';
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalHeader } from '@/components/GlobalHeader';
import { usePopSound } from '@/hooks/usePopSound';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CharacterLobby() {
  const router = useRouter();
  const { playPop } = usePopSound();
  const insets = useSafeAreaInsets();

  const handlePress = (route: string) => {
    playPop();
    router.push(route as any);
  };

  return (
    <ImageBackground
      source={require('../../../public/lobby-assets/images/bg-character-feature.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={{ paddingTop: insets.top }}>
        <GlobalHeader />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsWrapper}>
          
          {/* Bản Mới */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handlePress('/(app)/character/generate-v2')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✨</Text>
            </View>
            <Text style={styles.cardTitle}>Tạo nhân vật</Text>
            <Text style={styles.cardBadge}>Bản Mới</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handlePress('/(app)/character/storage-v2')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📚</Text>
            </View>
            <Text style={styles.cardTitle}>Kho nhân vật</Text>
            <Text style={styles.cardBadge}>Bản Mới</Text>
          </TouchableOpacity>

          {/* Bản Cũ (Legacy) */}
          <TouchableOpacity
            style={[styles.card, styles.cardLegacy]}
            activeOpacity={0.8}
            onPress={() => handlePress('/(app)/character/legacy-hub')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🪄</Text>
            </View>
            <Text style={styles.cardTitle}>Tạo nhân vật</Text>
            <Text style={[styles.cardBadge, styles.badgeLegacy]}>Bản Cũ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardLegacy]}
            activeOpacity={0.8}
            onPress={() => handlePress('/(app)/gallery')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📦</Text>
            </View>
            <Text style={styles.cardTitle}>Kho nhân vật</Text>
            <Text style={[styles.cardBadge, styles.badgeLegacy]}>Bản Cũ</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#fad698',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  cardsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
    maxWidth: 960,
  },
  card: {
    width: 210,
    height: 270,
    backgroundColor: '#FDFAF4',
    borderWidth: 6,
    borderColor: '#FFFFFF',
    borderRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  cardLegacy: {
    opacity: 0.9,
    borderColor: '#F3E8DE',
  },
  iconContainer: {
    marginBottom: 12,
  },
  icon: {
    fontSize: 56,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#475569',
    textAlign: 'center',
  },
  cardBadge: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7597',
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  badgeLegacy: {
    color: '#8A7463',
    backgroundColor: '#EBDCD0',
  },
});
