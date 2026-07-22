import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut, type Auth } from 'firebase/auth';

import { authApi } from '@/core/storymee';

let cachedAuth: Auth | null = null;

export function isFirebaseAuthEnabled(): boolean {
  return String(process.env.EXPO_PUBLIC_FIREBASE_AUTH_ENABLED || '').toLowerCase() === 'true';
}

function getFirebaseAuth(): Auth {
  if (!isFirebaseAuthEnabled()) throw new Error('Firebase authentication is disabled');
  if (cachedAuth) return cachedAuth;
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !projectId || !appId) throw new Error('Firebase public configuration is incomplete');
  const app = getApps().length ? getApp() : initializeApp({
    apiKey, projectId, appId,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  });
  cachedAuth = getAuth(app);
  return cachedAuth;
}

/** Classroom credentials stay canonical in StoryMee; Firebase only issues the session. */
export async function loginChildWithFirebase(username: string, password: string) {
  const customToken = await authApi.getFirebaseChildToken(username, password);
  const credential = await signInWithCustomToken(getFirebaseAuth(), customToken);
  return authApi.exchangeFirebaseToken({ idToken: await credential.user.getIdToken(true) });
}

export async function logoutFirebaseBestEffort(): Promise<void> {
  if (!isFirebaseAuthEnabled()) return;
  try { await signOut(getFirebaseAuth()); } catch { /* local logout must continue */ }
}
