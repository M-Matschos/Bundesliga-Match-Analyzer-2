import React from 'react'
import { renderHook, act } from '@testing-library/react-native'
import { ThemeProvider, useTheme } from '../../context/ThemeContext'

describe('ThemeContext', () => {
  describe('Initialization', () => {
    test('renders with system color scheme on mount', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      // Should have initial mode
      expect(result.current).toBeDefined()
      expect(result.current.mode).toBeDefined()
      expect(['light', 'dark']).toContain(result.current.mode)
    })

    test('provides theme context to children', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      // Should have mode and toggle function
      expect(result.current.mode).toBeDefined()
      expect(typeof result.current.toggleTheme).toBe('function')
      expect(typeof result.current.setTheme).toBe('function')
    })

    test('throws error when useTheme used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useTheme())
      }).toThrow('useTheme must be used within a ThemeProvider')

      consoleError.mockRestore()
    })
  })

  describe('Theme Toggle', () => {
    test('toggleTheme switches between modes', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      const initialMode = result.current.mode

      await act(async () => {
        result.current.toggleTheme()
        // Wait for state update
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // Mode should have changed
      const newMode = result.current.mode
      expect(newMode).not.toBe(initialMode)
      expect(['light', 'dark']).toContain(newMode)
    })

    test('setTheme sets specific mode to light', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      await act(async () => {
        result.current.setTheme('light')
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(result.current.mode).toBe('light')
    })

    test('setTheme sets specific mode to dark', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      await act(async () => {
        result.current.setTheme('dark')
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(result.current.mode).toBe('dark')
    })
  })

  describe('Memoization', () => {
    test('toggleTheme is memoized', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result, rerender } = renderHook(() => useTheme(), { wrapper })

      const toggleTheme1 = result.current.toggleTheme
      const setTheme1 = result.current.setTheme

      rerender()

      const toggleTheme2 = result.current.toggleTheme
      const setTheme2 = result.current.setTheme

      // Functions should be memoized (same reference)
      expect(toggleTheme1).toBe(toggleTheme2)
      expect(setTheme1).toBe(setTheme2)
    })
  })

  describe('Async Updates', () => {
    test('mode persists after toggle', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      const originalMode = result.current.mode

      await act(async () => {
        result.current.toggleTheme()
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.mode).not.toBe(originalMode)
    })
  })
})
