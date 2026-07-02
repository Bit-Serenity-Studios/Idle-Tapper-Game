/**
 * Central balance constants. All economy tuning lives here.
 * See BALANCE.md for design rationale.
 */

export const BALANCE = {
  tickRate: 10, // ticks per second
  autoSaveIntervalMs: 15_000,
  baseTapPower: 1, // essence per tap before upgrades
  costMultiplier: 1.15, // cost = baseCost * 1.15^owned
  offlineBaseCapSeconds: 8 * 3600, // 8h base offline vigil
  offlineMaxCapSeconds: 24 * 3600, // 24h with Perpetual Flame research
  offlineRate: 1.0, // fraction of active rate awarded offline

  // Prestige tuning. First Prima Materia at ~1e10 lifetime essence.
  // primaMateria = floor(sqrt(lifetimeEssence / prestigeDivisor))
  prestigeDivisor: 1e10,
  primaMateriaPerPercent: 2, // each PM = +2% global production
  primaMateriaFragmentsForOne: 7, // lunar-phase streak (7 fragments = 1 PM)

  // Milestone tiers: at each owned threshold, generator gains x2.
  milestones: [25, 50, 100, 200, 300, 400] as const,
  milestoneMultiplier: 2,

  // Timed boost defaults.
  bloodMoonMultiplier: 2,
  bloodMoonDurationSeconds: 4 * 60,
  timeDilationSeconds: 3600,
  bloodMoonCooldownSeconds: 30 * 60,
  timeDilationCooldownSeconds: 6 * 3600,
  offlineDoubleCooldownSeconds: 60 * 60,
} as const;

export type BalanceConfig = typeof BALANCE;
