import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mediaApi } from '@/core/storymee';
import { useFamily } from '@/features/family/store/useFamily';
import { useWorkspace } from '@/core/workspace/useWorkspace';

export default function CaptureScreen() {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  const childId = useFamily((s) => s.activeChildId); const ipId = useWorkspace((s) => s.getActiveIpId());
  async function choose(camera: boolean) {
    if (!childId) return Alert.alert('Chưa chọn hồ sơ con');
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Cần quyền truy cập ảnh');
    const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (result.canceled || !result.assets[0]) return;
    setBusy(true);
    try {
      const asset = result.assets[0]; const form = new FormData();
      form.append('file', { uri: asset.uri, name: asset.fileName || `aikid-${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' } as unknown as Blob);
      form.append('ipId', ipId);
      await mediaApi.upload(form, { ipId, assetType: 'uploaded', tags: `child:${childId}`, permanent: 'true' });
      Alert.alert('Đã tải lên', 'Ảnh đã có trong Gallery của hồ sơ.'); router.replace('/(app)/gallery');
    } catch (error) { Alert.alert('Tải ảnh thất bại', error instanceof Error ? error.message : 'Thử lại sau'); } finally { setBusy(false); }
  }
  return <SafeAreaView className="flex-1 bg-orange-50"><View className="p-5"><Pressable onPress={() => router.back()}><Text className="font-bold text-brand">← Về</Text></Pressable><Text className="mt-10 text-3xl font-extrabold">Thêm ảnh mẫu</Text><Text className="mt-2 text-slate-500">Ảnh được gắn đúng hồ sơ con và hiển thị trong Gallery.</Text>{busy ? <ActivityIndicator className="mt-12" /> : <><Pressable onPress={() => void choose(true)} className="mt-10 rounded-2xl bg-brand py-5"><Text className="text-center text-lg font-bold text-white">Chụp ảnh</Text></Pressable><Pressable onPress={() => void choose(false)} className="mt-4 rounded-2xl bg-white py-5"><Text className="text-center text-lg font-bold text-slate-800">Chọn từ thư viện</Text></Pressable></>}</View></SafeAreaView>;
}
