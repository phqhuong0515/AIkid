import { create } from 'zustand';

import { useFamily } from '@/features/family/store/useFamily';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';

import { apiClient } from '../api/client';
import { extractErrorMessage } from '../api/unwrap';
import { useWorkspace } from '../workspace/useWorkspace';
import { clearAccessToken, getAccessToken, setAccessToken } from './token';

export type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  name?: string;
  asParent?: boolean;
  parentalConsentAccepted?: boolean;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  resetSessionLocal: () => void;
  clearError: () => void;
};

type LoginResponse = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: AuthUser;
  data?: {
    token?: string;
    accessToken?: string;
    user?: AuthUser;
  };
};

function extractToken(body: LoginResponse): string | null {
  return (
    body.token ??
    body.accessToken ??
    body.access_token ??
    body.data?.token ??
    body.data?.accessToken ??
    null
  );
}

/**
 * Auth store — same contract as StoryMeeMobileApp.
 * Uses core-account-api via Gateway: login / register / me / delete.
 * Family hooks deferred until features/family is ported.
 */
export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        set({ token: null, user: null, isHydrated: true });
        return;
      }

      try {
        const { data } = await apiClient.get('/internal/v1/account/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user =
          (data as { user?: AuthUser })?.user ??
          (data as { data?: AuthUser })?.data ??
          null;
        set({ token, user, isHydrated: true });
        await useWorkspace.getState().loadWorkspaces({ token });
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response
          ?.status;
        if (status === 401 || status === 403) {
          await clearAccessToken();
          await useWorkspace.getState().reset();
          set({ token: null, user: null, isHydrated: true });
          return;
        }
        console.warn('[useAuth] hydrate /me failed, keeping token', e);
        set({ token, isHydrated: true });
        await useWorkspace.getState().loadWorkspaces({ token });
      }
    } catch {
      set({ token: null, user: null, isHydrated: true });
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post<LoginResponse>(
        '/internal/v1/account/login',
        { email: email.trim(), password },
      );

      const token = extractToken(data);
      if (!token) {
        throw new Error('Phản hồi đăng nhập không có token');
      }

      await setAccessToken(token);
      set({
        token,
        user: data.user ?? data.data?.user ?? { email: email.trim() },
        isLoading: false,
        error: null,
      });
      await useWorkspace.getState().loadWorkspaces({ token });
      await useFamily.getState().loadFamily();
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: extractErrorMessage(err, 'Đăng nhập thất bại'),
      });
      throw err;
    }
  },

  register: async ({
    email,
    password,
    name,
    asParent = true,
    parentalConsentAccepted = false,
  }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post<LoginResponse>(
        '/internal/v1/account/register',
        {
          email: email.trim(),
          password,
          name: name?.trim(),
          asParent,
          parentalConsentAccepted,
        },
      );

      let token = extractToken(data);
      let user = data.user ?? data.data?.user ?? null;

      if (!token) {
        const loginRes = await apiClient.post<LoginResponse>(
          '/internal/v1/account/login',
          { email: email.trim(), password },
        );
        token = extractToken(loginRes.data);
        user =
          loginRes.data.user ??
          loginRes.data.data?.user ??
          user ??
          { email: email.trim() };
      }

      if (!token) {
        throw new Error('Phản hồi đăng ký không có token');
      }

      await setAccessToken(token);
      set({
        token,
        user: user ?? { email: email.trim(), name: name?.trim() },
        isLoading: false,
        error: null,
      });
      await useWorkspace.getState().loadWorkspaces({ token });
      await useFamily.getState().loadFamily();
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: extractErrorMessage(err, 'Đăng ký thất bại'),
      });
      throw err;
    }
  },

  logout: async () => {
    await clearAccessToken();
    await useWorkspace.getState().reset();
    await useFamily.getState().reset();
    await useRecentAiImages.getState().clearAllScopes();
    set({ token: null, user: null, error: null, isLoading: false });
  },

  deleteAccount: async (password: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete('/internal/v1/account/me', {
        data: { password },
      } as Parameters<typeof apiClient.delete>[1] & {
        _skipAuthLogout?: boolean;
        data?: { password: string };
      });
      await clearAccessToken();
      await useWorkspace.getState().reset();
      await useFamily.getState().reset();
      await useRecentAiImages.getState().clearAllScopes();
      set({ token: null, user: null, isLoading: false, error: null });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: extractErrorMessage(err, 'Không xóa được tài khoản'),
      });
      throw err;
    }
  },

  resetSessionLocal: () => {
    void useWorkspace.getState().reset();
    void useFamily.getState().reset();
    void useRecentAiImages.getState().clearAllScopes();
    set({ token: null, user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
