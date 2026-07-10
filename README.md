# Magnum Opus

> *A scholar of the forbidden arts, alone in a candlelit study, transmuting base matter toward the Philosopher's Stone.*

An idle/incremental mobile game built with **Expo (SDK 52+)**, **React Native**, and **TypeScript**. The core currency is **Essence**, distilled by hand and then by an expanding apparatus of alembics, apprentices, and ritual circles.

The reference points are *Magic Research 2* and *Idle Pact* — restrained dark academia, mechanical density, quiet immersion, writing as art direction.

---

## Setup

```bash
npm install
```

## Run

```bash
npx expo start          # start the Metro bundler
npx expo start --ios    # iOS simulator
npx expo start --android
```

## Quality

```bash
npm test          # Jest — 48 unit tests over the engine
npm run typecheck # TypeScript strict, no `any`
npm run lint      # ESLint + Prettier
```

---

## Architecture at a glance

```
/app                 expo-router entry + tab screens
  /_layout.tsx       boot: load save, apply offline, wire tick + auto-save
  /(tabs)/           Study, Grimoire, Great Work, Ledger, Settings
/src
  /engine            pure TypeScript — zero React imports
    bigNumber.ts     mantissa+exponent big-number type
    format.ts        K/M/B/...aa/ab/... formatter + unit tests
    generators.ts    cost curves, bulk-buy math, production
    upgrades.ts      effect aggregation
    prestige.ts      Prima Materia sqrt formula, transmutations
    offline.ts       long-vigil earnings with cap
    save.ts          versioned schema + migrations + base64 export
    tick.ts          per-frame math
    balance.ts       ALL economy tuning lives here — see BALANCE.md
  /content           editable-in-one-place data + prose
    generators.ts    the eight tiers of apparatus
    upgrades.ts      apparatus + forbidden knowledge
    transmutations.ts    prestige tree
    lore.ts          flavor + UI copy
  /store             Zustand game store + settings store
  /services          Save, Ads (mock), Purchase (mock)
  /ui                theme + components + hooks
/__tests__           engine unit tests (Jest)
```

**The engine is React-free.** Every math primitive can be tested in Node without a mock DOM or React Native shim; the tests run in a plain `node` Jest environment. The Zustand store is the seam between engine and UI.

## Persistence

Auto-save every 15 seconds and on background (`AppState.change`). The save schema is versioned (`CURRENT_SAVE_VERSION`, `migrate()` in `src/engine/save.ts`); migrations chain incrementally, so a legacy save is upgraded to the current version at load time or the file is rejected as unparseable.

Export/import happens as a base64 string with a `MOP1:` tag, copied to the clipboard from Settings.

Anti-cheat lite: `clampElapsed` refuses negative time deltas and hard-caps a resumed save at 30 days, so a hand-edited save can't award millennia of production.

## Monetization

Everything sits behind `AdsService` and `PurchaseService` interfaces. The dev mocks grant rewards immediately and log to the console. Wire in `react-native-google-mobile-ads` with test IDs and (optionally) RevenueCat by swapping in a real implementation via `setAdsService` / `setPurchaseService`.

Rewarded ads are themed as **Visions**:
- *Consult the Spirits* — double the offline vigil after resume
- **Blood Moon** — 2x production for 4 minutes
- **Time Dilation Ritual** — bank an hour of the Work

The IAP is **The Patron's Pact** ($4.99): removes interstitials, shortens vision cooldowns for the holder (theme reasonable — do not hide any rewarded content behind the pact).

## Performance

- Zustand granular selectors: the `GeneratorRow` for a single tier only re-renders when *its* count, the essence total, or the buy quantity changes.
- All animations are `useNativeDriver: true` — the candle flicker, the tap ring, the floating gain.
- The tick loop uses `dt` from `Date.now()`, never a frame counter, so a JS-thread hitch never drifts the economy.
- The tick loop runs at 10Hz — cheap, and reads well.
- The `NumberTicker` interpolates in *log space* between values, so a jump from 1e5 → 1e15 animates smoothly rather than snapping.

## What isn't wired

- No real ad SDK. The mock in `src/services/AdsService.ts` grants every reward. Swap for a real implementation to test on device.
- No real IAP SDK.
- No tab icon PNGs — icons are alchemical unicode characters styled as tinted text.
- Splash / app icons are placeholder colored backgrounds.
- Sound (candle crackle, quill scratch) is a settings toggle only — audio not yet wired.

Each of these is a small, focused follow-up.

## Documents

- [BALANCE.md](./BALANCE.md) — economy tuning + rationale
- [LORE.md](./LORE.md) — all flavor text compiled
- [DECISIONS.md](./DECISIONS.md) — design decisions made autonomously
