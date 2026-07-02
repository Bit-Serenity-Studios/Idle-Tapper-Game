import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { type Big } from '@/engine/bigNumber';
import { format } from '@/engine/format';
import { colors, typography } from '@/ui/theme';

interface Props {
  id: number;
  amount: Big;
  onDone: (id: number) => void;
  originX: number;
  originY: number;
}

/**
 * A "+N Essence" that floats up and fades. Position is set by the caller
 * (usually the location of the tap). Uses native-driven transforms for cost.
 */
export function AnimatedGain({ id, amount, onDone, originX, originY }: Props): JSX.Element {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(y, {
        toValue: -80,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => onDone(id));
  }, [y, opacity, id, onDone]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          left: originX,
          top: originY,
          opacity,
          transform: [{ translateY: y }],
        },
      ]}
    >
      <Text style={styles.text}>+{format(amount)} Essence</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
  },
  text: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    color: colors.gold,
    fontSize: 18,
  },
});
