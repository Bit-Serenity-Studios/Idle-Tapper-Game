import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { transmutationMechanic } from '@/content/effectFormat';
import { LORE } from '@/content/lore';
import { TRANSMUTATIONS, stageName, type TransmutationDef } from '@/content/transmutations';
import { format } from '@/engine/format';
import {
  isTransmutationAvailable,
  prestigeGlobalMultiplier,
  prestigePrimaGainFactor,
  primaMateriaGain,
  projectedGlobalMultiplierAfterPrestige,
} from '@/engine/prestige';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/ui/hooks/useHaptics';
import { colors, space, typography } from '@/ui/theme';

export default function GreatWorkScreen(): JSX.Element {
  const primaMateria = useGameStore((s) => s.primaMateria);
  const prestigeCount = useGameStore((s) => s.prestigeCount);
  const lifetime = useGameStore((s) => s.lifetimeEssence);
  const ownedTransmutations = useGameStore((s) => s.ownedTransmutations);
  const prestige = useGameStore((s) => s.prestige);
  const buyTransmutation = useGameStore((s) => s.buyTransmutation);
  const haptics = useHaptics();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const primaContext = { primaMateria, ownedTransmutations };
  const gain = primaMateriaGain(lifetime, prestigePrimaGainFactor(primaContext));
  const currentMult = prestigeGlobalMultiplier(primaContext);
  const projectedMult = projectedGlobalMultiplierAfterPrestige(primaContext, lifetime);
  const stage = stageName(prestigeCount);

  const doPrestige = (): void => {
    if (prestige()) {
      haptics.success();
    }
    setConfirmOpen(false);
  };

  const onBuy = (id: string): void => {
    if (buyTransmutation(id)) haptics.success();
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.preamble}>{LORE.greatWorkPreamble}</Text>

        <View style={styles.statBlock}>
          <StatLine label={LORE.greatWorkStageLabel} value={stage} />
          <StatLine label="Prima Materia" value={String(primaMateria)} />
          <StatLine label="Present multiplier" value={`x${currentMult.toFixed(2)}`} />
          <StatLine label={LORE.greatWorkGainLabel} value={gain > 0 ? `+${gain}` : '—'} />
          <StatLine label={LORE.greatWorkProjectedMultiplier} value={`x${projectedMult.toFixed(2)}`} />
        </View>

        <Pressable
          onPress={() => (gain > 0 ? setConfirmOpen(true) : null)}
          disabled={gain <= 0}
          style={[styles.prestigeBtn, gain <= 0 && styles.prestigeBtnDisabled]}
        >
          <Text style={styles.prestigeLabel}>
            {gain > 0 ? LORE.greatWorkConfirm : LORE.greatWorkInsufficient}
          </Text>
          <Text style={styles.prestigeFlavor}>
            {gain > 0
              ? 'The Work will not undo itself.'
              : `${format(lifetime)} Essence distilled in this stage.`}
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Transmutations</Text>
        {TRANSMUTATIONS.map((t) => (
          <TransmutationCard
            key={t.id}
            def={t}
            owned={!!ownedTransmutations[t.id]}
            available={isTransmutationAvailable(t.id, ownedTransmutations, primaMateria)}
            onBuy={onBuy}
          />
        ))}
      </ScrollView>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>{LORE.greatWorkConfirm}</Text>
            <Text style={styles.confirmBody}>
              {`This stage will be dissolved. You will be paid ${gain} Prima Materia. Your apparatus and knowledge will be undone.`}
            </Text>
            <View style={styles.confirmActions}>
              <Pressable onPress={() => setConfirmOpen(false)} style={[styles.confirmBtn]}>
                <Text style={styles.confirmBtnLabel}>{LORE.greatWorkCancel}</Text>
              </Pressable>
              <Pressable onPress={doPrestige} style={[styles.confirmBtn, styles.confirmBtnPrimary]}>
                <Text style={[styles.confirmBtnLabel, styles.confirmBtnLabelPrimary]}>
                  Yes — complete the Work
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatLine({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function TransmutationCard({
  def,
  owned,
  available,
  onBuy,
}: {
  def: TransmutationDef;
  owned: boolean;
  available: boolean;
  onBuy: (id: string) => void;
}): JSX.Element {
  return (
    <Pressable
      disabled={!available || owned}
      onPress={() => onBuy(def.id)}
      style={[
        styles.card,
        owned && styles.cardOwned,
        !owned && !available && styles.cardLocked,
        !owned && available && styles.cardActive,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{def.name}</Text>
        <Text style={styles.cardCost}>
          {owned ? 'Kept' : `${def.cost} PM`}
        </Text>
      </View>
      <Text style={styles.cardMechanic}>{transmutationMechanic(def)}</Text>
      <Text style={styles.cardFlavor}>{def.flavor}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  list: {
    padding: space.lg,
    paddingBottom: space.xxl,
  },
  preamble: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 15,
    color: colors.parchmentDim,
    lineHeight: 24,
    marginBottom: space.xl,
  },
  statBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.goldFaint,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.goldFaint,
    paddingVertical: space.md,
    marginBottom: space.xl,
  },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statLabel: {
    fontFamily: typography.serif,
    fontSize: 13,
    color: colors.parchmentDim,
  },
  statValue: {
    fontFamily: typography.serif,
    fontSize: 15,
    color: colors.gold,
    fontVariant: ['tabular-nums'],
  },
  prestigeBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.oxbloodBright,
    backgroundColor: colors.inkRaised,
    padding: space.lg,
    alignItems: 'center',
    marginBottom: space.xl,
  },
  prestigeBtnDisabled: {
    borderColor: colors.locked,
    backgroundColor: colors.ink,
    opacity: 0.65,
  },
  prestigeLabel: {
    fontFamily: typography.serif,
    fontSize: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.parchment,
  },
  prestigeFlavor: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.parchmentFaint,
    marginTop: 6,
  },
  sectionTitle: {
    fontFamily: typography.serif,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  card: {
    padding: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginVertical: space.sm,
  },
  cardActive: {
    borderColor: colors.gold,
    backgroundColor: colors.inkRaised,
  },
  cardLocked: {
    borderColor: colors.locked,
    backgroundColor: colors.ink,
    opacity: 0.6,
  },
  cardOwned: {
    borderColor: colors.oxblood,
    backgroundColor: colors.inkRaised,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  cardTitle: {
    fontFamily: typography.serif,
    fontSize: 16,
    color: colors.parchment,
    flex: 1,
    marginRight: space.md,
  },
  cardCost: {
    fontFamily: typography.serif,
    fontSize: 13,
    color: colors.gold,
    fontVariant: ['tabular-nums'],
  },
  cardMechanic: {
    fontFamily: typography.serif,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.gold,
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },
  cardFlavor: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.parchmentFaint,
    marginTop: 4,
    lineHeight: 19,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.xl,
  },
  confirmCard: {
    width: '100%',
    backgroundColor: colors.inkRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.oxbloodBright,
    padding: space.xl,
  },
  confirmTitle: {
    fontFamily: typography.serif,
    fontSize: 22,
    color: colors.parchment,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: space.md,
  },
  confirmBody: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.parchmentDim,
    lineHeight: 22,
    marginBottom: space.xl,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmBtn: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldFaint,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  confirmBtnPrimary: {
    borderColor: colors.oxbloodBright,
    backgroundColor: colors.inkDeep,
  },
  confirmBtnLabel: {
    fontFamily: typography.serif,
    fontSize: 13,
    letterSpacing: 1.4,
    color: colors.parchmentDim,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  confirmBtnLabelPrimary: {
    color: colors.oxbloodBright,
  },
});
