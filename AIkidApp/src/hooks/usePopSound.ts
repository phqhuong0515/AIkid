/**
 * usePopSound — Dual-mode pop sound hook
 *
 * Web   → Web Audio API synthesis (identical to HTML source: dual-oscillator bubble pop)
 *         No file loading required → instant, no race conditions
 * Native → expo-av với pop.mp3 (async load with error handling)
 *
 * HTML Reference: public/_art_backup_html/index.html playPopSound()
 *   - osc1 (triangle): 200 → 350 → 80 Hz, gain 0.35, duration 0.15s  (warm body)
 *   - osc2 (sine):     850 → 1600 → 450 Hz, gain 0.18, duration 0.08s (click)
 */

import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';

// ─── Web Audio API: synthesized bubble pop (matches HTML exactly) ────────────
function playWebAudioPop() {
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx() as AudioContext;
    const now = ctx.currentTime;

    // 1. Warm resonant body — Triangle wave
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(200, now);
    osc1.frequency.exponentialRampToValueAtTime(350, now + 0.03);
    osc1.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // 2. High-frequency release click — Sine wave
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(850, now);
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(450, now + 0.08);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.18, now + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.09);

    // Close context after sounds finish
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 300);
  } catch (e) {
    console.warn('Web Audio API pop failed:', e);
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function usePopSound() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    // On web, use Web Audio API — no need to load file
    if (Platform.OS === 'web') return;

    let mounted = true;

    async function load() {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/audio/pop.mp3'),
          { shouldPlay: false, volume: 1.0 }
        );
        if (mounted) {
          soundRef.current = sound;
          isLoadedRef.current = true;
        } else {
          sound.unloadAsync();
        }
      } catch (err) {
        console.warn('usePopSound: could not load pop.mp3', err);
      }
    }

    load();

    return () => {
      mounted = false;
      isLoadedRef.current = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const playPop = useCallback(async () => {
    // Web: instant synthesized sound — no loading needed
    if (Platform.OS === 'web') {
      playWebAudioPop();
      return;
    }

    // Native: expo-av
    if (!isLoadedRef.current || !soundRef.current) return;
    try {
      await soundRef.current.replayAsync();
    } catch (err) {
      // Sound might be in bad state (unloaded, interrupted, etc.) — ignore
      console.warn('usePopSound: replayAsync failed', err);
    }
  }, []);

  return { playPop };
}
