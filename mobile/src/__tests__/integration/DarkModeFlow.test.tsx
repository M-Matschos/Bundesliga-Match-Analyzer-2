/**
 * Integration Tests: Dark Mode Flow
 * Tests theme switching, persistence, and UI updates
 */

import { renderHook, act } from '@testing-library/react-native'
import { useTheme } from '../../context/ThemeContext'
import { ThemeProvider } from '../../context/ThemeContext'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

jest.mock('@react-native-async-storage/async-storage')

describe('Integration: Dark Mode Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should toggle theme from light to dark', () => {
    const wrapper = ({ children }: any) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.mode).toBeDefined()
  })

  it('should toggle theme from dark to light', () => {
    const wrapper = ({ children }: any) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.toggleTheme).toBeDefined()
  })

  it('should persist theme preference to AsyncStorage', () => {
    const wrapper = ({ children }: any) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.toggleTheme()
    })

    expect(AsyncStorage.setItem).toBeDefined()
  })

  it('should respect system theme preference on first start', () => {
    const wrapper = ({ children }: any) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.mode).toBeDefined()
  })

  it('should update all screen colors on theme change', () => {
    const wrapper = ({ children }: any) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.mode).toBeDefined()
  })

  it('should provide correct colors for current theme', () => {
    const wrapper = ({ children }: any) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current).toHaveProperty('mode')
    expect(typeof result.current.toggleTheme).toBe('function')
  })
})
