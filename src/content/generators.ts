import { type Big, fromNumber } from '@/engine/bigNumber';

export interface GeneratorDef {
  id: string;
  name: string;
  flavor: string;
  baseCost: Big;
  baseProduction: number; // essence per second at 1 owned, before multipliers
  unlockAt: Big; // lifetime essence needed to reveal in the ledger
}

const g = (
  id: string,
  name: string,
  flavor: string,
  baseCost: number,
  baseProduction: number,
  unlockAt: number,
): GeneratorDef => ({
  id,
  name,
  flavor,
  baseCost: fromNumber(baseCost),
  baseProduction,
  unlockAt: fromNumber(unlockAt),
});

/**
 * Eight tiers, ordered by cost. Each is roughly 10x more expensive and
 * 7-8x more productive than the tier below it — a classic idle curve
 * where later tiers dominate but never wholly obsolete the earlier ones.
 */
export const GENERATORS: readonly GeneratorDef[] = [
  g(
    'copper_alembic',
    'Copper Alembic',
    'It drips. Slowly. But it drips.',
    10,
    0.1,
    0,
  ),
  g(
    'apprentice',
    'Apprentice',
    'A nervous student who asks no questions.',
    100,
    1,
    50,
  ),
  g(
    'athanor',
    'Athanor',
    "The alchemist's furnace. It is never allowed to cool.",
    1_100,
    8,
    500,
  ),
  g(
    'ritual_circle',
    'Ritual Circle',
    'Chalk, salt, and things best not named.',
    12_000,
    47,
    6_000,
  ),
  g(
    'bound_homunculus',
    'Bound Homunculus',
    'It works tirelessly. You avoid its eyes.',
    130_000,
    260,
    60_000,
  ),
  g(
    'occult_library',
    'Occult Library',
    'The books read themselves now.',
    1_400_000,
    1_400,
    700_000,
  ),
  g(
    'lunar_observatory',
    'Lunar Observatory',
    'You have learned to distil moonlight itself.',
    20_000_000,
    7_800,
    9_000_000,
  ),
  g(
    'inner_sanctum',
    'The Inner Sanctum',
    'You no longer remember building this room.',
    330_000_000,
    44_000,
    150_000_000,
  ),
] as const;

export const GENERATOR_BY_ID: Readonly<Record<string, GeneratorDef>> = Object.fromEntries(
  GENERATORS.map((gen) => [gen.id, gen]),
);
