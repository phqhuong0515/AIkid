import type { AxiosInstance } from 'axios';
import { Paths } from '../core/paths';
import { unwrapData } from '../core/unwrap';
import type { AuthLoginResult, ChangePasswordInput, PublicUser } from '../core/types';

export type LoginInput = {
  email?: string;
  username?: string;
  login?: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  name?: string;
  asParent?: boolean;
  parentalConsentAccepted?: boolean;
};

export type FirebaseExchangeInput = {
  idToken: string;
};

export type FirebaseGoogleSignInInput = {
  idToken: string;
  parentalConsentAccepted?: boolean;
  termsAccepted?: boolean;
};

export type FirebaseGoogleLinkInput = {
  idToken: string;
  password: string;
};

export type FirebaseGoogleLinkStatus = {
  linked: boolean;
  email: string | null;
  hasPassword: boolean;
};

export function createAuthApi(client: AxiosInstance) {
  return {
    async login(input: LoginInput): Promise<AuthLoginResult> {
      const { data } = await client.post<unknown>(Paths.accountLogin, {
        email: input.email,
        username: input.username,
        login: input.login || input.username || input.email,
        password: input.password,
      });
      const body = data as Record<string, unknown>;
      const token = String(body.token || body.accessToken || '');
      if (!token) {
        throw new Error('Login response missing token');
      }
      const user = (body.user || {}) as PublicUser;
      return {
        token,
        accessToken: String(body.accessToken || token),
        user,
        actor: (body.actor as AuthLoginResult['actor']) || user.actor,
        parentId: body.parentId ? String(body.parentId) : undefined,
        childProfileId: body.childProfileId
          ? String(body.childProfileId)
          : undefined,
        child: body.child,
      };
    },

    async register(input: RegisterInput): Promise<AuthLoginResult> {
      const { data } = await client.post<unknown>(Paths.accountRegister, {
        email: input.email,
        password: input.password,
        name: input.name,
        asParent: input.asParent !== false,
        parentalConsentAccepted: input.parentalConsentAccepted === true,
      });
      const body = data as Record<string, unknown>;
      const token = String(body.token || body.accessToken || '');
      if (!token) {
        throw new Error('Register response missing token');
      }
      return {
        token,
        accessToken: String(body.accessToken || token),
        user: (body.user || {}) as PublicUser,
        actor: 'parent',
      };
    },

    async me(): Promise<PublicUser> {
      const { data } = await client.get<unknown>(Paths.accountMe);
      const body = data as Record<string, unknown>;
      const user =
        (body.user as PublicUser) ||
        unwrapData<PublicUser>(data) ||
        ({} as PublicUser);
      return user;
    },

    /** Exchange a verified Firebase ID token for the canonical StoryMee JWT. */
    async exchangeFirebaseToken(input: FirebaseExchangeInput): Promise<AuthLoginResult> {
      const { data } = await client.post<unknown>(Paths.accountFirebaseExchange, input);
      const body = (unwrapData<Record<string, unknown>>(data) ?? data) as Record<string, unknown>;
      const token = String(body.token || body.accessToken || '');
      if (!token) throw new Error('Firebase exchange response missing StoryMee token');
      const user = (body.user || {}) as PublicUser;
      return {
        token,
        accessToken: String(body.accessToken || token),
        user,
        actor: (body.actor as AuthLoginResult['actor']) || user.actor,
        parentId: body.parentId ? String(body.parentId) : undefined,
        childProfileId: body.childProfileId ? String(body.childProfileId) : undefined,
        child: body.child,
      };
    },

    /** Google Firebase token -> canonical StoryMee parent session. */
    async signInWithFirebaseGoogle(
      input: FirebaseGoogleSignInInput,
    ): Promise<AuthLoginResult & { created?: boolean }> {
      const { data } = await client.post<unknown>(Paths.accountFirebaseGoogle, {
        idToken: input.idToken,
        parentalConsentAccepted: input.parentalConsentAccepted === true,
        termsAccepted: input.termsAccepted === true,
      });
      const body = (unwrapData<Record<string, unknown>>(data) ?? data) as Record<string, unknown>;
      const token = String(body.token || body.accessToken || '');
      if (!token) throw new Error('Google sign-in response missing StoryMee token');
      return {
        token,
        accessToken: String(body.accessToken || token),
        user: (body.user || {}) as PublicUser,
        actor: 'parent',
        created: body.created === true,
      };
    },

    /** Link Google only after StoryMee JWT + password step-up. */
    async linkFirebaseGoogle(input: FirebaseGoogleLinkInput): Promise<void> {
      await client.post(Paths.accountFirebaseGoogleLink, input);
    },

    async getFirebaseGoogleStatus(): Promise<FirebaseGoogleLinkStatus> {
      const { data } = await client.get<unknown>(Paths.accountFirebaseGoogleLink);
      const body = (unwrapData<Record<string, unknown>>(data) ?? data) as Record<string, unknown>;
      return {
        linked: body.linked === true,
        email: body.email ? String(body.email) : null,
        hasPassword: body.hasPassword === true,
      };
    },

    /** Unlink Google; backend rejects removal of the final login method. */
    async unlinkFirebaseGoogle(password: string): Promise<void> {
      await client.delete(Paths.accountFirebaseGoogleLink, { data: { password } });
    },

    /** Child username/password stays canonical; this only mints a Firebase custom token. */
    async getFirebaseChildToken(login: string, password: string): Promise<string> {
      const { data } = await client.post<unknown>(Paths.accountFirebaseChildToken, {
        username: login.trim().toLowerCase(),
        password,
      });
      const body = (unwrapData<Record<string, unknown>>(data) ?? data) as Record<string, unknown>;
      const token = String(body.customToken || body.firebaseCustomToken || '');
      if (!token) throw new Error('Firebase child-token response missing custom token');
      return token;
    },

    async logout(): Promise<void> {
      try {
        await client.post(Paths.accountLogout, {});
      } catch {
        // Ignore server errors on logout — client should clear token regardless
      }
    },

    async changePassword(input: ChangePasswordInput): Promise<void> {
      await client.post(Paths.accountChangePassword, {
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
      });
    },

    /**
     * Bước 1 — Quên mật khẩu: gửi email reset link/OTP.
     */
    async requestPasswordReset(email: string): Promise<void> {
      await client.post(Paths.accountForgotPassword, { email });
    },

    /**
     * Bước 2 — Quên mật khẩu: xác nhận token và đặt mật khẩu mới.
     * @param token  Token nhận từ email (query param trong link reset)
     * @param newPassword  Mật khẩu mới
     */
    async confirmPasswordReset(
      token: string,
      newPassword: string,
    ): Promise<void> {
      await client.post(Paths.accountResetPassword, { token, newPassword });
    },

    /** Gửi lại email xác thực tài khoản. */
    async resendVerification(email: string): Promise<void> {
      await client.post(Paths.accountResendVerification, { email });
    },

    async deleteAccount(password: string): Promise<void> {
      await client.delete(Paths.accountMe, { data: { password } });
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
