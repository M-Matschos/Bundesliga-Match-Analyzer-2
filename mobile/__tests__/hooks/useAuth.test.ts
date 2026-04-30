/**
 * Tests: useAuth Hook
 * Coverage: useAuth re-export from AuthContext
 */

import { renderHook } from '@testing-library/react-native'
import { useAuth } from '../../src/hooks/useAuth'

jest.mock('../../src/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: 'test_user_123', email: 'test@example.com' },
    authToken: 'test_token_abc123',
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  })),
}))

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return authenticated user when called', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current).toBeDefined()
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.id).toBe('test_user_123')
  })

  it('should return auth token when user is authenticated', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.authToken).toBe('test_token_abc123')
  })

  it('should return auth functions (login, logout, register)', () => {
    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.logout).toBe('function')
    expect(typeof result.current.register).toBe('function')
  })

  it('should indicate loading state when auth is checking', () => {
    const { useAuth: useAuthMock } = require('../../src/context/AuthContext')
    useAuthMock.mockReturnValueOnce({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      authToken: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isLoading).toBe(true)
  })

  it('should handle unauthenticated state', () => {
    const { useAuth: useAuthMock } = require('../../src/context/AuthContext')
    useAuthMock.mockReturnValueOnce({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      authToken: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})
