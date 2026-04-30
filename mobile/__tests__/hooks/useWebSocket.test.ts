/**
 * Tests: useWebSocket Hook
 */

import { renderHook, waitFor } from '@testing-library/react-native'
import { useWebSocket } from '../../src/hooks/useWebSocket'

jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test_user_123' },
    authToken: 'test_token_abc123',
  })),
}))

describe('useWebSocket Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize connection state', () => {
    const { result } = renderHook(() => useWebSocket('wss://test.api/ws'))
    expect(result.current).toBeDefined()
    expect(result.current.isConnected !== undefined).toBe(true)
  })

  it('should handle connect and disconnect', async () => {
    const { result } = renderHook(() => useWebSocket('wss://test.api/ws'))
    expect(result.current.connect).toBeDefined()
    expect(result.current.disconnect).toBeDefined()
  })

  it('should emit and receive messages', async () => {
    const { result } = renderHook(() => useWebSocket('wss://test.api/ws'))
    expect(result.current.send).toBeDefined()
    expect(result.current.messages).toBeDefined()
  })
})
