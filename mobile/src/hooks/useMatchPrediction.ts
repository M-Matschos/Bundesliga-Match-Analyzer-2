/**
 * useMatchPrediction Hook
 *
 * Custom React hook for managing prediction data with session-based caching.
 * Automatically fetches predictions on mount, caches results, and provides
 * manual refresh functionality.
 *
 * Phase D1: Task 2
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { matchAnalyticsService, PredictionResult, MatchData } from '../services/MatchAnalyticsService'

// ─── Types ───────────────────────────────────────────────────

/**
 * Hook result interface
 */
interface PredictionHookResult {
  prediction: PredictionResult | null
  loading: boolean
  error: string | null
  confidence: number
  refresh: () => Promise<void>
}

/**
 * Cache entry type
 */
interface CacheEntry {
  result: PredictionResult
  timestamp: number
}

// ─── Constants ───────────────────────────────────────────────────

const CACHE_EXPIRY_MS = 30 * 60 * 1000 // 30 minutes

// ─── Hook ───────────────────────────────────────────────────

/**
 * useMatchPrediction Hook
 *
 * Manages prediction loading, caching, and refresh for a specific match.
 *
 * Features:
 * - Automatic loading on mount
 * - Session-based caching (30-minute TTL)
 * - Memoization prevents duplicate API calls
 * - Manual refresh function
 * - Graceful error handling with fallback to cache
 *
 * @param matchId - The match ID to fetch predictions for
 * @param matchData - Optional match data (defaults to mock data if not provided)
 * @returns {PredictionHookResult} Hook result with prediction, loading, error, and refresh
 *
 * @example
 * ```typescript
 * const { prediction, loading, error, refresh, confidence } = useMatchPrediction('match123', {
 *   matchId: 'match123',
 *   homeTeamId: 'team1',
 *   awayTeamId: 'team2',
 * })
 *
 * if (loading) return <Spinner />
 * if (error) return <Error message={error} onRetry={refresh} />
 *
 * return <PredictionCard prediction={prediction} />
 * ```
 */
export function useMatchPrediction(
  matchId: string,
  matchData?: MatchData
): PredictionHookResult {
  // State
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cache ref for session-based caching
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map())

  // Track if component is mounted to prevent memory leaks
  const isMountedRef = useRef(true)

  /**
   * Check if cached prediction is still valid
   *
   * @private
   */
  const isCacheValid = useCallback((entry: CacheEntry): boolean => {
    return Date.now() - entry.timestamp < CACHE_EXPIRY_MS
  }, [])

  /**
   * Fetch prediction from cache or API
   *
   * @private
   */
  const fetchPrediction = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return

    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cached = cacheRef.current.get(matchId)
      if (cached && isCacheValid(cached)) {
        if (isMountedRef.current) {
          setPrediction(cached.result)
          setLoading(false)
        }
        return
      }

      // Create default match data if not provided
      const dataToUse: MatchData = matchData || {
        matchId,
        homeTeamId: `home_${matchId}`,
        awayTeamId: `away_${matchId}`,
        homeTeamForm: [1, 1, 0.5],
        awayTeamForm: [1, 0.5, 0],
        homeTeamGoalsFor: 8,
        homeTeamGoalsAgainst: 2,
        awayTeamGoalsFor: 6,
        awayTeamGoalsAgainst: 3,
        homeTeamRating: 72,
        awayTeamRating: 68,
      }

      // Fetch from service
      const result = await matchAnalyticsService.predictMatch(matchId, dataToUse)

      if (!isMountedRef.current) return

      // Cache the result
      cacheRef.current.set(matchId, {
        result,
        timestamp: Date.now(),
      })

      setPrediction(result)
      setError(result.error || null)
      setLoading(false)
    } catch (err) {
      if (!isMountedRef.current) return

      // Try to use cached data as fallback
      const cached = cacheRef.current.get(matchId)
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch prediction'

      if (cached) {
        // Use stale cache if available
        setPrediction(cached.result)
        setError(`${errorMsg} (showing cached data)`)
      } else {
        setError(errorMsg)
        setPrediction(null)
      }

      setLoading(false)
    }
  }, [matchId, matchData, isCacheValid])

  /**
   * Manual refresh function
   *
   * Clears cache for this match and re-fetches prediction.
   * Useful for pull-to-refresh patterns or when user knows odds have updated.
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return

    // Clear cache for this match
    cacheRef.current.delete(matchId)

    // Re-fetch
    await fetchPrediction()
  }, [matchId, fetchPrediction])

  /**
   * Load prediction on mount and when matchId changes
   */
  useEffect(() => {
    // Reset mounted flag
    isMountedRef.current = true

    // Fetch prediction
    fetchPrediction()

    // Cleanup: prevent state updates after unmount
    return () => {
      isMountedRef.current = false
    }
  }, [matchId, fetchPrediction])

  // Calculate confidence (0-100 from prediction)
  const confidence = prediction?.confidence || 0

  return {
    prediction,
    loading,
    error,
    confidence,
    refresh,
  }
}

export type { PredictionHookResult }
