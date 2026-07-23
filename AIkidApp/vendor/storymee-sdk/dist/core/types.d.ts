/** Shared domain types for StoryMee product apps */
export type Actor = 'parent' | 'child' | 'user';
export type PublicUser = {
    id: string;
    email?: string | null;
    loginUsername?: string | null;
    name?: string | null;
    role?: string;
    actor?: Actor;
    parentId?: string | null;
    childProfileId?: string | null;
    avatarUrl?: string | null;
};
export type AuthLoginResult = {
    token: string;
    accessToken?: string;
    user: PublicUser;
    actor?: Actor;
    parentId?: string;
    childProfileId?: string;
    child?: unknown;
};
export type AgeBand = '9-12' | '13-15' | string;
export type ChildConsent = {
    allowAiCreate: boolean;
    allowPhoto: boolean;
    allowExport: boolean;
    updatedAt?: string;
};
export type ChildProfile = {
    id: string;
    name: string;
    ageBand: AgeBand;
    language?: string;
    avatarColor?: string;
    avatarUrl?: string;
    level?: number;
    xp?: number;
    loginEnabled?: boolean;
    hasPin?: boolean;
    accountUserId?: string | null;
    loginEmail?: string | null;
    loginUsername?: string | null;
    emailIsPlaceholder?: boolean;
    hasPassword?: boolean;
    monthlyCreateCap?: number | null;
    monthlyCreateUsed?: number;
    consent: ChildConsent;
};
export type StorageSummary = {
    usedBytes: number;
    limitBytes: number;
    remainingBytes: number;
    usedLabel: string;
    limitLabel: string;
    remainingLabel?: string;
    percentUsed: number;
};
export type AiPlanSummary = {
    userId: string;
    plan: string;
    status: string;
    monthlyCreateCredits: number;
    monthlyRemainingCreateCredits?: number;
    bonusCreateCredits?: number;
    remainingCreateCredits: number;
    expiresAt?: string | null;
    storageBytesUsed?: number;
    storageBytesLimit?: number;
    storageBytesRemaining?: number;
    storage?: StorageSummary;
    source?: string;
    message?: string;
};
export type BillingPlan = {
    id: string;
    name?: string;
    amountMinor: number;
    currency?: string;
    monthlyCreateCredits?: number;
    features?: string[];
    [key: string]: unknown;
};
export type CreditPack = {
    id: string;
    name?: string;
    credits: number;
    amountMinor: number;
    currency?: string;
    expires?: boolean;
    [key: string]: unknown;
};
export type BillingCheckoutResult = {
    subscription?: unknown;
    paymentIntent?: unknown;
    pack?: CreditPack;
    duplicate?: boolean;
    monthlyRemainingCreateCredits?: number;
    bonusCreateCredits?: number;
    remainingCreateCredits?: number;
    checkout?: {
        payUrl?: string | null;
        paymentReady?: boolean;
        [key: string]: unknown;
    } | null;
    message?: string;
    [key: string]: unknown;
};
export type VoucherRedeemResult = {
    credits?: number;
    remainingCreateCredits?: number;
    message?: string;
    [key: string]: unknown;
};
export type JobType = 'image' | 'video' | 'audio' | 'composite' | string;
export type JobStatus = 'queued' | 'pending' | 'working' | 'done' | 'success' | 'completed' | 'failed' | 'error' | 'cancelled' | 'canceled' | string;
export type JobRecord = {
    id?: string;
    jobId?: string;
    status: JobStatus;
    outputUrls?: string[] | string | null;
    errorMessage?: string | null;
    jobType?: JobType;
    inputParams?: Record<string, unknown>;
    createdAt?: string;
};
export declare const TERMINAL_OK: Set<string>;
export declare const TERMINAL_FAIL: Set<string>;
export declare const DEFAULT_STORAGE_BYTES_LIMIT: number;
export type UserProfile = PublicUser & {
    language?: string | null;
    avatarUrl?: string | null;
    avatarColor?: string | null;
    bio?: string | null;
    createdAt?: string;
};
export type UpdateProfileInput = {
    name?: string;
    language?: string;
    avatarColor?: string;
    avatarUrl?: string;
    bio?: string;
};
export type ChangePasswordInput = {
    oldPassword: string;
    newPassword: string;
};
export type UserWorkspace = {
    ipId: string;
    name: string;
    logoUrl?: string | null;
    isActive?: boolean;
    role?: string;
};
//# sourceMappingURL=types.d.ts.map