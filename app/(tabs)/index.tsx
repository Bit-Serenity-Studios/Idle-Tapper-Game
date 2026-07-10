import { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { LORE } from '@/content/lore';
import { GENERATORS } from '@/content/generators';
import { type Big } from '@/engine/bigNumber';
import {
  selectTotalProduction,
  selectVisibleGenerators,
  useGameStore,
} from '@/store/gameStore';
import { AnimatedGain } from '@/ui/components/AnimatedGain';
import { BuyQuantityToggle } from '@/ui/components/BuyQuantityToggle';
import { DistillButton } from '@/ui/components/DistillButton';
import { GeneratorRow } from '@/ui/components/GeneratorRow';
import { NumberTicker } from '@/ui/components/NumberTicker';
import { OfflineModal } from '@/ui/components/OfflineModal';
import { useHaptics } from '@/ui/hooks/useHaptics';
import { colors, typography, space } from '@/ui/theme';
import { format } from '@/engine/format';

interface Gain {
  id: number;
  amount: Big;
  x: number;
  y: number;
}

export default function StudyScreen(): JSX.Element {
  const essence = useGameStore(useShallow((s) => s.essence));
  const production = useGameStore(useShallow(selectTotalProduction));
  const visible = useGameStore(useShallow(selectVisibleGenerators));
  const tap = useGameStore((s) => s.tap);
  const buyGenerator = useGameStore((s) => s.buyGenerator);
  const pendingOffline = useGameStore((s) => s.pendingOffline);
  const haptics = useHaptics();

  const [gains, setGains] = useState<Gain[]>([]);
  const nextId = useRef(0);

  const onDistill = useCallback(
    (x: number, y: number) => {
      const amount = tap();
      haptics.light();
      const id = ++nextId.current;
      setGains((g) => [...g, { id, amount, x: x - 60, y: y - 40 }]);
    },
    [tap, haptics],
  );

  const onGainDone = useCallback((id: number) => {
    setGains((g) => g.filter((x) => x.id !== id));
  }, []);

  const onBuy = useCallback(
    (id: string) => {
      if (buyGenerator(id)) haptics.medium();
    },
    [buyGenerator, haptics],
  );

  const listHeader = (
    <View>
      <View style={styles.essencePanel}>
        <Text style={styles.essenceLabel}>{LORE.essenceLabel}</Text>
        <NumberTicker value={essence} style={styles.essenceValue} />
        <Text style={styles.rate}>
          {format(production)}
          {LORE.productionSuffix}
        </Text>
      </View>
      <DistillButton onPress={onDistill} label={LORE.distillLabel} hint={LORE.distillHint} />
      <View style={styles.apparatusHeader}>
        <Text style={styles.sectionTitle}>Apparatus</Text>
        <BuyQuantityToggle />
      </View>
      {visible.length === 0 ? (
        <Text style={styles.empty}>{LORE.emptyApparatus}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={visible.length > 0 ? visible : []}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => (
          <GeneratorRow generatorId={item.id} onBuy={() => onBuy(item.id)} />
        )}
        ListHeaderComponent={listHeader}
        ListFooterComponent={<HiddenTiers />}
        contentContainerStyle={styles.list}
      />
      {gains.map((g) => (
        <AnimatedGain
          key={g.id}
          id={g.id}
          amount={g.amount}
          originX={g.x}
          originY={g.y}
          onDone={onGainDone}
        />
      ))}
      {pendingOffline ? <OfflineModal summary={pendingOffline} /> : null}
    </SafeAreaView>
  );
}

function HiddenTiers(): JSX.Element | null {
  const visibleIds = useGameStore(
    useShallow((s) => selectVisibleGenerators(s).map((g) => g.id)),
  );
  const hidden = GENERATORS.filter((g) => !visibleIds.includes(g.id));
  if (hidden.length === 0) return null;
  return (
    <View style={styles.hiddenBlock}>
      {hidden.slice(0, 1).map((g) => (
        <View key={g.id} style={styles.hiddenRow}>
          <Text style={styles.hiddenName}>{LORE.redactedName}</Text>
          <Text style={styles.hiddenFlavor}>{LORE.redactedFlavor}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  essencePanel: {
    alignItems: 'center',
    paddingVertical: space.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.goldFaint,
  },
  essenceLabel: {
    fontFamily: typography.serif,
    fontSize: 11,
    letterSpacing: 3,
    color: colors.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  essenceValue: {
    fontFamily: typography.serif,
    fontSize: 42,
    color: colors.parchment,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  rate: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.goldDim,
    marginTop: space.sm,
    fontVariant: ['tabular-nums'],
  },
  apparatusHeader: {
    paddingVertical: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.goldFaint,
  },
  sectionTitle: {
    fontFamily: typography.serif,
    fontSize: 15,
    letterSpacing: 2.5,
    color: colors.parchmentDim,
    textTransform: 'uppercase',
    marginBottom: space.md,
  },
  empty: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.parchmentFaint,
    textAlign: 'center',
    marginTop: space.lg,
    paddingHorizontal: space.xl,
    lineHeight: 22,
  },
  hiddenBlock: {
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.locked,
  },
  hiddenRow: {
    paddingVertical: space.md,
  },
  hiddenName: {
    fontFamily: typography.serif,
    fontSize: 15,
    color: colors.locked,
    textDecorationLine: 'line-through',
  },
  hiddenFlavor: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.locked,
    marginTop: 4,
  },
});
