# DECISIONS

Choices made autonomously during the build. Written so a future contributor can revisit them.

## Engine

- **Big-number representation**: mantissa + exponent (`{ m, e }`, break_infinity-style), *not* an arbitrary-precision library. Rationale: idle games only need magnitude, not precision, and a heavyweight library adds bundle size we can't afford on mobile. Enough range for astronomical values (well past 1e10,000) and O(1) for every op.
- **Log-space maths for prestige and max-buy**. Prima Materia gain and `maxBuyable` both compute via `log10` to avoid overflow when values pass 1e308. The tests cover the 1e300+ path explicitly.
- **Tick rate = 10Hz.** Enough resolution for the animated NumberTicker to read smoothly, cheap enough that a background app in a low-power state doesn't feel any drift. Real time is always `Date.now()`, never a frame counter — a JS-thread hitch never desyncs the economy.
- **`clampElapsed` hard-caps at 30 days.** A hand-edited save (e.g. lastSaveMs manually set to 1970) can't award millennia of production. Softer than a "invalidate the save" response; keeps players' progress intact.

## Balance

- **First Prima Materia at 1e10 lifetime Essence.** The prompt's target was "30–45 minutes"; 1e10 is reachable in ~35 min with a reasonable engaged run through the balance table. Tuning knob lives at `BALANCE.prestigeDivisor`.
- **Milestone thresholds at 25/50/100/200/300/400.** Six milestones per generator preserves a long tail past what the prompt's "at least 25/50/100/200" required, giving very late-run players something to keep pushing for.
- **Cost curve 1.15.** Canonical idle exponent — well-understood pacing.
- **Offline rate = 100%.** The prompt required offline to be "strictly worse than active play with vision boosts". Because active play includes taps, upgrades, and vision-multiplied Blood Moons, a 100% baseline is still strictly worse.

## Save

- **Save schema tagged `MOP1:`** so an import can reject non-Magnum-Opus base64. Migrations chain by version and are additive (no destructive migrations). A save that can't be parsed returns `null` — the UI surfaces a diegetic error rather than dropping into a fresh state.
- **Two persisted stores**: game state (`magnum_opus_save_v1`) and settings (`magnum_opus_settings_v1`). Separated so a wipe doesn't reset preferences like haptics.

## Aesthetic

- **EB Garamond bundled at 400 Regular + 400 Regular Italic** via `@expo-google-fonts/eb-garamond`. Static-import the two TTFs directly from the package's weight subpaths — importing from the package root pulls all ten weights into the Metro bundle because the package's `index.js` does top-level `require()`s on every face. `useFonts` in `app/_layout.tsx` gates render on load together with hydrate. No bold face is bundled — the codebase does not use `fontWeight`, and italic is switched by naming a separate family (`EBGaramondItalic`) rather than the CSS `fontStyle` seam, matching the RN custom-font convention.
- **Tab icons are alchemical unicode glyphs (🜍 🜛 ☿ 🜎 🜚) tinted with `Text`,** not raster/SVG icons. Consistent with the "text-and-UI-forward" brief and avoids any asset pipeline.
- **Palette pinned to `theme.ts`** — near-black ink, aged parchment, oxblood, tarnished gold, candle-glow. Dark theme only; the app declares `userInterfaceStyle: "dark"` in `app.json`.
- **Redacted upgrades render as strike-through** in the same slot the upgrade would occupy. Never shown as empty space, so the player has a sense of "there is more here."

## Monetization architecture

- **`AdsService` and `PurchaseService` are pure interfaces** with mock in-dev implementations. Neither native module is initialized at boot — no accidental TAC-eligible integration on a dev build. Swap in real backends by calling `setAdsService()` / `setPurchaseService()` before hydrate.
- **Rewarded ads are diegetic ("Consult the Spirits").** Interstitials do not appear in the UI at all in this build; the seam is there via `AdsService.maybeShowInterstitial(reason)` and is called nowhere yet. Left for the integrator to place at natural pause points (after prestige, on tab background) so the ad frequency is a business decision.

## What was deferred

- **Sound.** The `soundEnabled` toggle exists and is persisted; wiring `expo-av` to short candle-crackle / quill-scratch loops is a small follow-up.
- **Real ad SDK.** The interface is stable; production integration is a swap.
- **Splash / app icons.** Placeholder colored backgrounds. The brand needs an actual mark before ship.
- **A "restore purchases" affordance in Settings.** `PurchaseService.restore()` exists; the button is a five-line addition.

None of these gate first-run playability.
