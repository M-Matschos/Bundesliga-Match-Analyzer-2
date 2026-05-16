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

export const getThemeColors = jest.fn((theme: 'light' | 'dark' = 'light') =>
  theme === 'light' ? LIGHT_COLORS : DARK_COLORS
)

export const isDarkMode = jest.fn(() => false)

export const DARK_COLORS = {
  background: '#0D1B2A',
  surface: '#152336',
  surfaceHigh: '#1E3148',
  border: '#2A4060',
  primary: '#1A3A5C',
  blue: '#2E75B6',
  blueLight: '#4A90C4',
  purple: '#6B3FA0',
  green: '#1E7B4B',
  greenLight: '#27AE60',
  orange: '#E67E22',
  red: '#C0392B',
  yellow: '#F39C12',
  confidenceHigh: '#27AE60',
  confidenceMed: '#F39C12',
  confidenceLow: '#C0392B',
  text: '#ECEFF4',
  textSecond: '#B0BEC5',
  textMuted: '#78909C',
  textDisabled: '#6B7280',
  valueBet: '#F1C40F',
  valueBetBg: '#2A2200',
}

export const LIGHT_COLORS = {
  background: '#FFFFFF',
  surface: '#F5F7FA',
  surfaceHigh: '#E8ECEF',
  border: '#D0D7E1',
  primary: '#4A7BA7',
  blue: '#2E75B6',
  blueLight: '#6BA3D4',
  purple: '#8B5FA0',
  green: '#2E8B57',
  greenLight: '#27AE60',
  orange: '#E67E22',
  red: '#C0392B',
  yellow: '#F39C12',
  confidenceHigh: '#27AE60',
  confidenceMed: '#F39C12',
  confidenceLow: '#C0392B',
  text: '#1A1A1A',
  textSecond: '#4A4A4A',
  textMuted: '#8A8A8A',
  textDisabled: '#BDBDBD',
  valueBet: '#F1C40F',
  valueBetBg: '#FEF5E7',
}

export const getColors = jest.fn((theme: 'light' | 'dark' = 'dark') =>
  theme === 'light' ? LIGHT_COLORS : DARK_COLORS
)
