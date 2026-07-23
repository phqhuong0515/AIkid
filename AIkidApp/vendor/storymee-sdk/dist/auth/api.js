"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthApi = createAuthApi;
const paths_1 = require("../core/paths");
const unwrap_1 = require("../core/unwrap");
function createAuthApi(client) {
    return {
        async login(input) {
            const { data } = await client.post(paths_1.Paths.accountLogin, {
                email: input.email,
                username: input.username,
                login: input.login || input.username || input.email,
                password: input.password,
            });
            const body = data;
            const token = String(body.token || body.accessToken || '');
            if (!token) {
                throw new Error('Login response missing token');
            }
            const user = (body.user || {});
            return {
                token,
                accessToken: String(body.accessToken || token),
                user,
                actor: body.actor || user.actor,
                parentId: body.parentId ? String(body.parentId) : undefined,
                childProfileId: body.childProfileId
                    ? String(body.childProfileId)
                    : undefined,
                child: body.child,
            };
        },
        async register(input) {
            const { data } = await client.post(paths_1.Paths.accountRegister, {
                email: input.email,
                password: input.password,
                name: input.name,
                asParent: input.asParent !== false,
                parentalConsentAccepted: input.parentalConsentAccepted === true,
            });
            const body = data;
            const token = String(body.token || body.accessToken || '');
            if (!token) {
                throw new Error('Register response missing token');
            }
            return {
                token,
                accessToken: String(body.accessToken || token),
                user: (body.user || {}),
                actor: 'parent',
            };
        },
        async me() {
            const { data } = await client.get(paths_1.Paths.accountMe);
            const body = data;
            const user = body.user ||
                (0, unwrap_1.unwrapData)(data) ||
                {};
            return user;
        },
        /** Exchange a verified Firebase ID token for the canonical StoryMee JWT. */
        async exchangeFirebaseToken(input) {
            const { data } = await client.post(paths_1.Paths.accountFirebaseExchange, input);
            const body = ((0, unwrap_1.unwrapData)(data) ?? data);
            const token = String(body.token || body.accessToken || '');
            if (!token)
                throw new Error('Firebase exchange response missing StoryMee token');
            const user = (body.user || {});
            return {
                token,
                accessToken: String(body.accessToken || token),
                user,
                actor: body.actor || user.actor,
                parentId: body.parentId ? String(body.parentId) : undefined,
                childProfileId: body.childProfileId ? String(body.childProfileId) : undefined,
                child: body.child,
            };
        },
        /** Google Firebase token -> canonical StoryMee parent session. */
        async signInWithFirebaseGoogle(input) {
            const { data } = await client.post(paths_1.Paths.accountFirebaseGoogle, {
                idToken: input.idToken,
                parentalConsentAccepted: input.parentalConsentAccepted === true,
                termsAccepted: input.termsAccepted === true,
            });
            const body = ((0, unwrap_1.unwrapData)(data) ?? data);
            const token = String(body.token || body.accessToken || '');
            if (!token)
                throw new Error('Google sign-in response missing StoryMee token');
            return {
                token,
                accessToken: String(body.accessToken || token),
                user: (body.user || {}),
                actor: 'parent',
                created: body.created === true,
            };
        },
        /** Link Google only after StoryMee JWT + password step-up. */
        async linkFirebaseGoogle(input) {
            await client.post(paths_1.Paths.accountFirebaseGoogleLink, input);
        },
        async getFirebaseGoogleStatus() {
            const { data } = await client.get(paths_1.Paths.accountFirebaseGoogleLink);
            const body = ((0, unwrap_1.unwrapData)(data) ?? data);
            return {
                linked: body.linked === true,
                email: body.email ? String(body.email) : null,
                hasPassword: body.hasPassword === true,
            };
        },
        /** Unlink Google; backend rejects removal of the final login method. */
        async unlinkFirebaseGoogle(password) {
            await client.delete(paths_1.Paths.accountFirebaseGoogleLink, { data: { password } });
        },
        /** Child username/password stays canonical; this only mints a Firebase custom token. */
        async getFirebaseChildToken(login, password) {
            const { data } = await client.post(paths_1.Paths.accountFirebaseChildToken, {
                username: login.trim().toLowerCase(),
                password,
            });
            const body = ((0, unwrap_1.unwrapData)(data) ?? data);
            const token = String(body.customToken || body.firebaseCustomToken || '');
            if (!token)
                throw new Error('Firebase child-token response missing custom token');
            return token;
        },
        async logout() {
            try {
                await client.post(paths_1.Paths.accountLogout, {});
            }
            catch {
                // Ignore server errors on logout — client should clear token regardless
            }
        },
        async changePassword(input) {
            await client.post(paths_1.Paths.accountChangePassword, {
                oldPassword: input.oldPassword,
                newPassword: input.newPassword,
            });
        },
        /**
         * Bước 1 — Quên mật khẩu: gửi email reset link/OTP.
         */
        async requestPasswordReset(email) {
            await client.post(paths_1.Paths.accountForgotPassword, { email });
        },
        /**
         * Bước 2 — Quên mật khẩu: xác nhận token và đặt mật khẩu mới.
         * @param token  Token nhận từ email (query param trong link reset)
         * @param newPassword  Mật khẩu mới
         */
        async confirmPasswordReset(token, newPassword) {
            await client.post(paths_1.Paths.accountResetPassword, { token, newPassword });
        },
        /** Gửi lại email xác thực tài khoản. */
        async resendVerification(email) {
            await client.post(paths_1.Paths.accountResendVerification, { email });
        },
        async deleteAccount(password) {
            await client.delete(paths_1.Paths.accountMe, { data: { password } });
        },
    };
}
//# sourceMappingURL=api.js.map