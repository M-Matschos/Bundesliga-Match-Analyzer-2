/**
 * Match Oracle — Design System
 * Farben, Schriften, Abstände
 */

export const COLORS = {
  // Hintergrund (Dark Mode)
  background:   '#0D1B2A',
  surface:      '#152336',
  surfaceHigh:  '#1E3148',
  border:       '#2A4060',

  // Primärfarben
  primary:     '#1A3A5C',
  blue:        '#2E75B6',
  blueLight:   '#4A90C4',
  purple:      '#6B3FA0',

  // Status-Farben
  green:       '#1E7B4B',
  greenLight:  '#27AE60',
  orange:      '#E67E22',
  red:         '#C0392B',
  yellow:      '#F39C12',

  // Konfidenz
  confidenceHigh:   '#27AE60',
  confidenceMed:    '#F39C12',
  confidenceLow:    '#C0392B',

  // Text
  text:        '#ECEFF4',
  textSecond:  '#B0BEC5',
  textMuted:   '#78909C',

  // Value Bet Highlight
  valueBet:    '#F1C40F',
  valueBetBg:  '#2A2200',
}

export const FONTS = {
  regular:  'System',
  medium:   'System',
  bold:     'System',
}

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
}

export const RADIUS = {
  sm:   6,
  md:   10,
  lg:   16,
  full: 999,
}

/** Konvertiert Wahrscheinlichkeit (0–1) in Konfidenz-Farbe */
export function confidenceColor(label: 'HOCH' | 'MITTEL' | 'NIEDRIG'): string {
  if (label === 'HOCH')   return COLORS.confidenceHigh
  if (label === 'MITTEL') return COLORS.confidenceMed
  return COLORS.confidenceLow
}

/** Formatiert Wahrscheinlichkeit als Prozent-String */
export function formatProb(prob: number): string {
  return `${Math.round(prob * 100)}%`
}

/** Outcome Farben (Home/Draw/Away) */
export const OUTCOMES = {
  homeWin: COLORS.greenLight,    // Home gewinnt → Grün
  draw: COLORS.yellow,            // Unentschieden → Gelb
  awayWin: COLORS.red,            // Gast gewinnt → Rot
}

/** Liga-Farben */
export const LEAGUES = {
  bundesliga: '#D00',      // Rot (Bundesliga 1)
  bundesliga2: '#FDD835',  // Gelb (Bundesliga 2)
  dfbPokal: '#003da5',     // Blau (DFB-Pokal)
}

export const ELEVATION = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.3)',
  md: '0 2px 4px rgba(0,0,0,0.3)',
  lg: '0 4px 8px rgba(0,0,0,0.3)',
  xl: '0 8px 16px rgba(0,0,0,0.3)',
}
