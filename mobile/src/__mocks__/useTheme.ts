// Mock für hooks/useTheme — re-exportiert aus ThemeContext-Mock
export { useTheme, ThemeProvider } from './ThemeContext'
export type { ThemeMode } from './ThemeContext'

export const useThemeColors = jest.fn(() => ({
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecond: '#4A4A4A',
  textMuted: '#8A8A8A',
  surface: '#F5F7FA',
  border: '#D0D7E1',
  blue: '#2E75B6',
  green: '#27AE60',
  greenLight: '#2ECC71',
  red: '#E74C3C',
  orange: '#E67E22',
  yellow: '#F1C40F',
  confidenceHigh: '#27AE60',
  confidenceMedium: '#E67E22',
  confidenceLow: '#E74C3C',
}))

export const getThemeColors = jest.fn((theme: 'light' | 'dark' = 'light') => ({
  background: theme === 'light' ? '#FFFFFF' : '#0D1B2A',
  text: theme === 'light' ? '#1A1A1A' : '#ECEFF4',
}))

export const isDarkMode = jest.fn(() => false)

export const DARK_COLORS = {
  background: '#0D1B2A',
  text: '#ECEFF4',
}

export const LIGHT_COLORS = {
  background: '#FFFFFF',
  text: '#1A1A1A',
}

export const getColors = jest.fn((theme: 'light' | 'dark') =>
  theme === 'light' ? LIGHT_COLORS : DARK_COLORS
)
