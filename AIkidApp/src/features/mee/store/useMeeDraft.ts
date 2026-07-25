import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { createDefaultMeeDraft, type MeeDraft, type MeeGender } from '../types';
import { MEE_OPTIONS, HAIR_COLORS } from '../assets';
import { SKIN_TONE_COLORS } from '../skinTones';

const DRAFT_KEY = 'aikid.mee.draft.v1';
const LEGACY_KEY = 'mee_character_state';

type MeeState = {
  draft: MeeDraft;
  past: MeeDraft[];
  future: MeeDraft[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setGender: (g: MeeGender) => void;
  setField: <K extends keyof MeeDraft>(key: K, value: MeeDraft[K]) => void;
  reset: () => void;
  undo: () => void;
  redo: () => void;
  randomize: () => void;
  persist: () => Promise<void>;
};

function webLocalGet(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export const useMeeDraft = create<MeeState>((set, get) => ({
  draft: createDefaultMeeDraft(),
  past: [],
  future: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw =
        (await AsyncStorage.getItem(DRAFT_KEY)) ?? webLocalGet(LEGACY_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<MeeDraft>;
          set({
            draft: { ...createDefaultMeeDraft(), ...parsed, schemaVersion: 1 },
            isHydrated: true,
          });
          if (!(await AsyncStorage.getItem(DRAFT_KEY))) {
            await AsyncStorage.setItem(
              DRAFT_KEY,
              JSON.stringify(get().draft),
            );
          }
          return;
        } catch {
          // fall through
        }
      }
      set({ draft: createDefaultMeeDraft(), isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  setGender: (g) => {
    set((s) => ({
      past: [...s.past, s.draft],
      future: [],
      draft: { ...s.draft, gender: g },
    }));
    void get().persist();
  },

  setField: (key, value) => {
    set((s) => ({
      past: [...s.past, s.draft],
      future: [],
      draft: { ...s.draft, [key]: value },
    }));
    void get().persist();
  },

  reset: () => {
    const draft = createDefaultMeeDraft();
    set({ draft, past: [], future: [] });
    void AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  },

  undo: () => {
    set((s) => {
      if (s.past.length === 0) return s;
      const previous = s.past[s.past.length - 1];
      const newPast = s.past.slice(0, s.past.length - 1);
      return {
        past: newPast,
        future: [s.draft, ...s.future],
        draft: previous,
      };
    });
    void get().persist();
  },

  redo: () => {
    set((s) => {
      if (s.future.length === 0) return s;
      const next = s.future[0];
      const newFuture = s.future.slice(1);
      return {
        past: [...s.past, s.draft],
        future: newFuture,
        draft: next,
      };
    });
    void get().persist();
  },

  randomize: () => {
    set((s) => {
      const pick = <T>(arr: readonly T[] | T[]): T => arr[Math.floor(Math.random() * arr.length)];
      const skinTones = Object.keys(SKIN_TONE_COLORS).map(Number);
      const backgrounds = ['#FFF7ED', '#E0F2FE', '#F3E8FF', '#DCFCE7', '#FEF3C7'];
      
      const newDraft: MeeDraft = {
        ...s.draft,
        gender: pick(['male', 'female'] as const),
        skinTone: pick(skinTones),
        face: pick(MEE_OPTIONS.faces),
        eyes: pick(MEE_OPTIONS.eyes),
        eyebrows: pick(MEE_OPTIONS.eyebrows),
        mouth: pick(MEE_OPTIONS.mouths),
        bang: pick(MEE_OPTIONS.bangs),
        behind: pick(MEE_OPTIONS.behind),
        hairColor: pick(HAIR_COLORS).id,
        shirt: pick(MEE_OPTIONS.shirts.slice(1)), // Skip 0
        pants: pick(MEE_OPTIONS.pants.slice(1)),
        shirtColor: pick([1, 2, 3, 4, 5]),
        pantsColor: pick([1, 2, 3, 4, 5]),
        backgroundColor: pick(backgrounds),
      };

      return {
        past: [...s.past, s.draft],
        future: [],
        draft: newDraft,
      };
    });
    void get().persist();
  },

  persist: async () => {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(get().draft));
  },
}));
