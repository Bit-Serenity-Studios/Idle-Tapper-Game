import { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import flaskIcon from '../../../assets/icons/flask.png';
import { colors, typography } from '@/ui/theme';
import { CandleFlicker } from './CandleFlicker';

interface Props {
  onPress: (screenX: number, screenY: number) => void;
  label: string;
  hint: string;
}

export function DistillButton({ onPress, label, hint }: Props): JSX.Element {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const press = (screenX: number, screenY: number): void => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 60, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 5 }),
    ]).start();
    Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    onPress(screenX, screenY);
  };

  return (
    <Pressable
      onPressIn={(e) => press(e.nativeEvent.pageX, e.nativeEvent.pageY)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.tapArea}
    >
      <Animated.View style={[styles.ring, { transform: [{ scale }] }]}>
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
            },
          ]}
        />
        <View style={styles.iconStack}>
          <View style={styles.halo} pointerEvents="none">
            <CandleFlicker size={88} />
          </View>
          <Image source={flaskIcon} style={styles.flask} resizeMode="contain" />
        </View>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
      <Text style={styles.hint}>{hint}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tapArea: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  ring: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: colors.goldFaint,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inkRaised,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 110,
    backgroundColor: colors.candle,
  },
  iconStack: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  halo: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flask: {
    width: 62,
    height: 62,
    tintColor: colors.parchment,
  },
  label: {
    fontFamily: typography.serif,
    fontSize: 22,
    letterSpacing: 3,
    color: colors.parchment,
    textTransform: 'uppercase',
  },
  hint: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.parchmentFaint,
    marginTop: 12,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
});
