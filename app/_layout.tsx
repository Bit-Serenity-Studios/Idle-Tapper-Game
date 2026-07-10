import ebGaramondItalic from '@expo-google-fonts/eb-garamond/400Regular_Italic/EBGaramond_400Regular_Italic.ttf';
import ebGaramondRegular from '@expo-google-fonts/eb-garamond/400Regular/EBGaramond_400Regular.ttf';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { newLiveState } from '@/engine/save';
import { SaveService } from '@/services/SaveService';
import { getAdsService } from '@/services/AdsService';
import { getPurchaseService } from '@/services/PurchaseService';
import { useGameStore } from '@/store/gameStore';
import { useSettings } from '@/store/settingsStore';
import { useTick } from '@/ui/hooks/useTick';
import { colors } from '@/ui/theme';

/**
 * Boot: load save (or start fresh), apply offline vigil, roll a daily
 * commission if needed, wire the tick + auto-save loop.
 */
export default function RootLayout(): JSX.Element {
  const hydrated = useGameStore((s) => s.hydrated);
  const [bootError, setBootError] = useState<string | null>(null);
  const loadSettings = useSettings((s) => s.load);
  const [fontsLoaded] = useFonts({
    EBGaramond: ebGaramondRegular,
    EBGaramondItalic: ebGaramondItalic,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([loadSettings(), getAdsService().init(), getPurchaseService().init()]);
        if (cancelled) return;
        const saved = await SaveService.load();
        const now = Date.now();
        const state = saved ?? newLiveState(now);
        useGameStore.getState().hydrate(state, now);
        if (saved) {
          // Credit offline earnings and open the vigil summary on the study.
          useGameStore.getState().applyOffline(now);
        }
        useGameStore.getState().rollDailyCommission(now);
        getAdsService().setPatronPactActive(useGameStore.getState().removeAdsPurchased);
      } catch (err) {
        if (__DEV__) console.warn('[boot] failed', err);
        setBootError(String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadSettings]);

  useTick((state) => {
    void SaveService.save(state);
  });

  if (bootError) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorScreen}>
          <StatusBar style="light" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!hydrated || !fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={styles.boot}>
          <StatusBar style="light" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ink } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  errorScreen: {
    flex: 1,
    backgroundColor: colors.ink,
  },
});
