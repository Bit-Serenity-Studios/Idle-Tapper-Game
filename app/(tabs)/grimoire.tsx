import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LORE } from '@/content/lore';
import { UPGRADES } from '@/content/upgrades';
import { isUpgradeVisible } from '@/engine/upgrades';
import { useGameStore } from '@/store/gameStore';
import { UpgradeCard } from '@/ui/components/UpgradeCard';
import { useHaptics } from '@/ui/hooks/useHaptics';
import { colors, space, typography } from '@/ui/theme';

type Tab = 'apparatus' | 'forbidden';

export default function GrimoireScreen(): JSX.Element {
  const [tab, setTab] = useState<Tab>('apparatus');
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const haptics = useHaptics();

  const ownedUpgrades = useGameStore((s) => s.ownedUpgrades);
  const generatorsOwned = useGameStore((s) => s.generatorsOwned);

  const visible = useMemo(
    () =>
      UPGRADES.filter(
        (u) => u.category === tab && isUpgradeVisible(u, { owned: ownedUpgrades, generatorsOwned }),
      ),
    [tab, ownedUpgrades, generatorsOwned],
  );

  const onBuy = (id: string): void => {
    if (buyUpgrade(id)) haptics.success();
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.tabs}>
        <TabButton label={LORE.grimoireApparatus} active={tab === 'apparatus'} onPress={() => setTab('apparatus')} />
        <TabButton label={LORE.grimoireForbidden} active={tab === 'forbidden'} onPress={() => setTab('forbidden')} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {visible.length === 0 ? (
          <Text style={styles.empty}>
            {tab === 'apparatus'
              ? 'No apparatus can be enhanced yet. Build first, then read.'
              : 'The forbidden pages are still sealed. Distil, and they will open.'}
          </Text>
        ) : (
          visible.map((u) => <UpgradeCard key={u.id} def={u} onBuy={onBuy} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }): JSX.Element {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.goldFaint,
    paddingHorizontal: space.lg,
  },
  tabBtn: {
    paddingVertical: space.md,
    marginRight: space.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.gold,
  },
  tabLabel: {
    fontFamily: typography.serif,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.parchmentFaint,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: colors.gold,
  },
  list: {
    padding: space.lg,
    paddingBottom: space.xxl,
  },
  empty: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.parchmentFaint,
    textAlign: 'center',
    marginTop: space.xxl,
    lineHeight: 22,
  },
});
