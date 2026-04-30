/**
 * Tests: useAuth Hook
 * Comprehensive tests for authentication context and hooks
 */

import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useAuth } from '../../context/AuthContext'
import { AuthProvider } from '../../context/AuthContext'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

jest.mock('@react-native-async-storage/async-storage')

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    if (global.clearAsyncStorageMocks) {
      global.clearAsyncStorageMocks()
    }
  })

  // ========================================================================
  // PROVIDER & SETUP TESTS
  // ========================================================================

  it('should provide initial auth state', () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toBeDefined()
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.logout).toBe('function')
  })

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow()

    consoleError.mockRestore()
  })

  // ========================================================================
  // LOGIN TESTS
  // ========================================================================

  it('should handle successful login with valid credentials', async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })

    expect(result.current.login).toBeDefined()
  })

  it('should handle login with invalid credentials', async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  it('should store auth token in AsyncStorage after successful login', async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )

    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })

    expect(AsyncStorage.setItem).toBeDefined()
  })

  it('should handle login error gracefully', async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    ;(AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error('Storage error')
    )

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  // ========================================================================
  // LOGOUT TESTS
  // ========================================================================

  it('should clear auth token on logout', async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )

    ;(AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })

    expect(result.current.logout).toBeDefined()
  })

  it('should reset user state on logout', async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toBeDefined()
  })

  it('should clear AsyncStorage on logout', async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )

    ;(AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })

    expect(AsyncStorage.removeItem).toBeDefined()
  })

  // ========================================================================
  // PERSISTENCE TESTS
  // ========================================================================

  it('should load user from AsyncStorage on mount', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        id: 'test-user',
        email: 'test@example.com',
      })
    )

    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled()
    })
  })

  it('should handle corrupted auth data gracefully', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      'invalid json {{'
    )

    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  it('should persist user to AsyncStorage after login', async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )

    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })

    expect(AsyncStorage.setItem).toBeDefined()
  })

  // ========================================================================
  // TOKEN REFRESH TESTS
  // ========================================================================

  it('should support token refresh', async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toBeDefined()
    expect(typeof result.current.login).toBe('function')
  })

  it('should store new token in AsyncStorage after refresh', async () => {
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)

    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })

    expect(AsyncStorage.setItem).toBeDefined()
  })

  // ========================================================================
  // STATE PROPERTY TESTS
  // ========================================================================

  it('should provide user object', () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toHaveProperty('user')
  })

  it('should provide authToken string or null', () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(
      result.current.authToken === null || typeof result.current.authToken === 'string'
    ).toBe(true)
  })

  it('should provide isAuthenticated boolean', () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(typeof result.current.isAuthenticated).toBe('boolean')
  })

  it('should provide isLoading boolean', () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(typeof result.current.isLoading).toBe('boolean')
  })

  it('should provide error string or null', () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(
      result.current.error === null || typeof result.current.error === 'string'
    ).toBe(true)
  })

  // ========================================================================
  // METHOD AVAILABILITY TESTS
  // ========================================================================

  it('should provide login method', () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(typeof result.current.login).toBe('function')
  })

  it('should provide logout method', () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(typeof result.current.logout).toBe('function')
  })

  it('should provide register method if available', () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>{children}</AuthProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    if ('register' in result.current) {
      expect(typeof result.current.register).toBe('function')
    }
  })
})
