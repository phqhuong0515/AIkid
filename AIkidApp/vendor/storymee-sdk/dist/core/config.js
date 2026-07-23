"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_IP_ID = void 0;
exports.resolveGatewayBaseUrl = resolveGatewayBaseUrl;
exports.resolveDefaultIpId = resolveDefaultIpId;
/**
 * Resolve public gateway URL for product apps.
 * Never hardcode LAN IPs on clients.
 */
function resolveGatewayBaseUrl(envValue) {
    const fromEnv = (envValue || '').trim();
    if (fromEnv) {
        const cleaned = fromEnv.replace(/\/$/, '');
        if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(cleaned)) {
            console.warn('[@storymee/sdk] Gateway URL trỏ LAN — production nên dùng https://dev-hub.storymee.com');
        }
        return cleaned;
    }
    return 'https://dev-hub.storymee.com';
}
/**
 * No synthetic workspace is valid. Authenticated clients must resolve their
 * workspace from GET /account/workspaces; an env value is only an explicit
 * development fallback.
 */
exports.DEFAULT_IP_ID = '';
function resolveDefaultIpId(envValue) {
    const v = (envValue || '').trim();
    // Reject the historical placeholder: sending it produces misleading
    // "valid ipId required" / empty-gallery failures downstream.
    if (v === '11111111-1111-1111-1111-111111111111')
        return exports.DEFAULT_IP_ID;
    return v || exports.DEFAULT_IP_ID;
}
//# sourceMappingURL=config.js.map