import { BALANCE } from './balance';
import { type Big, add, mulNumber } from './bigNumber';
import { type RateContext, totalProductionPerSecond } from './generators';

/**
 * A single production tick. Given the current rate context and elapsed
 * seconds since the last tick, return the essence to add. This is pure —
 * the caller updates state.
 */
export function tick(ctx: RateContext, dtSeconds: number): Big {
  const clamped = Math.max(0, Math.min(dtSeconds, 60));
  const rate = totalProductionPerSecond(ctx);
  return mulNumber(rate, clamped);
}

/**
 * The tap increment. Base tap * tapMult (from apparatus/forbidden) * prestige tap mult.
 */
export function tapGain(base: number, tapMult: number, prestigeTapMult: number): Big {
  return mulNumber({ m: 1, e: 0 }, BALANCE.baseTapPower * base * tapMult * prestigeTapMult);
}

/**
 * Accumulate a delta into a Big. Semantic helper so call sites read cleanly.
 */
export function credit(prev: Big, gain: Big): Big {
  return add(prev, gain);
}
