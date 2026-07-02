import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  type LiveState,
  deserialize,
  exportSave as exportSaveEngine,
  importSave as importSaveEngine,
  migrate,
  serialize,
} from '@/engine/save';

const STORAGE_KEY = 'magnum_opus_save_v1';

export const SaveService = {
  async load(): Promise<LiveState | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const migrated = migrate(parsed);
      if (!migrated) return null;
      return deserialize(migrated);
    } catch (err) {
      console.warn('[SaveService] load failed', err);
      return null;
    }
  },

  async save(state: LiveState): Promise<void> {
    try {
      const payload = JSON.stringify(serialize(state));
      await AsyncStorage.setItem(STORAGE_KEY, payload);
    } catch (err) {
      console.warn('[SaveService] save failed', err);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('[SaveService] clear failed', err);
    }
  },

  exportString(state: LiveState): string {
    return exportSaveEngine(state);
  },

  importString(input: string): LiveState | null {
    const saved = importSaveEngine(input);
    if (!saved) return null;
    return deserialize(saved);
  },
};
