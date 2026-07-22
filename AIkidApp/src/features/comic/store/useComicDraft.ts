import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const DRAFT_KEY = 'aikid.comic.project.v2';
const LIBRARY_KEY = 'aikid.comic.library.v2';

export type ComicPageStatus = 'draft' | 'working' | 'done' | 'error';
export type ComicPage = {
  id: string;
  order: number;
  narration: string;
  visualPrompt: string;
  imageUrl: string | null;
  jobId: string | null;
  status: ComicPageStatus;
  error: string | null;
};
export type ComicProject = {
  schemaVersion: 2;
  id: string;
  title: string;
  idea: string;
  genre: string;
  characters: string;
  format: 'story' | 'comic';
  pages: ComicPage[];
  createdAt: string;
  updatedAt: string;
};
export type ComicLibraryItem = ComicProject & { versionId: string; version: number; savedAt: string };

function makePage(order: number): ComicPage {
  return { id: `${Date.now()}-${order}-${Math.random().toString(36).slice(2, 7)}`, order, narration: '', visualPrompt: '', imageUrl: null, jobId: null, status: 'draft', error: null };
}
function makeProject(): ComicProject {
  const now = new Date().toISOString();
  return { schemaVersion: 2, id: `comic-${Date.now()}`, title: '', idea: '', genre: 'Phiêu lưu', characters: '', format: 'comic', pages: [makePage(1)], createdAt: now, updatedAt: now };
}
function normalize(project: Partial<ComicProject>): ComicProject {
  const base = makeProject();
  const pages = Array.isArray(project.pages) && project.pages.length ? project.pages : base.pages;
  return { ...base, ...project, schemaVersion: 2, pages: pages.map((page, index) => ({ ...makePage(index + 1), ...page, order: index + 1 })) };
}

type State = {
  project: ComicProject;
  library: ComicLibraryItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  patchProject: (value: Partial<Omit<ComicProject, 'pages' | 'schemaVersion'>>) => void;
  addPage: () => void;
  updatePage: (id: string, value: Partial<ComicPage>) => void;
  movePage: (id: string, direction: -1 | 1) => void;
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
        let project = draftRaw ? normalize(JSON.parse(draftRaw)) : makeProject();
        if (!draftRaw && legacyRaw) {
          const legacy = JSON.parse(legacyRaw) as Record<string, unknown>;
          project = normalize({ title: String(legacy.title || ''), idea: String(legacy.idea || ''), genre: String(legacy.genre || 'Phiêu lưu'), characters: String(legacy.characters || ''), format: legacy.format === 'story' ? 'story' : 'comic' });
        }
        const parsedLibrary = libraryRaw ? JSON.parse(libraryRaw) as ComicLibraryItem[] : [];
        const library = parsedLibrary.map((item, index) => ({ ...normalize(item), versionId: item.versionId || `${item.id}-legacy-${index}`, version: Number(item.version) || 1, savedAt: item.savedAt || item.updatedAt }));
        set({ project, library, hydrated: true });
      } catch { set({ hydrated: true }); }
    },
    patchProject: (value) => setProject({ ...get().project, ...value }),
    addPage: () => setProject({ ...get().project, pages: [...get().project.pages, makePage(get().project.pages.length + 1)] }),
    updatePage: (id, value) => setProject({ ...get().project, pages: get().project.pages.map((page) => page.id === id ? { ...page, ...value } : page) }),
    movePage: (id, direction) => {
      const pages = [...get().project.pages]; const from = pages.findIndex((p) => p.id === id); const to = from + direction;
      if (from < 0 || to < 0 || to >= pages.length) return;
      [pages[from], pages[to]] = [pages[to], pages[from]];
      setProject({ ...get().project, pages: pages.map((page, index) => ({ ...page, order: index + 1 })) });
    },
    removePage: (id) => { if (get().project.pages.length <= 1) return; setProject({ ...get().project, pages: get().project.pages.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i + 1 })) }); },
    saveToLibrary: async () => { const now = new Date().toISOString(); const version = Math.max(0, ...get().library.filter((item) => item.id === get().project.id).map((item) => item.version)) + 1; const saved: ComicLibraryItem = { ...get().project, versionId: `${get().project.id}-v${version}-${Date.now()}`, version, savedAt: now }; const library = [saved, ...get().library]; set({ library }); await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library)); },
    loadFromLibrary: (versionId) => { const item = get().library.find((entry) => entry.versionId === versionId); if (item) setProject(normalize(item)); },
    removeFromLibrary: async (versionId) => { const library = get().library.filter((item) => item.versionId !== versionId); set({ library }); await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library)); },
    exportProjectJson: () => JSON.stringify(get().project, null, 2),
    reset: () => setProject(makeProject()),
  };
});
