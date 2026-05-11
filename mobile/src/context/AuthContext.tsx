import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authService } from '../services/api'

export interface User {
  id: string
  email: string
  username?: string
  created_at: string
  is_active: boolean
}

export interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username?: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  // Initialize auth on app launch
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token')
      if (storedToken) {
        // Validate token with backend
        const profile = await authService.getProfile()
        setUser(profile as User)
        setToken(storedToken)
      }
    } catch (error) {
      console.warn('Auth initialization failed:', error)
      // Clear invalid tokens
      await AsyncStorage.removeItem('auth_token')
      await AsyncStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      const { access_token, refresh_token } = response

      // Store tokens
      await AsyncStorage.setItem('auth_token', access_token)
      await AsyncStorage.setItem('refresh_token', refresh_token)
      setToken(access_token)

      // Fetch user profile
      const profile = await authService.getProfile()
      setUser(profile as User)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (email: string, password: string, username?: string) => {
    try {
      // Backend /register returns User only — login separately to obtain tokens
      await authService.register(email, password, username)
      await login(email, password)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Call backend logout if needed
      await authService.logout()
    } catch (error) {
      console.warn('Backend logout failed:', error)
    } finally {
      // Always clear local state
      await AsyncStorage.removeItem('auth_token')
      await AsyncStorage.removeItem('refresh_token')
      setUser(null)
      setToken(null)
    }
  }

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken()
      const { access_token } = response

      // Update token
      await AsyncStorage.setItem('auth_token', access_token)
      setToken(access_token)
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails, logout
      await logout()
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
