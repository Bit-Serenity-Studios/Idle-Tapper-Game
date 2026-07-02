import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GENERATOR_BY_ID } from '@/content/generators';
import { LORE } from '@/content/lore';
import { type UpgradeDef } from '@/content/upgrades';
import { gte } from '@/engine/bigNumber';
import { format } from '@/engine/format';
import { isUpgradeUnlocked } from '@/engine/upgrades';
import { useGameStore } from '@/store/gameStore';
import { colors, typography, space } from '@/ui/theme';

interface Props {
  def: UpgradeDef;
  onBuy: (id: string) => void;
}

/**
 * A grimoire entry. When unlocked and unowned, becomes purchasable.
 * When locked, displays the redacted, ominous placeholder.
 * When owned, the "cost" line is replaced with an "Inscribed" marker.
 */
export const UpgradeCard = memo(function UpgradeCard({ def, onBuy }: Props): JSX.Element {
  const owned = useGameStore((s) => !!s.ownedUpgrades[def.id]);
  const essence = useGameStore((s) => s.essence);
  const affordable = gte(essence, def.cost);
  const unlocked = useGameStore((s) =>
    isUpgradeUnlocked(def, { owned: s.ownedUpgrades, generatorsOwned: s.generatorsOwned }),
  );

  if (owned) {
    return (
      <View style={[styles.card, styles.cardOwned]}>
        <Text style={styles.title}>{def.name}</Text>
        <Text style={styles.flavor}>{def.flavor}</Text>
        <Text style={styles.inscribed}>Inscribed</Text>
      </View>
    );
  }

  if (!unlocked) {
    const req = def.requiresGenerator;
    return (
      <View style={[styles.card, styles.cardLocked]}>
        <Text style={styles.titleLocked}>{LORE.redactedName}</Text>
        <Text style={styles.flavorLocked}>{LORE.redactedFlavor}</Text>
        {req ? (
          <Text style={styles.reqHint}>
            {LORE.lockedUpgradeHint(GENERATOR_BY_ID[req.id].name, req.count)}
          </Text>
        ) : null}
        <Text style={styles.costLocked}>{format(def.cost)} Essence</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => affordable && onBuy(def.id)}
      style={({ pressed }) => [
        styles.card,
        affordable ? styles.cardActive : styles.cardUnaffordable,
        pressed && affordable && styles.cardPressed,
      ]}
    >
      <Text style={styles.title}>{def.name}</Text>
      <Text style={styles.flavor}>{def.flavor}</Text>
      <Text style={[styles.cost, !affordable && styles.costUnaffordable]}>
        {format(def.cost)} Essence
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginVertical: space.sm,
  },
  cardActive: {
    borderColor: colors.gold,
    backgroundColor: colors.inkRaised,
  },
  cardUnaffordable: {
    borderColor: colors.goldFaint,
    backgroundColor: colors.ink,
  },
  cardPressed: {
    backgroundColor: colors.inkDeep,
  },
  cardOwned: {
    borderColor: colors.oxblood,
    backgroundColor: colors.inkRaised,
    opacity: 0.75,
  },
  cardLocked: {
    borderColor: colors.locked,
    backgroundColor: colors.ink,
  },
  title: {
    fontFamily: typography.serif,
    fontSize: 16,
    color: colors.parchment,
  },
  titleLocked: {
    fontFamily: typography.serif,
    fontSize: 16,
    color: colors.locked,
    textDecorationLine: 'line-through',
  },
  flavor: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.parchmentFaint,
    marginTop: 4,
    lineHeight: 19,
  },
  flavorLocked: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.locked,
    marginTop: 4,
    lineHeight: 19,
  },
  cost: {
    fontFamily: typography.serif,
    fontSize: 14,
    color: colors.gold,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  costUnaffordable: {
    color: colors.parchmentFaint,
  },
  costLocked: {
    fontFamily: typography.serif,
    fontSize: 13,
    color: colors.locked,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  inscribed: {
    fontFamily: typography.serif,
    fontSize: 11,
    letterSpacing: 3,
    color: colors.oxbloodBright,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  reqHint: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 11,
    color: colors.locked,
    marginTop: 6,
  },
});
