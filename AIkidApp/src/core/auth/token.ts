import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** Same key as StoryMeeMobileApp — Class A shared session shape */
const ACCESS_TOKEN_KEY = 'storymee.access_token';
const SHARED_COOKIE_KEY = 'storymee_shared_token';

let memoryToken: string | null = null;
const webMemoryStore = new Map<string, string>();

function getAikidCookieDomain(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname.toLowerCase();
  if (host === 'aikid.vn' || host.endsWith('.aikid.vn')) {
    return '; domain=.aikid.vn';
  }
  if (host === 'aikid' || host.endsWith('.aikid')) {
    return '; domain=.aikid';
  }
  return '';
}

function writeSharedCookie(token: string): void {
  if (typeof document === 'undefined') return;
  try {
    const domain = getAikidCookieDomain();
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${SHARED_COOKIE_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${domain}${secure}`;
  } catch {
    // ignore cookie write errors
  }
}

function removeSharedCookie(): void {
  if (typeof document === 'undefined') return;
  try {
    const domain = getAikidCookieDomain();
    document.cookie = `${SHARED_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax${domain}`;
    if (domain) {
      document.cookie = `${SHARED_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch {
    // ignore
  }
}

function readSharedCookie(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.split('=');
      if (name?.trim() === SHARED_COOKIE_KEY) {
        const val = rest.join('=');
        return val ? decodeURIComponent(val.trim()) : null;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function readUrlSsoToken(): string | null {
  if (typeof window === 'undefined' || !window.location?.search) return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('sso_token') || params.get('token');
    if (ssoToken) {
      params.delete('sso_token');
      params.delete('token');
      const searchStr = params.toString();
      const newUrl =
        window.location.pathname +
        (searchStr ? `?${searchStr}` : '') +
        window.location.hash;
      window.history.replaceState(null, '', newUrl);
      return ssoToken;
    }
  } catch {
    // ignore
  }
  return null;
}

async function storageGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (key === ACCESS_TOKEN_KEY) {
      const urlToken = readUrlSsoToken();
      if (urlToken) {
        webMemoryStore.set(key, urlToken);
        try {
          globalThis.localStorage?.setItem(key, urlToken);
        } catch {
          // ignore
        }
        writeSharedCookie(urlToken);
        return urlToken;
      }

      const cookieToken = readSharedCookie();
      if (cookieToken) {
        webMemoryStore.set(key, cookieToken);
        try {
          globalThis.localStorage?.setItem(key, cookieToken);
        } catch {
          // ignore
        }
        return cookieToken;
      }

      let localToken: string | null = null;
      try {
        localToken =
          globalThis.localStorage?.getItem(key) ??
          webMemoryStore.get(key) ??
          null;
      } catch {
        localToken = webMemoryStore.get(key) ?? null;
      }
      if (localToken) {
        // Migrate a legacy host-only session into the shared .aikid.vn session.
        writeSharedCookie(localToken);
        return localToken;
      }
      return null;
    }

    try {
      return (
        globalThis.localStorage?.getItem(key) ??
        webMemoryStore.get(key) ??
        null
      );
    } catch {
      return webMemoryStore.get(key) ?? null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function storageSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webMemoryStore.set(key, value);
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // ignore quota / private mode
    }
    if (key === ACCESS_TOKEN_KEY) {
      writeSharedCookie(value);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function storageDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    webMemoryStore.delete(key);
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // ignore
    }
    if (key === ACCESS_TOKEN_KEY) {
      removeSharedCookie();
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export function getAccessTokenSync(): string | null {
  return memoryToken;
}

export async function getAccessToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  const stored = await storageGet(ACCESS_TOKEN_KEY);
  memoryToken = stored;
  return stored;
}

export async function setAccessToken(token: string): Promise<void> {
  memoryToken = token;
  await storageSet(ACCESS_TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  memoryToken = null;
  await storageDelete(ACCESS_TOKEN_KEY);
}
