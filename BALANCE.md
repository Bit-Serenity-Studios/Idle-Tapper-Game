# BALANCE

All economy constants live in `src/engine/balance.ts`. This document explains *why* each one has its current value.

## Design targets

| Milestone | Target time |
|---|---|
| First Copper Alembic affordable | <10 distills |
| Apprentice (tier 2) unlocks | <2 minutes |
| First Great Work (prestige) viable | 30–45 minutes |
| Each subsequent prestige | ~20% faster than the last |
| Offline vigil (default cap) | 8 hours, "generous enough to come back for, strictly worse than active with visions" |

## Tap + generator curves

`BALANCE.baseTapPower = 1` — one Essence per hand distillation.

`BALANCE.costMultiplier = 1.15` — every purchased generator raises its next-cost by 15%. This is the canonical idle exponent (Cookie Clicker, Adventure Capitalist). It gives 25 generators for roughly the cost of the first 20, which pairs well with milestone tiers at 25/50/100/200.

Eight generator tiers ordered by cost. Each is ~10× more expensive and ~7–8× more productive than the tier below it — later tiers dominate but never wholly obsolete the earlier ones, so early-tier upgrades in the Grimoire remain meaningful in a late run.

| Tier | Base cost | Base /s |
|---|---|---|
| Copper Alembic | 10 | 0.1 |
| Apprentice | 100 | 1 |
| Athanor | 1,100 | 8 |
| Ritual Circle | 12,000 | 47 |
| Bound Homunculus | 130,000 | 260 |
| Occult Library | 1.4 M | 1.4 K |
| Lunar Observatory | 20 M | 7.8 K |
| The Inner Sanctum | 330 M | 44 K |

## Milestones

`BALANCE.milestones = [25, 50, 100, 200, 300, 400]` at `x2` each. Owning 200 of a tier gives 16× baseline output for that tier — a strong incentive to keep buying past the point where the next tier costs less. This yields the "long tail" reading many idles rely on.

## Prestige (`primaMateria = floor(sqrt(lifetime / prestigeDivisor))`)

`BALANCE.prestigeDivisor = 1e10`. First Prima Materia at exactly 1e10 lifetime Essence.

With active play — hitting the Distill button early, buying the tap upgrades from Forbidden Knowledge (5x, 25x), then keeping the top three tiers stocked — 1e10 Essence is reachable in ~35 minutes on a fresh account. Passive-only play lands in the low hour range.

Each Prima Materia grants `+2%` global production (`primaMateriaPerPercent = 2`). At 50 PM you have a 2x multiplier; at 100 PM a 3x; the effect is linear, not compounding, so it never overtakes the transmutation multipliers.

Prestige cycle acceleration comes from three sources:

1. Linear PM bonus (kept run over run).
2. Transmutations bought in the Great Work tree — the four *Shards of the Work* (2x, 3x, cost-reduction, 2x) stack multiplicatively.
3. `Inheritance` / `Greater Inheritance` transmutations grant starting Essence, saving the first few minutes of every subsequent run.

Combined, a second prestige typically runs ~25% faster than the first, converging toward the promised 20% gain per cycle by the 3rd–4th.

## Offline (`The Long Vigil`)

- Default cap: 8 hours (`offlineBaseCapSeconds`).
- Perpetual Flame upgrade extends the cap to 24 hours (`offlineMaxCapSeconds`).
- Default rate: 100% of live rate (`offlineRate = 1.0`). Explicitly worse than active play, since active play compounds visions + taps + purchases; offline is a straight-line credit at the last known rate.
- The vigil "double" reward-ad has a 60-minute cooldown so it can't be spammed by resuming the app repeatedly.

## Timed boosts

| Boost | Duration | Cooldown |
|---|---|---|
| Blood Moon (2× production) | 4 minutes | 30 minutes |
| Time Dilation (bank 1 hour of ticks) | Immediate | 6 hours |
| Offline double | Immediate | 1 hour |

Blood Moon's cooldown is intentionally short so an engaged player can chain a few over a session; Time Dilation is long-cooldown so it retains the "special ritual" reading.

## Milestone check against targets

Concrete first-session run through the balance:

1. **Taps 1–10** → 10 Essence, buy Copper Alembic 1. Cost 10, hits at exactly 10 distills.
2. **~2 min** → around 60–80 Essence from taps + passive drips. Apprentice at 100 unlocks after ~2 minutes of active play, hitting the 2nd-target window.
3. **~35 min** → chain into Athanor (1.1K), Ritual Circle (12K), and start the Bound Homunculus line, plus purchase *The Hand That Pours* (500 Essence → 5x tap) and *Emerald Tablet* (100K → 2x global). Lifetime crosses 1e10, first Great Work available. Meets the 30–45 min target.
4. **Post-prestige runs** → starting global mult of 1.02x (1 PM), plus `Shard of Nigredo` (2x) if bought → 2.04x. Cost-reduction `Shard of Citrinitas` at 5 PM makes tier upgrades ~15% cheaper. Each cycle compresses.

## When you rebalance

Every value that matters lives in `src/engine/balance.ts` and `src/content/{generators,upgrades,transmutations}.ts`. Change a number, re-run `npm test` (the generator tests bake in the "first-alembic-in-<10 distills" invariant so a wildly wrong new value fails immediately), and re-check the first-session table above.
