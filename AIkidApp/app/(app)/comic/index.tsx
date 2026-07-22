import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/core/auth/useAuth';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { generateImageViaGateway } from '@/features/creative/generateImageViaGateway';
import { useFamily } from '@/features/family/store/useFamily';
import { useComicDraft, type ComicPage } from '@/features/comic/store/useComicDraft';
import { ChoiceChip, PrimaryButton, SectionCard } from '@/features/kids-ui/CreativeKit';
import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';

const GENRES = ['Phiêu lưu', 'Hài hước', 'Kỳ ảo', 'Khoa học', 'Tình bạn', 'Trinh thám'];

export default function ComicScreen() {
  const { token } = useAuth();
  const child = useFamily((s) => s.getActiveChild());
  const ipId = useWorkspace((s) => s.getActiveIpId());
  const { project, library, hydrated, hydrate, patchProject, addPage, updatePage, movePage, removePage, saveToLibrary, loadFromLibrary, removeFromLibrary, exportProjectJson, reset } = useComicDraft();
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [tab, setTab] = useState<'create' | 'library'>('create');

  useEffect(() => { void hydrate(); }, [hydrate]);
  useEffect(() => { if (!activePageId && project.pages[0]) setActivePageId(project.pages[0].id); }, [activePageId, project.pages]);

  function pagePrompt(page: ComicPage) {
    return [`Create one kid-friendly ${project.format === 'comic' ? 'comic panel' : 'storybook page illustration'}.`, `Story: ${project.title || project.idea}. Genre: ${project.genre}.`, `Characters: ${project.characters}.`, `This page narration: ${page.narration}.`, `Visual direction: ${page.visualPrompt}.`, 'Single scene, expressive characters, bright composition, no text, no watermark.'].join(' ');
  }

  async function generatePage(page: ComicPage) {
    if (!token || !child) return Alert.alert('Chưa sẵn sàng', 'Đăng nhập và chọn hồ sơ con trước.');
    if (!child.consent.allowAiCreate) return Alert.alert('AI đang tắt', 'Phụ huynh cần bật quyền tạo AI.');
    if (!project.idea.trim() || !project.characters.trim() || !page.visualPrompt.trim()) return Alert.alert('Thiếu nội dung', 'Nhập ý tưởng, nhân vật và mô tả hình cho trang này.');
    updatePage(page.id, { status: 'working', error: null });
    try {
      const result = await generateImageViaGateway({ userPrompt: pagePrompt(page), childProfileId: child.id, ipId });
      updatePage(page.id, { imageUrl: result.imageUrl, jobId: result.jobId, status: 'done', error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Thử lại sau';
      updatePage(page.id, { status: 'error', error: message });
      Alert.alert(`Trang ${page.order} thất bại`, message);
    }
  }

  async function shareProject() {
    if (!child?.consent.allowExport) return Alert.alert('Chưa được phép xuất', 'Phụ huynh cần bật quyền xuất nội dung cho hồ sơ.');
    await Share.share({ title: `${project.title || 'AIkid comic'}.json`, message: exportProjectJson() });
  }

  function handleAddPage() {
    addPage();
    const pages = useComicDraft.getState().project.pages;
    setActivePageId(pages[pages.length - 1]?.id ?? null);
  }

  if (!hydrated) return <ScreenChrome title="Sáng tác truyện"><View className="flex-1 items-center justify-center"><ActivityIndicator /></View></ScreenChrome>;
  return <ScreenChrome title="Sáng tác truyện" subtitle={`Project v2 · ${project.pages.length} trang`} backHref="/(app)/lobby" right={<Pressable onPress={() => setTab(tab === 'create' ? 'library' : 'create')}><Text className="font-bold text-brand">{tab === 'create' ? `Kho (${library.length})` : 'Sáng tác'}</Text></Pressable>}>
    {tab === 'library' ? <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      {library.length === 0 ? <View className="mt-20 items-center"><Text className="text-5xl">📚</Text><Text className="mt-4 font-bold text-slate-700">Kho project đang trống</Text></View> : library.map((item) => <View key={item.versionId} className="mb-3 flex-row rounded-2xl border border-orange-100 bg-white p-3">{item.pages.find((p) => p.imageUrl)?.imageUrl ? <Image source={{ uri: item.pages.find((p) => p.imageUrl)?.imageUrl ?? '' }} className="h-24 w-24 rounded-xl" /> : <View className="h-24 w-24 items-center justify-center rounded-xl bg-orange-50"><Text className="text-3xl">📖</Text></View>}<View className="ml-3 flex-1"><Text className="text-base font-extrabold text-slate-900">{item.title || 'Truyện chưa đặt tên'}</Text><Text className="mt-1 text-xs font-bold text-brand">v{item.version} · {item.genre} · {item.pages.length} trang</Text><View className="mt-3 flex-row gap-4"><Pressable onPress={() => { loadFromLibrary(item.versionId); setActivePageId(null); setTab('create'); }}><Text className="text-xs font-bold text-emerald-600">Mở phiên bản</Text></Pressable><Pressable onPress={() => void removeFromLibrary(item.versionId)}><Text className="text-xs font-bold text-red-500">Xoá</Text></Pressable></View></View></View>)}
    </ScrollView> : <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <SectionCard title="Thông tin truyện"><TextInput value={project.title} onChangeText={(title) => patchProject({ title })} placeholder="Tên câu chuyện" placeholderTextColor="#94A3B8" className="mb-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-900" /><TextInput value={project.idea} onChangeText={(idea) => patchProject({ idea })} multiline placeholder="Chuyện gì sẽ xảy ra?" placeholderTextColor="#94A3B8" className="mb-3 min-h-20 rounded-2xl bg-slate-50 px-4 py-3 text-slate-900" /><TextInput value={project.characters} onChangeText={(characters) => patchProject({ characters })} multiline placeholder="Nhân vật và tính cách…" placeholderTextColor="#94A3B8" className="min-h-20 rounded-2xl bg-slate-50 px-4 py-3 text-slate-900" /><View className="mt-3 flex-row flex-wrap"><ChoiceChip label="Truyện tranh" selected={project.format === 'comic'} onPress={() => patchProject({ format: 'comic' })} /><ChoiceChip label="Truyện chữ" selected={project.format === 'story'} onPress={() => patchProject({ format: 'story' })} /></View><View className="flex-row flex-wrap">{GENRES.map((genre) => <ChoiceChip key={genre} label={genre} selected={project.genre === genre} onPress={() => patchProject({ genre })} />)}</View></SectionCard>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">{project.pages.map((page) => <Pressable key={page.id} onPress={() => setActivePageId(page.id)} className={`mr-2 rounded-2xl px-4 py-3 ${activePageId === page.id ? 'bg-brand' : 'border border-orange-100 bg-white'}`}><Text className={`font-extrabold ${activePageId === page.id ? 'text-white' : 'text-slate-800'}`}>Trang {page.order}</Text><Text className={`mt-0.5 text-[10px] ${activePageId === page.id ? 'text-white/80' : page.status === 'error' ? 'text-red-500' : 'text-slate-400'}`}>{page.status}</Text></Pressable>)}<Pressable onPress={handleAddPage} className="mr-2 items-center justify-center rounded-2xl border border-dashed border-orange-300 px-5"><Text className="font-bold text-brand">＋ Trang</Text></Pressable></ScrollView>
      {project.pages.filter((page) => page.id === activePageId).map((page) => <SectionCard key={page.id} title={`Trang ${page.order}`} hint={`Job: ${page.jobId || 'chưa tạo'} · ${page.status}`}><TextInput value={page.narration} onChangeText={(narration) => updatePage(page.id, { narration })} multiline placeholder="Lời kể / diễn biến trang này…" placeholderTextColor="#94A3B8" className="mb-3 min-h-20 rounded-2xl bg-slate-50 px-4 py-3 text-slate-900" /><TextInput value={page.visualPrompt} onChangeText={(visualPrompt) => updatePage(page.id, { visualPrompt, status: page.status === 'done' ? 'draft' : page.status })} multiline placeholder="Khung cảnh, hành động, góc máy…" placeholderTextColor="#94A3B8" className="min-h-20 rounded-2xl bg-slate-50 px-4 py-3 text-slate-900" />{page.imageUrl ? <Image source={{ uri: page.imageUrl }} className="mt-3 h-72 w-full rounded-2xl" resizeMode="contain" /> : null}{page.error ? <Text className="mt-2 text-xs text-red-500">{page.error}</Text> : null}<View className="mt-3"><PrimaryButton label={page.status === 'working' ? 'Đang tạo trang…' : page.imageUrl ? 'Tạo lại trang này' : '✨ Tạo ảnh trang này'} disabled={page.status === 'working'} onPress={() => void generatePage(page)} /></View><View className="mt-3 flex-row justify-between"><Pressable onPress={() => movePage(page.id, -1)}><Text className="font-bold text-slate-500">← Lùi</Text></Pressable><Pressable onPress={() => removePage(page.id)}><Text className="font-bold text-red-500">Xoá trang</Text></Pressable><Pressable onPress={() => movePage(page.id, 1)}><Text className="font-bold text-slate-500">Tiến →</Text></Pressable></View></SectionCard>)}
      <View className="gap-3"><PrimaryButton label="Lưu phiên bản vào kho" onPress={() => void saveToLibrary()} /><Pressable onPress={() => void shareProject()} className="rounded-2xl border border-emerald-200 bg-emerald-50 py-4"><Text className="text-center font-extrabold text-emerald-700">Xuất project JSON</Text></Pressable><Pressable onPress={() => Alert.alert('Project mới?', 'Bản nháp hiện tại vẫn có thể lưu vào kho trước.', [{ text: 'Huỷ' }, { text: 'Tạo mới', style: 'destructive', onPress: () => { reset(); setActivePageId(null); } }])} className="py-3"><Text className="text-center text-sm font-bold text-red-500">Tạo project mới</Text></Pressable></View>
    </ScrollView>}
  </ScreenChrome>;
}
