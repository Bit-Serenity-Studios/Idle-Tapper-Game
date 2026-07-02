/**
 * AdsService — thin interface with a mock implementation for dev.
 *
 * The real implementation would wrap `react-native-google-mobile-ads` and use
 * Google's test IDs during development. All game code sits behind this
 * interface so we can swap the real backend in without touching UI or store.
 */

export type RewardKind = 'double_offline' | 'blood_moon' | 'time_dilation';

export interface RewardedAdOutcome {
  granted: boolean;
  reason?: 'no_fill' | 'cancelled' | 'error';
}

export interface AdsService {
  init(): Promise<void>;
  isReady(kind: RewardKind): boolean;
  showRewarded(kind: RewardKind): Promise<RewardedAdOutcome>;
  maybeShowInterstitial(reason: string): Promise<void>;
  setPatronPactActive(active: boolean): void;
}

/**
 * In-dev mock: instantly "grants" the reward without any real network call.
 * Deterministic and offline-safe for tests and CI.
 */
class MockAdsService implements AdsService {
  private patronPactActive = false;

  async init(): Promise<void> {
    /* no-op */
  }

  isReady(_kind: RewardKind): boolean {
    return true;
  }

  async showRewarded(kind: RewardKind): Promise<RewardedAdOutcome> {
    // Simulate a small delay in dev so UI can show a "loading vision" state.
    await new Promise((r) => setTimeout(r, 400));
    if (__DEV__) console.warn(`[MockAds] rewarded ${kind} granted`);
    return { granted: true };
  }

  async maybeShowInterstitial(reason: string): Promise<void> {
    if (this.patronPactActive) return;
    if (__DEV__) console.warn(`[MockAds] would show interstitial (${reason})`);
  }

  setPatronPactActive(active: boolean): void {
    this.patronPactActive = active;
  }
}

let instance: AdsService = new MockAdsService();

export function getAdsService(): AdsService {
  return instance;
}

export function setAdsService(service: AdsService): void {
  instance = service;
}
