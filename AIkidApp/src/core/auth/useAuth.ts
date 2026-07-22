import { create } from 'zustand';

import { useFamily } from '@/features/family/store/useFamily';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { authApi, familyApi } from '@/core/storymee';
import { isFirebaseAuthEnabled, loginChildWithFirebase, logoutFirebaseBestEffort } from '@/core/firebase/auth';

import { apiClient } from '../api/client';
import { extractErrorMessage } from '../api/unwrap';
import { useWorkspace } from '../workspace/useWorkspace';
import { clearAccessToken, getAccessToken, setAccessToken } from './token';

export type AuthUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
  [key: string]: unknown;
};

export type AuthActor = 'parent' | 'child';

type LoginPayload = {
  login: string;
  password: string;
  actorHint?: AuthActor;
};

type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  asParent?: boolean;
  parentalConsentAccepted?: boolean;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  actor: AuthActor;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithFirebaseIdToken: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  resetSessionLocal: () => void;
  clearError: () => void;
};

function peekJwtActor(token: string): AuthActor | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { actor?: string; role?: string };
    return payload.actor === 'child' || payload.role === 'child' ? 'child' : 'parent';
  } catch {
    return null;
  }
}

async function hydrateChildSession(token: string): Promise<AuthUser> {
  const { data } = await apiClient.get<unknown>('/api/v1/account/family/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = data as {
    data?: { child?: Record<string, unknown>; parentId?: string };
  };
  if (!body.data?.child) throw new Error('Child session response missing child');
  const child = familyApi.normalizeChild(body.data.child);
  await useFamily.getState().applyChildSession(child as never);
  return {
    id: child.id,
    name: child.name,
    actor: 'child',
    role: 'child',
    childId: child.id,
    parentId: body.data.parentId,
  };
}

/**
 * Auth store — same contract as StoryMeeMobileApp.
 * Uses core-account-api via Gateway: login / register / me / delete.
 * Family hooks deferred until features/family is ported.
 */
export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  actor: 'parent',
  isHydrated: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        set({ token: null, user: null, actor: 'parent', isHydrated: true });
        return;
      }

      const jwtActor = peekJwtActor(token);
      try {
        if (jwtActor === 'child') {
          const user = await hydrateChildSession(token);
          set({ token, user, actor: 'child', isHydrated: true });
          await useWorkspace.getState().loadWorkspaces({ token });
          return;
        }
        const user = await authApi.me();
        const actor: AuthActor = user.actor === 'child' ? 'child' : 'parent';
        if (actor === 'child') {
          const childUser = await hydrateChildSession(token);
          set({ token, user: childUser, actor, isHydrated: true });
          await useWorkspace.getState().loadWorkspaces({ token });
          return;
        }
        set({ token, user, actor, isHydrated: true });
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
        set({ token, actor: jwtActor ?? 'parent', isHydrated: true });
        await useWorkspace.getState().loadWorkspaces({ token });
      }
    } catch {
      set({ token: null, user: null, isHydrated: true });
    }
  },

  login: async ({ login, password, actorHint }) => {
    set({ isLoading: true, error: null });
    try {
      // Match MobileApp downgrade policy: when Firebase is enabled, failures are
      // surfaced instead of silently replaying classroom credentials.
      const result = actorHint === 'child' && isFirebaseAuthEnabled()
        ? await loginChildWithFirebase(login, password)
        : await authApi.login({ login: login.trim(), password });
      const token = result.token;
      const actor: AuthActor = result.actor === 'child' ||
        result.user?.actor === 'child' || result.user?.role === 'child' ||
        (actorHint === 'child' && !!result.child)
        ? 'child'
        : 'parent';

      await setAccessToken(token);
      set({
        token,
        user: result.user ?? { email: login.trim() },
        actor,
        isLoading: false,
        error: null,
      });
      await useWorkspace.getState().loadWorkspaces({ token });
      if (actor === 'parent') {
        await useFamily.getState().loadFamily();
      } else if (result.child && typeof result.child === 'object') {
        await useFamily.getState().applyChildSession(result.child as never);
      }
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
      const result = await authApi.register({
        email: email.trim(), password, name: name?.trim(), asParent,
        parentalConsentAccepted,
      });
      const token = result.token;
      const user = result.user;

      await setAccessToken(token);
      set({
        token,
        user: user ?? { email: email.trim(), name: name?.trim() },
        actor: 'parent',
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

  loginWithFirebaseIdToken: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.exchangeFirebaseToken({ idToken });
      const actor: AuthActor = result.actor === 'child' ? 'child' : 'parent';
      await setAccessToken(result.token);
      set({ token: result.token, user: result.user, actor, isLoading: false });
      await useWorkspace.getState().loadWorkspaces({ token: result.token });
      if (actor === 'parent') await useFamily.getState().loadFamily();
      else if (result.child && typeof result.child === 'object') {
        await useFamily.getState().applyChildSession(result.child as never);
      }
    } catch (err) {
      set({ isLoading: false, error: extractErrorMessage(err, 'Firebase login thất bại') });
      throw err;
    }
  },

  logout: async () => {
    await logoutFirebaseBestEffort();
    await clearAccessToken();
    await useWorkspace.getState().reset();
    await useFamily.getState().reset();
    await useRecentAiImages.getState().clearAllScopes();
    set({ token: null, user: null, actor: 'parent', error: null, isLoading: false });
  },

  deleteAccount: async (password: string) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.deleteAccount(password);
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
    set({ token: null, user: null, actor: 'parent', error: null });
  },

  clearError: () => set({ error: null }),
}));
