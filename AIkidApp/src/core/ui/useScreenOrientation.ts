import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Platform } from 'react-native';

export type OrientationMode = 'portrait' | 'landscape' | 'all';

export function useScreenOrientation(mode: OrientationMode = 'all'): void {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelled = false;

    async function apply() {
      try {
        const lock =
          mode === 'portrait'
            ? ScreenOrientation.OrientationLock.PORTRAIT_UP
            : mode === 'landscape'
              ? ScreenOrientation.OrientationLock.LANDSCAPE
              : ScreenOrientation.OrientationLock.DEFAULT;

        if (!cancelled) {
          await ScreenOrientation.lockAsync(lock);
        }
      } catch (e) {
        console.warn('[useScreenOrientation]', e);
      }
    }

    void apply();

    return () => {
      cancelled = true;
      if (Platform.OS !== 'web') {
        void ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.DEFAULT,
        ).catch(() => undefined);
      }
    };
  }, [mode]);
}
