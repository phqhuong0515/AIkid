import type { AxiosInstance } from 'axios';
import { Paths } from '../core/paths';
import { unwrapData } from '../core/unwrap';
import {
  DEFAULT_STORAGE_BYTES_LIMIT,
  type AiPlanSummary,
  type StorageSummary,
} from '../core/types';
import type { BillingCheckoutResult, BillingPlan, CreditPack, VoucherRedeemResult } from '../core/types';

export function formatStorageBytes(n: number): string {
  if (!n || n < 1024) return `${n || 0} B`;
  const u = ['KB', 'MB', 'GB'];
  let v = n;
  let i = -1;
  do {
    v /= 1024;
    i++;
  } while (v >= 1024 && i < u.length - 1);
  return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${u[i]}`;
}

export function normalizeStorageSummary(input?: {
  storageBytesUsed?: number | null;
  storageBytesLimit?: number | null;
  storageBytesRemaining?: number | null;
  storage?: Partial<StorageSummary> | null;
}): StorageSummary {
  const limit = Math.max(
    1,
    Number(
      input?.storage?.limitBytes ??
        input?.storageBytesLimit ??
        DEFAULT_STORAGE_BYTES_LIMIT,
    ) || DEFAULT_STORAGE_BYTES_LIMIT,
  );
  const used = Math.max(
    0,
    Number(input?.storage?.usedBytes ?? input?.storageBytesUsed ?? 0) || 0,
  );
  const remaining = Math.max(
    0,
    Number(
      input?.storage?.remainingBytes ??
        input?.storageBytesRemaining ??
        limit - used,
    ) || Math.max(0, limit - used),
  );
  const percentUsed = Math.min(100, Math.round((used / limit) * 100));
  return {
    usedBytes: used,
    limitBytes: limit,
    remainingBytes: remaining,
    usedLabel: input?.storage?.usedLabel || formatStorageBytes(used),
    limitLabel: input?.storage?.limitLabel || formatStorageBytes(limit),
    remainingLabel: formatStorageBytes(remaining),
    percentUsed:
      typeof input?.storage?.percentUsed === 'number'
        ? Number(input.storage.percentUsed)
        : percentUsed,
  };
}

export function createBillingApi(client: AxiosInstance) {
  const normalizeCheckout = (payload: unknown): BillingCheckoutResult => {
    if (!payload || typeof payload !== 'object') return {};
    const body = payload as Record<string, unknown>;
    const inner = unwrapData<Record<string, unknown>>(payload) || {};
    return {
      ...inner,
      checkout: body.checkout as BillingCheckoutResult['checkout'],
      message: typeof body.message === 'string' ? body.message : undefined,
    } as BillingCheckoutResult;
  };

  return {
    async listPlans(): Promise<BillingPlan[]> {
      const { data } = await client.get<unknown>(Paths.billingPlans);
      const plans = unwrapData<BillingPlan[]>(data) ?? (data as BillingPlan[]);
      if (!Array.isArray(plans)) throw new Error('Catalog gói không hợp lệ');
      return plans;
    },

    async checkoutPlan(plan: string, idempotencyKey = `sdk-plan-${plan}-${Date.now()}`): Promise<BillingCheckoutResult> {
      const { data } = await client.post<unknown>(
        Paths.billingMeCheckout,
        { plan, idempotencyKey },
        { headers: { 'Idempotency-Key': idempotencyKey } },
      );
      // Domain result lives in `data`; checkout metadata remains top-level.
      return normalizeCheckout(data);
    },

    async listCreditPacks(): Promise<CreditPack[]> {
      const { data } = await client.get<unknown>(Paths.billingCreditPacks);
      const packs = unwrapData<CreditPack[]>(data) ?? (data as CreditPack[]);
      if (!Array.isArray(packs)) throw new Error('Catalog lượt mua thêm không hợp lệ');
      return packs;
    },

    async checkoutCreditPack(packId: string, idempotencyKey = `sdk-credit-pack-${packId}-${Date.now()}`): Promise<BillingCheckoutResult> {
      const { data } = await client.post<unknown>(
        Paths.billingCreditPackCheckout,
        { packId, idempotencyKey },
        { headers: { 'Idempotency-Key': idempotencyKey } },
      );
      return normalizeCheckout(data);
    },

    async redeemVoucher(rawCode: string): Promise<VoucherRedeemResult> {
      const code = rawCode.trim();
      if (!code || code.length > 64) throw new Error('Mã voucher không hợp lệ');
      const { data } = await client.post<unknown>(Paths.billingVoucherRedeem, { code });
      return unwrapData<VoucherRedeemResult>(data) ?? (data as VoucherRedeemResult);
    },
    /**
     * Plan + credits + storage (via account ai-summary — denorm from billing).
     * Prefer this for mobile/profile badges.
     */
    async getAiSummary(): Promise<AiPlanSummary> {
      const { data } = await client.get<unknown>(Paths.accountAiSummary);
      const inner =
        unwrapData<AiPlanSummary>(data) ?? (data as AiPlanSummary);
      const storage = normalizeStorageSummary(inner || {});
      return {
        userId: String(inner?.userId || ''),
        plan: String(inner?.plan || 'free'),
        status: String(inner?.status || 'active'),
        monthlyCreateCredits: Number(inner?.monthlyCreateCredits ?? 0) || 0,
        monthlyRemainingCreateCredits:
          Number(inner?.monthlyRemainingCreateCredits ?? inner?.remainingCreateCredits ?? 0) || 0,
        bonusCreateCredits: Number(inner?.bonusCreateCredits ?? 0) || 0,
        remainingCreateCredits:
          Number(inner?.remainingCreateCredits ?? 0) || 0,
        expiresAt: inner?.expiresAt ?? null,
        storageBytesUsed: storage.usedBytes,
        storageBytesLimit: storage.limitBytes,
        storageBytesRemaining: storage.remainingBytes,
        storage,
        source: inner?.source,
        message: inner?.message,
      };
    },

    normalizeStorageSummary,
    formatStorageBytes,
  };
}

export type BillingApi = ReturnType<typeof createBillingApi>;
