/**
 * Lightweight big-number type: value = mantissa * 10^exponent.
 * Normalized so 1 <= |mantissa| < 10 (or the number is exactly zero).
 *
 * This is a break_infinity-style representation, not arbitrary precision.
 * It comfortably covers 1e-308 through 1e308 for the mantissa and any finite
 * exponent for the overall value. Enough for an idle game that will run for
 * years without saturating.
 */

export interface Big {
  readonly m: number; // mantissa
  readonly e: number; // exponent (integer)
}

export const ZERO: Big = { m: 0, e: 0 };
export const ONE: Big = { m: 1, e: 0 };

const LOG10 = Math.log(10);

function normalize(m: number, e: number): Big {
  if (!isFinite(m) || m === 0) return ZERO;
  const abs = Math.abs(m);
  const shift = Math.floor(Math.log10(abs));
  const nm = m / Math.pow(10, shift);
  const ne = e + shift;
  // Guard against tiny FP drift landing at 10 or 0.999...
  if (Math.abs(nm) >= 10) return { m: nm / 10, e: ne + 1 };
  if (Math.abs(nm) < 1) return { m: nm * 10, e: ne - 1 };
  return { m: nm, e: ne };
}

export function fromNumber(n: number): Big {
  if (!isFinite(n) || n === 0) return ZERO;
  return normalize(n, 0);
}

export function fromMantissa(m: number, e: number): Big {
  return normalize(m, e);
}

export function toNumber(b: Big): number {
  if (b.m === 0) return 0;
  if (b.e > 308) return b.m > 0 ? Infinity : -Infinity;
  if (b.e < -308) return 0;
  return b.m * Math.pow(10, b.e);
}

export function isZero(b: Big): boolean {
  return b.m === 0;
}

export function add(a: Big, b: Big): Big {
  if (a.m === 0) return b;
  if (b.m === 0) return a;
  // Align exponents. If |a.e - b.e| > ~15, the smaller vanishes.
  const diff = a.e - b.e;
  if (diff > 15) return a;
  if (diff < -15) return b;
  if (diff >= 0) {
    return normalize(a.m + b.m / Math.pow(10, diff), a.e);
  }
  return normalize(b.m + a.m / Math.pow(10, -diff), b.e);
}

export function sub(a: Big, b: Big): Big {
  return add(a, { m: -b.m, e: b.e });
}

export function mul(a: Big, b: Big): Big {
  if (a.m === 0 || b.m === 0) return ZERO;
  return normalize(a.m * b.m, a.e + b.e);
}

export function mulNumber(a: Big, n: number): Big {
  if (a.m === 0 || n === 0) return ZERO;
  return normalize(a.m * n, a.e);
}

export function div(a: Big, b: Big): Big {
  if (a.m === 0) return ZERO;
  if (b.m === 0) return ZERO; // callers must avoid; return zero rather than throw during a tick
  return normalize(a.m / b.m, a.e - b.e);
}

export function divNumber(a: Big, n: number): Big {
  if (a.m === 0) return ZERO;
  return normalize(a.m / n, a.e);
}

export function pow(a: Big, exp: number): Big {
  if (a.m === 0) return ZERO;
  if (exp === 0) return ONE;
  // (m * 10^e)^exp = m^exp * 10^(e*exp)
  const logM = Math.log10(a.m);
  const totalLog = (logM + a.e) * exp;
  const ne = Math.floor(totalLog);
  const nm = Math.pow(10, totalLog - ne);
  return normalize(nm, ne);
}

/**
 * Natural log. Only correct for positive values.
 */
export function ln(a: Big): number {
  if (a.m <= 0) return -Infinity;
  return Math.log(a.m) + a.e * LOG10;
}

export function log10(a: Big): number {
  if (a.m <= 0) return -Infinity;
  return Math.log10(a.m) + a.e;
}

/**
 * Compare two Big values. Returns -1, 0, or 1.
 */
export function cmp(a: Big, b: Big): -1 | 0 | 1 {
  if (a.m === 0 && b.m === 0) return 0;
  if (a.m === 0) return b.m > 0 ? -1 : 1;
  if (b.m === 0) return a.m > 0 ? 1 : -1;
  const aSign = a.m > 0 ? 1 : -1;
  const bSign = b.m > 0 ? 1 : -1;
  if (aSign !== bSign) return aSign > bSign ? 1 : -1;
  // same sign
  if (a.e !== b.e) {
    const r = a.e > b.e ? 1 : -1;
    return (aSign > 0 ? r : -r) as -1 | 1;
  }
  if (a.m === b.m) return 0;
  return a.m > b.m ? 1 : -1;
}

export function gte(a: Big, b: Big): boolean {
  return cmp(a, b) >= 0;
}
export function lt(a: Big, b: Big): boolean {
  return cmp(a, b) < 0;
}
export function eq(a: Big, b: Big): boolean {
  return cmp(a, b) === 0;
}

/**
 * Max of two Bigs.
 */
export function max(a: Big, b: Big): Big {
  return cmp(a, b) >= 0 ? a : b;
}

/**
 * Min of two Bigs.
 */
export function min(a: Big, b: Big): Big {
  return cmp(a, b) <= 0 ? a : b;
}

/**
 * Serialize a Big to a compact string that survives JSON.
 */
export function toString(b: Big): string {
  if (b.m === 0) return '0';
  return `${b.m}e${b.e}`;
}

export function fromString(s: string): Big {
  if (s === '0' || s === '') return ZERO;
  const parts = s.split('e');
  if (parts.length !== 2) return fromNumber(parseFloat(s));
  const m = parseFloat(parts[0]);
  const e = parseInt(parts[1], 10);
  if (!isFinite(m) || !isFinite(e)) return ZERO;
  return normalize(m, e);
}
