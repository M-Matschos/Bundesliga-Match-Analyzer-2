import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme()
  const [mode, setMode] = useState<ThemeMode>(
    (systemColorScheme as ThemeMode) || 'dark'
  )
  const [isLoading, setIsLoading] = useState(true)

  // Load theme preference from AsyncStorage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme')
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setMode(savedTheme)
        } else if (systemColorScheme) {
          setMode(systemColorScheme as ThemeMode)
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error)
        // Fallback to system scheme if AsyncStorage fails
        if (systemColorScheme) {
          setMode(systemColorScheme as ThemeMode)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadThemePreference()
  }, [systemColorScheme])

  // Persist theme to AsyncStorage when mode changes
  useEffect(() => {
    if (!isLoading) {
      const persistTheme = async () => {
        try {
          await AsyncStorage.setItem('theme', mode)
        } catch (error) {
          console.error('Failed to save theme preference:', error)
        }
      }

      persistTheme()
    }
  }, [mode, isLoading])

  // Toggle between light and dark mode with memoization
  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  // Set specific theme with memoization
  const setThemeCallback = useCallback((newMode: ThemeMode) => {
    setMode(newMode)
  }, [])

  const value: ThemeContextType = {
    mode,
    toggleTheme,
    setTheme: setThemeCallback,
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
