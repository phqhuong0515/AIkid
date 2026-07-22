import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { ArtStyleId } from '../constants';

const KEY = 'aikid.art.draft.v1';
export type ArtDraft = {
  styleId: ArtStyleId;
  prompt: string;
  referenceUri: string | null;
  referenceFileName: string | null;
  referenceMimeType: string | null;
  uploadedReferenceUrl: string | null;
  resultUri: string | null;
  resultJobId: string | null;
};
const initial: ArtDraft = {
  styleId: 'watercolor', prompt: '', referenceUri: null,
  referenceFileName: null, referenceMimeType: null,
  uploadedReferenceUrl: null, resultUri: null, resultJobId: null,
};

type State = { draft: ArtDraft; hydrated: boolean; hydrate: () => Promise<void>; patch: (value: Partial<ArtDraft>) => void; reset: () => void };
export const useArtDraft = create<State>((set, get) => ({
  draft: initial, hydrated: false,
  hydrate: async () => { try { const raw = await AsyncStorage.getItem(KEY); set({ draft: raw ? { ...initial, ...JSON.parse(raw) } : initial, hydrated: true }); } catch { set({ hydrated: true }); } },
  patch: (value) => { set((s) => ({ draft: { ...s.draft, ...value } })); queueMicrotask(() => void AsyncStorage.setItem(KEY, JSON.stringify(get().draft))); },
  reset: () => { set({ draft: initial }); void AsyncStorage.setItem(KEY, JSON.stringify(initial)); },
}));
