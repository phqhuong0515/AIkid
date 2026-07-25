import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { usePopSound } from '@/hooks/usePopSound';

const STYLES = [
  { id: 'Màu Nước', image: require('../../../public/mee-html/PNG/art-style-watercolor.jpeg'), from: 'from-[#FF8E53]', to: 'to-[#FF2E93]' },
  { id: 'Hoạt Hình', image: require('../../../public/mee-html/PNG/art-style-cartoon.jpeg'), from: 'from-[#00C6FF]', to: 'to-[#0072FF]' },
  { id: 'Bút Sáp', image: require('../../../public/mee-html/PNG/art-style-crayon.jpeg'), from: 'from-[#11998e]', to: 'to-[#38ef7d]' },
  { id: 'Anime', image: require('../../../public/mee-html/PNG/art-style-anime.jpeg'), from: 'from-[#FF9966]', to: 'to-[#FF5E62]' },
  { id: 'Manga', image: require('../../../public/mee-html/PNG/art-style-manga.jpeg'), from: 'from-[#7F00FF]', to: 'to-[#E100FF]' },
  { id: 'Truyện Tranh', image: require('../../../public/mee-html/PNG/art-style-comic.jpeg'), from: 'from-[#F857A6]', to: 'to-[#FF5858]' },
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
      <Animated.View style={[animatedStyle, { zIndex: isSelected ? 10 : 1 }]} className="w-[300px] h-[350px] justify-center">
        <View className={`w-full h-full bg-white border-[10px] rounded-[48px] items-center shadow-2xl ${isSelected ? 'border-pink-400' : 'border-white'}`}>
          <View className={`absolute -top-6 px-6 py-2 rounded-full border-[4px] border-white z-10 bg-gradient-to-br ${style.from} ${style.to}`}>
            <Text className="text-white font-bold text-xl uppercase tracking-wide shadow-sm" style={{ fontFamily: 'Mali' }}>{style.id}</Text>
          </View>
          <View className="w-full h-full rounded-[38px] overflow-hidden bg-slate-100">
            <Image source={style.image} className="w-full h-full" resizeMode="cover" />
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
    <View className="flex-1 justify-center items-center">
      <Text className="text-4xl font-bold text-gray-800 mb-8 shadow-sm" style={{ fontFamily: 'Mali' }}>CHỌN PHONG CÁCH VẼ</Text>
      <View className="flex-1 w-full justify-center">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 60, paddingVertical: 35, gap: 40, alignItems: 'center' }}
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
    <View className="flex-1 px-6 pb-6">
      <View className="flex-1 flex-row gap-6">
        {/* Left Panel: Drawing */}
        <View className="flex-1 bg-[#FDFAF4] rounded-[36px] p-5 border-[6px] border-white shadow-xl">
          <View className="flex-row justify-between items-center mb-4 pb-3 border-b-2 border-dashed border-[#EBDCD0]">
            <View className="flex-row items-center gap-2">
              <Ionicons name="brush-outline" size={24} color="#3182CE" />
              <Text className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Fredoka' }}>Bé Vẽ</Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => playPop()} className="flex-row items-center px-3 py-2 bg-white border-2 border-[#EBDCD0] rounded-full gap-1 hover:bg-[#FDFAF4]">
                <Ionicons name="arrow-undo-outline" size={16} color="#4A3D3C" />
                <Text className="font-bold text-[#4A3D3C]" style={{ fontFamily: 'Mali' }}>Hoàn Tác</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => playPop()} className="flex-row items-center px-3 py-2 bg-white border-2 border-[#EBDCD0] rounded-full gap-1 hover:bg-[#FDFAF4]">
                <Ionicons name="trash-outline" size={16} color="#4A3D3C" />
                <Text className="font-bold text-[#4A3D3C]" style={{ fontFamily: 'Mali' }}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="flex-1 flex-row gap-4">
            {/* Toolbar */}
            <View className="w-16 bg-[#F5EDE6] rounded-[24px] py-5 items-center border border-[#E5D9CE] gap-4">
              <TouchableOpacity onPress={() => playPop()} className="w-11 h-11 bg-white rounded-xl border-2 border-[#EBDCD0] justify-center items-center shadow-sm">
                <Ionicons name="brush" size={20} color="#4A3D3C" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => playPop()} className="w-11 h-11 bg-white rounded-xl border-2 border-[#EBDCD0] justify-center items-center shadow-sm">
                <Ionicons name="pencil" size={20} color="#4A3D3C" />
              </TouchableOpacity>
              <View className="w-8 h-[2px] bg-slate-200" />
              <View className="w-9 h-9 rounded-full border-[3px] border-white bg-black shadow-sm" />
              <View className="p-2 bg-white rounded-xl border border-[#EBDCD0] items-center gap-2">
                 <View className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                 <View className="w-3 h-3 rounded-full bg-slate-500" />
              </View>
            </View>
            {/* Canvas Area */}
            <View className="flex-1 bg-white rounded-[24px] border-2 border-dashed border-[#EBDCD0] justify-center items-center overflow-hidden">
               <Text className="text-gray-400 text-center" style={{ fontFamily: 'Mali' }}>Khu vực vẽ tranh</Text>
            </View>
          </View>
        </View>

        {/* Right Panel: AI Generation */}
        <View className="flex-1 bg-white rounded-[36px] p-5 border-[6px] border-white shadow-xl">
          <View className="flex-row justify-between items-center mb-4 pb-3 border-b-2 border-dashed border-[#EBDCD0]">
             <View className="flex-row items-center gap-2">
              <Ionicons name="color-wand-outline" size={24} color="#E53E3E" />
              <Text className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Fredoka' }}>Phép thuật AI</Text>
            </View>
          </View>
          
          <View className="flex-1 justify-center items-center">
             <View className="items-center p-8">
               <Ionicons name="color-wand" size={60} color="#FF6584" className="mb-4 drop-shadow-md" />
               <Text className="text-center text-base text-slate-500 mb-6 leading-6" style={{ fontFamily: 'Mali' }}>
                 Vẽ một chút, hoặc viết mô tả vào ô bên dưới, rồi bấm <Text className="font-bold text-pink-500">Phép Thuật</Text> để AI tạo ảnh nhé!
               </Text>
               <TouchableOpacity onPress={() => playPop()} className="flex-row items-center bg-pink-400 px-8 py-4 rounded-[30px] gap-2 shadow-lg shadow-pink-300 active:scale-95 transition-transform">
                 <Ionicons name="sparkles" size={24} color="white" />
                 <Text className="text-white font-bold text-xl uppercase" style={{ fontFamily: 'Mali' }}>Tạo Ảnh</Text>
               </TouchableOpacity>
             </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ImageBackground 
      source={require('../../../public/mee-html/PNG/bg-art.png')}
      className="flex-1"
      style={{ paddingTop: insets.top }}
      resizeMode="cover"
    >
      <View className="flex-row justify-between items-center px-6 py-3">
        <TouchableOpacity 
          className="flex-row items-center bg-pink-400 px-4 py-2.5 rounded-full shadow-md shadow-pink-300"
          onPress={() => { 
            playPop(); 
            step === 2 ? setStep(1) : (router.canGoBack() ? router.back() : router.replace('/(app)/art')); 
          }}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text className="text-white font-bold ml-2 text-base" style={{ fontFamily: 'Mali' }}>Trở Về</Text>
        </TouchableOpacity>
        <Image source={require('../../../public/lobby-assets/images/logo.svg')} style={{width: 120, height: 40}} resizeMode="contain" />
        <View style={{width: 100}} /> 
      </View>

      {step === 1 ? renderStyleSelection() : renderWorkspace()}
    </ImageBackground>
  );
}
