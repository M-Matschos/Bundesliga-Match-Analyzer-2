/**
 * Unified Design Token System
 * Shared across Desktop (React) + Mobile (React Native)
 *
 * Version: 1.0.0
 * Last Updated: 2026-04-25
 *
 * This is the SINGLE SOURCE OF TRUTH for all visual design.
 * No hardcoded colors, spacing, or typography in components.
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const COLORS = {
  // ---- Semantic Colors (Use these in components) ----

  // Primary - Main brand color (CTA, Primary Actions)
  primary: {
    default: '#3b82f6', // Blue 500
    hover: '#2563eb', // Blue 600
    active: '#1d4ed8', // Blue 700
    disabled: '#93c5fd', // Blue 300
    light: '#eff6ff', // Blue 50
  },

  // Danger - Destructive & Error states
  danger: {
    default: '#dc2626', // Red 600
    hover: '#b91c1c', // Red 700
    active: '#991b1b', // Red 800
    disabled: '#fca5a5', // Red 300
    light: '#fee2e2', // Red 50
  },

  // Success - Positive feedback & Confirmations
  success: {
    default: '#10b981', // Emerald 500
    hover: '#059669', // Emerald 600
    active: '#047857', // Emerald 700
    disabled: '#a7f3d0', // Emerald 300
    light: '#ecfdf5', // Emerald 50
  },

  // Warning - Alerts & Cautions
  warning: {
    default: '#f59e0b', // Amber 500
    hover: '#d97706', // Amber 600
    active: '#b45309', // Amber 700
    disabled: '#fcd34d', // Amber 300
    light: '#fffbeb', // Amber 50
  },

  // Info - Informational messages
  info: {
    default: '#06b6d4', // Cyan 500
    hover: '#0891b2', // Cyan 600
    active: '#0e7490', // Cyan 700
    disabled: '#a5f3fc', // Cyan 300
    light: '#ecf8ff', // Cyan 50
  },

  // ---- Neutral Colors (Background, Surface, Text) ----

  // Background - Darkest (main page background)
  background: '#0f172a', // Slate 900

  // Surface - Dark (cards, containers)
  surface: '#1e293b', // Slate 800

  // Border - UI element borders
  border: '#334155', // Slate 700

  // Text - Primary text color
  text: {
    primary: '#e2e8f0', // Slate 100 (white-ish)
    secondary: '#cbd5e1', // Slate 300 (gray)
    muted: '#94a3b8', // Slate 400 (dimmer)
    inverse: '#0f172a', // Slate 900 (for light backgrounds)
  },

  // ---- Confidence Score Colors (Football Predictions) ----

  confidenceHigh: '#10b981', // Green (High confidence)
  confidenceMedium: '#f59e0b', // Amber (Medium confidence)
  confidenceLow: '#ef4444', // Red (Low confidence)

  // ---- League Colors (Bundesliga Branding) ----

  leagues: {
    bundesliga: '#DD0000', // Official Bundesliga red
    bundesliga2: '#009900', // 2. Bundesliga green
    dfbPokal: '#FFD700', // DFB-Pokal gold
  },

  // ---- Outcome Probability Colors ----

  outcomes: {
    homeWin: '#3b82f6', // Blue
    draw: '#f59e0b', // Amber
    awayWin: '#ef4444', // Red
  },

  // ---- Gradient (Background) ----

  gradient: {
    start: '#0f172a', // From (dark blue)
    end: '#1e293b', // To (darker blue)
  },
}

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const TYPOGRAPHY = {
  // Font family stack (system fonts, no external files)
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',

  // Heading scale (h1 → h6 equivalent)
  heading: {
    xl: {
      size: 32,
      weight: 700,
      lineHeight: 1.2,
    },
    lg: {
      size: 24,
      weight: 700,
      lineHeight: 1.2,
    },
    md: {
      size: 20,
      weight: 600,
      lineHeight: 1.3,
    },
    sm: {
      size: 18,
      weight: 600,
      lineHeight: 1.4,
    },
  },

  // Body text scale (paragraphs, descriptions)
  body: {
    lg: {
      size: 16,
      weight: 400,
      lineHeight: 1.5,
    },
    md: {
      size: 14,
      weight: 400,
      lineHeight: 1.5,
    },
    sm: {
      size: 13,
      weight: 400,
      lineHeight: 1.4,
    },
  },

  // Label scale (form labels, badges, small text)
  label: {
    lg: {
      size: 14,
      weight: 600,
      lineHeight: 1.4,
      textTransform: 'uppercase' as const,
    },
    md: {
      size: 12,
      weight: 600,
      lineHeight: 1.4,
      textTransform: 'uppercase' as const,
    },
    sm: {
      size: 11,
      weight: 600,
      lineHeight: 1.3,
      textTransform: 'uppercase' as const,
    },
  },

  // Code text (monospace)
  code: {
    size: 13,
    weight: 500,
    fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    lineHeight: 1.5,
  },
}

// ============================================================================
// SPACING TOKENS (8px base unit)
// ============================================================================

export const SPACING = {
  xs: 4, // Tiny gaps
  sm: 8, // Small gaps (form field spacing)
  md: 16, // Medium gaps (component padding)
  lg: 24, // Large gaps (section spacing)
  xl: 32, // Extra large (major sections)
  xxl: 48, // Double extra large (page margins)
}

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const BORDER_RADIUS = {
  sm: 4, // Subtle (small elements)
  md: 6, // Default (inputs, buttons)
  lg: 12, // Rounded (cards)
  full: 9999, // Fully rounded (circles, pills)
}

// ============================================================================
// ELEVATION / SHADOW TOKENS
// ============================================================================

export const ELEVATION = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
}

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const ANIMATION = {
  duration: {
    fast: 150, // ms
    normal: 300, // ms
    slow: 500, // ms
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
}

// ============================================================================
// RESPONSIVE BREAKPOINTS (Mobile-first)
// ============================================================================

export const BREAKPOINTS = {
  xs: 0, // Mobile (default)
  sm: 640, // Tablet
  md: 768, // Tablet landscape
  lg: 1024, // Desktop
  xl: 1280, // Large desktop
  xxl: 1536, // Extra large
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get responsive spacing value
 * Usage: getSpacing('sm') → 8
 */
export function getSpacing(size: keyof typeof SPACING): number {
  return SPACING[size]
}

/**
 * Get color by confidence level (0-1)
 * 0.0-0.4 = Low (red)
 * 0.4-0.7 = Medium (amber)
 * 0.7-1.0 = High (green)
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.7) return COLORS.confidenceHigh
  if (confidence >= 0.4) return COLORS.confidenceMedium
  return COLORS.confidenceLow
}

/**
 * Get outcome color (home/draw/away)
 * Usage: getOutcomeColor('homeWin') → blue
 */
export function getOutcomeColor(
  outcome: 'homeWin' | 'draw' | 'awayWin'
): string {
  return COLORS.outcomes[outcome]
}

/**
 * Get league color by name
 * Usage: getLeagueColor('bundesliga') → red
 */
export function getLeagueColor(league: keyof typeof COLORS.leagues): string {
  return COLORS.leagues[league]
}

// ============================================================================
// PRESET COMBINATIONS (For convenience)
// ============================================================================

/**
 * Button variants (predefined combinations)
 */
export const BUTTON_STYLES = {
  primary: {
    background: COLORS.primary.default,
    color: COLORS.text.primary,
    hover: COLORS.primary.hover,
    active: COLORS.primary.active,
  },
  secondary: {
    background: COLORS.surface,
    color: COLORS.text.primary,
    border: COLORS.border,
    hover: COLORS.border,
  },
  danger: {
    background: COLORS.danger.default,
    color: COLORS.text.primary,
    hover: COLORS.danger.hover,
    active: COLORS.danger.active,
  },
  ghost: {
    background: 'transparent',
    color: COLORS.primary.default,
    hover: COLORS.primary.light,
    border: COLORS.primary.default,
  },
}

/**
 * Input variants
 */
export const INPUT_STYLES = {
  default: {
    border: COLORS.border,
    background: COLORS.surface,
    color: COLORS.text.primary,
    placeholder: COLORS.text.muted,
  },
  focus: {
    border: COLORS.primary.default,
    background: COLORS.background,
    boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.1)`,
  },
  error: {
    border: COLORS.danger.default,
    background: COLORS.background,
    boxShadow: `0 0 0 3px rgba(220, 38, 38, 0.1)`,
  },
  success: {
    border: COLORS.success.default,
    background: COLORS.background,
    boxShadow: `0 0 0 3px rgba(16, 185, 129, 0.1)`,
  },
}

// ============================================================================
// EXPORT AS DEFAULT FOR CONVENIENCE
// ============================================================================

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  ELEVATION,
  ANIMATION,
  BREAKPOINTS,
  getSpacing,
  getConfidenceColor,
  getOutcomeColor,
  getLeagueColor,
  BUTTON_STYLES,
  INPUT_STYLES,
}
