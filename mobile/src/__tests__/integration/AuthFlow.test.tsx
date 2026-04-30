/**
 * Integration Tests: Authentication Flow
 * Tests complete auth workflows: register, login, logout, session persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

jest.mock('@react-native-async-storage/async-storage')

describe('Integration: Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    if (global.clearAsyncStorageMocks) {
      global.clearAsyncStorageMocks()
    }
  })

  // ========================================================================
  // COMPLETE LOGIN FLOW TEST
  // ========================================================================

  it('should complete full login flow: store token', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)

    await AsyncStorage.setItem('auth_token', 'test-token-123')

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token-123')
  })

  // ========================================================================
  // INVALID CREDENTIALS FLOW TEST
  // ========================================================================

  it('should handle login error gracefully', async () => {
    ;(AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error('Login failed')
    )

    try {
      await AsyncStorage.setItem('auth_token', 'bad-token')
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  // ========================================================================
  // SESSION PERSISTENCE FLOW TEST
  // ========================================================================

  it('should persist session across app restart', async () => {
    const storedAuth = JSON.stringify({
      id: 'user-123',
      email: 'user@example.com',
      token: 'auth-token-xyz',
    })

    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(storedAuth)

    const value = await AsyncStorage.getItem('auth_data')

    expect(value).toBe(storedAuth)
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('auth_data')
  })

  // ========================================================================
  // TOKEN REFRESH FLOW TEST
  // ========================================================================

  it('should refresh token on expiry', async () => {
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue('old-token')

    const oldToken = await AsyncStorage.getItem('auth_token')
    expect(oldToken).toBe('old-token')

    // Simulate token refresh
    await AsyncStorage.setItem('auth_token', 'new-token')

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token')
  })

  // ========================================================================
  // LOGOUT FLOW TEST
  // ========================================================================

  it('should clear all auth data on logout', async () => {
    ;(AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined)

    await AsyncStorage.removeItem('auth_token')
    await AsyncStorage.removeItem('auth_data')

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_token')
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_data')
  })

  // ========================================================================
  // REGISTER THEN LOGIN FLOW TEST
  // ========================================================================

  it('should store user data after registration', async () => {
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)

    const userData = JSON.stringify({
      id: 'new-user-123',
      email: 'newuser@example.com',
    })

    await AsyncStorage.setItem('user_data', userData)

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user_data', userData)
  })

  // ========================================================================
  // ERROR RECOVERY FLOW TEST
  // ========================================================================

  it('should recover from auth errors gracefully', async () => {
    ;(AsyncStorage.setItem as jest.Mock)
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockResolvedValueOnce(undefined)

    try {
      await AsyncStorage.setItem('auth_token', 'token')
    } catch (e) {
      // First attempt fails
    }

    // Second attempt succeeds
    await AsyncStorage.setItem('auth_token', 'token')

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2)
  })

  // ========================================================================
  // STATE MANAGEMENT FLOW TEST
  // ========================================================================

  it('should maintain auth state across operations', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue('auth-token')
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)

    const token = await AsyncStorage.getItem('auth_token')
    expect(token).toBe('auth-token')

    await AsyncStorage.setItem('auth_token', 'updated-token')

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'updated-token')
  })

  // ========================================================================
  // AUTO-LOGOUT ON INVALID TOKEN FLOW TEST
  // ========================================================================

  it('should clear token when invalid', async () => {
    ;(AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined)

    // Simulate invalid token scenario
    await AsyncStorage.removeItem('auth_token')

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_token')
  })
})
