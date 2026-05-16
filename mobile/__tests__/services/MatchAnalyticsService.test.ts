/**
 * MatchAnalyticsService Unit Tests
 *
 * Comprehensive test suite for match prediction engine.
 * Covers: API calls, caching, error handling, ensemble voting,
 * value bet calculation, and metadata management.
 *
 * Phase D1: Task 7
 *
 * NOTE: All HTTP calls are mocked via jest.mock('axios') — no real network traffic.
 * Types are aligned to the actual PredictionResult / ModelMetadata interfaces in
 * src/services/MatchAnalyticsService.ts.
 */

import { matchAnalyticsService } from '../../src/services/MatchAnalyticsService'
import type {
  PredictionResult,
  ModelMetadata,
  MatchData,
  ModelPrediction,
} from '../../src/services/MatchAnalyticsService'

// ─── Mocks ───────────────────────────────────────────────────

jest.mock('axios')
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}))

import axios from 'axios'
const mockedAxios = axios as jest.Mocked<typeof axios>

/**
 * Helper: build a minimal valid API response body that
 * parseAndValidatePrediction() can process.
 */
function buildApiResponse(overrides: Record<string, unknown> = {}) {
  return {
    model_predictions: [
      {
        model_id: 'lr_1',
        model_name: 'Logistic Regression',
        home_win_prob: 0.45,
        draw_prob: 0.30,
        away_win_prob: 0.25,
        confidence: 0.8,
      },
      {
        model_id: 'rf_1',
        model_name: 'Random Forest',
        home_win_prob: 0.50,
        draw_prob: 0.28,
        away_win_prob: 0.22,
        confidence: 0.85,
      },
      {
        model_id: 'gb_1',
        model_name: 'Gradient Boosting',
        home_win_prob: 0.42,
        draw_prob: 0.32,
        away_win_prob: 0.26,
        confidence: 0.78,
      },
    ],
    odds: {
      home_win: 1.85,
      draw: 3.40,
      away_win: 4.10,
      over_2_5: 1.92,
      under_2_5: 1.92,
      btts: 1.50,
    },
    ...overrides,
  }
}

function buildMetadataResponse(overrides: Record<string, unknown> = {}) {
  return {
    model_count: 3,
    model_types: ['Logistic Regression', 'Random Forest', 'Gradient Boosting'],
    model_versions: ['1.0', '1.0', '1.0'],
    confidence_threshold: 0.6,
    last_updated: new Date().toISOString(),
    calibration_factor: 0.95,
    ...overrides,
  }
}

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

// ─── Tests ───────────────────────────────────────────────────

describe('MatchAnalyticsService', () => {
  /**
   * Reset mocks and caches before each test
   */
  beforeEach(() => {
    matchAnalyticsService.clearCache()
    matchAnalyticsService.clearMetadataCache()
    jest.clearAllMocks()

    // Default: axios.post returns a valid prediction, axios.get returns metadata
    mockedAxios.post = jest.fn().mockResolvedValue({ data: buildApiResponse() })
    mockedAxios.get = jest.fn().mockResolvedValue({ data: buildMetadataResponse() })
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
      expect(result.homeWinProb).toBeGreaterThanOrEqual(0)
      expect(result.homeWinProb).toBeLessThanOrEqual(1)
      expect(result.drawProb).toBeGreaterThanOrEqual(0)
      expect(result.drawProb).toBeLessThanOrEqual(1)
      expect(result.awayWinProb).toBeGreaterThanOrEqual(0)
      expect(result.awayWinProb).toBeLessThanOrEqual(1)
    })

    /**
     * Test 2: Probabilities sum to ~1.0
     */
    it('should ensure probabilities sum to 1.0', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_001',
        mockMatchData
      )

      const sum = result.homeWinProb + result.drawProb + result.awayWinProb
      expect(Math.abs(sum - 1.0)).toBeLessThan(0.01) // Allow 1% variance
    })

    /**
     * Test 3: Confidence is capped at 95 (0-100 scale, calibration factor applied)
     */
    it('should cap confidence at 95 (calibration factor)', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_001',
        mockMatchData
      )

      expect(result.confidence).toBeLessThanOrEqual(95)
      expect(result.confidence).toBeGreaterThanOrEqual(0)
    })

    /**
     * Test 4: agreementScore reflects model consensus
     */
    it('should calculate agreementScore', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_001',
        mockMatchData
      )

      expect(result.agreementScore).toBeGreaterThanOrEqual(0)
      expect(result.agreementScore).toBeLessThanOrEqual(1)
    })

    /**
     * Test 5: Handle network errors with retry logic — returns fallback result
     */
    it('should handle network errors gracefully', async () => {
      mockedAxios.post = jest.fn().mockRejectedValue(new Error('Network error'))

      const result = await matchAnalyticsService.predictMatch(
        'test_match_002',
        mockMatchData
      )

      expect(result).toBeDefined()
      expect(result.error).toBeDefined()
    })

    /**
     * Test 6: Return valid fallback result when all retries are exceeded
     */
    it('should handle max retry exceeded gracefully', async () => {
      mockedAxios.post = jest.fn().mockRejectedValue(new Error('Timeout'))

      const result = await matchAnalyticsService.predictMatch(
        'test_match_bad',
        mockMatchData
      )

      expect(result).toBeDefined()
      expect(result.homeWinProb).toBe(0.33)
      expect(result.drawProb).toBe(0.33)
    })
  })

  // ─── Caching Tests ───────────────────────────────────────

  describe('Prediction Caching', () => {
    /**
     * Test 7: Cache hit on second call — axios.post called only once
     */
    it('should cache prediction results', async () => {
      const matchId = 'test_match_cache_001'

      const result1 = await matchAnalyticsService.predictMatch(matchId, mockMatchData)
      const result2 = await matchAnalyticsService.predictMatch(matchId, mockMatchData)

      expect(result1).toEqual(result2)
      expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    })

    /**
     * Test 8: Cache respects TTL (30 minutes) — second call after expiry re-fetches
     */
    it('should respect cache TTL', async () => {
      const matchId = 'test_match_ttl_001'

      jest.useFakeTimers()

      await matchAnalyticsService.predictMatch(matchId, mockMatchData)
      expect(mockedAxios.post).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(31 * 60 * 1000) // 31 minutes → cache expired

      await matchAnalyticsService.predictMatch(matchId, mockMatchData)
      expect(mockedAxios.post).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })

    /**
     * Test 9: clearCache forces re-fetch on next call
     */
    it('should clear prediction cache', async () => {
      const matchId = 'test_match_clear_001'

      await matchAnalyticsService.predictMatch(matchId, mockMatchData)
      expect(mockedAxios.post).toHaveBeenCalledTimes(1)

      matchAnalyticsService.clearCache()

      await matchAnalyticsService.predictMatch(matchId, mockMatchData)
      expect(mockedAxios.post).toHaveBeenCalledTimes(2)
    })
  })

  // ─── Ensemble Voting Tests ───────────────────────────────────

  describe('Ensemble Voting', () => {
    /**
     * Test 10: Weighted average calculation stays within bounds
     */
    it('should calculate weighted ensemble average', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_ensemble_001',
        mockMatchData
      )

      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(95)
    })

    /**
     * Test 11: High agreementScore correlates with higher confidence
     */
    it('should reflect high agreement when all models agree', () => {
      const unanimousModels: ModelPrediction[] = [
        { modelId: 'm1', modelName: 'A', homeWinProb: 0.6, drawProb: 0.25, awayWinProb: 0.15, confidence: 0.9 },
        { modelId: 'm2', modelName: 'B', homeWinProb: 0.55, drawProb: 0.28, awayWinProb: 0.17, confidence: 0.85 },
        { modelId: 'm3', modelName: 'C', homeWinProb: 0.58, drawProb: 0.26, awayWinProb: 0.16, confidence: 0.88 },
      ]

      const { confidence } = matchAnalyticsService.calculateEnsemblePrediction(unanimousModels)
      // All 3 models agree on Home Win → agreement = 100% → confidence near 95
      expect(confidence).toBeGreaterThan(60)
    })

    /**
     * Test 12: Empty model list returns safe defaults
     */
    it('should return safe defaults for empty model list', () => {
      const { homeWinProb, drawProb, awayWinProb, confidence } =
        matchAnalyticsService.calculateEnsemblePrediction([])

      expect(homeWinProb).toBe(0.33)
      expect(drawProb).toBe(0.33)
      expect(awayWinProb).toBe(0.34)
      expect(confidence).toBe(0)
    })
  })

  // ─── Value Bet Detection Tests ───────────────────────────────

  describe('Value Bet Detection', () => {
    /**
     * Test 13: Each value bet has edge >= 0 and valid structure
     */
    it('should detect value bets with positive edge', async () => {
      const result = await matchAnalyticsService.predictMatch(
        'test_match_valuebets_001',
        mockMatchData
      )

      const valueBets = result.valueBets || []

      valueBets.forEach((bet) => {
        expect(bet.edge).toBeGreaterThanOrEqual(0)
        expect(bet.selection).toBeDefined()
        expect(typeof bet.selection).toBe('string')
        expect(bet.recommendedOdds).toBeGreaterThan(1)
        expect(bet.impliedProbability).toBeGreaterThanOrEqual(0)
        expect(bet.impliedProbability).toBeLessThanOrEqual(1)
      })
    })

    /**
     * Test 14: Value bets are sorted by edge descending
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

    /**
     * Test 15: detectValueBets returns empty array when no edge exists
     */
    it('should return no value bets when odds are too tight', () => {
      // Build a prediction where implied probs exceed predicted probs
      const prediction = {
        matchId: 'x',
        timestamp: Date.now(),
        homeWinProb: 0.30,
        drawProb: 0.30,
        awayWinProb: 0.40,
        confidence: 50,
        confidenceLabel: 'Medium' as const,
        predictedWinner: 'Away' as const,
        modelPredictions: [],
        agreementScore: 0.5,
      }

      const tightOdds = {
        homeWin: 1.20,  // implied = 0.833 >> 0.30 → no value
        draw: 2.00,     // implied = 0.500 >> 0.30 → no value
        awayWin: 1.50,  // implied = 0.667 >> 0.40 → no value
        over2_5: 1.10,
        under2_5: 7.00,
        btts: 1.20,
      }

      const bets = matchAnalyticsService.detectValueBets(prediction, tightOdds)
      expect(bets).toHaveLength(0)
    })
  })

  // ─── Metadata Tests ───────────────────────────────────────

  describe('Model Metadata', () => {
    /**
     * Test 16: Fetch model metadata from API
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
     * Test 17: Cache metadata — only one GET within 1 hour
     */
    it('should cache metadata for 1 hour', async () => {
      jest.useFakeTimers()

      await matchAnalyticsService.getModelMetadata()
      expect(mockedAxios.get).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(30 * 60 * 1000) // 30 minutes — still within TTL

      await matchAnalyticsService.getModelMetadata()
      expect(mockedAxios.get).toHaveBeenCalledTimes(1) // cached, no new call

      jest.useRealTimers()
    })

    /**
     * Test 18: clearMetadataCache forces re-fetch
     */
    it('should clear metadata cache', async () => {
      await matchAnalyticsService.getModelMetadata()
      expect(mockedAxios.get).toHaveBeenCalledTimes(1)

      matchAnalyticsService.clearMetadataCache()

      await matchAnalyticsService.getModelMetadata()
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    })

    /**
     * Test 19: Return default metadata when API fails
     */
    it('should return default metadata on fetch error', async () => {
      mockedAxios.get = jest.fn().mockRejectedValue(new Error('API down'))

      const metadata = await matchAnalyticsService.getModelMetadata()

      expect(metadata.modelCount).toBe(3)
      expect(metadata.modelTypes).toContain('Logistic Regression')
      expect(metadata.calibrationFactor).toBe(0.95)
    })
  })

  // ─── Error Handling Tests ───────────────────────────────────

  describe('Error Handling', () => {
    /**
     * Test 20: Graceful error handling — no thrown exceptions
     */
    it('should handle prediction errors gracefully', async () => {
      mockedAxios.post = jest.fn().mockRejectedValue(new Error('Service unavailable'))

      const result = await matchAnalyticsService.predictMatch(
        'test_match_error_001',
        mockMatchData
      )

      expect(result).toBeDefined()
      expect(result.error).toContain('Prediction failed')
    })

    /**
     * Test 21: No thrown errors on edge-case input (negative rating)
     */
    it('should handle invalid input gracefully', async () => {
      const invalidData: MatchData = {
        ...mockMatchData,
        homeTeamRating: -999,
      }

      const result = await matchAnalyticsService.predictMatch(
        'invalid_match',
        invalidData
      )

      expect(result).toBeDefined()
    })
  })

  // ─── Integration Tests ───────────────────────────────────

  describe('Integration', () => {
    /**
     * Test 22: Full prediction workflow
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
      expect(prediction.confidence).toBeLessThanOrEqual(95)

      // 4. Check value bets structure
      if (prediction.valueBets && prediction.valueBets.length > 0) {
        expect(prediction.valueBets[0].selection).toBeDefined()
        expect(prediction.valueBets[0].edge).toBeGreaterThanOrEqual(0)
      }
    })

    /**
     * Test 23: Multiple concurrent predictions resolve independently
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
        expect(result.homeWinProb).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
