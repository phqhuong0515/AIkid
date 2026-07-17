import { create } from 'zustand';

import {
  createEmptyDraft,
  defaultCategoryInputs,
} from '../constants';
import {
  loadDraftJson,
  loadSavedJson,
  readLegacyFragments,
  readLegacySaved,
  saveDraftJson,
  saveSavedJson,
} from '../storage';
import type {
  CategoryAnswers,
  CharacterCategoryId,
  CharacterDraft,
  SavedCharacter,
} from '../types';
import { buildCharacterUserPrompt } from '../constants';

type CharacterState = {
  draft: CharacterDraft;
  saved: SavedCharacter[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setMeta: (
    patch: Partial<
      Pick<
        CharacterDraft,
        | 'name'
        | 'age'
        | 'gender'
        | 'birthday'
        | 'species'
        | 'description'
      >
    >,
  ) => void;
  setActiveCategory: (cat: CharacterCategoryId) => void;
  setAnswer: (cat: CharacterCategoryId, index: number, value: string) => void;
  setIdeaShape: (value: string) => void;
  setGeneratedImageUri: (uri: string | null) => void;
  resetDraft: () => void;
  persistDraft: () => Promise<void>;
  saveCurrentToStorage: () => Promise<SavedCharacter | null>;
  removeSaved: (id: string) => Promise<void>;
  getUserPrompt: () => string;
};

function mergeCategoryInputs(
  base: CategoryAnswers,
  incoming?: Partial<CategoryAnswers> | null,
): CategoryAnswers {
  if (!incoming) return base;
  const next = { ...base };
  (Object.keys(base) as CharacterCategoryId[]).forEach((k) => {
    if (Array.isArray(incoming[k])) {
      next[k] = [...(incoming[k] as string[])];
    }
  });
  return next;
}

async function writeDraft(draft: CharacterDraft) {
  const payload = { ...draft, updatedAt: new Date().toISOString() };
  await saveDraftJson(JSON.stringify(payload));
  return payload;
}

export const useCharacterDraft = create<CharacterState>((set, get) => ({
  draft: createEmptyDraft(),
  saved: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      let draft = createEmptyDraft();
      const raw = await loadDraftJson();
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CharacterDraft;
          draft = {
            ...createEmptyDraft(),
            ...parsed,
            categoryInputs: mergeCategoryInputs(
              defaultCategoryInputs(),
              parsed.categoryInputs,
            ),
            schemaVersion: 1,
          };
        } catch {
          // keep empty
        }
      } else {
        const legacy = await readLegacyFragments();
        draft = {
          ...createEmptyDraft(),
          ...legacy,
          categoryInputs: mergeCategoryInputs(
            defaultCategoryInputs(),
            legacy.categoryInputs,
          ),
          schemaVersion: 1,
          updatedAt: new Date().toISOString(),
        };
        await saveDraftJson(JSON.stringify(draft));
      }

      let saved: SavedCharacter[] = [];
      const savedRaw = await loadSavedJson();
      if (savedRaw) {
        try {
          const parsed = JSON.parse(savedRaw);
          if (Array.isArray(parsed)) saved = parsed;
        } catch {
          // ignore
        }
      } else {
        const legacySaved = await readLegacySaved();
        if (legacySaved?.length) {
          saved = legacySaved;
          await saveSavedJson(JSON.stringify(saved));
        }
      }

      set({ draft, saved, isHydrated: true });
    } catch (e) {
      console.warn('[useCharacterDraft] hydrate failed', e);
      set({ isHydrated: true });
    }
  },

  setMeta: (patch) => {
    set((s) => ({
      draft: {
        ...s.draft,
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    }));
    void get().persistDraft();
  },

  setActiveCategory: (cat) => {
    set((s) => ({
      draft: {
        ...s.draft,
        activeCategory: cat,
        updatedAt: new Date().toISOString(),
      },
    }));
    void get().persistDraft();
  },

  setAnswer: (cat, index, value) => {
    set((s) => {
      const arr = [...(s.draft.categoryInputs[cat] || [])];
      while (arr.length <= index) arr.push('');
      arr[index] = value;
      return {
        draft: {
          ...s.draft,
          categoryInputs: {
            ...s.draft.categoryInputs,
            [cat]: arr,
          },
          updatedAt: new Date().toISOString(),
        },
      };
    });
    void get().persistDraft();
  },

  setIdeaShape: (value) => {
    set((s) => ({
      draft: {
        ...s.draft,
        ideaNotes: { ...s.draft.ideaNotes, shape: value },
        updatedAt: new Date().toISOString(),
      },
    }));
    void get().persistDraft();
  },

  setGeneratedImageUri: (uri) => {
    set((s) => ({
      draft: {
        ...s.draft,
        generatedImageUri: uri,
        updatedAt: new Date().toISOString(),
      },
    }));
    void get().persistDraft();
  },

  resetDraft: () => {
    const draft = createEmptyDraft();
    set({ draft });
    void saveDraftJson(JSON.stringify(draft));
  },

  persistDraft: async () => {
    const next = await writeDraft(get().draft);
    set({ draft: next });
  },

  saveCurrentToStorage: async () => {
    const { draft, saved } = get();
    const name = draft.name.trim() || 'Nhân vật chưa đặt tên';
    const prompt = buildCharacterUserPrompt(draft);
    const item: SavedCharacter = {
      id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      age: draft.age || undefined,
      gender: draft.gender || undefined,
      species: draft.species || undefined,
      description: draft.description || undefined,
      birthday: draft.birthday || undefined,
      avatarUri: draft.generatedImageUri || draft.uploadedImageUri || '',
      source: draft.generatedImageUri ? 'ai' : 'draft',
      createdAt: new Date().toISOString(),
      userPrompt: prompt,
    };
    const next = [item, ...saved];
    await saveSavedJson(JSON.stringify(next));
    set({ saved: next });
    return item;
  },

  removeSaved: async (id) => {
    const next = get().saved.filter((c) => c.id !== id);
    await saveSavedJson(JSON.stringify(next));
    set({ saved: next });
  },

  getUserPrompt: () => buildCharacterUserPrompt(get().draft),
}));
