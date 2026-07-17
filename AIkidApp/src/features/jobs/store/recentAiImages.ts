import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import type { GalleryMediaItem } from '@/features/media/api/mediaHooks';

/**
 * Ảnh AI theo hồ sơ con (childId).
 * File trên storage.storymee.com; index local theo scope child.
 */
const LEGACY_KEY = 'storymee.recent_ai_images.v1';
const MAX_ITEMS = 100;

function storageKey(scopeId: string | null): string {
  if (!scopeId) return LEGACY_KEY;
  return `storymee.recent_ai_images.v1.child.${scopeId}`;
}

function isSafeItem(i: unknown): i is GalleryMediaItem {
  if (!i || typeof i !== 'object') return false;
  const o = i as GalleryMediaItem;
  return (
    typeof o.id === 'string' &&
    o.id.length > 0 &&
    typeof o.uri === 'string' &&
    o.uri.length > 0
  );
}

function normalizeItems(raw: unknown): GalleryMediaItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isSafeItem)
    .map((item) => ({
      id: item.id,
      uri: item.uri,
      driveUrl: item.driveUrl ?? null,
      assetType: item.assetType ?? 'ai-image',
      tags: item.tags,
      createdAt: item.createdAt ?? null,
      width: item.width ?? null,
      height: item.height ?? null,
    }))
    .slice(0, MAX_ITEMS);
}

async function writeDisk(
  scopeId: string | null,
  items: GalleryMediaItem[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(scopeId), JSON.stringify(items));
  } catch (e) {
    console.warn('[recentAiImages] persist failed', e);
  }
}

type RecentAiState = {
  items: GalleryMediaItem[];
  /** Active child profile id — null = legacy/parent-wide */
  scopeId: string | null;
  isHydrated: boolean;
  hydrate: (scopeId?: string | null) => Promise<void>;
  setScope: (scopeId: string | null) => Promise<void>;
  add: (item: GalleryMediaItem) => void;
  merge: (items: GalleryMediaItem[]) => void;
  clear: () => void;
  clearAllScopes: () => Promise<void>;
};

export const useRecentAiImages = create<RecentAiState>((set, get) => ({
  items: [],
  scopeId: null,
  isHydrated: false,

  hydrate: async (scopeId) => {
    const scope = scopeId === undefined ? get().scopeId : scopeId;
    try {
      const raw = await AsyncStorage.getItem(storageKey(scope));
      if (raw) {
        set({
          items: normalizeItems(JSON.parse(raw) as unknown),
          scopeId: scope,
          isHydrated: true,
        });
        return;
      }
    } catch (e) {
      console.warn('[recentAiImages] hydrate failed', e);
    }
    set({ items: [], scopeId: scope, isHydrated: true });
  },

  setScope: async (scopeId) => {
    if (get().scopeId === scopeId && get().isHydrated) return;
    await get().hydrate(scopeId);
  },

  add: (item) => {
    if (!isSafeItem(item)) return;
    const scope = get().scopeId;
    const next = normalizeItems([
      {
        ...item,
        assetType: item.assetType ?? 'ai-image',
        createdAt: item.createdAt ?? new Date().toISOString(),
      },
      ...get().items.filter((x) => x.id !== item.id && x.uri !== item.uri),
    ]);
    set({ items: next });
    void writeDisk(scope, next);
  },

  merge: (incoming) => {
    const scope = get().scopeId;
    const map = new Map<string, GalleryMediaItem>();
    for (const item of [...normalizeItems(incoming), ...get().items]) {
      if (!map.has(item.id)) map.set(item.id, item);
    }
    const next = Array.from(map.values()).slice(0, MAX_ITEMS);
    set({ items: next });
    void writeDisk(scope, next);
  },

  clear: () => {
    const scope = get().scopeId;
    set({ items: [] });
    void AsyncStorage.removeItem(storageKey(scope)).catch(() => undefined);
  },

  clearAllScopes: async () => {
    set({ items: [], scopeId: null, isHydrated: false });
    try {
      const keys = await AsyncStorage.getAllKeys();
      const ours = keys.filter(
        (k) =>
          k === LEGACY_KEY || k.startsWith('storymee.recent_ai_images.v1'),
      );
      if (ours.length) await AsyncStorage.multiRemove(ours);
    } catch {
      /* ignore */
    }
  },
}));
