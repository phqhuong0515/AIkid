import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { extractErrorMessage } from '@/core/api/unwrap';

import {
  createChild,
  deleteChild,
  fetchFamily,
  updateChild,
  updateChildConsent,
} from '../api/familyApi';
import type { AgeBand, ChildProfile } from '../types';

const ACTIVE_CHILD_KEY = 'storymee.family.active_child_id.v1';

type FamilyState = {
  children: ChildProfile[];
  activeChildId: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  loadFamily: () => Promise<void>;
  setActiveChild: (childId: string | null) => Promise<void>;
  createChildProfile: (input: {
    name: string;
    ageBand: AgeBand | string;
    allowAiCreate?: boolean;
    allowPhoto?: boolean;
  }) => Promise<ChildProfile>;
  updateConsent: (
    childId: string,
    consent: {
      allowAiCreate?: boolean;
      allowPhoto?: boolean;
      allowExport?: boolean;
    },
  ) => Promise<void>;
  updateChildProfile: (
    childId: string,
    input: {
      name?: string;
      ageBand?: AgeBand | string;
    },
  ) => Promise<ChildProfile>;
  removeChild: (childId: string) => Promise<void>;
  getActiveChild: () => ChildProfile | null;
  reset: () => Promise<void>;
};

export const useFamily = create<FamilyState>((set, get) => ({
  children: [],
  activeChildId: null,
  isLoading: false,
  isHydrated: false,
  error: null,

  getActiveChild: () => {
    const { children, activeChildId } = get();
    if (!activeChildId) return null;
    return children.find((c) => c.id === activeChildId) ?? null;
  },

  loadFamily: async () => {
    set({ isLoading: true, error: null });
    try {
      const snap = await fetchFamily();
      let stored: string | null = null;
      try {
        stored = await AsyncStorage.getItem(ACTIVE_CHILD_KEY);
      } catch {
        /* ignore */
      }
      const validStored =
        stored && snap.children.some((c) => c.id === stored) ? stored : null;
      const activeChildId =
        validStored ??
        (snap.children.length === 1 ? snap.children[0].id : null);

      if (activeChildId) {
        await AsyncStorage.setItem(ACTIVE_CHILD_KEY, activeChildId);
      }

      set({
        children: snap.children,
        activeChildId,
        isLoading: false,
        isHydrated: true,
        error: null,
      });
    } catch (err: unknown) {
      set({
        isLoading: false,
        isHydrated: true,
        error: extractErrorMessage(err, 'Không tải được gia đình'),
      });
    }
  },

  setActiveChild: async (childId) => {
    if (childId) {
      const exists = get().children.some((c) => c.id === childId);
      if (!exists) return;
      await AsyncStorage.setItem(ACTIVE_CHILD_KEY, childId);
      set({ activeChildId: childId });
    } else {
      await AsyncStorage.removeItem(ACTIVE_CHILD_KEY);
      set({ activeChildId: null });
    }
  },

  createChildProfile: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const child = await createChild(input);
      const children = [...get().children, child];
      await AsyncStorage.setItem(ACTIVE_CHILD_KEY, child.id);
      set({
        children,
        activeChildId: child.id,
        isLoading: false,
      });
      return child;
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: extractErrorMessage(err, 'Không tạo được hồ sơ con'),
      });
      throw err;
    }
  },

  updateConsent: async (childId, consent) => {
    const child = await updateChildConsent(childId, consent);
    set({
      children: get().children.map((c) => (c.id === childId ? child : c)),
    });
  },

  updateChildProfile: async (childId, input) => {
    const child = await updateChild(childId, input);
    set({
      children: get().children.map((c) => (c.id === childId ? child : c)),
    });
    return child;
  },

  removeChild: async (childId) => {
    await deleteChild(childId);
    const children = get().children.filter((c) => c.id !== childId);
    let activeChildId = get().activeChildId;
    if (activeChildId === childId) {
      activeChildId = children[0]?.id ?? null;
      if (activeChildId) {
        await AsyncStorage.setItem(ACTIVE_CHILD_KEY, activeChildId);
      } else {
        await AsyncStorage.removeItem(ACTIVE_CHILD_KEY);
      }
    }
    set({ children, activeChildId });
  },

  reset: async () => {
    await AsyncStorage.removeItem(ACTIVE_CHILD_KEY);
    set({
      children: [],
      activeChildId: null,
      isHydrated: false,
      isLoading: false,
      error: null,
    });
  },
}));
