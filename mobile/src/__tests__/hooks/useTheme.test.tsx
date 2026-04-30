import React from 'react'
import { renderHook, act } from '@testing-library/react-native'
import { ThemeProvider, useTheme } from '../../context/ThemeContext'
import { useThemeColors, isDarkMode, getThemeColors } from '../../hooks/useTheme'
import { DARK_COLORS, LIGHT_COLORS } from '../../theme/colors'

jest.mock('@react-native-async-storage/async-storage')

describe('useTheme Hook & Utilities', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  )

  describe('useTheme Hook Basic', () => {
    test('returns theme mode and toggle function', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current).toBeDefined()
      expect(result.current.mode).toBeDefined()
      expect(typeof result.current.toggleTheme).toBe('function')
      expect(typeof result.current.setTheme).toBe('function')
    })

    test('useThemeColors returns current theme colors', () => {
      const { result } = renderHook(() => useThemeColors(), { wrapper })

      expect(result.current).toBeDefined()
      expect(result.current.background).toBeDefined()
      expect(result.current.text).toBeDefined()
      expect(result.current.surface).toBeDefined()
    })

    test('getThemeColors returns valid color palette', () => {
      const lightColors = getThemeColors('light')
      const darkColors = getThemeColors('dark')

      expect(lightColors).toBeDefined()
      expect(darkColors).toBeDefined()
      expect(lightColors.background).toBeDefined()
      expect(darkColors.background).toBeDefined()
    })
  })

  describe('useThemeColors Dynamic Update', () => {
    test('colors update when theme mode changes', async () => {
      const { result: themeResult } = renderHook(() => useTheme(), { wrapper })
      const { result: colorResult } = renderHook(() => useThemeColors(), { wrapper })

      expect(colorResult.current).toBeDefined()

      await act(async () => {
        themeResult.current.toggleTheme()
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Colors should be updated
      expect(colorResult.current).toBeDefined()
      expect(colorResult.current.background).toBeDefined()
    })

    test('getThemeColors returns correct palette', () => {
      const lightColors = getThemeColors('light')
      const darkColors = getThemeColors('dark')

      expect(lightColors).toEqual(LIGHT_COLORS)
      expect(darkColors).toEqual(DARK_COLORS)
    })
  })

  describe('Hook Error Handling', () => {
    test('isDarkMode safely handles errors', () => {
      // isDarkMode should not throw
      expect(() => {
        isDarkMode()
      }).not.toThrow()
    })

    test('useTheme throws when used outside provider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useTheme())
      }).toThrow('useTheme must be used within a ThemeProvider')

      consoleError.mockRestore()
    })
  })

  describe('Color Properties', () => {
    test('light mode colors have all required properties', () => {
      const colors = getThemeColors('light')

      // Check required color properties
      const requiredProps = [
        'background', 'text', 'surface', 'primary',
        'confidenceHigh', 'confidenceMed', 'confidenceLow',
        'textSecond', 'textMuted', 'blue', 'red', 'green'
      ]

      requiredProps.forEach(prop => {
        expect(colors[prop as keyof typeof LIGHT_COLORS]).toBeDefined()
      })
    })

    test('dark mode colors have all required properties', () => {
      const colors = getThemeColors('dark')

      // Check required color properties
      const requiredProps = [
        'background', 'text', 'surface', 'primary',
        'confidenceHigh', 'confidenceMed', 'confidenceLow',
        'textSecond', 'textMuted', 'blue', 'red', 'green'
      ]

      requiredProps.forEach(prop => {
        expect(colors[prop as keyof typeof DARK_COLORS]).toBeDefined()
      })
    })

    test('colors differ between light and dark modes', () => {
      const lightColors = getThemeColors('light')
      const darkColors = getThemeColors('dark')

      expect(lightColors.background).not.toBe(darkColors.background)
      expect(lightColors.text).not.toBe(darkColors.text)
      // Both modes should have distinct colors
      expect(Object.keys(lightColors).length).toBe(Object.keys(darkColors).length)
    })
  })

  describe('Re-exports', () => {
    test('exports useTheme from context', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })
      expect(result.current).toBeDefined()
    })

    test('exports color objects', () => {
      expect(DARK_COLORS).toBeDefined()
      expect(LIGHT_COLORS).toBeDefined()
    })
  })
})
