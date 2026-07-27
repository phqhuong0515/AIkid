import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mediaApi } from '@/core/storymee';
import { useFamily } from '@/features/family/store/useFamily';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { GlobalHeader } from '@/components/GlobalHeader';

export default function CaptureScreen() {
  const router = useRouter(); 
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const childId = useFamily((s) => s.activeChildId); 
  const ipId = useWorkspace((s) => s.getActiveIpId());

  async function choose(camera: boolean) {
    if (!childId) return Alert.alert('Chưa chọn hồ sơ con');
    const permission = camera 
      ? await ImagePicker.requestCameraPermissionsAsync() 
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
      
    if (!permission.granted) return Alert.alert('Cần quyền truy cập ảnh');
    
    const result = camera 
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 }) 
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
      
    if (result.canceled || !result.assets[0]) return;
    setBusy(true);
    try {
      const asset = result.assets[0]; 
      const form = new FormData();
      form.append('file', { uri: asset.uri, name: asset.fileName || `aikid-${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' } as unknown as Blob);
      form.append('ipId', ipId!);
      await mediaApi.upload(form, { ipId: ipId!, assetType: 'uploaded', tags: `child:${childId}`, permanent: 'true' });
      Alert.alert('Đã tải lên', 'Ảnh đã có trong Gallery của hồ sơ.'); 
      router.replace('/(app)/gallery');
    } catch (error) { 
      Alert.alert('Tải ảnh thất bại', error instanceof Error ? error.message : 'Thử lại sau'); 
    } finally { 
      setBusy(false); 
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../public/lobby-assets/images/bg-art.png')} style={styles.bgImage} resizeMode="cover">
        <View style={{ paddingTop: Math.max(20, insets.top), flex: 1 }}>
          <View style={{ paddingHorizontal: 16, zIndex: 10, paddingBottom: 16 }}>
            <GlobalHeader />
          </View>
          
          <View style={styles.mainCard}>
            <Text style={{ marginTop: 24, fontSize: 30, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>Thêm ảnh mẫu</Text>
            <Text style={{ marginTop: 8, color: '#64748B', textAlign: 'center', paddingHorizontal: 20 }}>
              Ảnh được gắn đúng hồ sơ con và hiển thị trong Gallery.
            </Text>
            
            {busy ? (
              <ActivityIndicator style={{ marginTop: 48 }} size="large" color="#FF7597" />
            ) : (
              <View style={{ paddingHorizontal: 24, paddingVertical: 40, gap: 16 }}>
                <Pressable onPress={() => void choose(true)} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Chụp ảnh</Text>
                </Pressable>
                
                <Pressable onPress={() => void choose(false)} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Chọn từ thư viện</Text>
                </Pressable>
              </View>
            )}
          </View>
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
  mainCard: {
    flex: 1,
    backgroundColor: '#FDFAF4',
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  primaryBtn: {
    backgroundColor: '#FF7597',
    paddingVertical: 20,
    borderRadius: 24,
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFF7ED',
  },
  secondaryBtnText: {
    color: '#0F172A',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
  },
});
