import {
  fromNumber,
  toNumber,
  add,
  sub,
  mul,
  mulNumber,
  div,
  pow,
  log10,
  cmp,
  gte,
  toString,
  fromString,
  ZERO,
  ONE,
} from '../src/engine/bigNumber';

describe('BigNumber', () => {
  test('normalizes on construction', () => {
    expect(fromNumber(12345).m).toBeCloseTo(1.2345, 6);
    expect(fromNumber(12345).e).toBe(4);
    expect(fromNumber(0.00042).e).toBe(-4);
  });

  test('zero round-trips', () => {
    expect(toNumber(fromNumber(0))).toBe(0);
    expect(toNumber(ZERO)).toBe(0);
  });

  test('roundtrip preserves value for JS-safe range', () => {
    for (const n of [1, 12, 999, 1_000_000, 3.14159, 1e15]) {
      expect(toNumber(fromNumber(n))).toBeCloseTo(n, 6);
    }
  });

  test('addition of like magnitudes', () => {
    const a = fromNumber(1e12);
    const b = fromNumber(2e12);
    expect(toNumber(add(a, b))).toBeCloseTo(3e12, -8);
  });

  test('addition of very different magnitudes returns the larger', () => {
    const big = fromNumber(1e100);
    const small = fromNumber(1);
    expect(cmp(add(big, small), big)).toBe(0);
  });

  test('multiplication scales exponents beyond MAX_SAFE_INTEGER', () => {
    const a = fromNumber(1e300);
    const b = fromNumber(1e300);
    const p = mul(a, b);
    expect(p.e).toBe(600);
    expect(p.m).toBeCloseTo(1, 6);
  });

  test('subtraction to zero', () => {
    const a = fromNumber(5);
    const b = fromNumber(5);
    expect(cmp(sub(a, b), ZERO)).toBe(0);
  });

  test('division inverse of multiplication', () => {
    const a = fromNumber(1e50);
    const b = fromNumber(1e20);
    expect(toNumber(div(a, b))).toBeCloseTo(1e30, -20);
  });

  test('pow at extreme scale', () => {
    const a = fromNumber(2);
    const p = pow(a, 100); // 2^100 ~ 1.26e30
    expect(p.e).toBe(30);
    expect(p.m).toBeCloseTo(1.267, 2);
  });

  test('mulNumber', () => {
    expect(toNumber(mulNumber(fromNumber(1e10), 3))).toBeCloseTo(3e10, -5);
  });

  test('cmp', () => {
    expect(cmp(fromNumber(2), fromNumber(1))).toBe(1);
    expect(cmp(fromNumber(1), fromNumber(2))).toBe(-1);
    expect(cmp(fromNumber(3), fromNumber(3))).toBe(0);
    expect(gte(fromNumber(3), fromNumber(3))).toBe(true);
    expect(gte(fromNumber(3), fromNumber(4))).toBe(false);
  });

  test('log10', () => {
    expect(log10(fromNumber(1000))).toBeCloseTo(3, 6);
    expect(log10(fromNumber(1e50))).toBeCloseTo(50, 6);
  });

  test('string round-trip', () => {
    const a = fromNumber(1234567890);
    expect(cmp(fromString(toString(a)), a)).toBe(0);
    const big = mulNumber(ONE, 1e200);
    expect(cmp(fromString(toString(big)), big)).toBe(0);
  });
});
