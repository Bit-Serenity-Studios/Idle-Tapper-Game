import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'magnum_opus_settings_v1';

interface SettingsState {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  loaded: boolean;
  setHaptics: (enabled: boolean) => void;
  setSound: (enabled: boolean) => void;
  load: () => Promise<void>;
}

export const useSettings = create<SettingsState>((set, get) => ({
  hapticsEnabled: true,
  soundEnabled: false,
  loaded: false,
  setHaptics: (enabled) => {
    set({ hapticsEnabled: enabled });
    void persist(get);
  },
  setSound: (enabled) => {
    set({ soundEnabled: enabled });
    void persist(get);
  },
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsState>;
        set({
          hapticsEnabled: parsed.hapticsEnabled ?? true,
          soundEnabled: parsed.soundEnabled ?? false,
          loaded: true,
        });
        return;
      }
    } catch (err) {
      console.warn('[settings] load failed', err);
    }
    set({ loaded: true });
  },
}));

async function persist(get: () => SettingsState): Promise<void> {
  try {
    const { hapticsEnabled, soundEnabled } = get();
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ hapticsEnabled, soundEnabled }),
    );
  } catch (err) {
    console.warn('[settings] save failed', err);
  }
}
