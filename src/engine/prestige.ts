import { BALANCE } from './balance';
import { type Big, ZERO, log10 } from './bigNumber';
import { TRANSMUTATIONS, TRANSMUTATION_BY_ID } from '@/content/transmutations';

/**
 * Prima Materia awarded on prestige. Sub-linear in lifetime essence so early
 * prestiges give small numbers and each additional PM demands ever more play.
 *
 *   PM = floor( sqrt( lifetime / divisor ) * primaGainFactor )
 *
 * primaGainFactor is 1 by default and modified by prestige-tree effects.
 */
export function primaMateriaGain(lifetimeEssenceThisRun: Big, primaGainFactor: number): number {
  // sqrt is done in log space to avoid overflow at lifetime > 1e308.
  const lg = log10(lifetimeEssenceThisRun) - Math.log10(BALANCE.prestigeDivisor);
  if (lg < 0) return 0;
  const sqrtLg = lg / 2;
  const raw = Math.pow(10, sqrtLg) * primaGainFactor;
  if (!isFinite(raw)) return Number.MAX_SAFE_INTEGER;
  return Math.floor(raw);
}

export interface PrestigeContext {
  primaMateria: number; // total ever, includes just-earned
  ownedTransmutations: Record<string, boolean>;
}

/**
 * Global production multiplier from prestige. Includes the flat per-PM bonus
 * and any transmutations that multiply production.
 */
export function prestigeGlobalMultiplier(ctx: PrestigeContext): number {
  const perPm = 1 + (BALANCE.primaMateriaPerPercent / 100) * ctx.primaMateria;
  let mult = perPm;
  for (const def of TRANSMUTATIONS) {
    if (!ctx.ownedTransmutations[def.id]) continue;
    for (const eff of def.effects) {
      if (eff.kind === 'globalMult') mult *= eff.factor;
    }
  }
  return mult;
}

export function prestigeTapMultiplier(ctx: PrestigeContext): number {
  let mult = 1;
  for (const def of TRANSMUTATIONS) {
    if (!ctx.ownedTransmutations[def.id]) continue;
    for (const eff of def.effects) {
      if (eff.kind === 'tapMult') mult *= eff.factor;
    }
  }
  return mult;
}

export function prestigeCostReduction(ctx: PrestigeContext): number {
  let f = 1;
  for (const def of TRANSMUTATIONS) {
    if (!ctx.ownedTransmutations[def.id]) continue;
    for (const eff of def.effects) {
      if (eff.kind === 'costReduction') f *= eff.factor;
    }
  }
  return f;
}

export function prestigeStartingEssence(ctx: PrestigeContext): Big {
  let n = 0;
  for (const def of TRANSMUTATIONS) {
    if (!ctx.ownedTransmutations[def.id]) continue;
    for (const eff of def.effects) {
      if (eff.kind === 'startingEssence') n += eff.amount;
    }
  }
  return n === 0 ? ZERO : { m: n / Math.pow(10, Math.floor(Math.log10(n))), e: Math.floor(Math.log10(n)) };
}

export function prestigePrimaGainFactor(ctx: PrestigeContext): number {
  let f = 1;
  for (const def of TRANSMUTATIONS) {
    if (!ctx.ownedTransmutations[def.id]) continue;
    for (const eff of def.effects) {
      if (eff.kind === 'primaGain') f *= eff.factor;
    }
  }
  return f;
}

/**
 * Whether a transmutation is currently available: all prereqs owned and PM cost affordable.
 */
export function isTransmutationAvailable(
  id: string,
  ownedTransmutations: Record<string, boolean>,
  primaMateria: number,
): boolean {
  const def = TRANSMUTATION_BY_ID[id];
  if (!def) return false;
  if (ownedTransmutations[id]) return false;
  if (primaMateria < def.cost) return false;
  if (def.requires) {
    for (const r of def.requires) if (!ownedTransmutations[r]) return false;
  }
  return true;
}

/**
 * The projected multiplier the player will have *after* prestige if they
 * complete it now. Used by the Great Work screen ("your work will yield x").
 */
export function projectedGlobalMultiplierAfterPrestige(
  ctx: PrestigeContext,
  lifetimeEssence: Big,
): number {
  const gain = primaMateriaGain(lifetimeEssence, prestigePrimaGainFactor(ctx));
  return prestigeGlobalMultiplier({ ...ctx, primaMateria: ctx.primaMateria + gain });
}

export function projectedGain(ctx: PrestigeContext, lifetimeEssence: Big): number {
  return primaMateriaGain(lifetimeEssence, prestigePrimaGainFactor(ctx));
}

