import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import {
  type Big,
  ZERO,
  add,
  cmp,
  fromNumber,
  gte,
  sub,
  mulNumber,
  toNumber,
} from '@/engine/bigNumber';
import { BALANCE } from '@/engine/balance';
import {
  type RateContext,
  bulkCost,
  maxBuyable as maxBuyableFn,
  nextCost,
  totalProductionPerSecond,
} from '@/engine/generators';
import { GENERATOR_BY_ID, GENERATORS } from '@/content/generators';
import { UPGRADE_BY_ID, type UpgradeDef } from '@/content/upgrades';
import { aggregateUpgradeEffects, isUpgradeUnlocked } from '@/engine/upgrades';
import {
  isTransmutationAvailable,
  prestigeCostReduction,
  prestigeGlobalMultiplier,
  prestigeStartingEssence,
  prestigeTapMultiplier,
  primaMateriaGain,
  prestigePrimaGainFactor,
} from '@/engine/prestige';
import { TRANSMUTATION_BY_ID } from '@/content/transmutations';
import { type LiveState, newLiveState } from '@/engine/save';
import { calculateOfflineEarnings, clampElapsed } from '@/engine/offline';

export type BuyQuantity = 1 | 10 | 100 | 'max';

export interface OfflineSummary {
  awarded: Big;
  cappedSeconds: number;
  droppedSeconds: number;
  ratePerSecond: Big;
}

export interface GameState extends LiveState {
  // Session-only, not persisted:
  now: number;
  buyQuantity: BuyQuantity;
  pendingOffline: OfflineSummary | null;
  hydrated: boolean;

  // Actions.
  hydrate: (state: LiveState, nowMs: number) => void;
  applyOffline: (nowMs: number) => void;
  clearOfflineSummary: () => void;
  doubleOfflineAward: () => void;

  tap: () => Big; // returns gain (for animation)
  tick: (nowMs: number) => void;
  setBuyQuantity: (q: BuyQuantity) => void;
  buyGenerator: (id: string) => boolean;
  buyUpgrade: (id: string) => boolean;
  prestige: () => boolean;
  buyTransmutation: (id: string) => boolean;

  startBloodMoon: (nowMs: number) => boolean;
  startTimeDilation: (nowMs: number) => boolean;
  requestDoubleOffline: (nowMs: number) => boolean;

  claimLunar: (isoDate: string) => number | null; // returns fragments awarded
  rollDailyCommission: (nowMs: number) => void;
  claimCommission: () => boolean;

  purchasePatronPact: () => void;

  wipe: (nowMs: number) => void;
}

/**
 * Derived rate context from state — cheap to compute; UI uses selectors to
 * avoid re-computing except when relevant fields change.
 */
function buildRateContext(state: LiveState): RateContext {
  const owned = Object.keys(state.ownedUpgrades).filter((k) => state.ownedUpgrades[k]);
  const eff = aggregateUpgradeEffects(owned);
  const prestigeCtx = {
    primaMateria: state.primaMateria,
    ownedTransmutations: state.ownedTransmutations,
  };
  return {
    owned: state.generatorsOwned,
    perGeneratorMult: eff.perGenerator,
    globalMultiplier: eff.globalMult * prestigeGlobalMultiplier(prestigeCtx),
    timedBoostMultiplier: bloodMoonActive(state) ? BALANCE.bloodMoonMultiplier : 1,
  };
}

function bloodMoonActive(state: LiveState): boolean {
  return state.boostBloodMoonEndsMs > state.lastSaveMs;
}

function nowBloodMoonActive(state: LiveState, nowMs: number): boolean {
  return state.boostBloodMoonEndsMs > nowMs;
}

function currentTapPower(state: LiveState): number {
  const owned = Object.keys(state.ownedUpgrades).filter((k) => state.ownedUpgrades[k]);
  const eff = aggregateUpgradeEffects(owned);
  const prestigeCtx = {
    primaMateria: state.primaMateria,
    ownedTransmutations: state.ownedTransmutations,
  };
  return BALANCE.baseTapPower * eff.tapMult * prestigeTapMultiplier(prestigeCtx);
}

function currentCostReduction(state: LiveState): number {
  const prestigeCtx = {
    primaMateria: state.primaMateria,
    ownedTransmutations: state.ownedTransmutations,
  };
  return prestigeCostReduction(prestigeCtx);
}

function nextGenCost(state: LiveState, id: string, count: number): Big {
  const def = GENERATOR_BY_ID[id];
  return mulNumber(bulkCost(def, state.generatorsOwned[id] ?? 0, count), currentCostReduction(state));
}

function resolveQuantity(state: LiveState, id: string, q: BuyQuantity): number {
  const def = GENERATOR_BY_ID[id];
  const owned = state.generatorsOwned[id] ?? 0;
  if (q === 'max') {
    // Account for cost reduction by scaling essence up before max calc.
    const reduction = currentCostReduction(state);
    const scaledEssence = mulNumber(state.essence, 1 / reduction);
    return maxBuyableFn(def, owned, scaledEssence);
  }
  return q;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    ...newLiveState(0),
    now: 0,
    buyQuantity: 1,
    pendingOffline: null,
    hydrated: false,

    hydrate: (state, nowMs) => {
      set({ ...state, now: nowMs, hydrated: true });
    },

    applyOffline: (nowMs) => {
      const state = get();
      const elapsed = clampElapsed(nowMs, state.lastSaveMs);
      if (elapsed < 5) return; // ignore tiny windows
      const rateCtx = buildRateContext(state);
      const owned = Object.keys(state.ownedUpgrades).filter((k) => state.ownedUpgrades[k]);
      const eff = aggregateUpgradeEffects(owned);
      const result = calculateOfflineEarnings({
        elapsedSeconds: elapsed,
        offlineCapSeconds: eff.offlineCapSeconds,
        offlineRate: eff.offlineRate,
        rateContext: rateCtx,
      });
      if (cmp(result.awarded, ZERO) <= 0) {
        set({ lastSaveMs: nowMs, now: nowMs });
        return;
      }
      set({
        essence: add(state.essence, result.awarded),
        lifetimeEssence: add(state.lifetimeEssence, result.awarded),
        lifetimeEssenceAllTime: add(state.lifetimeEssenceAllTime, result.awarded),
        lastSaveMs: nowMs,
        now: nowMs,
        pendingOffline: {
          awarded: result.awarded,
          cappedSeconds: result.cappedSeconds,
          droppedSeconds: result.droppedSeconds,
          ratePerSecond: result.ratePerSecond,
        },
      });
    },

    clearOfflineSummary: () => set({ pendingOffline: null }),

    doubleOfflineAward: () => {
      const state = get();
      if (!state.pendingOffline) return;
      const extra = state.pendingOffline.awarded;
      set({
        essence: add(state.essence, extra),
        lifetimeEssence: add(state.lifetimeEssence, extra),
        lifetimeEssenceAllTime: add(state.lifetimeEssenceAllTime, extra),
        pendingOffline: { ...state.pendingOffline, awarded: add(state.pendingOffline.awarded, extra) },
        lastOfflineDoubleMs: state.now,
      });
    },

    tap: () => {
      const state = get();
      const tapPower = currentTapPower(state);
      const gain = fromNumber(tapPower);
      set({
        essence: add(state.essence, gain),
        lifetimeEssence: add(state.lifetimeEssence, gain),
        lifetimeEssenceAllTime: add(state.lifetimeEssenceAllTime, gain),
        totalTaps: state.totalTaps + 1,
      });
      return gain;
    },

    tick: (nowMs) => {
      const state = get();
      let dt = (nowMs - state.lastSaveMs) / 1000;
      if (dt < 0) dt = 0;
      // Bank any time-dilation seconds to accelerate the tick.
      let effectiveDt = dt;
      let timeDilationLeft = state.boostTimeDilationExtraSeconds;
      if (timeDilationLeft > 0) {
        // Each real second, spend up to one bonus second (i.e. dt effective x2).
        const spent = Math.min(dt, timeDilationLeft);
        effectiveDt += spent;
        timeDilationLeft -= spent;
      }
      const rateCtx: RateContext = {
        ...buildRateContext(state),
        timedBoostMultiplier: nowBloodMoonActive(state, nowMs)
          ? BALANCE.bloodMoonMultiplier
          : 1,
      };
      const rate = totalProductionPerSecond(rateCtx);
      const gain = mulNumber(rate, effectiveDt);
      set({
        essence: add(state.essence, gain),
        lifetimeEssence: add(state.lifetimeEssence, gain),
        lifetimeEssenceAllTime: add(state.lifetimeEssenceAllTime, gain),
        boostTimeDilationExtraSeconds: timeDilationLeft,
        lastSaveMs: nowMs,
        now: nowMs,
      });
    },

    setBuyQuantity: (q) => set({ buyQuantity: q }),

    buyGenerator: (id) => {
      const state = get();
      const def = GENERATOR_BY_ID[id];
      if (!def) return false;
      const q = resolveQuantity(state, id, state.buyQuantity);
      if (q <= 0) return false;
      const cost = nextGenCost(state, id, q);
      if (!gte(state.essence, cost)) return false;
      set({
        essence: sub(state.essence, cost),
        generatorsOwned: {
          ...state.generatorsOwned,
          [id]: (state.generatorsOwned[id] ?? 0) + q,
        },
      });
      return true;
    },

    buyUpgrade: (id) => {
      const state = get();
      const def: UpgradeDef | undefined = UPGRADE_BY_ID[id];
      if (!def) return false;
      if (state.ownedUpgrades[id]) return false;
      if (
        !isUpgradeUnlocked(def, {
          owned: state.ownedUpgrades,
          generatorsOwned: state.generatorsOwned,
        })
      ) {
        return false;
      }
      if (!gte(state.essence, def.cost)) return false;
      set({
        essence: sub(state.essence, def.cost),
        ownedUpgrades: { ...state.ownedUpgrades, [id]: true },
      });
      return true;
    },

    prestige: () => {
      const state = get();
      const gain = primaMateriaGain(
        state.lifetimeEssence,
        prestigePrimaGainFactor({
          primaMateria: state.primaMateria,
          ownedTransmutations: state.ownedTransmutations,
        }),
      );
      if (gain <= 0) return false;
      const startingEssence = prestigeStartingEssence({
        primaMateria: state.primaMateria + gain,
        ownedTransmutations: state.ownedTransmutations,
      });
      set({
        essence: startingEssence,
        lifetimeEssence: ZERO,
        generatorsOwned: {},
        ownedUpgrades: {},
        primaMateria: state.primaMateria + gain,
        prestigeCount: state.prestigeCount + 1,
        totalPrestiges: state.totalPrestiges + 1,
        boostBloodMoonEndsMs: 0,
        boostTimeDilationExtraSeconds: 0,
        activeCommission: undefined,
      });
      return true;
    },

    buyTransmutation: (id) => {
      const state = get();
      if (!isTransmutationAvailable(id, state.ownedTransmutations, state.primaMateria)) {
        return false;
      }
      const def = TRANSMUTATION_BY_ID[id];
      set({
        primaMateria: state.primaMateria - def.cost,
        ownedTransmutations: { ...state.ownedTransmutations, [id]: true },
      });
      return true;
    },

    startBloodMoon: (nowMs) => {
      const state = get();
      if (nowMs - state.lastBloodMoonMs < BALANCE.bloodMoonCooldownSeconds * 1000) return false;
      set({
        boostBloodMoonEndsMs: nowMs + BALANCE.bloodMoonDurationSeconds * 1000,
        lastBloodMoonMs: nowMs,
      });
      return true;
    },

    startTimeDilation: (nowMs) => {
      const state = get();
      if (nowMs - state.lastTimeDilationMs < BALANCE.timeDilationCooldownSeconds * 1000)
        return false;
      set({
        boostTimeDilationExtraSeconds:
          state.boostTimeDilationExtraSeconds + BALANCE.timeDilationSeconds,
        lastTimeDilationMs: nowMs,
      });
      return true;
    },

    requestDoubleOffline: (nowMs) => {
      const state = get();
      if (nowMs - state.lastOfflineDoubleMs < BALANCE.offlineDoubleCooldownSeconds * 1000)
        return false;
      get().doubleOfflineAward();
      set({ lastOfflineDoubleMs: nowMs });
      return true;
    },

    claimLunar: (isoDate) => {
      const state = get();
      if (state.lastDailyClaimIsoDate === isoDate) return null;
      const priorDate = state.lastDailyClaimIsoDate;
      const isConsecutive = isYesterday(priorDate, isoDate);
      const streak = isConsecutive ? state.loginStreak + 1 : 1;
      const dayInCycle = ((streak - 1) % 7) + 1;
      // Fragments per phase: 1..7 (mild ramp).
      const fragments = dayInCycle;
      // Every 7 fragments, 1 Prima Materia (BALANCE.primaMateriaFragmentsForOne).
      // For clarity we award small essence bumps and PM only on day 7.
      let primaGain = 0;
      const essenceGain = fromNumber(
        Math.max(10, toNumber(totalProductionPerSecond(buildRateContext(state))) * dayInCycle * 60),
      );
      if (dayInCycle === 7) primaGain = 1;
      set({
        essence: add(state.essence, essenceGain),
        lifetimeEssence: add(state.lifetimeEssence, essenceGain),
        lifetimeEssenceAllTime: add(state.lifetimeEssenceAllTime, essenceGain),
        primaMateria: state.primaMateria + primaGain,
        loginStreak: streak,
        lastDailyClaimIsoDate: isoDate,
      });
      return fragments;
    },

    rollDailyCommission: (nowMs) => {
      const state = get();
      if (state.activeCommission && nowMs < state.activeCommission.expiresAtMs) return;
      const rate = totalProductionPerSecond(buildRateContext(state));
      // Target: 4 minutes of current production. Modest but scaling.
      const goal = mulNumber(rate, 4 * 60);
      // Give the player a chance if their rate is zero.
      const finalGoal = cmp(goal, fromNumber(50)) < 0 ? fromNumber(50) : goal;
      set({
        activeCommission: {
          id: `commission_${nowMs}`,
          goalEssence: finalGoal,
          startEssenceLifetime: state.lifetimeEssence,
          startedAtMs: nowMs,
          expiresAtMs: nowMs + 24 * 3600 * 1000,
          claimed: false,
        },
      });
    },

    claimCommission: () => {
      const state = get();
      const c = state.activeCommission;
      if (!c || c.claimed) return false;
      const progress = sub(state.lifetimeEssence, c.startEssenceLifetime);
      if (!gte(progress, c.goalEssence)) return false;
      // Reward: 30% of current lifetime, minimum bounded.
      const reward = mulNumber(c.goalEssence, 2.5);
      set({
        essence: add(state.essence, reward),
        lifetimeEssence: add(state.lifetimeEssence, reward),
        lifetimeEssenceAllTime: add(state.lifetimeEssenceAllTime, reward),
        activeCommission: { ...c, claimed: true },
      });
      return true;
    },

    purchasePatronPact: () => set({ removeAdsPurchased: true }),

    wipe: (nowMs) => {
      const fresh = newLiveState(nowMs);
      set({ ...fresh, now: nowMs, pendingOffline: null, buyQuantity: 1, hydrated: true });
    },
  })),
);

function isYesterday(prior: string, today: string): boolean {
  if (!prior) return false;
  const p = new Date(prior + 'T00:00:00');
  const t = new Date(today + 'T00:00:00');
  const diff = (t.getTime() - p.getTime()) / (24 * 3600 * 1000);
  return Math.abs(diff - 1) < 0.01;
}

// --- Selectors --------------------------------------------------------

export function selectRateContext(state: GameState): RateContext {
  return {
    ...buildRateContext(state),
    timedBoostMultiplier: nowBloodMoonActive(state, state.now)
      ? BALANCE.bloodMoonMultiplier
      : 1,
  };
}

export function selectTotalProduction(state: GameState): Big {
  return totalProductionPerSecond(selectRateContext(state));
}

export function selectNextCost(state: GameState, id: string): Big {
  const def = GENERATOR_BY_ID[id];
  return mulNumber(nextCost(def, state.generatorsOwned[id] ?? 0), currentCostReduction(state));
}

export function selectResolvedQuantity(state: GameState, id: string): number {
  return resolveQuantity(state, id, state.buyQuantity);
}

export function selectBulkCost(state: GameState, id: string): Big {
  const q = resolveQuantity(state, id, state.buyQuantity);
  return nextGenCost(state, id, Math.max(1, q));
}

export function selectTapPower(state: GameState): number {
  return currentTapPower(state);
}

export function selectVisibleGenerators(state: GameState): typeof GENERATORS {
  return GENERATORS.filter((g) => gte(state.lifetimeEssenceAllTime, g.unlockAt));
}

export function selectBloodMoonActive(state: GameState): boolean {
  return nowBloodMoonActive(state, state.now);
}
