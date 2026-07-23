import type { AxiosInstance } from 'axios';
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
export declare function createAuthApi(client: AxiosInstance): {
    login(input: LoginInput): Promise<AuthLoginResult>;
    register(input: RegisterInput): Promise<AuthLoginResult>;
    me(): Promise<PublicUser>;
    /** Exchange a verified Firebase ID token for the canonical StoryMee JWT. */
    exchangeFirebaseToken(input: FirebaseExchangeInput): Promise<AuthLoginResult>;
    /** Google Firebase token -> canonical StoryMee parent session. */
    signInWithFirebaseGoogle(input: FirebaseGoogleSignInInput): Promise<AuthLoginResult & {
        created?: boolean;
    }>;
    /** Link Google only after StoryMee JWT + password step-up. */
    linkFirebaseGoogle(input: FirebaseGoogleLinkInput): Promise<void>;
    getFirebaseGoogleStatus(): Promise<FirebaseGoogleLinkStatus>;
    /** Unlink Google; backend rejects removal of the final login method. */
    unlinkFirebaseGoogle(password: string): Promise<void>;
    /** Child username/password stays canonical; this only mints a Firebase custom token. */
    getFirebaseChildToken(login: string, password: string): Promise<string>;
    logout(): Promise<void>;
    changePassword(input: ChangePasswordInput): Promise<void>;
    /**
     * Bước 1 — Quên mật khẩu: gửi email reset link/OTP.
     */
    requestPasswordReset(email: string): Promise<void>;
    /**
     * Bước 2 — Quên mật khẩu: xác nhận token và đặt mật khẩu mới.
     * @param token  Token nhận từ email (query param trong link reset)
     * @param newPassword  Mật khẩu mới
     */
    confirmPasswordReset(token: string, newPassword: string): Promise<void>;
    /** Gửi lại email xác thực tài khoản. */
    resendVerification(email: string): Promise<void>;
    deleteAccount(password: string): Promise<void>;
};
export type AuthApi = ReturnType<typeof createAuthApi>;
//# sourceMappingURL=api.d.ts.map