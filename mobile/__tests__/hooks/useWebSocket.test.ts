/**
 * Tests: useWebSocket Hook
 *
 * Hook signature: useWebSocket(matchId: number, onEvent: (event) => void, options?)
 * Returns: { connected, error, sendMessage, disconnect, resetReconnectCounter, statistics }
 */

import { renderHook } from '@testing-library/react-native'
import { useWebSocket } from '../../src/hooks/useWebSocket'

// WebSocket global mock
class MockWebSocket {
  static OPEN = 1
  readyState = MockWebSocket.OPEN
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  send = jest.fn()
  close = jest.fn(() => {
    if (this.onclose) this.onclose()
  })
}

global.WebSocket = MockWebSocket as unknown as typeof WebSocket

describe('useWebSocket Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize connection state', () => {
    const onEvent = jest.fn()
    const { result } = renderHook(() => useWebSocket(42, onEvent))
    expect(result.current).toBeDefined()
    // connected is a boolean (initially false before onopen fires)
    expect(typeof result.current.connected).toBe('boolean')
  })

  it('should expose disconnect and sendMessage', () => {
    const onEvent = jest.fn()
    const { result } = renderHook(() => useWebSocket(42, onEvent))
    expect(typeof result.current.disconnect).toBe('function')
    expect(typeof result.current.sendMessage).toBe('function')
  })

  it('should expose statistics object', () => {
    const onEvent = jest.fn()
    const { result } = renderHook(() => useWebSocket(42, onEvent))
    expect(result.current.statistics).toBeDefined()
    expect(typeof result.current.statistics.eventsReceived).toBe('number')
  })
})
