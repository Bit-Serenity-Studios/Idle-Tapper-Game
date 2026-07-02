import { type Big, mulNumber } from './bigNumber';
import { type RateContext, totalProductionPerSecond } from './generators';

export interface OfflineParams {
  elapsedSeconds: number;
  offlineCapSeconds: number;
  offlineRate: number; // 0..1 fraction of live rate
  rateContext: RateContext;
}

export interface OfflineResult {
  awarded: Big;
  cappedSeconds: number; // seconds actually credited (min of elapsed & cap)
  droppedSeconds: number; // seconds we could not credit due to cap
  ratePerSecond: Big;
}

/**
 * The "Long Vigil". Credit offline production for time elapsed since the
 * last save, capped at the current cap and modulated by offlineRate.
 *
 * Rate is a snapshot of production at reset — we don't attempt to model
 * generator purchases during offline time, which would be both wrong
 * (players didn't make those choices) and easily exploited.
 */
export function calculateOfflineEarnings(params: OfflineParams): OfflineResult {
  const elapsed = Math.max(0, params.elapsedSeconds);
  const capped = Math.min(elapsed, Math.max(0, params.offlineCapSeconds));
  const dropped = elapsed - capped;
  const rate = totalProductionPerSecond(params.rateContext);
  const awarded = mulNumber(rate, capped * params.offlineRate);
  return {
    awarded,
    cappedSeconds: capped,
    droppedSeconds: dropped,
    ratePerSecond: rate,
  };
}

/**
 * Anti-cheat lite: clamp negative or absurdly-large deltas. Returns the
 * clamped, safe-to-use elapsed seconds.
 */
export function clampElapsed(nowMs: number, lastSaveMs: number): number {
  const delta = (nowMs - lastSaveMs) / 1000;
  if (!isFinite(delta)) return 0;
  if (delta < 0) return 0;
  // Cap absolute upper bound at 30 days so a corrupted or hand-edited save
  // can't award a billion years of production.
  const HARD_CAP_SECONDS = 30 * 24 * 3600;
  return Math.min(delta, HARD_CAP_SECONDS);
}
