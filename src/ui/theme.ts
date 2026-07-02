/**
 * Dark-academia palette. Ink-on-parchment inversion — the "parchment" is a warm
 * cream only used for text and glow accents against near-black surfaces.
 */
export const colors = {
  ink: '#1a1612',
  inkDeep: '#0f0c0a',
  inkRaised: '#231d17',
  inkBorder: '#2e2620',
  parchment: '#e8dcc4',
  parchmentDim: '#b5a988',
  parchmentFaint: '#7a7160',
  oxblood: '#6b2f2f',
  oxbloodBright: '#8a3c3c',
  gold: '#b8963e',
  goldDim: '#8a7030',
  goldFaint: '#5c4a20',
  candle: '#ffb968',
  locked: '#3a322a',
  danger: '#a94848',
} as const;

export const typography = {
  serif: 'EBGaramond',
  serifItalic: 'EBGaramondItalic',
  ui: undefined,
} as const;

export const type = {
  display: {
    fontFamily: typography.serif,
    fontSize: 34,
    letterSpacing: 0.5,
    color: colors.parchment,
  },
  heading: {
    fontFamily: typography.serif,
    fontSize: 22,
    letterSpacing: 0.3,
    color: colors.parchment,
  },
  subheading: {
    fontFamily: typography.serif,
    fontSize: 17,
    color: colors.parchmentDim,
  },
  body: {
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 22,
    color: colors.parchmentDim,
  },
  flavor: {
    fontFamily: typography.serifItalic,
    fontStyle: 'italic' as const,
    fontSize: 13,
    lineHeight: 20,
    color: colors.parchmentFaint,
  },
  number: {
    fontFamily: typography.serif,
    fontSize: 34,
    fontVariant: ['tabular-nums' as const],
    color: colors.gold,
  },
  numberSmall: {
    fontFamily: typography.serif,
    fontSize: 15,
    fontVariant: ['tabular-nums' as const],
    color: colors.parchment,
  },
  label: {
    fontFamily: typography.serif,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
    color: colors.parchmentFaint,
  },
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;
