/**
 * Resolve public gateway URL for product apps.
 * Never hardcode LAN IPs on clients.
 */
export function resolveGatewayBaseUrl(envValue?: string | null): string {
  const fromEnv = (envValue || '').trim();
  if (fromEnv) {
    const cleaned = fromEnv.replace(/\/$/, '');
    if (
      /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(cleaned)
    ) {
      console.warn(
        '[@storymee/sdk] Gateway URL trỏ LAN — production nên dùng https://dev-hub.storymee.com',
      );
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
export const DEFAULT_IP_ID = '';

export function resolveDefaultIpId(envValue?: string | null): string {
  const v = (envValue || '').trim();
  // Reject the historical placeholder: sending it produces misleading
  // "valid ipId required" / empty-gallery failures downstream.
  if (v === '11111111-1111-1111-1111-111111111111') return DEFAULT_IP_ID;
  return v || DEFAULT_IP_ID;
}
