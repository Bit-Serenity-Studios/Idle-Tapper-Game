import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { format, formatDuration } from '@/engine/format';
import { LORE } from '@/content/lore';
import { colors, typography, space } from '@/ui/theme';
import { type OfflineSummary, useGameStore } from '@/store/gameStore';
import { getAdsService } from '@/services/AdsService';
import { BALANCE } from '@/engine/balance';

interface Props {
  summary: OfflineSummary;
}

export function OfflineModal({ summary }: Props): JSX.Element {
  const clear = useGameStore((s) => s.clearOfflineSummary);
  const requestDouble = useGameStore((s) => s.requestDoubleOffline);
  const lastDouble = useGameStore((s) => s.lastOfflineDoubleMs);
  const now = useGameStore((s) => s.now);
  const cooldownRemaining = Math.max(
    0,
    BALANCE.offlineDoubleCooldownSeconds - (now - lastDouble) / 1000,
  );
  const doubleAvailable = cooldownRemaining <= 0;

  const onDouble = async (): Promise<void> => {
    const outcome = await getAdsService().showRewarded('double_offline');
    if (outcome.granted) requestDouble(Date.now());
    clear();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={clear}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{LORE.offlineTitle}</Text>
          <Text style={styles.body}>
            {LORE.offlineBody(format(summary.awarded), formatDuration(summary.cappedSeconds))}
          </Text>
          {summary.droppedSeconds > 60 ? (
            <Text style={styles.dropped}>
              {LORE.offlineCapReached(formatDuration(summary.droppedSeconds))}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              onPress={onDouble}
              disabled={!doubleAvailable}
              style={[styles.btn, styles.btnPrimary, !doubleAvailable && styles.btnDisabled]}
            >
              <Text style={styles.btnPrimaryLabel}>
                {doubleAvailable
                  ? LORE.offlineDouble
                  : `${formatDuration(cooldownRemaining)} until the spirits will answer`}
              </Text>
              {doubleAvailable ? (
                <Text style={styles.btnPrimaryHint}>{LORE.offlineDoubleHint}</Text>
              ) : null}
            </Pressable>
            <Pressable onPress={clear} style={[styles.btn, styles.btnSecondary]}>
              <Text style={styles.btnSecondaryLabel}>{LORE.offlineClaim}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.inkRaised,
    padding: space.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gold,
  },
  title: {
    fontFamily: typography.serif,
    fontSize: 24,
    color: colors.parchment,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: space.md,
    textAlign: 'center',
  },
  body: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 15,
    color: colors.parchmentDim,
    lineHeight: 22,
    textAlign: 'center',
  },
  dropped: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.parchmentFaint,
    marginTop: space.md,
    textAlign: 'center',
  },
  actions: {
    marginTop: space.xl,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: space.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  btnPrimary: {
    borderColor: colors.gold,
    backgroundColor: colors.inkDeep,
  },
  btnPrimaryLabel: {
    fontFamily: typography.serif,
    fontSize: 15,
    color: colors.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  btnPrimaryHint: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.parchmentFaint,
    marginTop: 4,
  },
  btnSecondary: {
    borderColor: colors.goldFaint,
  },
  btnSecondaryLabel: {
    fontFamily: typography.serif,
    fontSize: 14,
    color: colors.parchmentDim,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
