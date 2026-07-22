import { create } from 'zustand';

import { apiClient } from '@/core/api/client';
import { getDefaultIpId } from '@/core/api/config';
import { extractErrorMessage, unwrapData } from '@/core/api/unwrap';
import { getAccessToken, getAccessTokenSync } from '@/core/auth/token';
import {
  clearStoredActiveIpId,
  getStoredActiveIpId,
  setStoredActiveIpId,
} from './storage';

export type Workspace = {
  ipId: string;
  name: string;
  status: string;
  role: string;
  isDefault: boolean;
  type: 'universe';
};

type LoadOptions = {
  token?: string | null;
};

type WorkspaceState = {
  workspaces: Workspace[];
  activeIpId: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  loadWorkspaces: (opts?: LoadOptions) => Promise<void>;
  selectWorkspace: (ipId: string) => Promise<void>;
  reset: () => Promise<void>;
  getActiveIpId: () => string;
};

type WorkspacesResponse = {
  workspaces?: Workspace[];
  defaultIpId?: string | null;
};

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeIpId: null,
  isLoading: false,
  isHydrated: false,
  error: null,

  getActiveIpId: () => {
    return get().activeIpId ?? getDefaultIpId();
  },

  loadWorkspaces: async (opts) => {
    const token =
      opts?.token ?? getAccessTokenSync() ?? (await getAccessToken());

    if (!token) {
      set({
        workspaces: [],
        activeIpId: getDefaultIpId(),
        isLoading: false,
        isHydrated: true,
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.get<unknown>(
        '/api/v1/account/workspaces',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const payload = unwrapData<WorkspacesResponse>(data) ?? {};
      const workspaces = Array.isArray(payload.workspaces)
        ? payload.workspaces
        : [];
      const serverDefault = payload.defaultIpId ?? null;

      const stored = await getStoredActiveIpId();
      const storedValid =
        stored && workspaces.some((w) => w.ipId === stored) ? stored : null;

      const activeIpId =
        storedValid ??
        serverDefault ??
        workspaces.find((w) => w.isDefault)?.ipId ??
        workspaces[0]?.ipId ??
        getDefaultIpId();

      await setStoredActiveIpId(activeIpId);

      set({
        workspaces,
        activeIpId,
        isLoading: false,
        isHydrated: true,
        error: null,
      });
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Không tải được workspaces');
      const fallback = (await getStoredActiveIpId()) ?? getDefaultIpId();
      set({
        workspaces: [],
        activeIpId: fallback,
        isLoading: false,
        isHydrated: true,
        error: message,
      });
    }
  },

  selectWorkspace: async (ipId: string) => {
    const token = getAccessTokenSync() ?? (await getAccessToken());
    if (!token) {
      set({ error: 'Chưa đăng nhập — không chọn được workspace' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await apiClient.post(
        `/api/v1/account/workspaces/${ipId}/select`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await setStoredActiveIpId(ipId);
      set((state) => ({
        activeIpId: ipId,
        workspaces: state.workspaces.map((w) => ({
          ...w,
          isDefault: w.ipId === ipId,
        })),
        isLoading: false,
      }));
    } catch (err: unknown) {
      await setStoredActiveIpId(ipId);
      set((state) => ({
        activeIpId: ipId,
        workspaces: state.workspaces.map((w) => ({
          ...w,
          isDefault: w.ipId === ipId,
        })),
        isLoading: false,
        error: extractErrorMessage(err, 'Select workspace failed'),
      }));
    }
  },

  reset: async () => {
    await clearStoredActiveIpId();
    set({
      workspaces: [],
      activeIpId: null,
      isHydrated: false,
      isLoading: false,
      error: null,
    });
  },
}));
