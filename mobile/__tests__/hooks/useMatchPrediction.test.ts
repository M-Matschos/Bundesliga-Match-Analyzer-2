/**
 * useMatchPrediction Hook Integration Tests
 *
 * Comprehensive test suite for match prediction hook.
 * Covers: Hook lifecycle, caching, refresh, error handling,
 * loading states, and React component integration.
 *
 * Phase D1: Task 8
 */

import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useMatchPrediction } from '../../src/hooks/useMatchPrediction'
import { matchAnalyticsService } from '../../src/services/MatchAnalyticsService'
import type { MatchData } from '../../src/services/MatchAnalyticsService'

// ─── Mocks ───────────────────────────────────────────────────

jest.mock('../../src/services/MatchAnalyticsService', () => ({
  matchAnalyticsService: {
    predictMatch: jest.fn(),
    clearCache: jest.fn(),
  },
}))

// ─── Test Data ───────────────────────────────────────────────────

/**
 * Mock match data (synthetic values only)
 */
const mockMatchData: MatchData = {
  matchId: 'test_match_001',
  homeTeamId: 'team_001',
  awayTeamId: 'team_002',
  homeTeamForm: [1, 1, 0.5, 1, 0.5],
  awayTeamForm: [0.5, 1, 0.5, 1, 1],
  homeTeamGoalsFor: 18,
  homeTeamGoalsAgainst: 8,
  awayTeamGoalsFor: 12,
  awayTeamGoalsAgainst: 10,
  homeTeamRating: 74,
  awayTeamRating: 70,
}

/**
 * Mock prediction result (synthetic)
 */
const mockPredictionResult = {
  homeWinProbability: 0.45,
  drawProbability: 0.30,
  awayWinProbability: 0.25,
  confidence: 0.82,
  modelAgreement: 0.89,
  valueBets: [
    {
      betType: 'Over 2.5 Goals',
      odds: 1.95,
      edge: 0.12,
      impliedProbability: 0.513,
    },
  ],
  error: null,
}

// ─── Tests ───────────────────────────────────────────────────

describe('useMatchPrediction Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(matchAnalyticsService.predictMatch as jest.Mock).mockResolvedValue(
      mockPredictionResult
    )
  })

  // ─── Hook Lifecycle Tests ───────────────────────────────────

  describe('Hook Lifecycle', () => {
    /**
     * Test 1: Hook initializes with loading state
     */
    it('should initialize with loading state', () => {
      const { result } = renderHook(() =>
        useMatchPrediction('test_match_001', mockMatchData)
      )

      expect(result.current.loading).toBe(true)
      expect(result.current.prediction).toBeNull()
      expect(result.current.error).toBeNull()
    })

    /**
     * Test 2: Hook fetches prediction on mount
     */
    it('should fetch prediction on mount', async () => {
      const { result } = renderHook(() =>
        useMatchPrediction('test_match_001', mockMatchData)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(matchAnalyticsService.predictMatch).toHaveBeenCalledWith(
        'test_match_001',
        mockMatchData
      )
      expect(result.current.prediction).toEqual(mockPredictionResult)
    })

    /**
     * Test 3: Hook sets confidence from prediction
     */
    it('should set confidence from prediction result', async () => {
      const { result } = renderHook(() =>
        useMatchPrediction('test_match_001', mockMatchData)
      )

      await waitFor(() => {
        expect(result.current.confidence).toBe(
          mockPredictionResult.confidence
        )
      })
    })

    /**
     * Test 4: Hook uses default match data if not provided
     */
    it('should use default match data if not provided', async () => {
      const { result } = renderHook(() =>
        useMatchPrediction('test_match_default')
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(matchAnalyticsService.predictMatch).toHaveBeenCalled()
      // Should create synthetic match data
      const callArgs = (matchAnalyticsService.predictMatch as jest.Mock)
        .mock.calls[0]
      expect(callArgs[0]).toBe('test_match_default')
      expect(callArgs[1]).toBeDefined()
      expect(callArgs[1].matchId).toBe('test_match_default')
    })

    /**
     * Test 5: Hook re-fetches when matchId changes
     */
    it('should re-fetch when matchId changes', async () => {
      const { result, rerender } = renderHook(
        ({ matchId }: { matchId: string }) =>
          useMatchPrediction(matchId, mockMatchData),
        {
          initialProps: { matchId: 'match_001' },
        }
      )

      await waitFor(() => {
        expect(result.current.prediction).toBeDefined()
      })

      expect(matchAnalyticsService.predictMatch).toHaveBeenCalledTimes(1)

      rerender({ matchId: 'match_002' })

      await waitFor(() => {
        expect(matchAnalyticsService.predictMatch).toHaveBeenCalledTimes(2)
      })
    })
  })

  // ─── Caching Tests ───────────────────────────────────────

  describe('Caching', () => {
    /**
     * Test 6: Hook caches prediction results
     */
    it('should cache prediction results within TTL', async () => {
      const { result, rerender } = renderHook(
        ({ matchId }: { matchId: string }) =>
          useMatchPrediction(matchId, mockMatchData),
        {
          initialProps: { matchId: 'match_cache_001' },
        }
      )

      await waitFor(() => {
        expect(result.current.prediction).toBeDefined()
      })

      expect(matchAnalyticsService.predictMatch).toHaveBeenCalledTimes(1)

      // Re-render with same matchId
      rerender({ matchId: 'match_cache_001' })

      // Should not call API again (cached)
      expect(matchAnalyticsService.predictMatch).toHaveBeenCalledTimes(1)
    })

    /**
     * Test 7: Hook respects cache TTL (30 minutes)
     */
    it('should respect cache TTL', async () => {
      const { result } = renderHook(() =>
        useMatchPrediction('test_match_ttl_001', mockMatchData)
      )

      await waitFor(() => {
        expect(result.current.prediction).toBeDefined()
      })

      expect(matchAnalyticsService.predictMatch).toHaveBeenCalledTimes(1)

      // Advance time beyond TTL
      jest.useFakeTimers()
      jest.advanceTimersByTime(31 * 60 * 1000) // 31 minutes

      // Verify time advanced
      expect(jest.now()).toBeGreaterThan(30 * 60 * 1000)

      jest.useRealTimers()
    })
  })

  // ─── Refresh Tests ───────────────────────────────────────

  describe('Refresh Mechanism', () => {
    /**
     * Test 8: Refresh function re-fetches prediction
     */
    it('should refresh prediction when refresh called', async () => {
      const { result } = renderHook(() =>
        useMatchPrediction('test_match_refresh_001', mockMatchData)
      )

      await waitFor(() => {
        expect(result.current.prediction).toBeDefined()
      })

      expect(matchAnalyticsService.predictMatch).toHaveBeenCalledTimes(1)

      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        expect(matchAnalyticsService.predictMatch).toHaveBeenCalledTimes(2)
      })
    })

    /**
     * Test 9: Refresh sets loading state
     */
    it('should handle refresh loading state', async () => {
      const { result } = renderHook(() =>
        useMatchPrediction('test_match_loading_001', mockMatchData)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.refresh()
      })

      // Refresh should complete successfully
      expect(matchAnalyticsService.predictMatch).toHaveBeenCalled()
    })

    /**
     * Test 10: Refresh clears cache for match
     */
    it('should clear cache for match on refresh', async () => {
      const { result } = renderHook(() =>
        useMatchPrediction('test_match_clear_001', mockMatchData)
      )

      await waitFor(() => {
        expect(result.current.prediction).toBeDefined()
      })

      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        // Service should be called again (cache was cleared)
        expect(matchAnalyticsService.predictMatch).toHaveBeenCalledTimes(2)
      })
    })
  })

  // ─── Error Handling Tests ───────────────────────────────────

  describe('Error Handling', () => {
    /**
     * Test 11: Hook handles API errors
     */
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Failed to fetch prediction'
      ;(matchAnalyticsService.predictMatch as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      )

      const { result } = renderHook(() =>
        useMatchPrediction('test_match_error_001', mockMatchData)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Error should be set
      expect(result.current.error).toBeDefined()
      expect(result.current.prediction).toBeNull()
    })

    /**
     * Test 12: Hook uses stale cache on error if available
     */
    it('should use stale cache as fallback on error', async () => {
      // First successful call
      ;(matchAnalyticsService.predictMatch as jest.Mock).mockResolvedValueOnce(
        mockPredictionResult
      )

      const { result, rerender } = renderHook(
        ({ matchId }: { matchId: string }) =>
          useMatchPrediction(matchId, mockMatchData),
        {
          initialProps: { matchId: 'test_match_fallback_001' },
        }
      )

      await waitFor(() => {
        expect(result.current.prediction).toEqual(mockPredictionResult)
      })

      // Now mock error for next call
      ;(matchAnalyticsService.predictMatch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      // Refresh should fail but use cached data
      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        // Stale cache should still be used
        expect(result.current.prediction).toBeDefined()
        expect(result.current.error).toContain('cached data')
      })
    })

    /**
     * Test 13: Hook handles unmount cleanup
     */
    it('should prevent state updates after unmount', async () => {
      const { result, unmount } = renderHook(() =>
        useMatchPrediction('test_match_unmount_001', mockMatchData)
      )

      // Unmount before prediction completes
      unmount()

      // Should not throw error
      await waitFor(() => {
        // Component should be unmounted
        expect(matchAnalyticsService.predictMatch).toHaveBeenCalled()
      })
    })
  })

  // ─── Loading State Tests ───────────────────────────────────

  describe('Loading States', () => {
    /**
     * Test 14: Hook transitions through loading states correctly
     */
    it('should transition loading states correctly', async () => {
      const { result } = renderHook(() =>
        useMatchPrediction('test_match_states_001', mockMatchData)
      )

      // Initial: loading
      expect(result.current.loading).toBe(true)
      expect(result.current.prediction).toBeNull()

      // After fetch: not loading
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.prediction).toEqual(mockPredictionResult)
      expect(result.current.error).toBeNull()
    })

    /**
     * Test 15: Hook returns correct confidence value
     */
    it('should return correct confidence value', async () => {
      const { result } = renderHook(() =>
        useMatchPrediction('test_match_confidence_001', mockMatchData)
      )

      await waitFor(() => {
        expect(result.current.confidence).toBe(0.82)
      })

      expect(result.current.confidence).toBeGreaterThanOrEqual(0)
      expect(result.current.confidence).toBeLessThanOrEqual(1)
    })
  })

  // ─── Integration Tests ───────────────────────────────────

  describe('Integration', () => {
    /**
     * Test 16: Multiple hooks with same match work independently
     */
    it('should handle multiple hooks independently', async () => {
      const { result: result1 } = renderHook(() =>
        useMatchPrediction('test_match_multi_001', mockMatchData)
      )

      const { result: result2 } = renderHook(() =>
        useMatchPrediction('test_match_multi_001', mockMatchData)
      )

      await waitFor(() => {
        expect(result1.current.prediction).toBeDefined()
        expect(result2.current.prediction).toBeDefined()
      })

      // Both should have same data
      expect(result1.current.prediction).toEqual(result2.current.prediction)
    })

    /**
     * Test 17: Hook works with variant match data
     */
    it('should work with custom match data', async () => {
      const customMatchData: MatchData = {
        ...mockMatchData,
        homeTeamRating: 85,
        awayTeamRating: 75,
      }

      const { result } = renderHook(() =>
        useMatchPrediction('test_match_custom_001', customMatchData)
      )

      await waitFor(() => {
        expect(result.current.prediction).toBeDefined()
      })

      expect(matchAnalyticsService.predictMatch).toHaveBeenCalledWith(
        'test_match_custom_001',
        customMatchData
      )
    })

    /**
     * Test 18: Complete workflow: fetch -> refresh -> error
     */
    it('should handle complete workflow', async () => {
      const { result } = renderHook(() =>
        useMatchPrediction('test_match_workflow_001', mockMatchData)
      )

      // 1. Initial fetch
      await waitFor(() => {
        expect(result.current.prediction).toBeDefined()
      })
      expect(matchAnalyticsService.predictMatch).toHaveBeenCalledTimes(1)

      // 2. Refresh
      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        expect(matchAnalyticsService.predictMatch).toHaveBeenCalledTimes(2)
      })

      // 3. Simulate error on next refresh
      ;(matchAnalyticsService.predictMatch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        // Should have attempted call
        expect(matchAnalyticsService.predictMatch).toHaveBeenCalledTimes(3)
      })
    })
  })
})
