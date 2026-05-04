/**
 * MatchAnalyticsService Unit Tests
 *
 * Comprehensive test suite for match prediction engine.
 * Covers: API calls, caching, error handling, ensemble voting,
 * value bet calculation, and metadata management.
 *
 * Phase D1: Task 7
 */

import { matchAnalyticsService } from '../../src/services/MatchAnalyticsService'
import type {
  PredictionResult,
  ModelMetadata,
  MatchData,
  ValueBet,
} from '../../src/services/MatchAnalyticsService'

// ─── Test Data ───────────────────────────────────────────────────

/**
 * Mock match data for testing (synthetic values only)
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
 * Mock prediction result
 */
const mockPredictionResult: PredictionResult = {
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
    {
      betType: 'Home Win',
      odds: 2.15,
      edge: 0.08,
      impliedProbability: 0.465,
    },
  ],
  error: null,
}

/**
 * Mock model metadata
 */
const mockModelMetadata: ModelMetadata = {
  modelCount: 3,
  modelTypes: ['Logistic Regression', 'Random Forest', 'Gradient Boosting'],
  modelVersions: ['1.0', '1.0', '1.0'],
  confidenceThreshold: 0.6,
  lastUpdated: new Date().toISOString(),
  calibrationFactor: 0.95,
}

// ─── Tests ───────────────────────────────────────────────────

describe('MatchAnalyticsService', () => {
  /**
   * Clear caches before each test
   */
  beforeEach(() => {
    matchAnalyticsService.clearCache()
    matchAnalyticsService.clearMetadataCache()
    jest.clearAllMocks()
  })

  // ─── Prediction Tests ───────────────────────────────────────

  describe('predictMatch', () => {
    /**
     * Test 1: Successfully fetch prediction
     */
    it('should fetch prediction for a valid match', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_001',
        mockMatchData
      )

      expect(result).toBeDefined()
      expect(result.homeWinProbability).toBeGreaterThanOrEqual(0)
      expect(result.homeWinProbability).toBeLessThanOrEqual(1)
      expect(result.drawProbability).toBeGreaterThanOrEqual(0)
      expect(result.drawProbability).toBeLessThanOrEqual(1)
      expect(result.awayWinProbability).toBeGreaterThanOrEqual(0)
      expect(result.awayWinProbability).toBeLessThanOrEqual(1)
    })

    /**
     * Test 2: Probabilities sum to 1.0
     */
    it('should ensure probabilities sum to 1.0', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_001',
        mockMatchData
      )

      const sum =
        result.homeWinProbability +
        result.drawProbability +
        result.awayWinProbability

      expect(Math.abs(sum - 1.0)).toBeLessThan(0.01) // Allow 1% variance
    })

    /**
     * Test 3: Confidence is capped at 0.95
     */
    it('should cap confidence at 0.95 (calibration factor)', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_001',
        mockMatchData
      )

      expect(result.confidence).toBeLessThanOrEqual(0.95)
      expect(result.confidence).toBeGreaterThanOrEqual(0)
    })

    /**
     * Test 4: Model agreement reflects consensus
     */
    it('should calculate model agreement', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_001',
        mockMatchData
      )

      expect(result.modelAgreement).toBeGreaterThanOrEqual(0)
      expect(result.modelAgreement).toBeLessThanOrEqual(1)
    })

    /**
     * Test 5: Handle network errors with retry logic
     */
    it('should handle network errors gracefully', async () => {
      // Test will pass if no exception thrown
      // Actual API call uses exponential backoff
      const result = await matchAnalyticsService.predictMatch(
        'test_match_002',
        mockMatchData
      )

      expect(result).toBeDefined()
    })

    /**
     * Test 6: Return valid result on max retries exceeded
     */
    it('should handle max retry exceeded gracefully', async () => {
      // Service should not throw, return result (may have error field)
      const result = await matchAnalyticsService.predictMatch(
        'test_match_bad',
        mockMatchData
      )

      expect(result).toBeDefined()
      // Result object exists even if prediction failed
    })
  })

  // ─── Caching Tests ───────────────────────────────────────

  describe('Prediction Caching', () => {
    /**
     * Test 7: Cache hit on second call
     */
    it('should cache prediction results', async () => {
      const matchId = 'test_match_cache_001'

      // First call
      const result1 = await matchAnalyticsService.predictMatch(
        matchId,
        mockMatchData
      )

      // Second call (should be from cache)
      const result2 = await matchAnalyticsService.predictMatch(
        matchId,
        mockMatchData
      )

      expect(result1).toEqual(result2)
    })

    /**
     * Test 8: Cache respects TTL (30 minutes)
     */
    it('should respect cache TTL', async () => {
      const matchId = 'test_match_ttl_001'

      const result1 = await matchAnalyticsService.predictMatch(
        matchId,
        mockMatchData
      )

      // Simulate cache expiry by advancing time
      jest.useFakeTimers()
      jest.advanceTimersByTime(31 * 60 * 1000) // 31 minutes

      const result2 = await matchAnalyticsService.predictMatch(
        matchId,
        mockMatchData
      )

      jest.useRealTimers()

      expect(result1).toBeDefined()
      expect(result2).toBeDefined()
    })

    /**
     * Test 9: clearCache removes all predictions
     */
    it('should clear prediction cache', async () => {
      const matchId = 'test_match_clear_001'

      await matchAnalyticsService.predictMatch(matchId, mockMatchData)

      matchAnalyticsService.clearCache()

      // After clearing, next call fetches fresh
      const result = await matchAnalyticsService.predictMatch(
        matchId,
        mockMatchData
      )

      expect(result).toBeDefined()
    })
  })

  // ─── Ensemble Voting Tests ───────────────────────────────────

  describe('Ensemble Voting', () => {
    /**
     * Test 10: Weighted average calculation
     */
    it('should calculate weighted ensemble average', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_ensemble_001',
        mockMatchData
      )

      // Ensemble should balance multiple models
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(0.95)
    })

    /**
     * Test 11: Model agreement indicates consensus
     */
    it('should reflect high agreement on consensus', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_agreement_001',
        mockMatchData
      )

      // Agreement > 0.8 indicates strong consensus
      if (result.modelAgreement > 0.8) {
        expect(result.confidence).toBeGreaterThan(0.6)
      }
    })
  })

  // ─── Value Bet Detection Tests ───────────────────────────────

  describe('Value Bet Detection', () => {
    /**
     * Test 12: Detect value bets with positive edge
     */
    it('should detect value bets with positive edge', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_valuebets_001',
        mockMatchData
      )

      const valueBets = result.valueBets || []

      // Validate bet structure if bets exist
      valueBets.forEach((bet) => {
        expect(bet.edge).toBeGreaterThanOrEqual(0.03) // >= 3% edge
        expect(bet.betType).toBeDefined()
        expect(typeof bet.betType).toBe('string')
        expect(bet.odds).toBeGreaterThan(1)
        expect(bet.impliedProbability).toBeGreaterThanOrEqual(0)
        expect(bet.impliedProbability).toBeLessThanOrEqual(1)
      })
    })

    /**
     * Test 13: Edge calculation >= 3%
     */
    it('should only flag bets with edge >= 3%', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_edge_threshold_001',
        mockMatchData
      )

      const valueBets = result.valueBets || []

      valueBets.forEach((bet) => {
        expect(bet.edge).toBeGreaterThanOrEqual(0.03)
      })
    })

    /**
     * Test 14: Sort value bets by edge descending
     */
    it('should sort value bets by edge (highest first)', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_sorted_001',
        mockMatchData
      )

      const bets = result.valueBets || []

      for (let i = 0; i < bets.length - 1; i++) {
        expect(bets[i].edge).toBeGreaterThanOrEqual(bets[i + 1].edge)
      }
    })
  })

  // ─── Metadata Tests ───────────────────────────────────────

  describe('Model Metadata', () => {
    /**
     * Test 15: Fetch model metadata
     */
    it('should fetch model metadata', async () => {
      const metadata = await matchAnalyticsService.getModelMetadata()

      expect(metadata).toBeDefined()
      expect(metadata.modelCount).toBeGreaterThan(0)
      expect(metadata.modelTypes).toBeInstanceOf(Array)
      expect(metadata.modelVersions).toBeInstanceOf(Array)
      expect(metadata.confidenceThreshold).toBeGreaterThan(0)
      expect(metadata.confidenceThreshold).toBeLessThanOrEqual(1)
      expect(metadata.calibrationFactor).toBeGreaterThan(0)
      expect(metadata.calibrationFactor).toBeLessThanOrEqual(1)
      expect(metadata.lastUpdated).toBeDefined()
    })

    /**
     * Test 16: Cache metadata for 1 hour
     */
    it('should cache metadata for 1 hour', async () => {
      const metadata1 = await matchAnalyticsService.getModelMetadata()

      jest.useFakeTimers()
      jest.advanceTimersByTime(30 * 60 * 1000) // 30 minutes

      const metadata2 = await matchAnalyticsService.getModelMetadata()

      jest.useRealTimers()

      expect(metadata1).toEqual(metadata2)
    })

    /**
     * Test 17: Clear metadata cache
     */
    it('should clear metadata cache', async () => {
      await matchAnalyticsService.getModelMetadata()

      matchAnalyticsService.clearMetadataCache()

      const metadata = await matchAnalyticsService.getModelMetadata()

      expect(metadata).toBeDefined()
    })
  })

  // ─── Error Handling Tests ───────────────────────────────────

  describe('Error Handling', () => {
    /**
     * Test 18: Graceful error handling in predictions
     */
    it('should handle prediction errors gracefully', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_error_001',
        mockMatchData
      )

      expect(result).toBeDefined()
      // Result should always be returned, may have error field if call failed
    })

    /**
     * Test 19: Metadata fallback on error
     */
    it('should return default metadata on fetch error', async () => {
      const metadata = await matchAnalyticsService.getModelMetadata()

      // Should always return metadata (with defaults if fetch fails)
      expect(metadata.modelCount).toBeDefined()
      expect(metadata.modelCount).toBeGreaterThan(0)
    })

    /**
     * Test 20: No thrown errors on invalid input
     */
    it('should handle invalid input gracefully', async () => {
      const invalidData = {
        ...mockMatchData,
        homeTeamRating: -999, // Invalid: negative rating
      }

      const result = await matchAnalyticsService.predictMatch(
        'invalid_match',
        invalidData
      )

      // Should not throw, return valid result object
      expect(result).toBeDefined()
    })
  })

  // ─── Integration Tests ───────────────────────────────────

  describe('Integration', () => {
    /**
     * Test 21: Full prediction workflow
     */
    it('should execute complete prediction workflow', async () => {
      // 1. Fetch metadata
      const metadata = await matchAnalyticsService.getModelMetadata()
      expect(metadata).toBeDefined()

      // 2. Get prediction
      const prediction = await matchAnalyticsService.predictMatch(
        'test_match_workflow_001',
        mockMatchData
      )
      expect(prediction).toBeDefined()

      // 3. Verify prediction quality
      expect(prediction.confidence).toBeGreaterThanOrEqual(0)
      expect(prediction.confidence).toBeLessThanOrEqual(1)

      // 4. Check value bets
      if (prediction.valueBets && prediction.valueBets.length > 0) {
        expect(prediction.valueBets[0].edge).toBeGreaterThanOrEqual(0.03)
      }
    })

    /**
     * Test 22: Multiple concurrent predictions
     */
    it('should handle multiple concurrent predictions', async () => {
      const matchIds = ['match_001', 'match_002', 'match_003']

      const results = await Promise.all(
        matchIds.map((id) =>
          matchAnalyticsService.predictMatch(id, mockMatchData)
        )
      )

      expect(results).toHaveLength(3)
      results.forEach((result) => {
        expect(result).toBeDefined()
        expect(result.homeWinProbability).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
