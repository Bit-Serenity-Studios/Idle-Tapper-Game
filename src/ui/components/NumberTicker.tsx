import { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';

import { type Big, log10 } from '@/engine/bigNumber';
import { format } from '@/engine/format';
import { colors, typography } from '@/ui/theme';

interface Props {
  value: Big;
  fractionDigits?: number;
  style?: TextStyle;
  suffix?: string;
}

/**
 * Smoothed number display. Instead of animating the numeric value (which for
 * a Big is not straightforward) we interpolate the *log10*, which drives the
 * animation-per-magnitude that reads well for idle progression. When the
 * value changes by less than a hair we just snap.
 */
export const NumberTicker = memo(function NumberTicker({
  value,
  fractionDigits = 2,
  style,
  suffix,
}: Props): JSX.Element {
  const [display, setDisplay] = useState<Big>(value);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef<Big>(value);

  useEffect(() => {
    targetRef.current = value;
    // If the change is trivial (< ~0.1% relative), snap.
    if (Math.abs(log10(value) - log10(display)) < 0.001) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const startLog = log10(display);
    const endLog = log10(value);
    const startTime = Date.now();
    const durationMs = 250;
    const step = (): void => {
      const t = Math.min(1, (Date.now() - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const currentLog = startLog + (endLog - startLog) * eased;
      const e = Math.floor(currentLog);
      const m = Math.pow(10, currentLog - e);
      setDisplay({ m, e });
      if (t < 1) {
        frame = requestAnimationFrame(step);
        rafRef.current = frame;
      } else {
        setDisplay(targetRef.current);
      }
    };
    frame = requestAnimationFrame(step);
    rafRef.current = frame;
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // Depending on the target's numeric fields (not the object identity) means
    // the animation only restarts on a real value change; `display` mutating
    // each frame must not restart it.
  }, [value.m, value.e]);

  return (
    <Text style={[styles.text, style]} allowFontScaling={false}>
      {format(display, fractionDigits)}
      {suffix ?? ''}
    </Text>
  );
});

const styles = StyleSheet.create({
  text: {
    fontFamily: typography.serif,
    color: colors.gold,
    fontSize: 34,
    fontVariant: ['tabular-nums'],
  },
});
