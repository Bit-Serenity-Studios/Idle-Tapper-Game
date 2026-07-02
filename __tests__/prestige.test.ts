import {
  primaMateriaGain,
  prestigeGlobalMultiplier,
  isTransmutationAvailable,
} from '../src/engine/prestige';
import { fromNumber } from '../src/engine/bigNumber';
import { BALANCE } from '../src/engine/balance';

describe('prestige', () => {
  test('no prima below the divisor', () => {
    expect(primaMateriaGain(fromNumber(BALANCE.prestigeDivisor - 1), 1)).toBe(0);
  });

  test('exactly divisor yields 1 PM', () => {
    expect(primaMateriaGain(fromNumber(BALANCE.prestigeDivisor), 1)).toBe(1);
  });

  test('4x divisor -> 2 PM (sqrt)', () => {
    expect(primaMateriaGain(fromNumber(BALANCE.prestigeDivisor * 4), 1)).toBe(2);
  });

  test('gain factor multiplies', () => {
    const raw = primaMateriaGain(fromNumber(BALANCE.prestigeDivisor * 100), 1); // 10
    expect(raw).toBe(10);
    const boosted = primaMateriaGain(fromNumber(BALANCE.prestigeDivisor * 100), 1.5);
    expect(boosted).toBe(15);
  });

  test('extreme scale — no overflow', () => {
    const g = primaMateriaGain(fromNumber(1e300), 1);
    expect(isFinite(g)).toBe(true);
    expect(g).toBeGreaterThan(0);
  });

  test('global multiplier is +2% per PM plus transmutations', () => {
    expect(
      prestigeGlobalMultiplier({ primaMateria: 0, ownedTransmutations: {} }),
    ).toBeCloseTo(1, 6);
    expect(
      prestigeGlobalMultiplier({ primaMateria: 10, ownedTransmutations: {} }),
    ).toBeCloseTo(1.2, 6);
    expect(
      prestigeGlobalMultiplier({
        primaMateria: 10,
        ownedTransmutations: { nigredo_shard: true },
      }),
    ).toBeCloseTo(2.4, 6);
  });

  test('isTransmutationAvailable respects PM cost and prereqs', () => {
    expect(isTransmutationAvailable('nigredo_shard', {}, 0)).toBe(false);
    expect(isTransmutationAvailable('nigredo_shard', {}, 1)).toBe(true);
    // Requires nigredo_shard first
    expect(isTransmutationAvailable('albedo_shard', {}, 100)).toBe(false);
    expect(
      isTransmutationAvailable('albedo_shard', { nigredo_shard: true }, 3),
    ).toBe(true);
    expect(
      isTransmutationAvailable('albedo_shard', { nigredo_shard: true, albedo_shard: true }, 3),
    ).toBe(false);
  });
});
