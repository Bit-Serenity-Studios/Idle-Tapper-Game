/**
 * Central store for all flavor text that is not tightly bound to a
 * generator/upgrade definition. Edit here to tune the writing without
 * hunting through screens.
 *
 * A single voice — dark academia, restrained, faintly ominous.
 * Nothing modern. No slang. No pop-culture nods.
 */

export const LORE = {
  studyTitle: 'The Study',
  distillLabel: 'Distill',
  distillHint: 'Press the flame to distil a measure of Essence by hand.',
  essenceLabel: 'Essence',
  productionSuffix: '/s',

  emptyApparatus:
    'No apparatus stands. The shelves are dark. The hand must do the work of many, for now.',

  grimoireTitle: 'The Grimoire',
  grimoireApparatus: 'Apparatus',
  grimoireForbidden: 'Forbidden Knowledge',
  redactedName: 'A page torn from something older…',
  redactedFlavor: 'The text has been struck through. What remains is a cost, and a promise.',
  lockedUpgradeHint: (name: string, count: number) =>
    `Requires ${count} ${name} to reveal.`,

  greatWorkTitle: 'The Great Work',
  greatWorkPreamble:
    'To complete a stage of the Work is to burn away what has been built and be paid, in the coin of the world beneath, for what remained. Nothing endures but the Prima Materia — and what you have inscribed with it.',
  greatWorkConfirm: 'Complete the Work?',
  greatWorkCancel: 'Not yet.',
  greatWorkStageLabel: 'Present stage',
  greatWorkGainLabel: 'Prima Materia to be gained',
  greatWorkProjectedMultiplier: 'Total production multiplier after the Work',
  greatWorkInsufficient: 'You have not yet distilled enough Essence to complete a stage.',

  ledgerTitle: 'The Ledger',
  ledgerLifetime: 'Essence distilled, lifetime',
  ledgerRun: 'Essence distilled, this stage',
  ledgerTaps: 'Distillations by hand',
  ledgerPrestiges: 'Stages of the Work completed',
  ledgerTimePlayed: 'Time in the study',
  ledgerRate: 'Present rate',

  settingsTitle: 'Settings',
  settingsExport: 'Seal the Sigil (export)',
  settingsImport: 'Break the Sigil (import)',
  settingsWipe: 'Cast the Grimoire into the fire',
  settingsWipeConfirm:
    'This will burn every page. There is no cinder from which to remake it. Are you certain?',
  settingsHaptics: 'Tremor of the hand (haptics)',
  settingsSound: 'Sound of the flame',
  settingsRemoveAds: 'The Patron’s Pact',

  offlineTitle: 'The Long Vigil',
  offlineBody: (formatted: string, duration: string) =>
    `While you kept the long vigil these ${duration}, the athanor burned on. ${formatted} Essence has been distilled.`,
  offlineDouble: 'Consult the Spirits',
  offlineDoubleHint: 'Sacrifice a vision to double what was distilled.',
  offlineClaim: 'Accept',
  offlineCapReached: (dropped: string) =>
    `The vessel would take no more. ${dropped} of your vigil went uncredited.`,

  boostBloodMoonName: 'Blood Moon',
  boostBloodMoonFlavor: 'For four minutes, the study distils twice as fast.',
  boostTimeDilationName: 'Time Dilation Ritual',
  boostTimeDilationFlavor: 'A single hour of the Work, compressed into the present moment.',
  boostAdCta: 'Consult the Spirits (watch a vision)',

  commissionTitle: 'A Commission',
  commissionFlavor:
    'A letter arrived under the door, with no seal. You are asked to distil a certain measure by dawn.',
  commissionProgress: 'Progress',
  commissionClaim: 'Claim the fee',
  commissionExpired: 'The candle guttered. The patron has departed.',

  lunarTitle: 'Lunar Phases',
  lunarFlavor: (day: number) =>
    `The moon shows its ${['new', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full', 'waning gibbous', 'last quarter'][day - 1] ?? 'shrouded'} face.`,
  lunarClaim: 'Attend the moon',
  lunarAlreadyClaimed: 'You have attended the moon already tonight.',

  patronPact: 'The Patron’s Pact',
  patronPactBody:
    'A patron of a certain kind will remove the interstitial visions from your practice, and shorten the cooldown of the spirits you consult.',
  patronPactPrice: '$4.99',
  patronPactPurchased: 'Signed. The interstitials are stilled.',

  wipeToast: 'The study is dark. The apparatus is cold. Begin again.',
} as const;
