import type { AxiosInstance } from 'axios';
import type { AgeBand, ChildProfile } from '../core/types';
declare function normalizeChild(raw: Record<string, unknown>): ChildProfile;
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
export declare function createFamilyApi(client: AxiosInstance): {
    listFamily(): Promise<{
        children: ChildProfile[];
    }>;
    createChild(input: CreateChildInput): Promise<ChildProfile>;
    setChildPassword(childId: string, password: string, opts?: {
        parentPassword?: string;
        loginEmail?: string;
        loginUsername?: string;
    }): Promise<ChildProfile>;
    updateChildConsent(childId: string, consent: {
        allowAiCreate?: boolean;
        allowPhoto?: boolean;
        allowExport?: boolean;
    }): Promise<ChildProfile>;
    /**
     * Parent đặt lại mật khẩu cho con (không cần mật khẩu cũ của con).
     * Dùng khi con quên mật khẩu.
     */
    resetChildPassword(childId: string, newPassword: string, parentPassword?: string): Promise<ChildProfile>;
    /**
     * Parent đặt lại PIN cho con.
     * Dùng khi con quên PIN.
     */
    resetChildPin(childId: string, newPin: string, parentPassword?: string): Promise<ChildProfile>;
    /**
     * Upload avatar cho child profile.
     * Hỗ trợ Web (File/Blob) và React Native ({ uri, type, name }).
     */
    uploadChildAvatar(childId: string, file: File | Blob | {
        uri: string;
        type?: string;
        name?: string;
    }): Promise<{
        avatarUrl: string;
    }>;
    /** Child session updates only its own avatar; ownership comes from verified JWT. */
    updateMyAvatar(avatarUrl: string): Promise<ChildProfile>;
    normalizeChild: typeof normalizeChild;
};
export type FamilyApi = ReturnType<typeof createFamilyApi>;
export {};
//# sourceMappingURL=api.d.ts.map