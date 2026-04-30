import { useContext, useEffect, useState } from 'react'
import { ThemeContext, useTheme as useThemeContext } from '../context/ThemeContext'
import { getColors, DARK_COLORS, LIGHT_COLORS } from '../theme/colors'
import type { ThemeMode } from '../context/ThemeContext'

/**
 * Get theme colors for a specific mode
 * @param theme Theme mode ('light' or 'dark')
 * @returns Color palette object
 */
export function getThemeColors(theme: ThemeMode = 'dark') {
  return getColors(theme)
}

/**
 * Check if current theme is dark mode
 * @returns true if dark mode, false if light mode
 */
export function isDarkMode(): boolean {
  try {
    const context = useContext(ThemeContext)
    if (context === undefined) {
      // Fallback to dark mode if no provider
      return true
    }
    return context.mode === 'dark'
  } catch {
    // Safely handle context errors
    return true
  }
}

/**
 * Hook to get current theme colors with automatic updates
 * Subscribes to theme changes and returns updated colors
 * @returns Color palette object that updates when theme mode changes
 */
export function useThemeColors() {
  const { mode } = useThemeContext()
  const [colors, setColors] = useState(() => getColors(mode))

  useEffect(() => {
    setColors(getColors(mode))
  }, [mode])

  return colors
}

// Re-export useTheme hook from context for convenience
export { useTheme } from '../context/ThemeContext'
export type { ThemeMode } from '../context/ThemeContext'

// Export color palettes for direct access if needed
export { DARK_COLORS, LIGHT_COLORS, getColors }
