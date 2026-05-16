// Mock für ThemeContext — verhindert "useTheme must be used within ThemeProvider" in Tests
import React from 'react'

export type ThemeMode = 'light' | 'dark'

export const useTheme = jest.fn(() => ({
  mode: 'light' as ThemeMode,
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
}))

export const ThemeContext = React.createContext({
  mode: 'light' as ThemeMode,
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children)
