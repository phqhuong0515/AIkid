import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { useFamily } from '@/features/family/store/useFamily';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { resolveMediaUri, useAiImages } from '@/features/media/api/mediaHooks';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { mediaApi } from '@/core/storymee';

export default function GalleryScreen() {
  const router = useRouter();
  const childId = useFamily((s) => s.activeChildId);
  const ipId = useWorkspace((s) => s.activeIpId);
  const recentAi = useRecentAiImages((s) => s.items);
  const setRecentScope = useRecentAiImages((s) => s.setScope);
  const query = useQuery({
    queryKey: ['media', 'gallery', childId, ipId],
    enabled: !!childId && !!ipId,
    queryFn: () => mediaApi.listGallery({ ipId: ipId!, tag: `child:${childId}`, limit: 100, offset: 0 }),
  });
  const aiQuery = useAiImages({ enabled: !!childId && !!ipId, childId, ipId });
  useFocusEffect(useCallback(() => {
    if (!childId || !ipId) return;
    void setRecentScope(childId);
    void query.refetch();
    void aiQuery.refetch();
  }, [childId, ipId, setRecentScope]));
  const remoteAi = aiQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const aiItems = [...recentAi, ...remoteAi].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.id === item.id || candidate.uri === item.uri) === index,
  );
  return <SafeAreaView className="flex-1 bg-orange-50">
    <View className="flex-row items-center bg-white px-4 py-3"><Pressable onPress={() => router.back()}><Text className="font-bold text-brand">← Về</Text></Pressable><Text className="flex-1 text-center text-lg font-extrabold">Gallery</Text><Pressable onPress={() => router.push('/(app)/capture')}><Text className="font-bold text-brand">+ Ảnh</Text></Pressable></View>
    {!childId ? <Text className="m-5 rounded-xl bg-amber-100 p-4">Chọn hồ sơ con trước khi xem ảnh.</Text> : query.isLoading ? <ActivityIndicator className="mt-12" /> :
      <ScrollView refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />} contentContainerStyle={{ padding: 12 }}>
        {aiItems.length ? <><Text className="mb-2 text-lg font-extrabold text-slate-900">Ảnh AI</Text><View className="mb-5 flex-row flex-wrap gap-2">{aiItems.map((item) => <Image key={`ai-${item.id}`} source={{ uri: item.uri }} style={{ width: '48%', aspectRatio: 1, borderRadius: 14 }} contentFit="cover" />)}</View></> : null}
        <Text className="mb-2 text-lg font-extrabold text-slate-900">Ảnh tải lên</Text>
        <View className="flex-row flex-wrap gap-2">{query.data?.items.map((item, index) => { const uri = resolveMediaUri(String(item.url || item.imageUrl || item.previewUrl || '')); return uri ? <Image key={`upload-${item.id || `${uri}-${index}`}`} source={{ uri }} style={{ width: '48%', aspectRatio: 1, borderRadius: 14 }} contentFit="cover" /> : null; })}</View>
        {!query.data?.items.length && !aiItems.length ? <Text className="py-16 text-center text-slate-500">Chưa có ảnh. Chụp, chọn ảnh từ thư viện hoặc tạo ảnh AI.</Text> : null}
      </ScrollView>}
  </SafeAreaView>;
}
