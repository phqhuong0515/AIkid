import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** Same key as StoryMeeMobileApp — Class A shared session shape */
const ACCESS_TOKEN_KEY = 'storymee.access_token';

let memoryToken: string | null = null;
const webMemoryStore = new Map<string, string>();

async function storageGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
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
