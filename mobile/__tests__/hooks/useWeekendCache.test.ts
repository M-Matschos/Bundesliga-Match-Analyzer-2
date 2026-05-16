/**
 * Tests: useWeekendCache Hook
 *
 * Hook signature: useWeekendCache(leagues: string[])
 * Returns: { cachedResult, loading, saveToCache, clearCache }
 */

import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useWeekendCache } from '../../src/hooks/useWeekendCache'
import AsyncStorage from '@react-native-async-storage/async-storage'

// AsyncStorage is mocked as a flat object in jest.setup.js — cast to jest.Mock directly
const mockGetItem = AsyncStorage.getItem as jest.Mock
const mockSetItem = AsyncStorage.setItem as jest.Mock

describe('useWeekendCache Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetItem.mockResolvedValue(null)
    mockSetItem.mockResolvedValue(undefined)
  })

  it('should initialize with null cachedResult and loading true/false', async () => {
    const { result } = renderHook(() => useWeekendCache([]))
    // loading starts true; cachedResult starts null
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.cachedResult).toBeNull()
  })

  it('should expose saveToCache function', () => {
    const { result } = renderHook(() => useWeekendCache(['bundesliga']))
    expect(typeof result.current.saveToCache).toBe('function')
  })

  it('should save data to AsyncStorage via saveToCache', async () => {
    const { result } = renderHook(() => useWeekendCache(['bundesliga']))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const mockResult = { matches: [], date: '2026-05-16' } as any
    await act(async () => {
      await result.current.saveToCache(mockResult)
    })

    expect(mockSetItem).toHaveBeenCalledWith(
      'weekend_results',
      expect.stringContaining('bundesliga'),
    )
  })
})
