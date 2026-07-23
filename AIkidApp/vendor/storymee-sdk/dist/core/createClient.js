"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorymeeClient = createStorymeeClient;
const axios_1 = __importDefault(require("axios"));
function defaultIsCredentialAuthUrl(url, method) {
    const m = (method || 'get').toLowerCase();
    if (url.includes('account/login') ||
        url.includes('account/register') ||
        url.includes('account/auth/firebase/') ||
        url.includes('family/child-login') ||
        url.includes('device-pair')) {
        return true;
    }
    if (url.includes('account/me') && m === 'delete')
        return true;
    return false;
}
/**
 * Gateway-only Axios client shared by all product apps.
 * Inject token storage from the host app (SecureStore / localStorage).
 */
function createStorymeeClient(opts) {
    const client = axios_1.default.create({
        baseURL: opts.baseURL.replace(/\/$/, ''),
        timeout: opts.timeoutMs ?? 30000,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
    let isHandlingUnauthorized = false;
    const isCred = opts.isCredentialAuthUrl || defaultIsCredentialAuthUrl;
    client.interceptors.request.use(async (config) => {
        if (config.url && config.url.startsWith('/')) {
            config.url = config.url.replace(/^\/+/, '');
        }
        const existing = config.headers?.Authorization;
        if (!existing) {
            const sync = opts.getAccessTokenSync?.() ?? null;
            const token = sync ?? (opts.getAccessToken ? await opts.getAccessToken() : null);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        const childId = opts.getChildProfileId?.() ?? null;
        if (childId && !config.headers['X-Child-Profile-Id']) {
            config.headers['X-Child-Profile-Id'] = childId;
        }
        return config;
    }, (error) => Promise.reject(error));
    client.interceptors.response.use((response) => response, async (error) => {
        const status = error.response?.status;
        const originalRequest = error.config;
        const url = originalRequest?.url ?? '';
        const method = originalRequest?.method;
        const hadToken = !!(opts.getAccessTokenSync?.() ?? null) ||
            !!(originalRequest?.headers?.Authorization ||
                originalRequest?.headers
                    ?.authorization);
        if (status === 401 &&
            !isCred(url, method) &&
            !originalRequest?._skipAuthLogout &&
            hadToken) {
            if (!isHandlingUnauthorized) {
                isHandlingUnauthorized = true;
                try {
                    await opts.clearAccessToken?.();
                    opts.onUnauthorized?.();
                }
                finally {
                    setTimeout(() => {
                        isHandlingUnauthorized = false;
                    }, 500);
                }
            }
        }
        return Promise.reject(error);
    });
    return client;
}
//# sourceMappingURL=createClient.js.map