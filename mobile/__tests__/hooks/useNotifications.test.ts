/**
 * Tests: useNotifications Hook
 * Coverage: Firebase Cloud Messaging
 */

import { renderHook, waitFor } from '@testing-library/react-native'
import { useNotifications } from '../../src/hooks/useNotifications'

jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test_user_123', email: 'test@example.com' },
  })),
}))

jest.mock('@react-native-firebase/messaging', () => ({
  default: jest.fn(() => ({
    getToken: jest.fn().mockResolvedValue('test_device_token_123'),
    requestPermission: jest.fn().mockResolvedValue(2),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
    onMessage: jest.fn(() => jest.fn()),
  })),
  AuthorizationStatus: { AUTHORIZED: 2, PROVISIONAL: 3 },
}))

global.fetch = jest.fn()

describe('useNotifications Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success' }),
    })
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useNotifications())
    expect(result.current).toBeDefined()
    expect(result.current.notifications).toEqual([])
    expect(result.current.unreadCount).toBe(0)
  })

  it('should return device token when available', async () => {
    const { result } = renderHook(() => useNotifications())
    await waitFor(() => {
      expect(result.current.deviceToken).toBeDefined()
    })
  })

  it('should subscribe to a match', async () => {
    const { result } = renderHook(() => useNotifications())
    await result.current.subscribeToMatch(12345)
    await waitFor(() => {
      expect(result.current.subscriptions).toContain(12345)
    })
  })

  it('should unsubscribe from a match', async () => {
    const { result } = renderHook(() => useNotifications())
    await result.current.subscribeToMatch(12345)
    await result.current.unsubscribeFromMatch(12345)
    await waitFor(() => {
      expect(result.current.subscriptions).not.toContain(12345)
    })
  })
})
