import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '@/ui/theme';

/**
 * A slow, uneven opacity animation on a warm dot. Two overlapping animations
 * produce a beat that never quite repeats — cheap, no external libs, no
 * useNativeDriver=false paths.
 */
export function CandleFlicker({ size = 24 }: { size?: number }): JSX.Element {
  const a = useRef(new Animated.Value(0.6)).current;
  const b = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const loop = (val: Animated.Value, min: number, max: number, base: number): Animated.CompositeAnimation =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: max,
            duration: base + Math.random() * 400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: min,
            duration: base + Math.random() * 400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
    const la = loop(a, 0.4, 0.9, 900);
    const lb = loop(b, 0.6, 1, 1300);
    la.start();
    lb.start();
    return () => {
      la.stop();
      lb.stop();
    };
  }, [a, b]);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            top: -size / 2,
            left: -size / 2,
            opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.25] }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.core,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: b,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: colors.candle,
  },
  core: {
    backgroundColor: colors.candle,
  },
});
