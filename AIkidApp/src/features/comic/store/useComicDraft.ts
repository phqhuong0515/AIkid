import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const DRAFT_KEY = 'aikid.comic.project.v2';
const LIBRARY_KEY = 'aikid.comic.library.v2';

export type PanelCount = 2 | 4 | 6;
export type ComicPageStatus = 'draft' | 'queued' | 'working' | 'composing' | 'done' | 'error';
export type ComicPanelStatus = 'draft' | 'queued' | 'working' | 'done' | 'error';
export type ComicCharacter = {
  id: string;
  sourceId?: string;
  name: string;
  role: 'main' | 'supporting';
  personality: string;
  appearancePrompt: string;
  referenceImageUrl: string | null;
};
export type ComicPanel = {
  id: string;
  order: number;
  action: string;
  speaker: string;
  dialogue: string;
  status: ComicPanelStatus;
  jobId: string | null;
  imageUrl: string | null;
  error: string | null;
};
export type ComicPage = {
  id: string;
  order: number;
  title: string;
  idea: string;
  panelCount: PanelCount;
  panels: ComicPanel[];
  imageUrl: string | null;
  jobId: string | null;
  batchId: string | null;
  imageContractVersion: number;
  status: ComicPageStatus;
  error: string | null;
};
export type ComicProject = {
  schemaVersion: 4;
  id: string;
  title: string;
  genre: string;
  artStyle: string;
  cast: ComicCharacter[];
  pages: ComicPage[];
  createdAt: string;
  updatedAt: string;
};
export type ComicLibraryItem = ComicProject & { versionId: string; version: number; savedAt: string };

function panel(id: string, order: number, action = '', speaker = '', dialogue = ''): ComicPanel {
  return { id: `${id}-panel-${order}`, order, action, speaker, dialogue, status: 'draft', jobId: null, imageUrl: null, error: null };
}

export function scaffoldPanels(pageId: string, idea: string, count: PanelCount): ComicPanel[] {
  const story = idea.trim() || 'Câu chuyện của bé';
  const beats = count === 2
    ? [`Mở đầu: giới thiệu ${story}`, 'Kết thúc: điều bất ngờ được giải quyết']
    : count === 4
      ? [`Mở đầu: giới thiệu ${story}`, 'Nhân vật phát hiện một điều bất ngờ', 'Nhân vật hành động để giải quyết', 'Kết thúc vui và rõ ràng']
      : [`Mở đầu: giới thiệu ${story}`, 'Một dấu hiệu lạ xuất hiện', 'Nhân vật bắt đầu khám phá', 'Thử thách lớn nhất xảy ra', 'Nhân vật tìm được cách giải quyết', 'Kết thúc vui và đáng nhớ'];
  return beats.map((action, index) => panel(pageId, index + 1, action));
}

function makePage(order: number): ComicPage {
  const id = `${Date.now()}-${order}-${Math.random().toString(36).slice(2, 7)}`;
  return { id, order, title: '', idea: '', panelCount: 4, panels: scaffoldPanels(id, '', 4), imageUrl: null, jobId: null, batchId: null, imageContractVersion: 3, status: 'draft', error: null };
}

function makeProject(): ComicProject {
  const now = new Date().toISOString();
  return { schemaVersion: 4, id: `comic-${Date.now()}`, title: '', genre: 'Phiêu lưu', artStyle: 'Hoạt hình', cast: [], pages: [makePage(1)], createdAt: now, updatedAt: now };
}

function normalize(raw: unknown): ComicProject {
  const base = makeProject();
  if (!raw || typeof raw !== 'object') return base;
  const legacy = raw as Record<string, unknown>;
  const legacyIdea = typeof legacy.idea === 'string' ? legacy.idea : '';
  const legacyCharacters = typeof legacy.characters === 'string' ? legacy.characters : '';
  const rawCast = Array.isArray(legacy.cast) ? legacy.cast : [];
  const cast: ComicCharacter[] = rawCast.filter((item) => item && typeof item === 'object').map((item, index) => {
    const value = item as Partial<ComicCharacter>;
    return { id: value.id || `legacy-character-${index}`, sourceId: value.sourceId, name: value.name || `Nhân vật ${index + 1}`, role: value.role === 'supporting' ? 'supporting' : 'main', personality: value.personality || '', appearancePrompt: value.appearancePrompt || '', referenceImageUrl: value.referenceImageUrl || null };
  });
  if (!cast.length && legacyCharacters.trim()) cast.push({ id: 'legacy-cast', name: legacyCharacters, role: 'main', personality: '', appearancePrompt: legacyCharacters, referenceImageUrl: null });
  const rawPages = Array.isArray(legacy.pages) && legacy.pages.length ? legacy.pages : [makePage(1)];
  const pages = rawPages.map((item, index) => {
    const value = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    const id = typeof value.id === 'string' ? value.id : `${Date.now()}-${index + 1}`;
    const idea = typeof value.idea === 'string' ? value.idea : (typeof value.storyBeat === 'string' ? value.storyBeat : legacyIdea);
    const requestedCount = Number(value.panelCount);
    const panelCount: PanelCount = requestedCount === 2 || requestedCount === 6 ? requestedCount : 4;
    const rawPanels = Array.isArray(value.panels) ? value.panels : [];
    const panels = rawPanels.length === panelCount ? rawPanels.map((entry, panelIndex) => {
      const p = entry && typeof entry === 'object' ? entry as Record<string, unknown> : {};
      return { ...panel(id, panelIndex + 1, String(p.action || ''), String(p.speaker || ''), String(p.dialogue || '')), status: p.status === 'queued' || p.status === 'working' || p.status === 'done' || p.status === 'error' ? p.status : 'draft', jobId: typeof p.jobId === 'string' ? p.jobId : null, imageUrl: typeof p.imageUrl === 'string' ? p.imageUrl : null, error: typeof p.error === 'string' ? p.error : null };
    }) : scaffoldPanels(id, idea, panelCount);
    const imageUrl = typeof value.imageUrl === 'string' ? value.imageUrl : null;
    return { id, order: index + 1, title: typeof value.title === 'string' ? value.title : '', idea, panelCount, panels, imageUrl, jobId: typeof value.jobId === 'string' ? value.jobId : null, batchId: typeof value.batchId === 'string' ? value.batchId : null, imageContractVersion: typeof value.imageContractVersion === 'number' ? value.imageContractVersion : imageUrl ? 1 : 3, status: value.status === 'done' || value.status === 'queued' || value.status === 'working' || value.status === 'composing' || value.status === 'error' ? value.status : 'draft', error: typeof value.error === 'string' ? value.error : null } as ComicPage;
  });
  return { ...base, id: typeof legacy.id === 'string' ? legacy.id : base.id, title: typeof legacy.title === 'string' ? legacy.title : '', genre: typeof legacy.genre === 'string' ? legacy.genre : 'Phiêu lưu', artStyle: typeof legacy.artStyle === 'string' ? legacy.artStyle : 'Hoạt hình', cast, pages, createdAt: typeof legacy.createdAt === 'string' ? legacy.createdAt : base.createdAt, updatedAt: typeof legacy.updatedAt === 'string' ? legacy.updatedAt : base.updatedAt };
}

type State = {
  project: ComicProject;
  library: ComicLibraryItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  patchProject: (value: Partial<Pick<ComicProject, 'title' | 'genre' | 'artStyle' | 'cast'>>) => void;
  addPage: () => void;
  updatePage: (id: string, value: Partial<ComicPage>) => void;
  scaffoldPage: (id: string) => void;
  updatePanel: (pageId: string, panelId: string, value: Partial<ComicPanel>) => void;
  addCharacter: (character: ComicCharacter) => void;
  updateCharacter: (id: string, value: Partial<ComicCharacter>) => void;
  removeCharacter: (id: string) => void;
  toggleCharacterRole: (id: string) => void;
  removePage: (id: string) => void;
  saveToLibrary: () => Promise<void>;
  loadFromLibrary: (versionId: string) => void;
  removeFromLibrary: (versionId: string) => Promise<void>;
  exportProjectJson: () => string;
  reset: () => void;
};

export const useComicDraft = create<State>((set, get) => {
  const persist = () => queueMicrotask(() => void AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(get().project)));
  const setProject = (project: ComicProject) => { set({ project: { ...project, updatedAt: new Date().toISOString() } }); persist(); };
  return {
    project: makeProject(), library: [], hydrated: false,
    hydrate: async () => {
      try {
        const [draftRaw, libraryRaw, legacyRaw] = await Promise.all([AsyncStorage.getItem(DRAFT_KEY), AsyncStorage.getItem(LIBRARY_KEY), AsyncStorage.getItem('aikid.comic.draft.v1')]);
        const project = normalize(draftRaw ? JSON.parse(draftRaw) : legacyRaw ? JSON.parse(legacyRaw) : null);
        const parsed = libraryRaw ? JSON.parse(libraryRaw) : [];
        const library = (Array.isArray(parsed) ? parsed : []).map((item, index) => ({ ...normalize(item), versionId: String(item?.versionId || `legacy-${index}`), version: Number(item?.version) || 1, savedAt: String(item?.savedAt || item?.updatedAt || new Date().toISOString()) }));
        set({ project, library, hydrated: true });
      } catch { set({ hydrated: true }); }
    },
    patchProject: (value) => setProject({ ...get().project, ...value }),
    addPage: () => setProject({ ...get().project, pages: [...get().project.pages, makePage(get().project.pages.length + 1)] }),
    updatePage: (id, value) => setProject({ ...get().project, pages: get().project.pages.map((page) => page.id === id ? { ...page, ...value } : page) }),
    scaffoldPage: (id) => setProject({ ...get().project, pages: get().project.pages.map((page) => page.id === id ? { ...page, panels: scaffoldPanels(page.id, page.idea, page.panelCount), imageUrl: null, jobId: null, batchId: null, status: 'draft', error: null } : page) }),
    updatePanel: (pageId, panelId, value) => setProject({ ...get().project, pages: get().project.pages.map((page) => page.id === pageId ? { ...page, imageUrl: null, jobId: null, batchId: null, panels: page.panels.map((item) => item.id === panelId ? { ...item, ...value, status: 'draft', jobId: null, imageUrl: null, error: null } : item), status: 'draft', error: null } : page) }),
    addCharacter: (character) => { if (get().project.cast.some((item) => item.sourceId && item.sourceId === character.sourceId)) return; setProject({ ...get().project, cast: [...get().project.cast, character] }); },
    updateCharacter: (id, value) => setProject({ ...get().project, cast: get().project.cast.map((item) => item.id === id ? { ...item, ...value } : item) }),
    removeCharacter: (id) => setProject({ ...get().project, cast: get().project.cast.filter((item) => item.id !== id) }),
    toggleCharacterRole: (id) => setProject({ ...get().project, cast: get().project.cast.map((item) => item.id === id ? { ...item, role: item.role === 'main' ? 'supporting' : 'main' } : item) }),
    removePage: (id) => { if (get().project.pages.length <= 1) return; setProject({ ...get().project, pages: get().project.pages.filter((page) => page.id !== id).map((page, index) => ({ ...page, order: index + 1 })) }); },
    saveToLibrary: async () => { const now = new Date().toISOString(); const version = Math.max(0, ...get().library.filter((item) => item.id === get().project.id).map((item) => item.version)) + 1; const saved = { ...get().project, versionId: `${get().project.id}-v${version}-${Date.now()}`, version, savedAt: now }; const library = [saved, ...get().library]; set({ library }); await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library)); },
    loadFromLibrary: (versionId) => { const item = get().library.find((entry) => entry.versionId === versionId); if (item) setProject(normalize(item)); },
    removeFromLibrary: async (versionId) => { const library = get().library.filter((item) => item.versionId !== versionId); set({ library }); await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library)); },
    exportProjectJson: () => JSON.stringify(get().project, null, 2),
    reset: () => setProject(makeProject()),
  };
});
