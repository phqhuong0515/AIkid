import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { createDefaultMeeDraft, type MeeDraft, type MeeGender } from '../types';

const DRAFT_KEY = 'aikid.mee.draft.v1';
const LEGACY_KEY = 'mee_character_state';

type MeeState = {
  draft: MeeDraft;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setGender: (g: MeeGender) => void;
  setField: <K extends keyof MeeDraft>(key: K, value: MeeDraft[K]) => void;
  reset: () => void;
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
    set((s) => ({ draft: { ...s.draft, gender: g } }));
    void get().persist();
  },

  setField: (key, value) => {
    set((s) => ({ draft: { ...s.draft, [key]: value } }));
    void get().persist();
  },

  reset: () => {
    const draft = createDefaultMeeDraft();
    set({ draft });
    void AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  },

  persist: async () => {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(get().draft));
  },
}));
