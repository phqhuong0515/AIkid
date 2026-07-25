import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Pressable, ScrollView, Share, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { queryClient } from '@/core/query/queryClient';
import { useAuth } from '@/core/auth/useAuth';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { useCharacterDraft } from '@/features/character';
import type { SavedCharacter } from '@/features/character/types';
import { createComicBatch, pollComicBatch, retryComicPanel, type ComicBatch } from '@/features/comic/api/comicBatch';
import { generateComicScriptViaGateway } from '@/features/comic/api/generateComicScript';
import { scaffoldPanels, useComicDraft, type ComicCharacter, type ComicPage, type ComicPanel, type PanelCount } from '@/features/comic/store/useComicDraft';
import { useFamily } from '@/features/family/store/useFamily';
import { createImageJob, firstOutputUri, pollJobUntilDone } from '@/features/jobs/api/jobHooks';
import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';

const GENRES = ['Phiêu lưu', 'Hài hước', 'Kỳ ảo', 'Khoa học', 'Tình bạn', 'Trinh thám'] as const;
const ART_STYLES = ['Hoạt hình', 'Màu nước', 'Manga', 'Truyện tranh', 'Bút sáp', '3D mềm'] as const;
const PANEL_COUNTS: PanelCount[] = [2, 4, 6];

export default function ComicScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const child = useFamily((state) => state.getActiveChild());
  const ipId = useWorkspace((state) => state.getActiveIpId());
  const { width } = useWindowDimensions();
  const desktop = width >= 940;
  const { project, library, hydrated, hydrate, patchProject, addPage, updatePage, updatePanel, addCharacter, updateCharacter, removeCharacter, toggleCharacterRole, removePage, saveToLibrary, loadFromLibrary, removeFromLibrary, exportProjectJson, reset } = useComicDraft();
  const { saved: savedCharacters, hydrate: hydrateCharacters } = useCharacterDraft();
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [tab, setTab] = useState<'create' | 'library'>('create');
  const [characterPickerOpen, setCharacterPickerOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [scripting, setScripting] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [generatingCharacterId, setGeneratingCharacterId] = useState<string | null>(null);
  const [retryingPanelId, setRetryingPanelId] = useState<string | null>(null);

  useEffect(() => { void hydrate(); void hydrateCharacters(); }, [hydrate, hydrateCharacters]);
  useEffect(() => { if (!activePageId && project.pages[0]) setActivePageId(project.pages[0].id); }, [activePageId, project.pages]);
  const page = project.pages.find((item) => item.id === activePageId) ?? project.pages[0];

  async function generateScript() {
    if (!page.idea.trim()) return Alert.alert('Bé chưa kể câu chuyện', 'Hãy viết một hoặc hai câu về điều sẽ xảy ra.');
    if (!token || !child) return Alert.alert('Chưa sẵn sàng', 'Đăng nhập và chọn hồ sơ con trước.');
    setScripting(true);
    try {
      const panels = await generateComicScriptViaGateway({ pageId: page.id, idea: page.idea, genre: project.genre, panelCount: page.panelCount, cast: project.cast, childProfileId: child.id });
      updatePage(page.id, { panels, imageUrl: null, status: 'draft', error: null });
    } catch (error) {
      updatePage(page.id, { panels: scaffoldPanels(page.id, page.idea, page.panelCount), imageUrl: null, status: 'draft' });
      Alert.alert('LLM chưa phản hồi', `${error instanceof Error ? error.message : 'Không tạo được kịch bản'}. App đã tạo bản panel mẫu để bé vẫn tiếp tục sửa.`);
    } finally { setScripting(false); }
  }

  function applyBatch(batch: ComicBatch) {
    const batchPanels = new Map(batch.panels.map((item) => [item.panelId, item]));
    const panels = page.panels.map((item) => {
      const remote = batchPanels.get(item.id);
      return remote ? { ...item, status: remote.status, jobId: remote.jobId, imageUrl: remote.imageUrl, error: remote.error } : item;
    });
    updatePage(page.id, { batchId: batch.batchId, panels, imageUrl: batch.finalImageUrl, jobId: batch.composeJobId, imageContractVersion: 3, status: batch.status, error: batch.error });
  }

  async function generatePage() {
    if (!token || !child || !ipId) return Alert.alert('Chưa sẵn sàng', 'Đăng nhập, chọn hồ sơ con và project trước.');
    if (!child.consent.allowAiCreate) return Alert.alert('AI đang tắt', 'Phụ huynh cần bật quyền tạo AI.');
    if (!page.idea.trim() || page.panels.some((item) => !item.action.trim())) return Alert.alert('Kịch bản chưa đủ', 'Viết ý tưởng và hoàn thiện nội dung các panel trước.');
    updatePage(page.id, { status: 'queued', imageUrl: null, jobId: null, batchId: null, panels: page.panels.map((item) => ({ ...item, status: 'queued', jobId: null, imageUrl: null, error: null })), error: null });
    try {
      const created = await createComicBatch({ page, projectId: project.id, genre: project.genre, artStyle: project.artStyle, cast: project.cast, childProfileId: child.id, ipId });
      applyBatch(created);
      const completed = await pollComicBatch(created.batchId, applyBatch);
      applyBatch(completed);
      void queryClient.invalidateQueries({ queryKey: ['media', 'gallery'] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Thử lại sau';
      updatePage(page.id, { status: 'error', error: message });
      Alert.alert('Không tạo được trang truyện', message);
    }
  }

  async function retryPanel(panelId: string) {
    if (!page.batchId) return Alert.alert('Chưa có lượt vẽ', 'Hãy tạo trang truyện trước.');
    setRetryingPanelId(panelId);
    try {
      const retried = await retryComicPanel(page.batchId, panelId);
      applyBatch(retried);
      const completed = await pollComicBatch(page.batchId, applyBatch);
      applyBatch(completed);
      void queryClient.invalidateQueries({ queryKey: ['media', 'gallery'] });
    } catch (error) {
      Alert.alert('Không retry được panel', error instanceof Error ? error.message : 'Thử lại sau');
    } finally { setRetryingPanelId(null); }
  }

  function addSavedCharacter(character: SavedCharacter) {
    addCharacter({ id: `cast-${Date.now()}-${character.id}`, sourceId: character.id, name: character.name, role: project.cast.some((item) => item.role === 'main') ? 'supporting' : 'main', personality: character.description || '', appearancePrompt: character.userPrompt || character.description || character.name, referenceImageUrl: character.avatarUri || null });
    setCharacterPickerOpen(false);
  }

  function addManualCharacter() {
    if (!manualName.trim()) return;
    addCharacter({ id: `manual-${Date.now()}`, name: manualName.trim(), role: project.cast.some((item) => item.role === 'main') ? 'supporting' : 'main', personality: manualDescription.trim(), appearancePrompt: manualDescription.trim(), referenceImageUrl: null });
    setManualName(''); setManualDescription('');
  }

  async function generateCharacterReference(character: ComicCharacter) {
    if (!token || !child || !ipId) return Alert.alert('Chưa sẵn sàng', 'Đăng nhập, chọn hồ sơ con và project trước.');
    if (!character.appearancePrompt.trim()) return Alert.alert('Thiếu mô tả', 'Hãy mô tả ngoại hình nhân vật trước khi tạo ảnh.');
    setGeneratingCharacterId(character.id);
    try {
      const prompt = [
        'Create one kid-friendly character reference portrait on a plain light background.',
        `Character name: ${character.name}. Appearance: ${character.appearancePrompt}. Personality: ${character.personality || 'friendly'}.`,
        'Show the full body, front view, neutral pose, clean silhouette, one character only.',
        'No text, no letters, no logo, no watermark.',
      ].join('\n');
      const jobId = await createImageJob({ prompt, ipId, childProfileId: child.id });
      const job = await pollJobUntilDone(jobId);
      const imageUrl = firstOutputUri(job);
      if (!imageUrl) throw new Error('Job xong nhưng không có ảnh nhân vật');
      updateCharacter(character.id, { referenceImageUrl: imageUrl });
      void queryClient.invalidateQueries({ queryKey: ['media', 'gallery'] });
      Alert.alert('Đã tạo nhân vật', 'Ảnh này sẽ được dùng để giữ nhân vật nhất quán trong các panel.');
    } catch (error) {
      Alert.alert('Không tạo được nhân vật', error instanceof Error ? error.message : 'Thử lại sau');
    } finally { setGeneratingCharacterId(null); }
  }

  async function saveProject() {
    await saveToLibrary();
    Alert.alert('Đã lưu truyện', 'Project đã vào Kho truyện; ảnh hoàn thành nằm trong Gallery.', [{ text: 'Gallery', onPress: () => router.push('/(app)/gallery') }, { text: 'Đóng' }]);
  }

  if (!hydrated) return <ScreenChrome title="Xưởng truyện tranh"><View className="flex-1 items-center justify-center"><ActivityIndicator /></View></ScreenChrome>;
  if (tab === 'library') return <LibraryView library={library} onBack={() => setTab('create')} onOpen={(id) => { loadFromLibrary(id); setActivePageId(null); setTab('create'); }} onRemove={removeFromLibrary} />;

  const editor = <View style={{ width: desktop ? 430 : '100%', gap: 14 }}>
    <Card number="1" title="Bé muốn kể chuyện gì?" hint="Một ý tưởng ngắn là đủ. Mỗi trang là một câu chuyện trọn vẹn.">
      <TextInput value={page.idea} onChangeText={(idea) => updatePage(page.id, { idea, status: 'draft' })} multiline placeholder="Ví dụ: Mèo Mít đi tìm chiếc bánh sinh nhật bị mất trong khu rừng…" placeholderTextColor="#94A3B8" className="min-h-[110px] rounded-2xl bg-orange-50 px-4 py-3 text-[15px] leading-6 text-slate-900" textAlignVertical="top" />
      <Text className="mb-2 mt-4 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Không khí câu chuyện</Text>
      <View className="flex-row flex-wrap">{GENRES.map((genre) => <Chip key={genre} label={genre} selected={project.genre === genre} onPress={() => patchProject({ genre })} />)}</View>
      <Text className="mb-2 mt-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Nét vẽ</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>{ART_STYLES.map((artStyle) => <Chip key={artStyle} label={artStyle} selected={project.artStyle === artStyle} onPress={() => patchProject({ artStyle })} />)}</ScrollView>
      <Text className="mb-2 mt-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Số panel</Text>
      <View className="flex-row">{PANEL_COUNTS.map((count) => <Chip key={count} label={`${count} panel`} selected={page.panelCount === count} onPress={() => updatePage(page.id, { panelCount: count, panels: scaffoldPanels(page.id, page.idea, count), imageUrl: null, status: 'draft' })} />)}</View>
    </Card>

    <Card number="2" title="Nhân vật trong truyện" hint="Chọn nhân vật đã tạo để giữ khuôn mặt và trang phục nhất quán.">
      <View className="gap-2">{project.cast.map((character) => <Pressable accessibilityRole="button" accessibilityLabel={`Sửa ${character.name}`} onPress={() => setEditingCharacterId(character.id)} key={character.id} className="flex-row items-center rounded-2xl border border-slate-100 bg-slate-50 p-2.5">{character.referenceImageUrl ? <Image source={{ uri: character.referenceImageUrl }} className="h-12 w-12 rounded-xl" /> : <View className="h-12 w-12 items-center justify-center rounded-xl bg-violet-100"><Text className="text-xl">🧸</Text></View>}<View className="ml-3 min-w-0 flex-1"><Text className="font-extrabold text-slate-900">{character.name}</Text><Text numberOfLines={1} className="mt-0.5 text-xs text-slate-500">{character.appearancePrompt || 'Chưa có mô tả ngoại hình'}</Text><Text className="mt-1 text-[11px] font-extrabold text-violet-600">{character.role === 'main' ? '⭐ Chính' : 'Phụ'} · Chạm để sửa</Text></View><Text className="px-2 text-lg text-slate-300">›</Text></Pressable>)}</View>
      <Pressable accessibilityRole="button" onPress={() => setCharacterPickerOpen(true)} className="mt-3 items-center rounded-2xl border border-dashed border-violet-300 bg-violet-50 py-3"><Text className="font-extrabold text-violet-700">＋ Chọn từ Gallery nhân vật</Text></Pressable>
      <View className="mt-3 gap-2 rounded-2xl bg-orange-50 p-3"><TextInput value={manualName} onChangeText={setManualName} placeholder="Tên nhân vật mới…" placeholderTextColor="#94A3B8" className="h-11 rounded-xl border border-orange-100 bg-white px-3 font-bold text-slate-900" /><TextInput value={manualDescription} onChangeText={setManualDescription} placeholder="Ngoại hình, ví dụ: chú rồng xanh nhút nhát…" placeholderTextColor="#94A3B8" className="min-h-[54px] rounded-xl border border-orange-100 bg-white px-3 py-2 text-slate-700" multiline textAlignVertical="top" /><Pressable onPress={addManualCharacter} className="min-h-[42px] items-center justify-center rounded-xl bg-white"><Text className="text-xs font-extrabold text-brand">Thêm nhân vật nhanh</Text></Pressable></View>
    </Card>

    <Card number="3" title={`${page.panelCount} panel của trang`} hint="AI gợi ý kịch bản bằng Vertex → Gemini. Bé chỉ cần sửa hành động và lời thoại.">
      <Pressable accessibilityRole="button" onPress={() => void generateScript()} disabled={scripting} className="mb-3 min-h-[50px] items-center justify-center rounded-2xl bg-violet-600 px-4"><Text className="font-extrabold text-white">{scripting ? 'AI đang chia câu chuyện…' : '✨ AI chia thành các panel'}</Text></Pressable>
      <PanelEditor page={page} desktop={desktop} viewportWidth={width} onChange={(panelId, value) => updatePanel(page.id, panelId, value)} />
    </Card>
  </View>;

  const completedPanels = page.panels.filter((item) => item.status === 'done').length;
  const failedPanels = page.panels.filter((item) => item.status === 'error').length;
  const generatingPage = page.status === 'queued' || page.status === 'working' || page.status === 'composing';
  const preview = <View style={{ flex: 1, width: desktop ? undefined : '100%', gap: 12 }}>
    <View className="overflow-hidden rounded-[26px] border border-orange-100 bg-white"><View className="flex-row items-center justify-between gap-3 px-4 py-3"><View className="min-w-0 flex-1"><Text className="text-[11px] font-extrabold uppercase tracking-wide text-brand">Trang {page.order}</Text><Text numberOfLines={2} className="mt-0.5 text-base font-extrabold text-slate-900">{page.title || page.idea || 'Câu chuyện của bé'}</Text></View><Text className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{page.panelCount} panel</Text></View><View className="relative bg-orange-50" style={{ minHeight: desktop ? 520 : 390 }}>{page.imageUrl ? <Image source={{ uri: page.imageUrl }} style={{ width: '100%', height: desktop ? 520 : 390 }} resizeMode="contain" /> : <PanelStoryboard page={page} />}</View></View>
    {generatingPage || failedPanels ? <BatchProgress page={page} retryingPanelId={retryingPanelId} onRetry={(panelId) => void retryPanel(panelId)} /> : null}
    {page.error ? <Text className="rounded-xl bg-red-50 p-3 text-xs text-red-600">{page.error}</Text> : null}
    <Pressable accessibilityRole="button" onPress={() => void generatePage()} disabled={generatingPage} className={`min-h-[58px] items-center justify-center rounded-2xl px-4 ${generatingPage ? 'bg-slate-300' : 'bg-brand'}`}><Text className="text-[15px] font-extrabold text-white">{generatingPage ? page.status === 'composing' ? 'Đang ghép trang PNG…' : `Đang vẽ ${completedPanels}/${page.panelCount} panel…` : page.imageUrl ? '✨ Vẽ lại từng panel' : '✨ Vẽ từng panel & ghép trang'}</Text></Pressable>
    <View className={`${desktop ? 'flex-row' : ''} gap-2`}><Pressable onPress={() => void saveProject()} className="min-h-[52px] flex-1 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50"><Text className="font-extrabold text-emerald-700">Lưu truyện</Text></Pressable><Pressable onPress={() => void Share.share({ title: `${project.title || 'AIkid comic'}.json`, message: exportProjectJson() })} className="min-h-[52px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-5"><Text className="font-extrabold text-slate-600">Chia sẻ</Text></Pressable></View>
  </View>;

  const editingCharacter = project.cast.find((item) => item.id === editingCharacterId) ?? null;
  return <ScreenChrome title="Xưởng truyện tranh" subtitle="Ý tưởng → nhân vật → panel → cả trang" backHref="/(app)/lobby" right={<Pressable onPress={() => setTab('library')}><Text className="font-extrabold text-brand">Kho ({library.length})</Text></Pressable>}><ScrollView contentContainerStyle={{ padding: desktop ? 24 : 14, paddingBottom: 70 }} keyboardShouldPersistTaps="handled"><View style={{ width: '100%', maxWidth: 1220, alignSelf: 'center', flexDirection: desktop ? 'row' : 'column', gap: 18, alignItems: 'flex-start' }}>{editor}{preview}</View><View className="mx-auto mt-4 w-full max-w-[1220px] flex-row flex-wrap items-center gap-2">{project.pages.map((item) => <Pressable key={item.id} onPress={() => setActivePageId(item.id)} className={`rounded-xl px-4 py-3 ${item.id === page.id ? 'bg-slate-900' : 'bg-white'}`}><Text className={`font-extrabold ${item.id === page.id ? 'text-white' : 'text-slate-700'}`}>Trang {item.order}</Text></Pressable>)}<Pressable onPress={() => { addPage(); const pages = useComicDraft.getState().project.pages; setActivePageId(pages[pages.length - 1]?.id ?? null); }} className="rounded-xl border border-dashed border-orange-300 px-4 py-3"><Text className="font-extrabold text-brand">＋ Trang mới</Text></Pressable>{project.pages.length > 1 ? <Pressable onPress={() => removePage(page.id)} className="px-3 py-3"><Text className="font-bold text-red-400">Xoá trang</Text></Pressable> : null}<Pressable onPress={() => Alert.alert('Tạo truyện mới?', 'Bản nháp hiện tại sẽ được thay thế.', [{ text: 'Huỷ' }, { text: 'Tạo mới', style: 'destructive', onPress: () => { reset(); setActivePageId(null); } }])} className="ml-auto px-3 py-3"><Text className="font-bold text-slate-400">Tạo project mới</Text></Pressable></View></ScrollView><CharacterPicker visible={characterPickerOpen} characters={savedCharacters.filter((item) => !item.childProfileId || item.childProfileId === child?.id)} selectedIds={project.cast.map((item) => item.sourceId).filter(Boolean) as string[]} onPick={addSavedCharacter} onClose={() => setCharacterPickerOpen(false)} /><CharacterEditor character={editingCharacter} generating={generatingCharacterId === editingCharacter?.id} onChange={(value) => editingCharacter && updateCharacter(editingCharacter.id, value)} onToggleRole={() => editingCharacter && toggleCharacterRole(editingCharacter.id)} onGenerate={() => editingCharacter && void generateCharacterReference(editingCharacter)} onRemove={() => { if (editingCharacter) removeCharacter(editingCharacter.id); setEditingCharacterId(null); }} onClose={() => setEditingCharacterId(null)} /></ScreenChrome>;
}

function Card({ number, title, hint, children }: { number: string; title: string; hint: string; children: React.ReactNode }) { return <View className="rounded-[24px] border border-orange-100 bg-white p-4"><Text className="text-[11px] font-extrabold uppercase tracking-[1.2px] text-brand">{number} · {title}</Text><Text className="mb-3 mt-1 text-xs leading-5 text-slate-500">{hint}</Text>{children}</View>; }
function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} className={`mb-2 mr-2 rounded-full px-3.5 py-2 ${selected ? 'bg-slate-900' : 'border border-orange-100 bg-orange-50'}`}><Text className={`text-xs font-extrabold ${selected ? 'text-white' : 'text-orange-900'}`}>{label}</Text></Pressable>; }

function PanelEditor({ page, desktop, viewportWidth, onChange }: { page: ComicPage; desktop: boolean; viewportWidth: number; onChange: (panelId: string, value: Partial<ComicPanel>) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => { if (activeIndex >= page.panels.length) setActiveIndex(Math.max(0, page.panels.length - 1)); }, [activeIndex, page.panels.length]);
  const mobileCardWidth = Math.max(260, Math.min(350, viewportWidth - 66));
  const webCompact = Platform.OS === 'web' && !desktop;
  const card = (item: ComicPanel) => <View key={item.id} style={{ width: desktop ? '48.5%' : webCompact ? '100%' : mobileCardWidth }} className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3">
    <View className="mb-2 flex-row items-center justify-between"><Text className="text-[11px] font-extrabold uppercase text-sky-600">Panel {item.order}</Text><Text className="text-[10px] font-bold text-slate-400">{item.order}/{page.panelCount}</Text></View>
    <TextInput value={item.action} onChangeText={(action) => onChange(item.id, { action })} multiline placeholder="Chuyện gì xảy ra?" placeholderTextColor="#94A3B8" className="min-h-[62px] rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm text-slate-900" textAlignVertical="top" />
    <View className="mt-2 flex-row gap-2"><TextInput value={item.speaker} onChangeText={(speaker) => onChange(item.id, { speaker })} placeholder="Ai nói?" placeholderTextColor="#94A3B8" className="h-11 w-[34%] rounded-xl border border-sky-100 bg-white px-3 text-sm text-slate-900" /><TextInput value={item.dialogue} onChangeText={(dialogue) => onChange(item.id, { dialogue })} placeholder="Lời thoại…" placeholderTextColor="#94A3B8" className="h-11 min-w-0 flex-1 rounded-xl border border-sky-100 bg-white px-3 text-sm text-slate-900" /></View>
  </View>;
  if (desktop) return <View className="flex-row flex-wrap gap-3">{page.panels.map(card)}</View>;
  if (Platform.OS === 'web') {
    const activePanel = page.panels[activeIndex];
    return <View><View className="mb-2 flex-row items-center justify-center gap-1.5"><Pressable accessibilityLabel="Panel trước" onPress={() => setActiveIndex((value) => Math.max(0, value - 1))} disabled={activeIndex === 0} className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"><Text className={activeIndex === 0 ? 'text-slate-300' : 'text-slate-700'}>‹</Text></Pressable>{page.panels.map((panel, index) => <Pressable accessibilityRole="button" accessibilityState={{ selected: index === activeIndex }} key={panel.id} onPress={() => setActiveIndex(index)} className={`h-8 min-w-[32px] items-center justify-center rounded-full px-2 ${index === activeIndex ? 'bg-violet-600' : 'bg-violet-50'}`}><Text className={`text-[11px] font-extrabold ${index === activeIndex ? 'text-white' : 'text-violet-600'}`}>{index + 1}</Text></Pressable>)}<Pressable accessibilityLabel="Panel sau" onPress={() => setActiveIndex((value) => Math.min(page.panels.length - 1, value + 1))} disabled={activeIndex === page.panels.length - 1} className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"><Text className={activeIndex === page.panels.length - 1 ? 'text-slate-300' : 'text-slate-700'}>›</Text></Pressable></View>{activePanel ? card(activePanel) : null}</View>;
  }
  return <View><ScrollView horizontal pagingEnabled decelerationRate="fast" snapToInterval={mobileCardWidth + 10} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 10 }}>{page.panels.map(card)}</ScrollView><Text className="mt-2 text-center text-[11px] font-bold text-slate-400">Vuốt ngang để sửa panel tiếp theo →</Text></View>;
}

function BatchProgress({ page, retryingPanelId, onRetry }: { page: ComicPage; retryingPanelId: string | null; onRetry: (panelId: string) => void }) {
  const done = page.panels.filter((item) => item.status === 'done').length;
  const progress = Math.round((done / page.panelCount) * 100);
  const labels = { draft: 'Chờ', queued: 'Xếp hàng', working: 'Đang vẽ', done: 'Xong', error: 'Lỗi' } as const;
  return <View className="rounded-2xl border border-violet-100 bg-white p-3">
    <View className="flex-row items-center justify-between"><Text className="text-xs font-extrabold text-slate-800">Tiến độ trang truyện</Text><Text className="text-xs font-extrabold text-violet-600">{page.status === 'composing' ? 'Đang ghép PNG' : `${done}/${page.panelCount} panel`}</Text></View>
    <View className="mt-2 h-2 overflow-hidden rounded-full bg-violet-50"><View className="h-full rounded-full bg-violet-500" style={{ width: `${page.status === 'composing' ? 96 : progress}%` }} /></View>
    <View className="mt-3 flex-row flex-wrap gap-2">{page.panels.map((panel) => {
      const failed = panel.status === 'error';
      return <View key={panel.id} className={`min-w-[94px] flex-1 rounded-xl border p-2 ${failed ? 'border-red-200 bg-red-50' : panel.status === 'done' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}><Text className="text-[10px] font-extrabold uppercase text-slate-500">Panel {panel.order}</Text><Text className={`mt-1 text-xs font-bold ${failed ? 'text-red-600' : panel.status === 'done' ? 'text-emerald-700' : 'text-slate-600'}`}>{labels[panel.status]}</Text>{failed ? <Pressable accessibilityRole="button" onPress={() => onRetry(panel.id)} disabled={retryingPanelId === panel.id} className="mt-2 rounded-lg bg-red-500 px-2 py-1.5"><Text className="text-center text-[10px] font-extrabold text-white">{retryingPanelId === panel.id ? 'Đang thử…' : 'Thử lại'}</Text></Pressable> : null}</View>;
    })}</View>
    <Text className="mt-2 text-[11px] leading-4 text-slate-400">Mỗi panel được xếp hàng riêng. App chỉ hiển thị ảnh PNG cuối sau khi ghép đủ panel và lời thoại.</Text>
  </View>;
}

function CharacterEditor({ character, generating, onChange, onToggleRole, onGenerate, onRemove, onClose }: { character: ComicCharacter | null; generating: boolean; onChange: (value: Partial<ComicCharacter>) => void; onToggleRole: () => void; onGenerate: () => void; onRemove: () => void; onClose: () => void }) {
  return <Modal visible={Boolean(character)} transparent animationType="fade" onRequestClose={onClose}><View className="flex-1 items-center justify-center bg-slate-950/40 p-4"><Pressable className="absolute inset-0" onPress={onClose} /><View className="w-full max-w-[540px] rounded-[28px] bg-white p-5">{character ? <><View className="flex-row items-center justify-between"><Text className="text-xl font-extrabold text-slate-900">Sửa nhân vật</Text><Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Text className="text-xl">×</Text></Pressable></View><View className="mt-4 flex-row items-center gap-3">{character.referenceImageUrl ? <Image source={{ uri: character.referenceImageUrl }} className="h-24 w-24 rounded-2xl" /> : <View className="h-24 w-24 items-center justify-center rounded-2xl bg-violet-50"><Text className="text-4xl">🧸</Text></View>}<View className="min-w-0 flex-1"><TextInput value={character.name} onChangeText={(name) => onChange({ name })} placeholder="Tên nhân vật" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 font-extrabold text-slate-900" /><Pressable onPress={onToggleRole} className="mt-2 min-h-[40px] items-center justify-center rounded-xl bg-violet-50"><Text className="text-xs font-extrabold text-violet-700">{character.role === 'main' ? '⭐ Nhân vật chính' : 'Nhân vật phụ'} · Đổi vai</Text></Pressable></View></View><Text className="mb-1 mt-4 text-[11px] font-extrabold uppercase text-slate-400">Ngoại hình cố định</Text><TextInput value={character.appearancePrompt} onChangeText={(appearancePrompt) => onChange({ appearancePrompt })} multiline textAlignVertical="top" placeholder="Màu tóc, trang phục, dáng người…" placeholderTextColor="#94A3B8" className="min-h-[82px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900" /><Text className="mb-1 mt-3 text-[11px] font-extrabold uppercase text-slate-400">Tính cách</Text><TextInput value={character.personality} onChangeText={(personality) => onChange({ personality })} placeholder="Vui vẻ, tò mò…" placeholderTextColor="#94A3B8" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900" /><Pressable accessibilityRole="button" onPress={onGenerate} disabled={generating} className="mt-4 min-h-[50px] items-center justify-center rounded-2xl bg-violet-600 px-4"><Text className="font-extrabold text-white">{generating ? 'Đang tạo ảnh nhân vật…' : character.referenceImageUrl ? '✨ Tạo lại ảnh nhân vật' : '✨ Tạo ảnh nhân vật trước'}</Text></Pressable><View className="mt-2 flex-row gap-2"><Pressable onPress={onRemove} className="min-h-[44px] flex-1 items-center justify-center rounded-xl bg-red-50"><Text className="text-xs font-extrabold text-red-500">Xoá nhân vật</Text></Pressable><Pressable onPress={onClose} className="min-h-[44px] flex-1 items-center justify-center rounded-xl bg-slate-100"><Text className="text-xs font-extrabold text-slate-700">Xong</Text></Pressable></View></> : null}</View></View></Modal>;
}

function PanelStoryboard({ page }: { page: ComicPage }) { const width = page.panelCount === 6 ? '31%' : '48%'; return <View className="flex-row flex-wrap justify-center gap-2 p-3">{page.panels.map((item) => <View key={item.id} style={{ width, minHeight: page.panelCount === 2 ? 330 : 180 }} className="items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-white p-3"><Text className="text-[10px] font-extrabold uppercase text-brand">Panel {item.order}</Text><Text className="mt-2 text-center text-xs leading-5 text-slate-500">{item.action || 'Chưa có nội dung'}</Text>{item.dialogue ? <Text className="mt-3 rounded-xl bg-sky-50 px-2 py-1.5 text-center text-xs font-bold text-sky-800">{item.speaker ? `${item.speaker}: ` : ''}{item.dialogue}</Text> : null}</View>)}</View>; }

function CharacterPicker({ visible, characters, selectedIds, onPick, onClose }: { visible: boolean; characters: SavedCharacter[]; selectedIds: string[]; onPick: (character: SavedCharacter) => void; onClose: () => void }) { return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View className="flex-1 items-center justify-center bg-slate-950/40 p-4"><Pressable className="absolute inset-0" onPress={onClose} /><View className="max-h-[82%] w-full max-w-[620px] rounded-[28px] bg-white p-5"><View className="flex-row items-center justify-between"><View><Text className="text-xl font-extrabold text-slate-900">Chọn nhân vật</Text><Text className="mt-1 text-xs text-slate-500">Từ Gallery → Nhân vật</Text></View><Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Text className="text-xl">×</Text></Pressable></View><ScrollView className="mt-4"><View className="flex-row flex-wrap gap-2">{characters.map((character) => { const selected = selectedIds.includes(character.id); return <Pressable accessibilityRole="button" disabled={selected} key={character.id} onPress={() => onPick(character)} style={{ width: '48%' }} className={`overflow-hidden rounded-2xl border ${selected ? 'border-emerald-300 bg-emerald-50' : 'border-orange-100 bg-white'}`}>{character.avatarUri ? <Image source={{ uri: character.avatarUri }} style={{ width: '100%', aspectRatio: 1.2 }} resizeMode="cover" /> : <View className="h-28 items-center justify-center bg-violet-50"><Text className="text-4xl">🧸</Text></View>}<View className="p-3"><Text className="font-extrabold text-slate-900">{character.name}</Text><Text className="mt-1 text-xs text-slate-500">{selected ? '✓ Đã chọn' : 'Chạm để thêm'}</Text></View></Pressable>; })}</View>{!characters.length ? <Text className="py-14 text-center text-slate-500">Chưa có nhân vật. Hãy tạo Mee hoặc Nhân vật AI rồi lưu vào Gallery.</Text> : null}</ScrollView></View></View></Modal>; }

function LibraryView({ library, onBack, onOpen, onRemove }: { library: ReturnType<typeof useComicDraft.getState>['library']; onBack: () => void; onOpen: (id: string) => void; onRemove: (id: string) => Promise<void> }) { return <ScreenChrome title="Kho truyện" subtitle={`${library.length} phiên bản`} right={<Pressable onPress={onBack}><Text className="font-extrabold text-brand">Sáng tác</Text></Pressable>}><ScrollView contentContainerStyle={{ width: '100%', maxWidth: 920, alignSelf: 'center', padding: 16 }}>{library.map((item) => <View key={item.versionId} className="mb-3 flex-row rounded-2xl bg-white p-3">{item.pages[0]?.imageUrl ? <Image source={{ uri: item.pages[0].imageUrl }} className="h-24 w-24 rounded-xl" /> : <View className="h-24 w-24 items-center justify-center rounded-xl bg-orange-50"><Text className="text-3xl">📖</Text></View>}<View className="ml-3 flex-1"><Text className="font-extrabold text-slate-900">{item.title || item.pages[0]?.idea || 'Truyện chưa đặt tên'}</Text><Text className="mt-1 text-xs text-slate-500">v{item.version} · {item.pages.length} trang</Text><View className="mt-3 flex-row gap-4"><Pressable onPress={() => onOpen(item.versionId)}><Text className="font-bold text-emerald-600">Mở</Text></Pressable><Pressable onPress={() => void onRemove(item.versionId)}><Text className="font-bold text-red-400">Xoá</Text></Pressable></View></View></View>)}{!library.length ? <Text className="py-20 text-center text-slate-500">Kho truyện đang trống</Text> : null}</ScrollView></ScreenChrome>; }
