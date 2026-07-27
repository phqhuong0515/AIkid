import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ImageBackground, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { usePopSound } from '@/hooks/usePopSound';
import { GlobalHeader } from '@/components/GlobalHeader';

const STYLES = [
  { id: 'Màu Nước', image: require('../../../public/art-styles/art-style-watercolor.jpeg'), colors: ['#FF8E53', '#FF2E93'] },
  { id: 'Hoạt Hình', image: require('../../../public/art-styles/art-style-cartoon.jpeg'), colors: ['#00C6FF', '#0072FF'] },
  { id: 'Bút Sáp', image: require('../../../public/art-styles/art-style-crayon.jpeg'), colors: ['#11998e', '#38ef7d'] },
  { id: 'Anime', image: require('../../../public/art-styles/art-style-anime.jpeg'), colors: ['#FF9966', '#FF5E62'] },
  { id: 'Manga', image: require('../../../public/art-styles/art-style-manga.jpeg'), colors: ['#7F00FF', '#E100FF'] },
  { id: 'Truyện Tranh', image: require('../../../public/art-styles/art-style-comic.jpeg'), colors: ['#F857A6', '#FF5858'] },
];

const StyleCard = ({ style, isSelected, onPress, playPop }: { style: any, isSelected: boolean, onPress: () => void, playPop: () => void }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPressIn={() => { scale.value = withSpring(1.05); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={() => { playPop(); onPress(); }}
    >
      <Animated.View style={[animatedStyle, { zIndex: isSelected ? 10 : 1 }, styles.cardWrapper]}>
        <View style={[styles.cardContent, isSelected ? styles.cardSelected : styles.cardUnselected]}>
          <View style={[styles.cardBadge, { backgroundColor: style.colors[0] }]}>
            <Text style={styles.cardBadgeText}>{style.id}</Text>
          </View>
          <View style={styles.cardImageWrapper}>
            <Image source={style.image} style={styles.cardImage} resizeMode="cover" />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function DrawV2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const { playPop } = usePopSound();

  const handleStyleSelect = (id: string) => {
    setSelectedStyle(id);
    setTimeout(() => {
      setStep(2);
    }, 500);
  };

  const renderStyleSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>CHỌN PHONG CÁCH VẼ</Text>
      <View style={{ flex: 1, width: '100%', justifyContent: 'center' }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {STYLES.map((style) => (
            <StyleCard 
              key={style.id}
              style={style}
              isSelected={selectedStyle === style.id}
              onPress={() => handleStyleSelect(style.id)}
              playPop={playPop}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderWorkspace = () => (
    <View style={styles.workspaceContainer}>
      <View style={styles.workspaceRow}>
        {/* Left Panel: Drawing */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="brush-outline" size={24} color="#3182CE" />
              <Text style={styles.panelTitle}>Bé Vẽ</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => playPop()} style={styles.toolBtn}>
                <Ionicons name="arrow-undo-outline" size={16} color="#4A3D3C" />
                <Text style={styles.toolBtnText}>Hoàn Tác</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => playPop()} style={styles.toolBtn}>
                <Ionicons name="trash-outline" size={16} color="#4A3D3C" />
                <Text style={styles.toolBtnText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.canvasAreaRow}>
            {/* Toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity onPress={() => playPop()} style={styles.iconBtn}>
                <Ionicons name="brush" size={20} color="#4A3D3C" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => playPop()} style={styles.iconBtn}>
                <Ionicons name="pencil" size={20} color="#4A3D3C" />
              </TouchableOpacity>
              <View style={styles.divider} />
              <View style={styles.currentColor} />
              <View style={styles.sizePicker}>
                 <View style={styles.sizeSmall} />
                 <View style={styles.sizeLarge} />
              </View>
            </View>
            {/* Canvas Area */}
            <View style={styles.canvas}>
               <Text style={styles.canvasText}>Khu vực vẽ tranh</Text>
            </View>
          </View>
        </View>

        {/* Right Panel: AI Generation */}
        <View style={styles.panelAlt}>
          <View style={styles.panelHeader}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="color-wand-outline" size={24} color="#E53E3E" />
              <Text style={styles.panelTitle}>Phép thuật AI</Text>
            </View>
          </View>
          
          <View style={styles.aiContent}>
             <View style={styles.aiInnerBox}>
               <Ionicons name="color-wand" size={60} color="#FF6584" style={{ marginBottom: 16 }} />
               <Text style={styles.aiHelpText}>
                 Vẽ một chút, hoặc viết mô tả vào ô bên dưới, rồi bấm <Text style={{ fontWeight: 'bold', color: '#EC4899' }}>Phép Thuật</Text> để AI tạo ảnh nhé!
               </Text>
               <TouchableOpacity onPress={() => playPop()} style={styles.aiBtn}>
                 <Ionicons name="sparkles" size={24} color="white" />
                 <Text style={styles.aiBtnText}>Tạo Ảnh</Text>
               </TouchableOpacity>
             </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../../public/lobby-assets/images/bg-art.png')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <View style={{ paddingTop: Math.max(20, insets.top), flex: 1 }}>
          <View style={{ paddingHorizontal: 16, zIndex: 10 }}>
            {step === 1 ? (
              <GlobalHeader />
            ) : (
              <View style={styles.customHeader}>
                <TouchableOpacity 
                  style={styles.backBtn}
                  onPress={() => { 
                    playPop(); 
                    setStep(1); 
                  }}
                >
                  <Ionicons name="arrow-back" size={20} color="white" />
                  <Text style={styles.backBtnText}>Trở Về</Text>
                </TouchableOpacity>
                <View style={{ width: 100 }} /> 
              </View>
            )}
          </View>
          {step === 1 ? renderStyleSelection() : renderWorkspace()}
        </View>
      </ImageBackground>
    </View>
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
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7597',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  backBtnText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  cardWrapper: {
    width: 300,
    height: 350,
    justifyContent: 'center',
  },
  cardContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 10,
    borderRadius: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardSelected: {
    borderColor: '#FF7597',
  },
  cardUnselected: {
    borderColor: '#FFFFFF',
  },
  cardBadge: {
    position: 'absolute',
    top: -24,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardImageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 32,
  },
  scrollContent: {
    paddingHorizontal: 60,
    paddingVertical: 35,
    gap: 40,
    alignItems: 'center',
  },
  workspaceContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  workspaceRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
  panel: {
    flex: 1,
    backgroundColor: '#FDFAF4',
    borderRadius: 36,
    padding: 20,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  panelAlt: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    padding: 20,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#EBDCD0',
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EBDCD0',
    borderRadius: 20,
    gap: 4,
  },
  toolBtnText: {
    fontWeight: 'bold',
    color: '#4A3D3C',
  },
  canvasAreaRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  toolbar: {
    width: 64,
    backgroundColor: '#F5EDE6',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9CE',
    gap: 16,
  },
  iconBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EBDCD0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: 32,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  currentColor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#000000',
  },
  sizePicker: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBDCD0',
    alignItems: 'center',
    gap: 8,
  },
  sizeSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748B',
  },
  sizeLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#64748B',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#EBDCD0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  canvasText: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  aiContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiInnerBox: {
    alignItems: 'center',
    padding: 32,
  },
  aiHelpText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 24,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7597',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  aiBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
    textTransform: 'uppercase',
  },
});
