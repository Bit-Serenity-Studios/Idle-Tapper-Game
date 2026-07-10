import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LORE } from '@/content/lore';
import { getAdsService } from '@/services/AdsService';
import { getPurchaseService } from '@/services/PurchaseService';
import { SaveService } from '@/services/SaveService';
import { useGameStore } from '@/store/gameStore';
import { useSettings } from '@/store/settingsStore';
import { colors, space, typography } from '@/ui/theme';

export default function SettingsScreen(): JSX.Element {
  const hapticsEnabled = useSettings((s) => s.hapticsEnabled);
  const soundEnabled = useSettings((s) => s.soundEnabled);
  const setHaptics = useSettings((s) => s.setHaptics);
  const setSound = useSettings((s) => s.setSound);
  const removeAdsPurchased = useGameStore((s) => s.removeAdsPurchased);
  const purchasePatronPact = useGameStore((s) => s.purchasePatronPact);
  const wipe = useGameStore((s) => s.wipe);
  const hydrate = useGameStore((s) => s.hydrate);

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const doExport = async (): Promise<void> => {
    const encoded = SaveService.exportString(useGameStore.getState());
    await Clipboard.setStringAsync(encoded);
    Alert.alert('Sealed', 'The sigil has been copied to your device.');
  };

  const doImport = (): void => {
    setImportError(null);
    const state = SaveService.importString(importText.trim());
    if (!state) {
      setImportError('The seal is broken but the words within do not resolve.');
      return;
    }
    hydrate(state, Date.now());
    void SaveService.save(state);
    setImportText('');
    setImportOpen(false);
  };

  const doWipe = (): void => {
    Alert.alert(LORE.settingsWipe, LORE.settingsWipeConfirm, [
      { text: 'Stay the hand', style: 'cancel' },
      {
        text: 'Cast it in',
        style: 'destructive',
        onPress: () => {
          const now = Date.now();
          wipe(now);
          void SaveService.clear();
        },
      },
    ]);
  };

  const doPurchase = async (): Promise<void> => {
    const outcome = await getPurchaseService().purchase('remove_ads');
    if (outcome.success) {
      purchasePatronPact();
      getAdsService().setPatronPactActive(true);
      Alert.alert(LORE.patronPact, LORE.patronPactPurchased);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.list}>
        <Section title="Preferences">
          <Row label={LORE.settingsHaptics}>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHaptics}
              trackColor={{ true: colors.gold, false: colors.locked }}
              thumbColor={colors.parchment}
            />
          </Row>
          <Row label={LORE.settingsSound}>
            <Switch
              value={soundEnabled}
              onValueChange={setSound}
              trackColor={{ true: colors.gold, false: colors.locked }}
              thumbColor={colors.parchment}
            />
          </Row>
        </Section>

        <Section title="The Patron’s Pact">
          <Text style={styles.mechanic}>{LORE.patronPactMechanic}</Text>
          <Text style={styles.flavor}>{LORE.patronPactBody}</Text>
          <Pressable
            onPress={doPurchase}
            disabled={removeAdsPurchased}
            style={[styles.btn, removeAdsPurchased && styles.btnDisabled]}
          >
            <Text style={styles.btnLabel}>
              {removeAdsPurchased ? 'Signed' : `Sign the Pact — ${LORE.patronPactPrice}`}
            </Text>
          </Pressable>
        </Section>

        <Section title="The Sigil">
          <Pressable onPress={doExport} style={styles.btn}>
            <Text style={styles.btnLabel}>{LORE.settingsExport}</Text>
          </Pressable>
          <Pressable onPress={() => setImportOpen(true)} style={styles.btn}>
            <Text style={styles.btnLabel}>{LORE.settingsImport}</Text>
          </Pressable>
        </Section>

        <Section title="Danger">
          <Pressable onPress={doWipe} style={[styles.btn, styles.btnDanger]}>
            <Text style={styles.btnLabel}>{LORE.settingsWipe}</Text>
          </Pressable>
        </Section>
      </ScrollView>

      <Modal visible={importOpen} transparent animationType="fade" onRequestClose={() => setImportOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{LORE.settingsImport}</Text>
            <TextInput
              value={importText}
              onChangeText={setImportText}
              multiline
              placeholder="MOP1:..."
              placeholderTextColor={colors.parchmentFaint}
              style={styles.textArea}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {importError ? <Text style={styles.error}>{importError}</Text> : null}
            <View style={styles.cardActions}>
              <Pressable onPress={() => setImportOpen(false)} style={styles.btn}>
                <Text style={styles.btnLabel}>Cancel</Text>
              </Pressable>
              <Pressable onPress={doImport} style={[styles.btn, styles.btnPrimary]}>
                <Text style={styles.btnLabel}>Break the Sigil</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLabel: {
    fontFamily: typography.serif,
    fontSize: 14,
    color: colors.parchmentDim,
  },
  mechanic: {
    fontFamily: typography.serif,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.gold,
    marginBottom: 4,
    fontVariant: ['tabular-nums'],
  },
  flavor: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.parchmentFaint,
    lineHeight: 20,
    marginBottom: space.md,
  },
  btn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldFaint,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: space.sm,
  },
  btnPrimary: {
    borderColor: colors.gold,
    backgroundColor: colors.inkRaised,
  },
  btnDanger: {
    borderColor: colors.danger,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnLabel: {
    fontFamily: typography.serif,
    fontSize: 13,
    letterSpacing: 1.4,
    color: colors.parchment,
    textTransform: 'uppercase',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: space.xl,
  },
  card: {
    backgroundColor: colors.inkRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gold,
    padding: space.xl,
  },
  cardTitle: {
    fontFamily: typography.serif,
    fontSize: 18,
    color: colors.parchment,
    textAlign: 'center',
    marginBottom: space.md,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  textArea: {
    fontFamily: typography.serif,
    fontSize: 12,
    color: colors.parchment,
    backgroundColor: colors.ink,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldFaint,
    padding: space.md,
    minHeight: 100,
    marginBottom: space.md,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  error: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic',
    color: colors.danger,
    fontSize: 13,
    marginBottom: space.sm,
  },
});
