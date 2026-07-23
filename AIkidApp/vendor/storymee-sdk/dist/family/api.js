"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFamilyApi = createFamilyApi;
const paths_1 = require("../core/paths");
const unwrap_1 = require("../core/unwrap");
function normalizeChild(raw) {
    const consent = (raw.consent || {});
    return {
        id: String(raw.id || ''),
        name: String(raw.name || 'Con'),
        ageBand: String(raw.ageBand || '9-12'),
        language: String(raw.language || 'vi'),
        avatarColor: String(raw.avatarColor || 'indigo'),
        avatarUrl: raw.avatarUrl ? String(raw.avatarUrl) : undefined,
        level: Number(raw.level ?? 1) || 1,
        xp: Number(raw.xp ?? 0) || 0,
        loginEnabled: Boolean(raw.loginEnabled),
        hasPin: Boolean(raw.hasPin),
        accountUserId: raw.accountUserId ? String(raw.accountUserId) : null,
        loginEmail: raw.loginEmail ? String(raw.loginEmail) : null,
        loginUsername: raw.loginUsername ? String(raw.loginUsername) : null,
        emailIsPlaceholder: Boolean(raw.emailIsPlaceholder),
        hasPassword: Boolean(raw.hasPassword),
        monthlyCreateCap: raw.monthlyCreateCap === null || raw.monthlyCreateCap === undefined
            ? null
            : Number(raw.monthlyCreateCap),
        monthlyCreateUsed: Number(raw.monthlyCreateUsed ?? 0) || 0,
        consent: {
            allowAiCreate: Boolean(consent.allowAiCreate),
            allowPhoto: Boolean(consent.allowPhoto),
            allowExport: Boolean(consent.allowExport),
            updatedAt: typeof consent.updatedAt === 'string' ? consent.updatedAt : undefined,
        },
    };
}
function createFamilyApi(client) {
    return {
        async listFamily() {
            const { data } = await client.get(paths_1.Paths.family);
            const inner = (0, unwrap_1.unwrapData)(data);
            const children = Array.isArray(inner?.children)
                ? inner.children
                    .map((c) => normalizeChild(c))
                    .filter((c) => c.id)
                : [];
            return { children };
        },
        async createChild(input) {
            const { data } = await client.post(paths_1.Paths.familyChildren, input);
            const inner = (0, unwrap_1.unwrapData)(data);
            if (!inner?.child)
                throw new Error('Không tạo được hồ sơ con');
            return normalizeChild(inner.child);
        },
        async setChildPassword(childId, password, opts) {
            const { data } = await client.post(paths_1.Paths.familyChildPassword(childId), {
                password,
                parentPassword: opts?.parentPassword,
                loginEmail: opts?.loginEmail,
                loginUsername: opts?.loginUsername,
            });
            const inner = (0, unwrap_1.unwrapData)(data);
            if (!inner?.child)
                throw new Error('Không đặt được mật khẩu');
            return normalizeChild(inner.child);
        },
        async updateChildConsent(childId, consent) {
            const { data } = await client.patch(paths_1.Paths.familyChildConsent(childId), consent);
            const inner = (0, unwrap_1.unwrapData)(data);
            if (!inner?.child)
                throw new Error('Không cập nhật quyền');
            return normalizeChild(inner.child);
        },
        /**
         * Parent đặt lại mật khẩu cho con (không cần mật khẩu cũ của con).
         * Dùng khi con quên mật khẩu.
         */
        async resetChildPassword(childId, newPassword, parentPassword) {
            const { data } = await client.post(paths_1.Paths.familyChildPassword(childId), {
                password: newPassword,
                parentPassword,
                reset: true,
            });
            const inner = (0, unwrap_1.unwrapData)(data);
            if (!inner?.child)
                throw new Error('Không đặt lại được mật khẩu');
            return normalizeChild(inner.child);
        },
        /**
         * Parent đặt lại PIN cho con.
         * Dùng khi con quên PIN.
         */
        async resetChildPin(childId, newPin, parentPassword) {
            const { data } = await client.post(paths_1.Paths.familyChildPassword(childId), {
                pin: newPin,
                parentPassword,
                reset: true,
            });
            const inner = (0, unwrap_1.unwrapData)(data);
            if (!inner?.child)
                throw new Error('Không đặt lại được PIN');
            return normalizeChild(inner.child);
        },
        /**
         * Upload avatar cho child profile.
         * Hỗ trợ Web (File/Blob) và React Native ({ uri, type, name }).
         */
        async uploadChildAvatar(childId, file) {
            const form = new FormData();
            if (typeof file.uri === 'string') {
                const rn = file;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                form.append('avatar', { uri: rn.uri, type: rn.type ?? 'image/jpeg', name: rn.name ?? 'avatar.jpg' });
            }
            else {
                form.append('avatar', file);
            }
            const { data } = await client.post(paths_1.Paths.familyChildAvatar(childId), form, { headers: { 'Content-Type': 'multipart/form-data' } });
            const body = data;
            return {
                avatarUrl: String(body.avatarUrl || body.url || (0, unwrap_1.unwrapData)(data)?.avatarUrl || ''),
            };
        },
        /** Child session updates only its own avatar; ownership comes from verified JWT. */
        async updateMyAvatar(avatarUrl) {
            const { data } = await client.patch(paths_1.Paths.familyMeAvatar, { avatarUrl });
            const inner = (0, unwrap_1.unwrapData)(data);
            if (!inner?.child)
                throw new Error('Không cập nhật được ảnh đại diện');
            return normalizeChild(inner.child);
        },
        normalizeChild,
    };
}
//# sourceMappingURL=api.js.map