import { type Big, fromNumber } from '@/engine/bigNumber';

export type UpgradeEffect =
  | { kind: 'globalMult'; factor: number }
  | { kind: 'tapMult'; factor: number }
  | { kind: 'generatorMult'; generatorId: string; factor: number }
  | { kind: 'offlineCapSeconds'; seconds: number }
  | { kind: 'offlineRate'; rate: number };

export interface UpgradeDef {
  id: string;
  name: string;
  flavor: string;
  category: 'apparatus' | 'forbidden';
  cost: Big;
  requires?: string[]; // other upgrade ids that must be owned
  requiresGenerator?: { id: string; count: number };
  effects: UpgradeEffect[];
}

const u = (
  id: string,
  name: string,
  flavor: string,
  category: 'apparatus' | 'forbidden',
  cost: number,
  effects: UpgradeEffect[],
  extras: Partial<Pick<UpgradeDef, 'requires' | 'requiresGenerator'>> = {},
): UpgradeDef => ({
  id,
  name,
  flavor,
  category,
  cost: fromNumber(cost),
  effects,
  ...extras,
});

/**
 * Apparatus upgrades: named enhancements per generator kind.
 * Naming leans into workshop-of-a-scholar imagery — retort, athanor,
 * seal, script — never modern jargon.
 */
export const UPGRADES: readonly UpgradeDef[] = [
  // --- Copper Alembic line ---
  u(
    'silvered_retort',
    'Silvered Retort',
    'A finer condensate. Copper Alembics distil three times as much.',
    'apparatus',
    500,
    [{ kind: 'generatorMult', generatorId: 'copper_alembic', factor: 3 }],
    { requiresGenerator: { id: 'copper_alembic', count: 10 } },
  ),
  u(
    'philosophic_mercury',
    'Philosophic Mercury',
    'The volatile spirit, ennobled. Copper Alembics distil twice again.',
    'apparatus',
    50_000,
    [{ kind: 'generatorMult', generatorId: 'copper_alembic', factor: 2 }],
    { requires: ['silvered_retort'], requiresGenerator: { id: 'copper_alembic', count: 50 } },
  ),

  // --- Apprentice line ---
  u(
    'iron_discipline',
    'Iron Discipline',
    'They no longer flinch at what they must handle. Apprentices work thrice as fast.',
    'apparatus',
    3_000,
    [{ kind: 'generatorMult', generatorId: 'apprentice', factor: 3 }],
    { requiresGenerator: { id: 'apprentice', count: 10 } },
  ),
  u(
    'oath_of_silence',
    'Oath of Silence',
    'What they saw last winter, they will not speak of. Twice more Essence, then.',
    'apparatus',
    250_000,
    [{ kind: 'generatorMult', generatorId: 'apprentice', factor: 2 }],
    { requires: ['iron_discipline'], requiresGenerator: { id: 'apprentice', count: 50 } },
  ),

  // --- Athanor line ---
  u(
    'salamander_stone',
    'Salamander Stone',
    'A fire that answers to the fire. Athanors burn thrice as hot.',
    'apparatus',
    30_000,
    [{ kind: 'generatorMult', generatorId: 'athanor', factor: 3 }],
    { requiresGenerator: { id: 'athanor', count: 10 } },
  ),

  // --- Ritual Circle line ---
  u(
    'red_chalk',
    'Red Chalk',
    'The lines bind harder in blood. Ritual Circles yield thrice.',
    'apparatus',
    350_000,
    [{ kind: 'generatorMult', generatorId: 'ritual_circle', factor: 3 }],
    { requiresGenerator: { id: 'ritual_circle', count: 10 } },
  ),

  // --- Bound Homunculus line ---
  u(
    'unblinking_eyes',
    'Unblinking Eyes',
    'It has stopped sleeping. This is thought to be good for Essence.',
    'apparatus',
    3_500_000,
    [{ kind: 'generatorMult', generatorId: 'bound_homunculus', factor: 3 }],
    { requiresGenerator: { id: 'bound_homunculus', count: 10 } },
  ),

  // --- Occult Library line ---
  u(
    'the_index_prohibitum',
    'The Index Prohibitum',
    'A catalogue of every forbidden text. They collate themselves at night.',
    'apparatus',
    40_000_000,
    [{ kind: 'generatorMult', generatorId: 'occult_library', factor: 3 }],
    { requiresGenerator: { id: 'occult_library', count: 10 } },
  ),

  // --- Lunar Observatory line ---
  u(
    'silver_astrolabe',
    'Silver Astrolabe',
    'The moon consents to be measured, and thereby to be distilled.',
    'apparatus',
    600_000_000,
    [{ kind: 'generatorMult', generatorId: 'lunar_observatory', factor: 3 }],
    { requiresGenerator: { id: 'lunar_observatory', count: 10 } },
  ),

  // --- Inner Sanctum line ---
  u(
    'unnamed_geometry',
    'Unnamed Geometry',
    'A shape with more corners than the eye admits. The Sanctum labours thrice as hard.',
    'apparatus',
    9_500_000_000,
    [{ kind: 'generatorMult', generatorId: 'inner_sanctum', factor: 3 }],
    { requiresGenerator: { id: 'inner_sanctum', count: 10 } },
  ),

  // --- Forbidden Knowledge (global) ---
  u(
    'the_hand_that_pours',
    'The Hand That Pours',
    'Your grip has grown steadier than it should be. Each Distill yields five.',
    'forbidden',
    500,
    [{ kind: 'tapMult', factor: 5 }],
  ),
  u(
    'the_practised_hand',
    'The Practised Hand',
    'Repetition begets a certain grace. Each Distill yields five times over.',
    'forbidden',
    500_000,
    [{ kind: 'tapMult', factor: 5 }],
    { requires: ['the_hand_that_pours'] },
  ),
  u(
    'emerald_tablet',
    'The Emerald Tablet, Deciphered',
    'As above, so below — you have finally understood the middle line. All production doubles.',
    'forbidden',
    100_000,
    [{ kind: 'globalMult', factor: 2 }],
  ),
  u(
    'azoth',
    'Azoth',
    'The universal solvent, and its worthy opposite. All production doubles again.',
    'forbidden',
    50_000_000,
    [{ kind: 'globalMult', factor: 2 }],
    { requires: ['emerald_tablet'] },
  ),
  u(
    'the_great_signature',
    'The Great Signature',
    'A single character, deep in an old margin, changes everything. Production trebles.',
    'forbidden',
    50_000_000_000,
    [{ kind: 'globalMult', factor: 3 }],
    { requires: ['azoth'] },
  ),
  u(
    'perpetual_flame',
    'Perpetual Flame',
    'The candles no longer gutter. The apparatus works while you sleep — for as long as you sleep, to a point.',
    'forbidden',
    2_000_000,
    [{ kind: 'offlineCapSeconds', seconds: 24 * 3600 }],
  ),
  u(
    'the_long_vigil',
    'The Long Vigil',
    'The night watches back. Offline production is not diminished.',
    'forbidden',
    20_000_000,
    [{ kind: 'offlineRate', rate: 1 }],
    { requires: ['perpetual_flame'] },
  ),
] as const;

export const UPGRADE_BY_ID: Readonly<Record<string, UpgradeDef>> = Object.fromEntries(
  UPGRADES.map((up) => [up.id, up]),
);
