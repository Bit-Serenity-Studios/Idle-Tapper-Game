import { GENERATOR_BY_ID } from './generators';
import { type TransmutationDef } from './transmutations';
import { type UpgradeDef } from './upgrades';

/**
 * Plain-language "condenser" for what an upgrade does — shown next to the
 * flavor line so a scanning player never has to decode. Short noun phrases,
 * multiplied with " · " when an upgrade has multiple effects.
 *
 * Voice: neutral. This IS the utilitarian read; the flavor carries the vibe.
 */
export function upgradeMechanic(def: UpgradeDef): string {
  return def.effects.map(effectStringForUpgrade).join(' · ');
}

function effectStringForUpgrade(eff: UpgradeDef['effects'][number]): string {
  switch (eff.kind) {
    case 'globalMult':
      return `×${eff.factor} all production`;
    case 'tapMult':
      return `×${eff.factor} tap yield`;
    case 'generatorMult': {
      const g = GENERATOR_BY_ID[eff.generatorId];
      return g ? `×${eff.factor} ${g.name}` : `×${eff.factor} ${eff.generatorId}`;
    }
    case 'offlineCapSeconds':
      return `${Math.round(eff.seconds / 3600)}h offline cap`;
    case 'offlineRate':
      return `${Math.round(eff.rate * 100)}% offline rate`;
  }
}

export function transmutationMechanic(def: TransmutationDef): string {
  return def.effects.map(effectStringForTransmutation).join(' · ');
}

function effectStringForTransmutation(eff: TransmutationDef['effects'][number]): string {
  switch (eff.kind) {
    case 'globalMult':
      return `×${eff.factor} all production`;
    case 'tapMult':
      return `×${eff.factor} tap yield`;
    case 'startingEssence':
      return `+${formatCompact(eff.amount)} starting Essence each stage`;
    case 'costReduction':
      return `−${Math.round((1 - eff.factor) * 100)}% apparatus cost`;
    case 'primaGain':
      return `+${Math.round((eff.factor - 1) * 100)}% Prima Materia per stage`;
  }
}

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
