import React, { useState, useRef } from 'react';
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalHeader } from '@/components/GlobalHeader';
import { usePopSound } from '@/hooks/usePopSound';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

function Toast({ message, visible }: { message: string; visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]} pointerEvents="none">
      <Text style={styles.toastText}>🚀 {message}</Text>
    </Animated.View>
  );
}

const CARDS = [
  {
    id: 'draw',
    title: 'Vẽ Tranh',
    desc: 'Bắt đầu từ những nét vẽ nhỏ, AI sẽ mở ra cả một thế giới đầy màu sắc và kỳ diệu!',
    image: require('../../../public/lobby-assets/images/art-comic.jpeg'),
    route: '/(app)/art/style-v2',
    playColor: ['#FF5E97', '#FF9EB5'] as [string, string],
  },
  {
    id: 'story',
    title: 'Sáng Tác Truyện',
    desc: 'Mỗi ý tưởng đều có thể trở thành một cuốn truyện tranh đầy màu sắc và cảm xúc!',
    image: require('../../../public/lobby-assets/images/art-image.jpeg'),
    route: '/(app)/comic/create-v2',
    playColor: ['#F97316', '#FDBA74'] as [string, string],
  },
  {
    id: 'video',
    title: 'Làm Video',
    desc: 'Biến những câu chuyện yêu thích thành video rực rỡ và sống động!',
    image: require('../../../public/lobby-assets/images/art-video.jpeg'),
    route: 'coming_soon',
    playColor: ['#8B5CF6', '#C4B5FD'] as [string, string],
    badge: 'Sắp ra mắt',
  },
];

export default function ArtLobby() {
  const router = useRouter();
  const { playPop } = usePopSound();
  const insets = useSafeAreaInsets();
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const handleCardPress = (route: string, title: string) => {
    playPop();
    if (route === 'coming_soon') {
      showToast(`${title} đang được phát triển, bé nhé!`);
    } else {
      router.push(route as any);
    }
  };

  return (
    <ImageBackground
      source={require('../../../public/lobby-assets/images/bg-art.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={{ paddingTop: insets.top }}>
        <GlobalHeader />
        {/* Back Button - gradient hồng như HTML */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => { playPop(); router.canGoBack() ? router.back() : router.replace('/(app)/lobby' as any); }}
        >
          <LinearGradient
            colors={['#FF9EB5', '#FF7597']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.backBtnGradient}
          >
            <Ionicons name="home" size={18} color="#FFF" />
            <Text style={styles.backBtnText}>Trở Về</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Image
            source={require('../../../public/lobby-assets/images/title-art-vn.png')}
            style={styles.titleImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.cardsWrapper}>
          {CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleCardPress(card.route, card.title)}
            >
              <Image source={card.image} style={styles.cardImage} />
              {card.badge && (
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{card.badge}</Text>
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc}>{card.desc}</Text>
                <LinearGradient
                  colors={card.playColor}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.playButton}
                >
                  <Ionicons name="play" size={20} color="white" />
                </LinearGradient>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Toast message={toastMsg} visible={toastVisible} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#FED7D7' },
  backBtn: { marginLeft: 20, marginTop: 8, alignSelf: 'flex-start' },
  backBtnGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9999 },
  backBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  scrollContainer: { flexGrow: 1, alignItems: 'center', paddingBottom: 40, paddingHorizontal: 20 },
  titleContainer: { marginTop: 16, marginBottom: 24, alignItems: 'center' },
  titleImage: { width: 260, height: 80 },
  cardsWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, width: '100%', maxWidth: 960 },
  card: { width: 280, backgroundColor: '#FDFAF4', borderRadius: 24, borderWidth: 5, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6, overflow: 'hidden' },
  cardImage: { width: '100%', height: 180, resizeMode: 'cover' },
  cardBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(139,92,246,0.9)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 },
  cardBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  cardContent: { padding: 18, alignItems: 'center' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#475569', marginBottom: 8, textAlign: 'center' },
  cardDesc: { fontSize: 13, color: '#8A7463', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  playButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  toast: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#334155', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999 },
  toastText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
