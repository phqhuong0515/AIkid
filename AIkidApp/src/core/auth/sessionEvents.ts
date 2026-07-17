/**
 * Bridge tránh circular import: api client → clear token → UI/auth store.
 * Root layout đăng ký listener để sync Zustand + clear React Query.
 */

type SessionListener = () => void;

const listeners = new Set<SessionListener>();

export function notifySessionInvalidated(): void {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('[sessionEvents] listener error', e);
    }
  });
}

export function onSessionInvalidated(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
