import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { format } from '@/engine/format';
import { GENERATOR_BY_ID } from '@/content/generators';
import {
  selectBulkCost,
  selectResolvedQuantity,
  useGameStore,
} from '@/store/gameStore';
import { colors, typography } from '@/ui/theme';
import { gte } from '@/engine/bigNumber';
import { generatorProductionPerSecond } from '@/engine/generators';
import { aggregateUpgradeEffects } from '@/engine/upgrades';

interface Props {
  generatorId: string;
  onBuy: () => void;
}

/**
 * A single apparatus line: name, owned count, cost of next batch, buy button.
 *
 * Selectors here return primitives (numbers, booleans) rather than fresh Big
 * objects so the row does not re-render on every 100ms tick — only when a
 * relevant input has actually changed (owned count, buy quantity, affordability
 * flip, per-generator multiplier).
 */
export const GeneratorRow = memo(function GeneratorRow({
  generatorId,
  onBuy,
}: Props): JSX.Element {
  const def = GENERATOR_BY_ID[generatorId];
  const owned = useGameStore((s) => s.generatorsOwned[generatorId] ?? 0);
  const buyQuantity = useGameStore((s) => s.buyQuantity);
  const resolvedQty = useGameStore((s) => selectResolvedQuantity(s, generatorId));

  // `gte` returns a boolean — shallow-equal from tick to tick until it flips.
  const affordable = useGameStore((s) => gte(s.essence, selectBulkCost(s, generatorId)));

  const perGenMult = useGameStore((s) => {
    const ownedIds = Object.keys(s.ownedUpgrades).filter((k) => s.ownedUpgrades[k]);
    const eff = aggregateUpgradeEffects(ownedIds);
    return eff.perGenerator[generatorId] ?? 1;
  });

  // These derived Bigs are pure functions of the numeric selectors above, so
  // useMemo caches them from render to render.
  const production = useMemo(
    () => generatorProductionPerSecond(def, owned, perGenMult),
    [def, owned, perGenMult],
  );

  // cost changes when owned or buyQuantity change; for 'max' it also depends
  // on essence (via resolvedQty). Cheap to recompute when it does. Big is an
  // object so shallow-compare is required — reference equality would spin.
  const cost = useGameStore(useShallow((s) => selectBulkCost(s, generatorId)));

  const qtyLabel =
    buyQuantity === 'max'
      ? resolvedQty <= 0
        ? '—'
        : `x${resolvedQty}`
      : `x${buyQuantity}`;

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.name}>{def.name}</Text>
        <Text style={styles.owned}>{owned}</Text>
      </View>
      <Text style={styles.flavor}>{def.flavor}</Text>
      <View style={styles.footer}>
        <Text style={styles.production}>{format(production)} /s</Text>
        <Pressable
          onPress={onBuy}
          disabled={!affordable || resolvedQty <= 0}
          style={({ pressed }) => [
            styles.buyBtn,
            !affordable && styles.buyBtnDisabled,
            pressed && affordable && styles.buyBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Buy ${def.name}`}
        >
          <Text style={[styles.buyText, !affordable && styles.buyTextDisabled]}>{qtyLabel}</Text>
          <Text style={[styles.buyCost, !affordable && styles.buyTextDisabled]}>
            {format(cost)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.goldFaint,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  name: {
    fontFamily: typography.serif,
    fontSize: 18,
    color: colors.parchment,
  },
  owned: {
    fontFamily: typography.serif,
    fontSize: 18,
    color: colors.goldDim,
    fontVariant: ['tabular-nums'],
  },
  flavor: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.parchmentFaint,
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  production: {
    fontFamily: typography.serif,
    fontSize: 13,
    color: colors.parchmentDim,
    fontVariant: ['tabular-nums'],
  },
  buyBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 110,
    alignItems: 'center',
    backgroundColor: colors.inkRaised,
  },
  buyBtnDisabled: {
    borderColor: colors.locked,
    backgroundColor: colors.ink,
  },
  buyBtnPressed: {
    backgroundColor: colors.inkDeep,
  },
  buyText: {
    fontFamily: typography.serif,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.parchmentDim,
    textTransform: 'uppercase',
  },
  buyCost: {
    fontFamily: typography.serif,
    fontSize: 16,
    color: colors.gold,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  buyTextDisabled: {
    color: colors.parchmentFaint,
  },
});
