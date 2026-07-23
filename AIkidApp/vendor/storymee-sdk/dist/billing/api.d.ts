import type { AxiosInstance } from 'axios';
import { type AiPlanSummary, type StorageSummary } from '../core/types';
import type { BillingCheckoutResult, BillingPlan, CreditPack, VoucherRedeemResult } from '../core/types';
export declare function formatStorageBytes(n: number): string;
export declare function normalizeStorageSummary(input?: {
    storageBytesUsed?: number | null;
    storageBytesLimit?: number | null;
    storageBytesRemaining?: number | null;
    storage?: Partial<StorageSummary> | null;
}): StorageSummary;
export declare function createBillingApi(client: AxiosInstance): {
    listPlans(): Promise<BillingPlan[]>;
    checkoutPlan(plan: string, idempotencyKey?: string): Promise<BillingCheckoutResult>;
    listCreditPacks(): Promise<CreditPack[]>;
    checkoutCreditPack(packId: string, idempotencyKey?: string): Promise<BillingCheckoutResult>;
    redeemVoucher(rawCode: string): Promise<VoucherRedeemResult>;
    /**
     * Plan + credits + storage (via account ai-summary — denorm from billing).
     * Prefer this for mobile/profile badges.
     */
    getAiSummary(): Promise<AiPlanSummary>;
    normalizeStorageSummary: typeof normalizeStorageSummary;
    formatStorageBytes: typeof formatStorageBytes;
};
export type BillingApi = ReturnType<typeof createBillingApi>;
//# sourceMappingURL=api.d.ts.map