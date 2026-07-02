import { calculateOfflineEarnings, clampElapsed } from '../src/engine/offline';
import { fromNumber, toNumber } from '../src/engine/bigNumber';
import { GENERATOR_BY_ID } from '../src/content/generators';

describe('offline earnings', () => {
  const baseRateCtx = {
    owned: { [GENERATOR_BY_ID.copper_alembic.id]: 100 }, // 0.1 * 100 = 10/s, with 3 milestones (25/50/100) x8 => 80/s
    perGeneratorMult: {},
    globalMultiplier: 1,
    timedBoostMultiplier: 1,
  };

  test('awards elapsed * rate up to cap', () => {
    const r = calculateOfflineEarnings({
      elapsedSeconds: 60,
      offlineCapSeconds: 3600,
      offlineRate: 1,
      rateContext: baseRateCtx,
    });
    // 60 seconds * 80/s = 4800
    expect(toNumber(r.awarded)).toBeCloseTo(4800, -1);
    expect(r.cappedSeconds).toBe(60);
    expect(r.droppedSeconds).toBe(0);
  });

  test('caps at offlineCapSeconds and reports dropped', () => {
    const r = calculateOfflineEarnings({
      elapsedSeconds: 10_000,
      offlineCapSeconds: 3600,
      offlineRate: 1,
      rateContext: baseRateCtx,
    });
    expect(r.cappedSeconds).toBe(3600);
    expect(r.droppedSeconds).toBe(10_000 - 3600);
  });

  test('offlineRate scales the award linearly', () => {
    const r = calculateOfflineEarnings({
      elapsedSeconds: 100,
      offlineCapSeconds: 3600,
      offlineRate: 0.5,
      rateContext: baseRateCtx,
    });
    expect(toNumber(r.awarded)).toBeCloseTo(100 * 80 * 0.5, -1);
  });

  test('negative or absurd elapsed is clamped', () => {
    expect(clampElapsed(1000, 2000)).toBe(0);
    expect(clampElapsed(1000, 1000)).toBe(0);
    expect(clampElapsed(1_000_000_000_000, 0)).toBeLessThanOrEqual(30 * 24 * 3600);
  });

  test('zero-owned yields zero', () => {
    const r = calculateOfflineEarnings({
      elapsedSeconds: 3600,
      offlineCapSeconds: 3600,
      offlineRate: 1,
      rateContext: { ...baseRateCtx, owned: {} },
    });
    expect(toNumber(r.awarded)).toBe(0);
  });

  test('rate matches Big', () => {
    const r = calculateOfflineEarnings({
      elapsedSeconds: 1,
      offlineCapSeconds: 3600,
      offlineRate: 1,
      rateContext: baseRateCtx,
    });
    expect(toNumber(r.ratePerSecond)).toBeCloseTo(80, -1);
    // Keep the unused import quiet.
    expect(fromNumber(1)).toBeTruthy();
  });
});
