import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACTIVE_IP_KEY = 'storymee.active_ip_id';

const memory = new Map<string, string>();

async function get(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function set(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    memory.set(key, value);
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function del(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    memory.delete(key);
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getStoredActiveIpId(): Promise<string | null> {
  return get(ACTIVE_IP_KEY);
}

export async function setStoredActiveIpId(ipId: string): Promise<void> {
  await set(ACTIVE_IP_KEY, ipId);
}

export async function clearStoredActiveIpId(): Promise<void> {
  await del(ACTIVE_IP_KEY);
}
