import { useEffect } from 'react';
import { AppState } from 'react-native';

import { BALANCE } from '@/engine/balance';
import { useGameStore } from '@/store/gameStore';

/**
 * Drives the game clock: 10Hz tick that pushes essence into the store, plus
 * an auto-save every 15s and on backgrounding.
 */
export function useTick(save: (state: ReturnType<typeof useGameStore.getState>) => void): void {
  useEffect(() => {
    const tick = useGameStore.getState().tick;
    const interval = setInterval(() => tick(Date.now()), 1000 / BALANCE.tickRate);
    const saveInterval = setInterval(() => save(useGameStore.getState()), BALANCE.autoSaveIntervalMs);
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') {
        tick(Date.now());
        save(useGameStore.getState());
      } else if (next === 'active') {
        useGameStore.getState().applyOffline(Date.now());
      }
    });
    return () => {
      clearInterval(interval);
      clearInterval(saveInterval);
      sub.remove();
      save(useGameStore.getState());
    };
  }, [save]);
}
