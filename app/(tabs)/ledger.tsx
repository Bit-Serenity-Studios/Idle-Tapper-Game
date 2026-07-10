import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { LORE } from '@/content/lore';
import { format, formatDuration, formatNumber } from '@/engine/format';
import { cmp, gte, sub, ZERO } from '@/engine/bigNumber';
import { BALANCE } from '@/engine/balance';
import {
  selectBloodMoonActive,
  selectTotalProduction,
  useGameStore,
} from '@/store/gameStore';
import { getAdsService } from '@/services/AdsService';
import { useHaptics } from '@/ui/hooks/useHaptics';
import { colors, space, typography } from '@/ui/theme';

/**
 * The Ledger. Aggregates everything the player might want to see:
 * lifetime stats, active boosts, daily lunar-phase login, and the current
 * commission with its progress bar.
 */
export default function LedgerScreen(): JSX.Element {
  const state = useGameStore();
  const production = useGameStore(useShallow(selectTotalProduction));
  const bloodMoon = useGameStore(selectBloodMoonActive);
  const haptics = useHaptics();

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const timePlayedSec = (now - state.createdAtMs) / 1000;

  const isoToday = new Date().toISOString().slice(0, 10);
  const canClaimLunar = state.lastDailyClaimIsoDate !== isoToday;
  const lunarDay = ((state.loginStreak % 7) || 7); // display today’s upcoming phase

  const onClaimLunar = (): void => {
    const fragments = state.claimLunar(isoToday);
    if (fragments != null) haptics.success();
  };

  const commission = state.activeCommission;
  let commissionProgress = 0;
  let commissionComplete = false;
  if (commission) {
    const done = sub(state.lifetimeEssence, commission.startEssenceLifetime);
    const goal = commission.goalEssence;
    commissionProgress = cmp(goal, ZERO) > 0 ? Math.min(1, expDiv(done, goal)) : 0;
    commissionComplete = gte(done, goal);
  }

  const onClaimCommission = (): void => {
    if (state.claimCommission()) haptics.success();
  };

  const bloodMoonRemaining = Math.max(0, (state.boostBloodMoonEndsMs - now) / 1000);
  const bloodMoonCooldown = Math.max(
    0,
    BALANCE.bloodMoonCooldownSeconds - (now - state.lastBloodMoonMs) / 1000,
  );
  const timeDilationCooldown = Math.max(
    0,
    BALANCE.timeDilationCooldownSeconds - (now - state.lastTimeDilationMs) / 1000,
  );

  const requestBloodMoon = async (): Promise<void> => {
    const outcome = await getAdsService().showRewarded('blood_moon');
    if (outcome.granted) {
      state.startBloodMoon(Date.now());
      haptics.success();
    }
  };
  const requestTimeDilation = async (): Promise<void> => {
    const outcome = await getAdsService().showRewarded('time_dilation');
    if (outcome.granted) {
      state.startTimeDilation(Date.now());
      haptics.success();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.list}>
        <Section title="Stats">
          <StatLine label={LORE.ledgerLifetime} value={format(state.lifetimeEssenceAllTime)} />
          <StatLine label={LORE.ledgerRun} value={format(state.lifetimeEssence)} />
          <StatLine label={LORE.ledgerTaps} value={formatNumber(state.totalTaps)} />
          <StatLine label={LORE.ledgerPrestiges} value={formatNumber(state.totalPrestiges)} />
          <StatLine label={LORE.ledgerTimePlayed} value={formatDuration(timePlayedSec)} />
          <StatLine label={LORE.ledgerRate} value={`${format(production)}${LORE.productionSuffix}`} />
          {bloodMoon ? (
            <StatLine
              label={LORE.boostBloodMoonName}
              value={`${formatDuration(bloodMoonRemaining)} remaining`}
            />
          ) : null}
          {state.boostTimeDilationExtraSeconds > 0 ? (
            <StatLine
              label="Banked time"
              value={formatDuration(state.boostTimeDilationExtraSeconds)}
            />
          ) : null}
        </Section>

        <Section title={LORE.lunarTitle}>
          <Text style={styles.mechanic}>{LORE.lunarMechanic}</Text>
          <Text style={styles.flavor}>{LORE.lunarFlavor(lunarDay)}</Text>
          <Text style={styles.streak}>
            Streak: {state.loginStreak} {state.loginStreak === 1 ? 'night' : 'nights'}
          </Text>
          <Pressable
            onPress={onClaimLunar}
            disabled={!canClaimLunar}
            style={[styles.btn, !canClaimLunar && styles.btnDisabled]}
          >
            <Text style={styles.btnLabel}>
              {canClaimLunar ? LORE.lunarClaim : LORE.lunarAlreadyClaimed}
            </Text>
          </Pressable>
        </Section>

        {commission ? (
          <Section title={LORE.commissionTitle}>
            <Text style={styles.mechanic}>{LORE.commissionMechanic}</Text>
            <Text style={styles.flavor}>{LORE.commissionFlavor}</Text>
            <Text style={styles.streak}>
              {`Distil ${format(commission.goalEssence)} Essence before the candle gutters.`}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${commissionProgress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {LORE.commissionProgress}: {(commissionProgress * 100).toFixed(1)}%
            </Text>
            {commission.claimed ? (
              <Text style={styles.claimed}>Claimed.</Text>
            ) : (
              <Pressable
                onPress={onClaimCommission}
                disabled={!commissionComplete}
                style={[styles.btn, !commissionComplete && styles.btnDisabled]}
              >
                <Text style={styles.btnLabel}>{LORE.commissionClaim}</Text>
              </Pressable>
            )}
          </Section>
        ) : null}

        <Section title="Visions">
          <VisionButton
            name={LORE.boostBloodMoonName}
            mechanic={LORE.boostBloodMoonMechanic}
            flavor={LORE.boostBloodMoonFlavor}
            cooldown={bloodMoonCooldown}
            onPress={requestBloodMoon}
          />
          <VisionButton
            name={LORE.boostTimeDilationName}
            mechanic={LORE.boostTimeDilationMechanic}
            flavor={LORE.boostTimeDilationFlavor}
            cooldown={timeDilationCooldown}
            onPress={requestTimeDilation}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Approximate ratio `a/b` as a plain number in [0, 1+). Uses log-space so
 * a Big divisor and dividend don't overflow.
 */
function expDiv(a: { m: number; e: number }, b: { m: number; e: number }): number {
  if (a.m === 0) return 0;
  if (b.m === 0) return 1;
  const lg = Math.log10(a.m) + a.e - (Math.log10(b.m) + b.e);
  if (lg > 6) return 1e6;
  return Math.pow(10, lg);
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
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

function VisionButton({
  name,
  mechanic,
  flavor,
  cooldown,
  onPress,
}: {
  name: string;
  mechanic: string;
  flavor: string;
  cooldown: number;
  onPress: () => void;
}): JSX.Element {
  const ready = cooldown <= 0;
  return (
    <Pressable
      disabled={!ready}
      onPress={onPress}
      style={[styles.vision, !ready && styles.btnDisabled]}
    >
      <Text style={styles.visionName}>{name}</Text>
      <Text style={styles.mechanic}>{mechanic}</Text>
      <Text style={styles.visionFlavor}>{flavor}</Text>
      <Text style={styles.visionCta}>
        {ready ? LORE.boostAdCta : `Available in ${formatDuration(cooldown)}`}
      </Text>
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
  section: {
    marginBottom: space.xl,
  },
  sectionTitle: {
    fontFamily: typography.serif,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.goldFaint,
    paddingBottom: 4,
  },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  statLabel: {
    fontFamily: typography.serif,
    fontSize: 14,
    color: colors.parchmentDim,
    flex: 1,
    marginRight: space.md,
  },
  statValue: {
    fontFamily: typography.serif,
    fontSize: 14,
    color: colors.gold,
    fontVariant: ['tabular-nums'],
  },
  mechanic: {
    fontFamily: typography.serif,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.gold,
    marginTop: 4,
    marginBottom: 4,
    fontVariant: ['tabular-nums'],
  },
  flavor: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.parchmentFaint,
    lineHeight: 20,
    marginBottom: space.sm,
  },
  streak: {
    fontFamily: typography.serif,
    fontSize: 13,
    color: colors.parchmentDim,
    marginBottom: space.md,
  },
  btn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gold,
    padding: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    borderColor: colors.locked,
    opacity: 0.6,
  },
  btnLabel: {
    fontFamily: typography.serif,
    fontSize: 13,
    letterSpacing: 1.6,
    color: colors.parchment,
    textTransform: 'uppercase',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.locked,
    marginTop: space.sm,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold,
  },
  progressLabel: {
    fontFamily: typography.serif,
    fontSize: 12,
    color: colors.parchmentFaint,
    marginBottom: space.sm,
  },
  claimed: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.oxbloodBright,
    marginTop: 4,
  },
  vision: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldFaint,
    padding: 12,
    marginBottom: space.md,
  },
  visionName: {
    fontFamily: typography.serif,
    fontSize: 15,
    color: colors.parchment,
  },
  visionFlavor: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.parchmentFaint,
    marginTop: 4,
    lineHeight: 18,
  },
  visionCta: {
    fontFamily: typography.serif,
    fontSize: 12,
    letterSpacing: 1.4,
    color: colors.gold,
    marginTop: 8,
    textTransform: 'uppercase',
  },
});
