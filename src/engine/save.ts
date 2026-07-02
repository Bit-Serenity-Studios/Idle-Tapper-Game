/**
 * Versioned save schema + migration. The store holds Bigs; the save file
 * holds serialized-string forms so JSON round-trips cleanly.
 */

import { type Big, fromString, toString, ZERO } from './bigNumber';

export const CURRENT_SAVE_VERSION = 1;

export interface SavedStateV1 {
  version: 1;
  essence: string; // Big serialized
  lifetimeEssence: string; // for prestige threshold
  lifetimeEssenceAllTime: string; // for ledger
  generatorsOwned: Record<string, number>;
  ownedUpgrades: Record<string, boolean>;
  ownedTransmutations: Record<string, boolean>;
  primaMateria: number;
  prestigeCount: number;
  lastSaveMs: number;
  createdAtMs: number;
  totalTaps: number;
  totalPrestiges: number;
  boostBloodMoonEndsMs: number; // 0 if not active
  boostTimeDilationExtraSeconds: number; // banked, not yet applied
  lastBloodMoonMs: number;
  lastTimeDilationMs: number;
  lastOfflineDoubleMs: number;
  lastDailyClaimIsoDate: string; // yyyy-mm-dd (local)
  loginStreak: number;
  activeCommission?: {
    id: string;
    goalEssence: string; // Big serialized
    startEssenceLifetime: string;
    startedAtMs: number;
    expiresAtMs: number;
    claimed: boolean;
  };
  removeAdsPurchased: boolean;
}

export type AnySavedState = { version: number } & Record<string, unknown>;

/**
 * A live game state — Big values are actual Bigs, not strings.
 */
export interface LiveState {
  essence: Big;
  lifetimeEssence: Big;
  lifetimeEssenceAllTime: Big;
  generatorsOwned: Record<string, number>;
  ownedUpgrades: Record<string, boolean>;
  ownedTransmutations: Record<string, boolean>;
  primaMateria: number;
  prestigeCount: number;
  lastSaveMs: number;
  createdAtMs: number;
  totalTaps: number;
  totalPrestiges: number;
  boostBloodMoonEndsMs: number;
  boostTimeDilationExtraSeconds: number;
  lastBloodMoonMs: number;
  lastTimeDilationMs: number;
  lastOfflineDoubleMs: number;
  lastDailyClaimIsoDate: string;
  loginStreak: number;
  activeCommission?: {
    id: string;
    goalEssence: Big;
    startEssenceLifetime: Big;
    startedAtMs: number;
    expiresAtMs: number;
    claimed: boolean;
  };
  removeAdsPurchased: boolean;
}

export function newLiveState(nowMs: number): LiveState {
  return {
    essence: ZERO,
    lifetimeEssence: ZERO,
    lifetimeEssenceAllTime: ZERO,
    generatorsOwned: {},
    ownedUpgrades: {},
    ownedTransmutations: {},
    primaMateria: 0,
    prestigeCount: 0,
    lastSaveMs: nowMs,
    createdAtMs: nowMs,
    totalTaps: 0,
    totalPrestiges: 0,
    boostBloodMoonEndsMs: 0,
    boostTimeDilationExtraSeconds: 0,
    lastBloodMoonMs: 0,
    lastTimeDilationMs: 0,
    lastOfflineDoubleMs: 0,
    lastDailyClaimIsoDate: '',
    loginStreak: 0,
    activeCommission: undefined,
    removeAdsPurchased: false,
  };
}

export function serialize(state: LiveState): SavedStateV1 {
  return {
    version: 1,
    essence: toString(state.essence),
    lifetimeEssence: toString(state.lifetimeEssence),
    lifetimeEssenceAllTime: toString(state.lifetimeEssenceAllTime),
    generatorsOwned: state.generatorsOwned,
    ownedUpgrades: state.ownedUpgrades,
    ownedTransmutations: state.ownedTransmutations,
    primaMateria: state.primaMateria,
    prestigeCount: state.prestigeCount,
    lastSaveMs: state.lastSaveMs,
    createdAtMs: state.createdAtMs,
    totalTaps: state.totalTaps,
    totalPrestiges: state.totalPrestiges,
    boostBloodMoonEndsMs: state.boostBloodMoonEndsMs,
    boostTimeDilationExtraSeconds: state.boostTimeDilationExtraSeconds,
    lastBloodMoonMs: state.lastBloodMoonMs,
    lastTimeDilationMs: state.lastTimeDilationMs,
    lastOfflineDoubleMs: state.lastOfflineDoubleMs,
    lastDailyClaimIsoDate: state.lastDailyClaimIsoDate,
    loginStreak: state.loginStreak,
    activeCommission: state.activeCommission
      ? {
          id: state.activeCommission.id,
          goalEssence: toString(state.activeCommission.goalEssence),
          startEssenceLifetime: toString(state.activeCommission.startEssenceLifetime),
          startedAtMs: state.activeCommission.startedAtMs,
          expiresAtMs: state.activeCommission.expiresAtMs,
          claimed: state.activeCommission.claimed,
        }
      : undefined,
    removeAdsPurchased: state.removeAdsPurchased,
  };
}

export function deserialize(saved: SavedStateV1): LiveState {
  return {
    essence: fromString(saved.essence),
    lifetimeEssence: fromString(saved.lifetimeEssence),
    lifetimeEssenceAllTime: fromString(saved.lifetimeEssenceAllTime),
    generatorsOwned: saved.generatorsOwned ?? {},
    ownedUpgrades: saved.ownedUpgrades ?? {},
    ownedTransmutations: saved.ownedTransmutations ?? {},
    primaMateria: saved.primaMateria ?? 0,
    prestigeCount: saved.prestigeCount ?? 0,
    lastSaveMs: saved.lastSaveMs,
    createdAtMs: saved.createdAtMs,
    totalTaps: saved.totalTaps ?? 0,
    totalPrestiges: saved.totalPrestiges ?? 0,
    boostBloodMoonEndsMs: saved.boostBloodMoonEndsMs ?? 0,
    boostTimeDilationExtraSeconds: saved.boostTimeDilationExtraSeconds ?? 0,
    lastBloodMoonMs: saved.lastBloodMoonMs ?? 0,
    lastTimeDilationMs: saved.lastTimeDilationMs ?? 0,
    lastOfflineDoubleMs: saved.lastOfflineDoubleMs ?? 0,
    lastDailyClaimIsoDate: saved.lastDailyClaimIsoDate ?? '',
    loginStreak: saved.loginStreak ?? 0,
    activeCommission: saved.activeCommission
      ? {
          id: saved.activeCommission.id,
          goalEssence: fromString(saved.activeCommission.goalEssence),
          startEssenceLifetime: fromString(saved.activeCommission.startEssenceLifetime),
          startedAtMs: saved.activeCommission.startedAtMs,
          expiresAtMs: saved.activeCommission.expiresAtMs,
          claimed: saved.activeCommission.claimed,
        }
      : undefined,
    removeAdsPurchased: saved.removeAdsPurchased ?? false,
  };
}

/**
 * Migration entrypoint. Given any prior save shape, return the current one.
 * Handles missing/unknown versions defensively — we never want a garbled save
 * to nuke the player's progress; if we truly can't parse it we return null so
 * the caller can decide whether to prompt for import.
 */
export function migrate(input: unknown): SavedStateV1 | null {
  if (!input || typeof input !== 'object') return null;
  const anyState = input as AnySavedState;
  const version = typeof anyState.version === 'number' ? anyState.version : 0;
  let cur: AnySavedState = anyState;
  if (version < 1) cur = migrate_0_to_1(cur);
  // Future migrations chain here.
  if (cur.version !== CURRENT_SAVE_VERSION) return null;
  return cur as unknown as SavedStateV1;
}

function migrate_0_to_1(prev: AnySavedState): AnySavedState {
  // Version 0 was a pre-release layout without prestige fields. Fill
  // defaults and stamp the version.
  return {
    ...prev,
    version: 1,
    primaMateria: (prev.primaMateria as number | undefined) ?? 0,
    prestigeCount: (prev.prestigeCount as number | undefined) ?? 0,
    ownedTransmutations: (prev.ownedTransmutations as Record<string, boolean> | undefined) ?? {},
    boostBloodMoonEndsMs: (prev.boostBloodMoonEndsMs as number | undefined) ?? 0,
    boostTimeDilationExtraSeconds:
      (prev.boostTimeDilationExtraSeconds as number | undefined) ?? 0,
    lastBloodMoonMs: (prev.lastBloodMoonMs as number | undefined) ?? 0,
    lastTimeDilationMs: (prev.lastTimeDilationMs as number | undefined) ?? 0,
    lastOfflineDoubleMs: (prev.lastOfflineDoubleMs as number | undefined) ?? 0,
    lastDailyClaimIsoDate: (prev.lastDailyClaimIsoDate as string | undefined) ?? '',
    loginStreak: (prev.loginStreak as number | undefined) ?? 0,
    removeAdsPurchased: (prev.removeAdsPurchased as boolean | undefined) ?? false,
    totalTaps: (prev.totalTaps as number | undefined) ?? 0,
    totalPrestiges: (prev.totalPrestiges as number | undefined) ?? 0,
    lifetimeEssenceAllTime:
      (prev.lifetimeEssenceAllTime as string | undefined) ??
      (prev.lifetimeEssence as string | undefined) ??
      '0',
  };
}

/**
 * Base64 export/import. We use a simple base64 wrap so users can share saves
 * without accidental copy-paste corruption from Slack, and we prefix a tag so
 * we can reject non-Magnum-Opus strings up front.
 */
const EXPORT_TAG = 'MOP1:';

export function exportSave(state: LiveState): string {
  const json = JSON.stringify(serialize(state));
  return EXPORT_TAG + base64Encode(json);
}

export function importSave(input: string): SavedStateV1 | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith(EXPORT_TAG)) return null;
  const payload = trimmed.slice(EXPORT_TAG.length);
  try {
    const json = base64Decode(payload);
    const parsed = JSON.parse(json);
    return migrate(parsed);
  } catch {
    return null;
  }
}

/**
 * Portable base64. Uses btoa/atob where available; falls back to a Buffer
 * shim so tests running in Node also work.
 */
function base64Encode(s: string): string {
  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(s)));
  return Buffer.from(s, 'utf8').toString('base64');
}

function base64Decode(s: string): string {
  if (typeof atob === 'function') return decodeURIComponent(escape(atob(s)));
  return Buffer.from(s, 'base64').toString('utf8');
}
