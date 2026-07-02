import {
  nextCost,
  bulkCost,
  maxBuyable,
  generatorProductionPerSecond,
  totalProductionPerSecond,
} from '../src/engine/generators';
import { GENERATORS, GENERATOR_BY_ID } from '../src/content/generators';
import { fromNumber, toNumber, cmp } from '../src/engine/bigNumber';
import { BALANCE } from '../src/engine/balance';

describe('generators — cost & production math', () => {
  test('first alembic cost baseline', () => {
    const alembic = GENERATOR_BY_ID.copper_alembic;
    expect(toNumber(nextCost(alembic, 0))).toBeCloseTo(10, 6);
  });

  test('cost scaling matches 1.15^n', () => {
    const alembic = GENERATOR_BY_ID.copper_alembic;
    for (const n of [0, 1, 5, 10, 25, 100]) {
      expect(toNumber(nextCost(alembic, n))).toBeCloseTo(10 * Math.pow(1.15, n), 3);
    }
  });

  test('bulk cost = sum of individual costs (small counts)', () => {
    const alembic = GENERATOR_BY_ID.copper_alembic;
    let manual = 0;
    for (let i = 0; i < 10; i++) manual += toNumber(nextCost(alembic, i));
    expect(toNumber(bulkCost(alembic, 0, 10))).toBeCloseTo(manual, 3);
  });

  test('bulk cost of 0 is zero', () => {
    expect(toNumber(bulkCost(GENERATOR_BY_ID.copper_alembic, 5, 0))).toBe(0);
  });

  test('maxBuyable — barely enough for one', () => {
    const alembic = GENERATOR_BY_ID.copper_alembic;
    // Enough for exactly the 6th (owned=5) generator.
    const cost = toNumber(nextCost(alembic, 5));
    expect(maxBuyable(alembic, 5, fromNumber(cost))).toBe(1);
    expect(maxBuyable(alembic, 5, fromNumber(cost - 0.01))).toBe(0);
  });

  test('maxBuyable — enough for many', () => {
    const alembic = GENERATOR_BY_ID.copper_alembic;
    // Compute bulk cost of exactly 20; give exactly that essence; expect 20.
    const cost = bulkCost(alembic, 0, 20);
    expect(maxBuyable(alembic, 0, cost)).toBe(20);
    // A hair under 20 — expect 19.
    expect(maxBuyable(alembic, 0, fromNumber(toNumber(cost) - 1))).toBe(19);
  });

  test('maxBuyable at very late-game essence', () => {
    const inner = GENERATOR_BY_ID.inner_sanctum;
    const essence = fromNumber(1e50);
    const n = maxBuyable(inner, 100, essence);
    expect(n).toBeGreaterThan(200);
    // Sanity: buying that many should be affordable, buying one more should not.
    expect(cmp(bulkCost(inner, 100, n), essence)).toBeLessThanOrEqual(0);
    expect(cmp(bulkCost(inner, 100, n + 1), essence)).toBeGreaterThan(0);
  });

  test('production per second applies milestones', () => {
    const alembic = GENERATOR_BY_ID.copper_alembic;
    // 24 owned: no milestone -> 0.1 * 24 * 1 = 2.4
    expect(toNumber(generatorProductionPerSecond(alembic, 24, 1))).toBeCloseTo(2.4, 6);
    // 25 owned: first milestone -> x2 -> 0.1 * 25 * 2 = 5
    expect(toNumber(generatorProductionPerSecond(alembic, 25, 1))).toBeCloseTo(5, 6);
    // 100 owned: three milestones -> x8 -> 0.1 * 100 * 8 = 80
    expect(toNumber(generatorProductionPerSecond(alembic, 100, 1))).toBeCloseTo(80, 6);
  });

  test('production per second applies per-gen multiplier before milestones', () => {
    const alembic = GENERATOR_BY_ID.copper_alembic;
    // 25 owned with x3 per-gen boost -> 0.1 * 25 * 3 * 2 = 15
    expect(toNumber(generatorProductionPerSecond(alembic, 25, 3))).toBeCloseTo(15, 6);
  });

  test('totalProductionPerSecond scales with global mult and boost', () => {
    const owned: Record<string, number> = {};
    for (const g of GENERATORS) owned[g.id] = 5;
    const base = totalProductionPerSecond({
      owned,
      perGeneratorMult: {},
      globalMultiplier: 1,
      timedBoostMultiplier: 1,
    });
    const doubled = totalProductionPerSecond({
      owned,
      perGeneratorMult: {},
      globalMultiplier: 2,
      timedBoostMultiplier: 1,
    });
    expect(toNumber(doubled)).toBeCloseTo(2 * toNumber(base), -5);
    const boosted = totalProductionPerSecond({
      owned,
      perGeneratorMult: {},
      globalMultiplier: 1,
      timedBoostMultiplier: 4,
    });
    expect(toNumber(boosted)).toBeCloseTo(4 * toNumber(base), -5);
  });

  test('sanity: first alembic affordable in <10 baseline distills', () => {
    const alembic = GENERATOR_BY_ID.copper_alembic;
    expect(toNumber(nextCost(alembic, 0)) / BALANCE.baseTapPower).toBeLessThanOrEqual(10);
  });
});
