/**
 * Tests: useRegisterDevice Hook
 */

import { renderHook, waitFor } from '@testing-library/react-native'
import { useRegisterDevice } from '../../src/hooks/useRegisterDevice'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test_user_123' },
    authToken: 'test_token_abc123',
  })),
}))

jest.mock('@react-native-async-storage/async-storage')
jest.mock('axios')
jest.mock('../../src/config/firebase.config', () => ({
  getDeviceToken: jest.fn().mockResolvedValue('test_token_123'),
  onDeviceTokenRefresh: jest.fn(() => jest.fn()),
}))

describe('useRegisterDevice Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)
    ;(axios.post as jest.Mock).mockResolvedValue({
      data: { success: true, message: 'Device registered' },
    })
  })

  it('should return isRegistering and error states', () => {
    const { result } = renderHook(() => useRegisterDevice())
    expect(result.current).toBeDefined()
    expect(typeof result.current.isRegistering).toBe('boolean')
  })

  it('should register device on mount with valid user', async () => {
    renderHook(() => useRegisterDevice())
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled()
    })
  })

  it('should cache device token in AsyncStorage', async () => {
    renderHook(() => useRegisterDevice())
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled()
    })
  })

  it('should handle registration error gracefully', async () => {
    ;(axios.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Registration failed' } },
    })
    renderHook(() => useRegisterDevice())
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled()
    })
  })
})
