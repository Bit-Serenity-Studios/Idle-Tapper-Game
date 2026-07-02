import { type Big, log10, toNumber } from './bigNumber';

/**
 * Standard suffixes up to 1e33, then alphabetic pairs (aa, ab, ac, ..., zz).
 * Beyond zz we go to triples (aaa, aab, ...). Effectively unbounded.
 */
const SHORT_SUFFIXES = [
  '', // 1e0
  'K', // 1e3
  'M', // 1e6
  'B', // 1e9
  'T', // 1e12
  'Qa', // 1e15
  'Qi', // 1e18
  'Sx', // 1e21
  'Sp', // 1e24
  'Oc', // 1e27
  'No', // 1e30
];

/**
 * Return the alphabetic suffix for a given "engineering index" (the tier is
 * 3-magnitudes-wide, so tier=11 -> 1e33 -> "aa", tier=12 -> "ab", ...).
 */
function alphaSuffix(tier: number): string {
  // The first 11 tiers are covered by SHORT_SUFFIXES. This function handles
  // tier >= 11, returning the letter pair for that engineering tier.
  let n = tier - 11;
  let out = '';
  // Base-26 with lowercase letters. 0 -> 'a', 25 -> 'z', 26 -> 'ba', ...
  do {
    out = String.fromCharCode(97 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  // For the first band (11..11+26 -> aa..az) we want double letters, so pad.
  if (out.length === 1) out = 'a' + out;
  return out;
}

/**
 * Format a raw JS number using the same rules as the Big formatter.
 * Useful for stat-line values that never exceed 1e15 (integers).
 */
export function formatNumber(n: number, fractionDigits = 2): string {
  if (!isFinite(n)) return '∞';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs < 1000) {
    // Small values: keep them clean. 12.4, 3, 0.05.
    if (abs >= 10 || abs === Math.floor(abs)) return round(n, 0).toString();
    return round(n, fractionDigits).toString();
  }
  const exp = Math.floor(Math.log10(abs));
  const tier = Math.floor(exp / 3);
  const suffix = tier < SHORT_SUFFIXES.length ? SHORT_SUFFIXES[tier] : alphaSuffix(tier);
  const scaled = n / Math.pow(10, tier * 3);
  return `${round(scaled, fractionDigits)}${suffix}`;
}

/**
 * Format a Big for display. Always chooses the shortest human-legible form.
 */
export function format(b: Big, fractionDigits = 2): string {
  if (b.m === 0) return '0';
  const lg = log10(b);
  if (lg < 3) return formatNumber(toNumber(b), fractionDigits);
  const tier = Math.floor(lg / 3);
  const suffix = tier < SHORT_SUFFIXES.length ? SHORT_SUFFIXES[tier] : alphaSuffix(tier);
  // scaled mantissa in [1, 1000)
  const scaledLog = lg - tier * 3;
  const scaled = Math.pow(10, scaledLog);
  return `${round(scaled, fractionDigits)}${suffix}`;
}

/**
 * Rounded number as a plain-JS string with trailing zeros trimmed.
 */
function round(n: number, digits: number): string {
  const rounded = Number(n.toFixed(digits));
  return rounded.toString();
}

/**
 * Format a duration in whole-second granularity. "3h 12m 04s".
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0s';
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(sec)}s`;
  if (m > 0) return `${m}m ${pad(sec)}s`;
  return `${sec}s`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
