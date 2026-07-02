import { format, formatDuration, formatNumber } from '../src/engine/format';
import { fromNumber, mulNumber } from '../src/engine/bigNumber';

describe('formatter', () => {
  test('sub-1000 keeps raw form', () => {
    expect(format(fromNumber(0))).toBe('0');
    expect(format(fromNumber(1))).toBe('1');
    expect(format(fromNumber(42))).toBe('42');
    expect(format(fromNumber(999))).toBe('999');
  });

  test('standard suffixes', () => {
    expect(format(fromNumber(1_234))).toBe('1.23K');
    expect(format(fromNumber(4_560_000))).toBe('4.56M');
    expect(format(fromNumber(7_890_000_000))).toBe('7.89B');
    expect(format(fromNumber(1e12))).toBe('1T');
    expect(format(fromNumber(1e15))).toBe('1Qa');
    expect(format(fromNumber(1e18))).toBe('1Qi');
    expect(format(fromNumber(1e30))).toBe('1No');
  });

  test('past 1e33 goes to letter pairs', () => {
    expect(format(fromNumber(1e33))).toBe('1aa');
    expect(format(fromNumber(1e36))).toBe('1ab');
    expect(format(fromNumber(1e39))).toBe('1ac');
  });

  test('very large values (beyond Number range) still format', () => {
    const huge = mulNumber(fromNumber(1e300), 1e100);
    // 1e400 — engineering tier = floor(400/3)=133, suffix should be a letter pair.
    const s = format(huge);
    expect(s).toMatch(/^[0-9.]+[a-z]{2,}$/);
  });

  test('plain number formatter', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(12)).toBe('12');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1500)).toBe('1.5K');
  });

  test('duration', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(65)).toBe('1m 05s');
    expect(formatDuration(3661)).toBe('1h 01m 01s');
  });
});
