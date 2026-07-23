import type { AxiosInstance } from 'axios';
import { Paths } from '../core/paths';
import { unwrapData } from '../core/unwrap';
import type { AgeBand, ChildProfile } from '../core/types';

function normalizeChild(raw: Record<string, unknown>): ChildProfile {
  const consent = (raw.consent || {}) as Record<string, unknown>;
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
    monthlyCreateCap:
      raw.monthlyCreateCap === null || raw.monthlyCreateCap === undefined
        ? null
        : Number(raw.monthlyCreateCap),
    monthlyCreateUsed: Number(raw.monthlyCreateUsed ?? 0) || 0,
    consent: {
      allowAiCreate: Boolean(consent.allowAiCreate),
      allowPhoto: Boolean(consent.allowPhoto),
      allowExport: Boolean(consent.allowExport),
      updatedAt:
        typeof consent.updatedAt === 'string' ? consent.updatedAt : undefined,
    },
  };
}

export type CreateChildInput = {
  name: string;
  ageBand: AgeBand;
  allowAiCreate?: boolean;
  allowPhoto?: boolean;
  allowExport?: boolean;
  loginEmail?: string;
  loginUsername?: string;
  password: string;
};

export function createFamilyApi(client: AxiosInstance) {
  return {
    async listFamily(): Promise<{ children: ChildProfile[] }> {
      const { data } = await client.get<unknown>(Paths.family);
      const inner = unwrapData<{ children?: unknown[] }>(data);
      const children = Array.isArray(inner?.children)
        ? inner!.children
            .map((c) => normalizeChild(c as Record<string, unknown>))
            .filter((c) => c.id)
        : [];
      return { children };
    },

    async createChild(input: CreateChildInput): Promise<ChildProfile> {
      const { data } = await client.post<unknown>(Paths.familyChildren, input);
      const inner = unwrapData<{ child?: Record<string, unknown> }>(data);
      if (!inner?.child) throw new Error('Không tạo được hồ sơ con');
      return normalizeChild(inner.child);
    },

    async setChildPassword(
      childId: string,
      password: string,
      opts?: {
        parentPassword?: string;
        loginEmail?: string;
        loginUsername?: string;
      },
    ): Promise<ChildProfile> {
      const { data } = await client.post<unknown>(
        Paths.familyChildPassword(childId),
        {
          password,
          parentPassword: opts?.parentPassword,
          loginEmail: opts?.loginEmail,
          loginUsername: opts?.loginUsername,
        },
      );
      const inner = unwrapData<{ child?: Record<string, unknown> }>(data);
      if (!inner?.child) throw new Error('Không đặt được mật khẩu');
      return normalizeChild(inner.child);
    },

    async updateChildConsent(
      childId: string,
      consent: {
        allowAiCreate?: boolean;
        allowPhoto?: boolean;
        allowExport?: boolean;
      },
    ): Promise<ChildProfile> {
      const { data } = await client.patch<unknown>(
        Paths.familyChildConsent(childId),
        consent,
      );
      const inner = unwrapData<{ child?: Record<string, unknown> }>(data);
      if (!inner?.child) throw new Error('Không cập nhật quyền');
      return normalizeChild(inner.child);
    },

    /**
     * Parent đặt lại mật khẩu cho con (không cần mật khẩu cũ của con).
     * Dùng khi con quên mật khẩu.
     */
    async resetChildPassword(
      childId: string,
      newPassword: string,
      parentPassword?: string,
    ): Promise<ChildProfile> {
      const { data } = await client.post<unknown>(
        Paths.familyChildPassword(childId),
        {
          password: newPassword,
          parentPassword,
          reset: true,
        },
      );
      const inner = unwrapData<{ child?: Record<string, unknown> }>(data);
      if (!inner?.child) throw new Error('Không đặt lại được mật khẩu');
      return normalizeChild(inner.child);
    },

    /**
     * Parent đặt lại PIN cho con.
     * Dùng khi con quên PIN.
     */
    async resetChildPin(
      childId: string,
      newPin: string,
      parentPassword?: string,
    ): Promise<ChildProfile> {
      const { data } = await client.post<unknown>(
        Paths.familyChildPassword(childId),
        {
          pin: newPin,
          parentPassword,
          reset: true,
        },
      );
      const inner = unwrapData<{ child?: Record<string, unknown> }>(data);
      if (!inner?.child) throw new Error('Không đặt lại được PIN');
      return normalizeChild(inner.child);
    },

    /**
     * Upload avatar cho child profile.
     * Hỗ trợ Web (File/Blob) và React Native ({ uri, type, name }).
     */
    async uploadChildAvatar(
      childId: string,
      file: File | Blob | { uri: string; type?: string; name?: string },
    ): Promise<{ avatarUrl: string }> {
      const form = new FormData();
      if (typeof (file as { uri?: string }).uri === 'string') {
        const rn = file as { uri: string; type?: string; name?: string };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.append('avatar', { uri: rn.uri, type: rn.type ?? 'image/jpeg', name: rn.name ?? 'avatar.jpg' } as any);
      } else {
        form.append('avatar', file as File | Blob);
      }
      const { data } = await client.post<unknown>(
        Paths.familyChildAvatar(childId),
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      const body = data as Record<string, unknown>;
      return {
        avatarUrl: String(
          body.avatarUrl || body.url || unwrapData<{ avatarUrl?: string }>(data)?.avatarUrl || '',
        ),
      };
    },

    /** Child session updates only its own avatar; ownership comes from verified JWT. */
    async updateMyAvatar(avatarUrl: string): Promise<ChildProfile> {
      const { data } = await client.patch<unknown>(Paths.familyMeAvatar, { avatarUrl });
      const inner = unwrapData<{ child?: Record<string, unknown> }>(data);
      if (!inner?.child) throw new Error('Không cập nhật được ảnh đại diện');
      return normalizeChild(inner.child);
    },

    normalizeChild,
  };
}

export type FamilyApi = ReturnType<typeof createFamilyApi>;
