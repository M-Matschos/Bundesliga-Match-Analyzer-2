/**
 * Tests: useWeekendCache Hook
 */

import { renderHook, waitFor } from '@testing-library/react-native'
import { useWeekendCache } from '../../src/hooks/useWeekendCache'
import AsyncStorage from '@react-native-async-storage/async-storage'

jest.mock('@react-native-async-storage/async-storage')

describe('useWeekendCache Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)
  })

  it('should return cached weekend matches', async () => {
    const { result } = renderHook(() => useWeekendCache())
    expect(result.current.matches).toBeDefined()
    expect(Array.isArray(result.current.matches)).toBe(true)
  })

  it('should refresh cache from API', async () => {
    const { result } = renderHook(() => useWeekendCache())
    expect(result.current.refresh).toBeDefined()
    await result.current.refresh()
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled()
    })
  })

  it('should return cache expiry time', () => {
    const { result } = renderHook(() => useWeekendCache())
    expect(result.current.lastUpdated).toBeDefined()
  })
})
