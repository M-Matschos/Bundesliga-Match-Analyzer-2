/**
 * WCAG AA Contrast Ratio Validation Test Suite
 * Validates that all color combinations meet accessibility standards
 *
 * WCAG AA Standard:
 * - Normal text: minimum 4.5:1 contrast ratio
 * - Large text (18pt+): minimum 3:1 contrast ratio
 * - UI components: minimum 3:1 contrast ratio
 */

import { LIGHT_COLORS, DARK_COLORS } from '../../theme/colors'

/**
 * Convert hex color to RGB tuple
 * @param hex Color in hex format (#RRGGBB)
 * @returns RGB tuple [r, g, b]
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [0, 0, 0]
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

/**
 * Get relative luminance of RGB color per WCAG 2.0
 * @param rgb RGB color tuple
 * @returns Relative luminance (0-1)
 */
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two RGB colors
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 is lighter
 * @param rgb1 First color RGB
 * @param rgb2 Second color RGB
 * @returns Contrast ratio (typically 1-21)
 */
function getContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const l1 = getRelativeLuminance(rgb1)
  const l2 = getRelativeLuminance(rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Format contrast ratio for display
 * @param ratio Contrast ratio
 * @returns Formatted string (e.g., "7.2:1")
 */
function formatRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`
}

/**
 * Light Mode Contrast Tests
 */
describe('Light Mode - WCAG AA Contrast Validation', () => {
  it('text (#1A1A1A) vs background (#FFFFFF) >= 4.5:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(LIGHT_COLORS.text),
      hexToRgb(LIGHT_COLORS.background)
    )
    console.log(`Light text vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('textSecond (#4A4A4A) vs background (#FFFFFF) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(LIGHT_COLORS.textSecond),
      hexToRgb(LIGHT_COLORS.background)
    )
    console.log(`Light secondary text vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })

  it('textMuted (#8A8A8A) vs background (#FFFFFF) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(LIGHT_COLORS.textMuted),
      hexToRgb(LIGHT_COLORS.background)
    )
    console.log(`Light muted text vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })

  it('primary blue (#2E75B6) vs background (#FFFFFF) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(LIGHT_COLORS.blue),
      hexToRgb(LIGHT_COLORS.background)
    )
    console.log(`Light blue vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })

  it('green (#2E8B57) vs background (#FFFFFF) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(LIGHT_COLORS.green),
      hexToRgb(LIGHT_COLORS.background)
    )
    console.log(`Light green vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })

  it('red (#C0392B) vs background (#FFFFFF) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(LIGHT_COLORS.red),
      hexToRgb(LIGHT_COLORS.background)
    )
    console.log(`Light red vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })
})

/**
 * Dark Mode Contrast Tests
 */
describe('Dark Mode - WCAG AA Contrast Validation', () => {
  it('text (#ECEFF4) vs background (#0D1B2A) >= 4.5:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(DARK_COLORS.text),
      hexToRgb(DARK_COLORS.background)
    )
    console.log(`Dark text vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('textSecond (#B0BEC5) vs background (#0D1B2A) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(DARK_COLORS.textSecond),
      hexToRgb(DARK_COLORS.background)
    )
    console.log(`Dark secondary text vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })

  it('textMuted (#78909C) vs background (#0D1B2A) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(DARK_COLORS.textMuted),
      hexToRgb(DARK_COLORS.background)
    )
    console.log(`Dark muted text vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })

  it('primary blue (#2E75B6) vs background (#0D1B2A) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(DARK_COLORS.blue),
      hexToRgb(DARK_COLORS.background)
    )
    console.log(`Dark blue vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })

  it('green (#27AE60) vs background (#0D1B2A) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(DARK_COLORS.greenLight),
      hexToRgb(DARK_COLORS.background)
    )
    console.log(`Dark green vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })

  it('red (#C0392B) vs background (#0D1B2A) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(DARK_COLORS.red),
      hexToRgb(DARK_COLORS.background)
    )
    console.log(`Dark red vs background: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })
})

/**
 * Surface/Component Tests
 */
describe('Component Surface - WCAG AA Contrast Validation', () => {
  it('text vs surface (light mode) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(LIGHT_COLORS.text),
      hexToRgb(LIGHT_COLORS.surface)
    )
    console.log(`Light text vs surface: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })

  it('text vs surface (dark mode) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(DARK_COLORS.text),
      hexToRgb(DARK_COLORS.surface)
    )
    console.log(`Dark text vs surface: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })

  it('textSecond vs surface (light mode) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(LIGHT_COLORS.textSecond),
      hexToRgb(LIGHT_COLORS.surface)
    )
    console.log(`Light secondary text vs surface: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })

  it('textSecond vs surface (dark mode) >= 3:1', () => {
    const ratio = getContrastRatio(
      hexToRgb(DARK_COLORS.textSecond),
      hexToRgb(DARK_COLORS.surface)
    )
    console.log(`Dark secondary text vs surface: ${formatRatio(ratio)}`)
    expect(ratio).toBeGreaterThanOrEqual(3)
  })
})

/**
 * Critical Pairs Summary
 */
describe('Contrast Ratio Summary Report', () => {
  it('generates comprehensive contrast report', () => {
    const report = {
      lightMode: {
        textVsBackground: formatRatio(
          getContrastRatio(
            hexToRgb(LIGHT_COLORS.text),
            hexToRgb(LIGHT_COLORS.background)
          )
        ),
        secondaryVsBackground: formatRatio(
          getContrastRatio(
            hexToRgb(LIGHT_COLORS.textSecond),
            hexToRgb(LIGHT_COLORS.background)
          )
        ),
        blueVsBackground: formatRatio(
          getContrastRatio(
            hexToRgb(LIGHT_COLORS.blue),
            hexToRgb(LIGHT_COLORS.background)
          )
        ),
      },
      darkMode: {
        textVsBackground: formatRatio(
          getContrastRatio(
            hexToRgb(DARK_COLORS.text),
            hexToRgb(DARK_COLORS.background)
          )
        ),
        secondaryVsBackground: formatRatio(
          getContrastRatio(
            hexToRgb(DARK_COLORS.textSecond),
            hexToRgb(DARK_COLORS.background)
          )
        ),
        blueVsBackground: formatRatio(
          getContrastRatio(
            hexToRgb(DARK_COLORS.blue),
            hexToRgb(DARK_COLORS.background)
          )
        ),
      },
    }

    console.log('Contrast Ratio Report:')
    console.log(JSON.stringify(report, null, 2))

    expect(true).toBe(true)
  })
})
