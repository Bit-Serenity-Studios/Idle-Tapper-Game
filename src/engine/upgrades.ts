import { UPGRADES, UPGRADE_BY_ID, type UpgradeDef } from '@/content/upgrades';
import { BALANCE } from './balance';

export interface UpgradeContext {
  owned: Record<string, boolean>;
  generatorsOwned: Record<string, number>;
}

/**
 * Aggregate all owned upgrade effects into a single set of multipliers /
 * per-generator boosts / offline modifiers.
 */
export interface AggregatedEffects {
  globalMult: number;
  tapMult: number;
  perGenerator: Record<string, number>;
  offlineCapSeconds: number;
  offlineRate: number;
}

export function aggregateUpgradeEffects(ownedIds: readonly string[]): AggregatedEffects {
  const agg: AggregatedEffects = {
    globalMult: 1,
    tapMult: 1,
    perGenerator: {},
    offlineCapSeconds: BALANCE.offlineBaseCapSeconds,
    offlineRate: BALANCE.offlineRate,
  };
  for (const id of ownedIds) {
    const def = UPGRADE_BY_ID[id];
    if (!def) continue;
    for (const eff of def.effects) {
      switch (eff.kind) {
        case 'globalMult':
          agg.globalMult *= eff.factor;
          break;
        case 'tapMult':
          agg.tapMult *= eff.factor;
          break;
        case 'generatorMult': {
          const cur = agg.perGenerator[eff.generatorId] ?? 1;
          agg.perGenerator[eff.generatorId] = cur * eff.factor;
          break;
        }
        case 'offlineCapSeconds':
          agg.offlineCapSeconds = Math.max(agg.offlineCapSeconds, eff.seconds);
          break;
        case 'offlineRate':
          agg.offlineRate = Math.max(agg.offlineRate, eff.rate);
          break;
      }
    }
  }
  return agg;
}

/**
 * An upgrade is *visible* once its prerequisite generator threshold is met,
 * regardless of whether the player can afford it. Before that it appears as
 * a redacted line ("A page torn from something older…").
 */
export function isUpgradeVisible(def: UpgradeDef, ctx: UpgradeContext): boolean {
  if (def.requires) {
    for (const r of def.requires) if (!ctx.owned[r]) return false;
  }
  if (def.requiresGenerator) {
    const owned = ctx.generatorsOwned[def.requiresGenerator.id] ?? 0;
    if (owned < Math.floor(def.requiresGenerator.count / 3)) return false;
  }
  return true;
}

export function isUpgradeUnlocked(def: UpgradeDef, ctx: UpgradeContext): boolean {
  if (def.requires) {
    for (const r of def.requires) if (!ctx.owned[r]) return false;
  }
  if (def.requiresGenerator) {
    const owned = ctx.generatorsOwned[def.requiresGenerator.id] ?? 0;
    if (owned < def.requiresGenerator.count) return false;
  }
  return true;
}

export function listUpgrades(category?: 'apparatus' | 'forbidden'): readonly UpgradeDef[] {
  if (!category) return UPGRADES;
  return UPGRADES.filter((u) => u.category === category);
}
