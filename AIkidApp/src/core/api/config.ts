/**
 * Runtime config từ EXPO_PUBLIC_* (set trong .env / EAS).
 *
 * Frontend LUÔN dùng public Gateway (dev-hub / api.storymee.com).
 * Auth account → Gateway → core-account-api.
 * Không hardcode IP LAN nội bộ trên client.
 */
export function resolveGatewayBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    const cleaned = fromEnv.replace(/\/$/, '');
    if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(cleaned)) {
      console.warn(
        '[config] EXPO_PUBLIC_API_URL trỏ LAN nội bộ — frontend nên dùng https://dev-hub.storymee.com',
      );
    }
    return cleaned;
  }
  return 'https://dev-hub.storymee.com';
}

/**
 * Fallback IP khi workspace API chưa hydrate / offline.
 * Production: ưu tiên useWorkspace.getActiveIpId() (từ /account/workspaces).
 */
export function getDefaultIpId(): string {
  const fromEnv = process.env.EXPO_PUBLIC_DEFAULT_IP_ID?.trim();
  if (fromEnv) return fromEnv;
  return '11111111-1111-1111-1111-111111111111';
}

/** parent_only | family | guest — default family (parent + child profiles like MobileApp) */
export function getAuthMode(): 'parent_only' | 'family' | 'guest' {
  const raw = process.env.EXPO_PUBLIC_AUTH_MODE?.trim().toLowerCase();
  if (raw === 'family' || raw === 'guest' || raw === 'parent_only') return raw;
  return 'family';
}

export const GATEWAY_BASE_URL = resolveGatewayBaseUrl();
