/**
 * Prestige-only permanent effects, purchased with Prima Materia after
 * completing a stage of the Great Work.
 */

export type TransmutationEffect =
  | { kind: 'globalMult'; factor: number }
  | { kind: 'tapMult'; factor: number }
  | { kind: 'startingEssence'; amount: number }
  | { kind: 'costReduction'; factor: number } // multiplied into generator base cost
  | { kind: 'primaGain'; factor: number }; // extra PM per prestige

export interface TransmutationDef {
  id: string;
  name: string;
  flavor: string;
  cost: number; // in Prima Materia
  requires?: string[];
  effects: TransmutationEffect[];
}

const t = (
  id: string,
  name: string,
  flavor: string,
  cost: number,
  effects: TransmutationEffect[],
  requires?: string[],
): TransmutationDef => ({ id, name, flavor, cost, effects, requires });

export const TRANSMUTATIONS: readonly TransmutationDef[] = [
  t(
    'nigredo_shard',
    'Shard of Nigredo',
    'A black grain kept in a phial around your neck. All production is doubled.',
    1,
    [{ kind: 'globalMult', factor: 2 }],
  ),
  t(
    'albedo_shard',
    'Shard of Albedo',
    'A pale grain, warm to the touch. Each Distill is trebled.',
    3,
    [{ kind: 'tapMult', factor: 3 }],
    ['nigredo_shard'],
  ),
  t(
    'citrinitas_shard',
    'Shard of Citrinitas',
    'A grain like a fleck of hard sun. All costs are cheaper.',
    5,
    [{ kind: 'costReduction', factor: 0.85 }],
    ['albedo_shard'],
  ),
  t(
    'rubedo_shard',
    'Shard of Rubedo',
    'A red grain that will not stay in the light. Production doubles once more.',
    10,
    [{ kind: 'globalMult', factor: 2 }],
    ['citrinitas_shard'],
  ),
  t(
    'inheritance',
    'Inheritance',
    'Each new beginning is not quite from nothing.',
    2,
    [{ kind: 'startingEssence', amount: 1_000 }],
  ),
  t(
    'greater_inheritance',
    'Greater Inheritance',
    'The apparatus, curiously, is already warm.',
    8,
    [{ kind: 'startingEssence', amount: 1_000_000 }],
    ['inheritance'],
  ),
  t(
    'the_widow_stone',
    "The Widow's Stone",
    'Some who complete the Work end alone. Prima Materia yield increases by half.',
    15,
    [{ kind: 'primaGain', factor: 1.5 }],
    ['rubedo_shard'],
  ),
] as const;

export const TRANSMUTATION_BY_ID: Readonly<Record<string, TransmutationDef>> = Object.fromEntries(
  TRANSMUTATIONS.map((tr) => [tr.id, tr]),
);

/**
 * Named stages of the Great Work, cycling with Roman numerals after the fourth.
 */
const BASE_STAGES = ['Nigredo', 'Albedo', 'Citrinitas', 'Rubedo'] as const;

export function stageName(prestigeCount: number): string {
  const idx = prestigeCount % 4;
  const cycle = Math.floor(prestigeCount / 4);
  const base = BASE_STAGES[idx];
  if (cycle === 0) return base;
  return `${base} ${toRoman(cycle + 1)}`;
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let out = '';
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out || 'I';
}
