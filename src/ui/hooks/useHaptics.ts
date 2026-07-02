import * as Haptics from 'expo-haptics';
import { useCallback, useMemo } from 'react';

import { useSettings } from '@/store/settingsStore';

export function useHaptics(): {
  light: () => void;
  medium: () => void;
  success: () => void;
  warning: () => void;
} {
  const enabled = useSettings((s) => s.hapticsEnabled);
  const light = useCallback(() => {
    if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [enabled]);
  const medium = useCallback(() => {
    if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [enabled]);
  const success = useCallback(() => {
    if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [enabled]);
  const warning = useCallback(() => {
    if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [enabled]);
  return useMemo(() => ({ light, medium, success, warning }), [light, medium, success, warning]);
}
