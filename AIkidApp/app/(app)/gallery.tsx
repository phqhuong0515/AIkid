import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { useFamily } from '@/features/family/store/useFamily';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { resolveMediaUri, useAiImages } from '@/features/media/api/mediaHooks';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { mediaApi } from '@/core/storymee';
import { useCharacterDraft } from '@/features/character';
import type { SavedCharacter } from '@/features/character/types';

export default function GalleryScreen() {
  const router = useRouter();
  const childId = useFamily((s) => s.activeChildId);
  const ipId = useWorkspace((s) => s.activeIpId);
  const recentAi = useRecentAiImages((s) => s.items);
  const setRecentScope = useRecentAiImages((s) => s.setScope);
  const { saved: allCharacters, hydrate: hydrateCharacters } = useCharacterDraft();
  const characters = allCharacters.filter(
    (character) => !character.childProfileId || character.childProfileId === childId,
  );
  const [section, setSection] = useState<'all' | 'ai' | 'uploads' | 'characters'>('all');
  const [selectedCharacter, setSelectedCharacter] = useState<SavedCharacter | null>(null);
  useEffect(() => { void hydrateCharacters(); }, [hydrateCharacters]);
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
    {!childId ? <Text className="m-5 rounded-xl bg-amber-100 p-4">Chọn hồ sơ con trước khi xem ảnh.</Text> : query.isLoading ? <ActivityIndicator className="mt-12" /> : <>
      <View className="border-b border-orange-100 bg-white px-3 py-2"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{([
        ['all', 'Tất cả'], ['ai', `AI · ${aiItems.length}`], ['uploads', `Tải lên · ${query.data?.items.length ?? 0}`], ['characters', `Nhân vật · ${characters.length}`],
      ] as const).map(([id, label]) => <Pressable accessibilityRole="button" accessibilityState={{ selected: section === id }} key={id} onPress={() => setSection(id)} className={`rounded-full px-4 py-2.5 ${section === id ? 'bg-slate-900' : 'bg-orange-50'}`}><Text className={`text-xs font-extrabold ${section === id ? 'text-white' : 'text-slate-700'}`}>{label}</Text></Pressable>)}</ScrollView></View>
      <ScrollView refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />} contentContainerStyle={{ width: '100%', maxWidth: 980, alignSelf: 'center', padding: 12, paddingBottom: 60 }}>
        {(section === 'all' || section === 'characters') && characters.length ? <GallerySection title="Nhân vật" hint="Chạm vào ảnh để xem prompt"><View className="flex-row flex-wrap gap-2">{characters.map((character) => <Pressable accessibilityRole="button" accessibilityLabel={`Xem nhân vật ${character.name}`} key={character.id} onPress={() => setSelectedCharacter(character)} style={{ width: '48%' }} className="overflow-hidden rounded-2xl border border-orange-100 bg-white">{character.avatarUri ? <Image source={{ uri: character.avatarUri }} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" /> : <View className="aspect-square items-center justify-center bg-violet-50"><Text className="text-4xl">🧸</Text></View>}<View className="p-3"><Text className="font-extrabold text-slate-900" numberOfLines={1}>{character.name}</Text><Text className="mt-0.5 text-[11px] text-slate-400">{character.source === 'ai' ? 'Nhân vật AI' : 'Bản nháp'}</Text></View></Pressable>)}</View></GallerySection> : null}
        {(section === 'all' || section === 'ai') && aiItems.length ? <GallerySection title="Ảnh AI"><View className="flex-row flex-wrap gap-2">{aiItems.map((item) => <Image key={`ai-${item.id}`} source={{ uri: item.uri }} style={{ width: '48%', aspectRatio: 1, borderRadius: 14 }} contentFit="cover" />)}</View></GallerySection> : null}
        {(section === 'all' || section === 'uploads') ? <GallerySection title="Ảnh tải lên"><View className="flex-row flex-wrap gap-2">{query.data?.items.map((item, index) => { const uri = resolveMediaUri(String(item.url || item.imageUrl || item.previewUrl || '')); return uri ? <Image key={`upload-${item.id || `${uri}-${index}`}`} source={{ uri }} style={{ width: '48%', aspectRatio: 1, borderRadius: 14 }} contentFit="cover" /> : null; })}</View></GallerySection> : null}
        {!query.data?.items.length && !aiItems.length && !characters.length ? <Text className="py-16 text-center text-slate-500">Chưa có ảnh. Chụp, chọn ảnh từ thư viện hoặc tạo ảnh AI.</Text> : null}
      </ScrollView>
      <CharacterPromptModal character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />
    </>}
  </SafeAreaView>;
}

function GallerySection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return <View className="mb-6"><View className="mb-2 flex-row items-end justify-between"><Text className="text-lg font-extrabold text-slate-900">{title}</Text>{hint ? <Text className="text-[11px] text-slate-400">{hint}</Text> : null}</View>{children}</View>;
}

function CharacterPromptModal({ character, onClose }: { character: SavedCharacter | null; onClose: () => void }) {
  return <Modal visible={Boolean(character)} transparent animationType="fade" onRequestClose={onClose}><View className="flex-1 items-center justify-center bg-slate-950/40 p-4"><Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel="Đóng chi tiết nhân vật" />{character ? <View className="max-h-[86%] w-full max-w-[620px] overflow-hidden rounded-[28px] bg-white"><ScrollView><View className="relative">{character.avatarUri ? <Image source={{ uri: character.avatarUri }} style={{ width: '100%', aspectRatio: 1.35 }} contentFit="contain" /> : null}<Pressable accessibilityRole="button" onPress={onClose} className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full bg-white/90"><Text className="text-xl text-slate-600">×</Text></Pressable></View><View className="p-5"><Text className="text-xl font-extrabold text-slate-900">{character.name}</Text><Text className="mt-1 text-xs font-bold uppercase tracking-wide text-brand">Prompt tạo nhân vật</Text><Text selectable className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{character.userPrompt || 'Nhân vật này chưa có prompt được lưu.'}</Text><Text className="mt-3 text-xs text-slate-400">Đã lưu {new Date(character.createdAt).toLocaleString('vi-VN')}</Text></View></ScrollView></View> : null}</View></Modal>;
}
