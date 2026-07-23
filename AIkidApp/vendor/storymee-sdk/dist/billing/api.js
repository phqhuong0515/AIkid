"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStorageBytes = formatStorageBytes;
exports.normalizeStorageSummary = normalizeStorageSummary;
exports.createBillingApi = createBillingApi;
const paths_1 = require("../core/paths");
const unwrap_1 = require("../core/unwrap");
const types_1 = require("../core/types");
function formatStorageBytes(n) {
    if (!n || n < 1024)
        return `${n || 0} B`;
    const u = ['KB', 'MB', 'GB'];
    let v = n;
    let i = -1;
    do {
        v /= 1024;
        i++;
    } while (v >= 1024 && i < u.length - 1);
    return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${u[i]}`;
}
function normalizeStorageSummary(input) {
    const limit = Math.max(1, Number(input?.storage?.limitBytes ??
        input?.storageBytesLimit ??
        types_1.DEFAULT_STORAGE_BYTES_LIMIT) || types_1.DEFAULT_STORAGE_BYTES_LIMIT);
    const used = Math.max(0, Number(input?.storage?.usedBytes ?? input?.storageBytesUsed ?? 0) || 0);
    const remaining = Math.max(0, Number(input?.storage?.remainingBytes ??
        input?.storageBytesRemaining ??
        limit - used) || Math.max(0, limit - used));
    const percentUsed = Math.min(100, Math.round((used / limit) * 100));
    return {
        usedBytes: used,
        limitBytes: limit,
        remainingBytes: remaining,
        usedLabel: input?.storage?.usedLabel || formatStorageBytes(used),
        limitLabel: input?.storage?.limitLabel || formatStorageBytes(limit),
        remainingLabel: formatStorageBytes(remaining),
        percentUsed: typeof input?.storage?.percentUsed === 'number'
            ? Number(input.storage.percentUsed)
            : percentUsed,
    };
}
function createBillingApi(client) {
    const normalizeCheckout = (payload) => {
        if (!payload || typeof payload !== 'object')
            return {};
        const body = payload;
        const inner = (0, unwrap_1.unwrapData)(payload) || {};
        return {
            ...inner,
            checkout: body.checkout,
            message: typeof body.message === 'string' ? body.message : undefined,
        };
    };
    return {
        async listPlans() {
            const { data } = await client.get(paths_1.Paths.billingPlans);
            const plans = (0, unwrap_1.unwrapData)(data) ?? data;
            if (!Array.isArray(plans))
                throw new Error('Catalog gói không hợp lệ');
            return plans;
        },
        async checkoutPlan(plan, idempotencyKey = `sdk-plan-${plan}-${Date.now()}`) {
            const { data } = await client.post(paths_1.Paths.billingMeCheckout, { plan, idempotencyKey }, { headers: { 'Idempotency-Key': idempotencyKey } });
            // Domain result lives in `data`; checkout metadata remains top-level.
            return normalizeCheckout(data);
        },
        async listCreditPacks() {
            const { data } = await client.get(paths_1.Paths.billingCreditPacks);
            const packs = (0, unwrap_1.unwrapData)(data) ?? data;
            if (!Array.isArray(packs))
                throw new Error('Catalog lượt mua thêm không hợp lệ');
            return packs;
        },
        async checkoutCreditPack(packId, idempotencyKey = `sdk-credit-pack-${packId}-${Date.now()}`) {
            const { data } = await client.post(paths_1.Paths.billingCreditPackCheckout, { packId, idempotencyKey }, { headers: { 'Idempotency-Key': idempotencyKey } });
            return normalizeCheckout(data);
        },
        async redeemVoucher(rawCode) {
            const code = rawCode.trim();
            if (!code || code.length > 64)
                throw new Error('Mã voucher không hợp lệ');
            const { data } = await client.post(paths_1.Paths.billingVoucherRedeem, { code });
            return (0, unwrap_1.unwrapData)(data) ?? data;
        },
        /**
         * Plan + credits + storage (via account ai-summary — denorm from billing).
         * Prefer this for mobile/profile badges.
         */
        async getAiSummary() {
            const { data } = await client.get(paths_1.Paths.accountAiSummary);
            const inner = (0, unwrap_1.unwrapData)(data) ?? data;
            const storage = normalizeStorageSummary(inner || {});
            return {
                userId: String(inner?.userId || ''),
                plan: String(inner?.plan || 'free'),
                status: String(inner?.status || 'active'),
                monthlyCreateCredits: Number(inner?.monthlyCreateCredits ?? 0) || 0,
                monthlyRemainingCreateCredits: Number(inner?.monthlyRemainingCreateCredits ?? inner?.remainingCreateCredits ?? 0) || 0,
                bonusCreateCredits: Number(inner?.bonusCreateCredits ?? 0) || 0,
                remainingCreateCredits: Number(inner?.remainingCreateCredits ?? 0) || 0,
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
//# sourceMappingURL=api.js.map