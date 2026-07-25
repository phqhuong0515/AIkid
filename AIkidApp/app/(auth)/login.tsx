import { useRouter } from 'expo-router';
import { View, ImageBackground, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { CatLoginAnimation } from '@/features/auth/components/CatLoginAnimation';
import { useScreenOrientation } from '@/core/ui/useScreenOrientation';

export default function LoginScreen() {
  useScreenOrientation('all');
  const router = useRouter();

  return (
    <ImageBackground 
      source={require('../../assets/images/bg-login.jpeg')} 
      style={{flex: 1, width: '100%', height: '100%'}} 
      resizeMode="cover"
    >
      <View style={{flex: 1}}>
        <TouchableOpacity 
          style={{
            position: 'absolute', top: 35, right: 38, zIndex: 100, 
            backgroundColor: '#ff7597', borderRadius: 38, width: 76, height: 76, 
            justifyContent: 'center', alignItems: 'center',
            shadowColor: '#ff7597', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.35, shadowRadius: 20
          }} 
          onPress={() => router.back()}
        >
          <FontAwesome6 name="xmark" size={32} color="white" />
        </TouchableOpacity>
        <CatLoginAnimation onBack={() => router.back()} />
      </View>
    </ImageBackground>
  );
}
