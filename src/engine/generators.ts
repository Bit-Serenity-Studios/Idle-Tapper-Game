import { BALANCE } from './balance';
import {
  type Big,
  ZERO,
  add,
  mulNumber,
  cmp,
  fromNumber,
  gte,
  log10,
} from './bigNumber';
import { type GeneratorDef, GENERATORS } from '@/content/generators';

/**
 * Cost of the next single generator given current owned count.
 *   cost = baseCost * costMult^owned
 */
export function nextCost(def: GeneratorDef, owned: number): Big {
  return mulNumber(def.baseCost, Math.pow(BALANCE.costMultiplier, owned));
}

/**
 * Bulk buy: cost to purchase `count` generators starting from `owned`.
 * Geometric series sum, closed form — no loop, no O(n).
 *
 *   sum = baseCost * r^owned * (r^count - 1) / (r - 1)
 */
export function bulkCost(def: GeneratorDef, owned: number, count: number): Big {
  if (count <= 0) return ZERO;
  const r = BALANCE.costMultiplier;
  const factor = (Math.pow(r, count) - 1) / (r - 1);
  return mulNumber(def.baseCost, Math.pow(r, owned) * factor);
}

/**
 * Given available essence, return the maximum whole count of `def` that can
 * be purchased starting from `owned`. Closed form using logs — precise enough
 * for game math and O(1) regardless of essence magnitude.
 *
 *   essence >= baseCost * r^owned * (r^n - 1) / (r - 1)
 *   => r^n <= 1 + essence * (r-1) / (baseCost * r^owned)
 *   => n = floor( log_r(RHS) )
 */
export function maxBuyable(def: GeneratorDef, owned: number, essence: Big): number {
  if (cmp(essence, nextCost(def, owned)) < 0) return 0;
  const r = BALANCE.costMultiplier;
  // ratio = essence / (baseCost * r^owned)
  const denomLog = log10(def.baseCost) + owned * Math.log10(r);
  const essenceLog = log10(essence);
  const ratioLog = essenceLog - denomLog;
  const ratio = Math.pow(10, ratioLog);
  const inner = 1 + ratio * (r - 1);
  if (inner <= 0) return 0;
  const n = Math.floor(Math.log(inner) / Math.log(r));
  return Math.max(0, n);
}

/**
 * Production per second for one generator kind after applying its milestone
 * multipliers and any per-generator boost. Global multipliers (research,
 * prestige, boosts) are applied at the total-rate step, not here.
 */
export function generatorProductionPerSecond(
  def: GeneratorDef,
  owned: number,
  perGeneratorMultiplier: number,
): Big {
  if (owned <= 0) return ZERO;
  let mult = perGeneratorMultiplier;
  for (const threshold of BALANCE.milestones) {
    if (owned >= threshold) mult *= BALANCE.milestoneMultiplier;
  }
  return fromNumber(def.baseProduction * owned * mult);
}

export interface RateContext {
  owned: Record<string, number>;
  perGeneratorMult: Record<string, number>; // from apparatus upgrades
  globalMultiplier: number; // all research + prestige stacked
  timedBoostMultiplier: number; // ephemeral (blood moon etc.)
}

/**
 * Total essence-per-second production summed over all generators, with all
 * multipliers applied. Returns Big to accommodate late-game values.
 */
export function totalProductionPerSecond(ctx: RateContext): Big {
  let total: Big = ZERO;
  for (const def of GENERATORS) {
    const owned = ctx.owned[def.id] ?? 0;
    if (owned <= 0) continue;
    const perGen = ctx.perGeneratorMult[def.id] ?? 1;
    total = add(total, generatorProductionPerSecond(def, owned, perGen));
  }
  const globalMult = ctx.globalMultiplier * ctx.timedBoostMultiplier;
  return mulNumber(total, globalMult);
}

/**
 * Distribute a tick of dt seconds. Returns the essence to add and does not
 * mutate any state.
 */
export function tickProduction(ctx: RateContext, dtSeconds: number): Big {
  if (dtSeconds <= 0) return ZERO;
  const perSec = totalProductionPerSecond(ctx);
  return mulNumber(perSec, dtSeconds);
}

/**
 * A generator is "revealed" once the player's lifetime essence has reached
 * its unlock threshold. Redacted rows appear before their own unlock.
 */
export function isGeneratorRevealed(def: GeneratorDef, lifetimeEssence: Big): boolean {
  return gte(lifetimeEssence, def.unlockAt);
}

/**
 * The subsequent tier — one past the highest currently affordable one — is
 * shown redacted, teasing content. Everything past that stays hidden.
 */
export function firstRedactedIndex(lifetimeEssence: Big): number {
  for (let i = 0; i < GENERATORS.length; i++) {
    if (!isGeneratorRevealed(GENERATORS[i], lifetimeEssence)) return i;
  }
  return GENERATORS.length;
}

