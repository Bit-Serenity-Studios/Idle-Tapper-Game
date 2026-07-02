import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type BuyQuantity, useGameStore } from '@/store/gameStore';
import { colors, typography } from '@/ui/theme';

const OPTIONS: readonly BuyQuantity[] = [1, 10, 100, 'max'] as const;

export function BuyQuantityToggle(): JSX.Element {
  const q = useGameStore((s) => s.buyQuantity);
  const set = useGameStore((s) => s.setBuyQuantity);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Buy</Text>
      {OPTIONS.map((opt) => {
        const selected = opt === q;
        return (
          <Pressable
            key={String(opt)}
            onPress={() => set(opt)}
            style={[styles.chip, selected && styles.chipSelected]}
            accessibilityRole="button"
            accessibilityLabel={`Buy ${opt}`}
            accessibilityState={{ selected }}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {opt === 'max' ? 'Max' : `x${opt}`}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: typography.serif,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.parchmentFaint,
    marginRight: 12,
    textTransform: 'uppercase',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldFaint,
  },
  chipSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.inkRaised,
  },
  chipText: {
    fontFamily: typography.serif,
    fontSize: 13,
    color: colors.parchmentDim,
    fontVariant: ['tabular-nums'],
  },
  chipTextSelected: {
    color: colors.gold,
  },
});
