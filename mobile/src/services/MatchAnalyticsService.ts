/**
 * Match Analytics Service — Ensemble ML Prediction Engine
 *
 * Provides advanced ML-powered match predictions with ensemble voting,
 * confidence calibration, and value bet detection.
 *
 * Phase D1: Advanced Analytics Engine
 */

import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── Types ───────────────────────────────────────────────────

/**
 * Individual model prediction output
 */
export interface ModelPrediction {
  modelId: string
  modelName: string
  homeWinProb: number // 0-1
  drawProb: number    // 0-1
  awayWinProb: number // 0-1
  confidence: number  // 0-1 (model's internal confidence)
}

/**
 * Betting odds in decimal format
 */
export interface BettingOdds {
  homeWin: number      // e.g., 1.85
  draw: number         // e.g., 3.40
  awayWin: number      // e.g., 4.10
  over2_5: number      // e.g., 1.92
  under2_5: number     // e.g., 1.92
  btts: number         // Both Teams To Score e.g., 1.50
}

/**
 * Detected value betting opportunity
 */
export interface ValueBet {
  selection: string        // e.g., "Home Win", "Over 2.5"
  predictedProbability: number
  impliedProbability: number
  edge: number             // Percentage edge (profit potential)
  recommendedOdds: number
  estimatedROI: number
}

/**
 * Main prediction result with confidence and value bets
 */
export interface PredictionResult {
  matchId: string
  timestamp: number
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  confidence: number       // 0-100 (ensemble confidence)
  confidenceLabel: 'Low' | 'Medium' | 'High'
  predictedWinner: 'Home' | 'Draw' | 'Away'
  modelPredictions: ModelPrediction[]
  valueBets: ValueBet[]
  agreementScore: number   // How many models agree on winner
  error?: string
}

/**
 * Model metadata from backend
 */
export interface ModelMetadata {
  modelCount: number
  modelTypes: string[]
  modelVersions: string[]
  confidenceThreshold: number
  lastUpdated: string
  calibrationFactor: number
}

/**
 * Match data input for predictions
 */
export interface MatchData {
  matchId: string
  homeTeamId: string
  awayTeamId: string
  homeTeamForm?: number[]       // Recent results (1=W, 0.5=D, 0=L)
  awayTeamForm?: number[]
  homeTeamGoalsFor?: number
  homeTeamGoalsAgainst?: number
  awayTeamGoalsFor?: number
  awayTeamGoalsAgainst?: number
  headToHeadResults?: number[]  // 1=home win, 0.5=draw, 0=away win
  homeTeamRating?: number       // 0-100 team strength rating
  awayTeamRating?: number
}

// ─── Constants ───────────────────────────────────────────────────

const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api/v1'
  : 'https://api.matchoracle.app/api/v1'

const CACHE_TTL_METADATA = 60 * 60 * 1000 // 1 hour
const VALUE_BET_THRESHOLD = 0.03 // 3% minimum edge
const MAX_RETRIES = 2
const INITIAL_BACKOFF_MS = 500
const REQUEST_TIMEOUT_MS = 10000

// ─── Service ───────────────────────────────────────────────────

/**
 * MatchAnalyticsService — Ensemble ML prediction engine
 *
 * Integrates multiple ML models with voting logic, confidence calibration,
 * and value bet detection for informed betting decisions.
 */
class MatchAnalyticsService {
  private modelMetadataCache: ModelMetadata | null = null
  private modelMetadataCacheTime: number = 0
  private predictionCache: Map<string, { result: PredictionResult; timestamp: number }> = new Map()

  /**
   * Predict match outcome using ensemble ML models
   *
   * @param matchId - Unique match identifier
   * @param matchData - Historical and contextual match data
   * @returns Prediction result with probabilities and confidence
   */
  async predictMatch(
    matchId: string,
    matchData: MatchData
  ): Promise<PredictionResult> {
    try {
      // Return cached prediction if available and fresh (< 30 min)
      const cached = this.predictionCache.get(matchId)
      if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
        return cached.result
      }

      // Call backend prediction endpoint with retry logic
      const result = await this.callPredictionAPI(matchId, matchData)

      // Cache the result
      this.predictionCache.set(matchId, {
        result,
        timestamp: Date.now(),
      })

      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        matchId,
        timestamp: Date.now(),
        homeWinProb: 0.33,
        drawProb: 0.33,
        awayWinProb: 0.34,
        confidence: 0,
        confidenceLabel: 'Low',
        predictedWinner: 'Draw',
        modelPredictions: [],
        valueBets: [],
        agreementScore: 0,
        error: `Prediction failed: ${errorMsg}. Returned default probabilities.`,
      }
    }
  }

  /**
   * Call backend API for predictions with exponential backoff retry
   *
   * @private
   */
  private async callPredictionAPI(
    matchId: string,
    matchData: MatchData,
    retryCount: number = 0
  ): Promise<PredictionResult> {
    try {
      const token = await AsyncStorage.getItem('auth_token')
      const response = await axios.post(
        `${API_BASE_URL}/predictions`,
        {
          match_id: matchId,
          home_team_id: matchData.homeTeamId,
          away_team_id: matchData.awayTeamId,
          home_team_form: matchData.homeTeamForm || [],
          away_team_form: matchData.awayTeamForm || [],
          home_team_goals_for: matchData.homeTeamGoalsFor || 0,
          home_team_goals_against: matchData.homeTeamGoalsAgainst || 0,
          away_team_goals_for: matchData.awayTeamGoalsFor || 0,
          away_team_goals_against: matchData.awayTeamGoalsAgainst || 0,
          head_to_head: matchData.headToHeadResults || [],
          home_team_rating: matchData.homeTeamRating || 50,
          away_team_rating: matchData.awayTeamRating || 50,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: REQUEST_TIMEOUT_MS,
        }
      )

      return this.parseAndValidatePrediction(matchId, response.data)
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, retryCount)
        await new Promise((resolve) => setTimeout(resolve, backoffMs))
        return this.callPredictionAPI(matchId, matchData, retryCount + 1)
      }
      throw error
    }
  }

  /**
   * Parse and validate API response structure
   *
   * @private
   */
  private parseAndValidatePrediction(
    matchId: string,
    data: unknown
  ): PredictionResult {
    const dataObj = data as Record<string, unknown>

    // Extract model predictions from response
    const modelPredictions: ModelPrediction[] = (
      (dataObj.model_predictions as unknown[]) || []
    )
      .slice(0, 5) // Limit to 5 models
      .map((m) => {
        const model = m as Record<string, unknown>
        return {
          modelId: (model.model_id as string) || `model_${Math.random()}`,
          modelName: (model.model_name as string) || 'Unknown',
          homeWinProb: Math.min(1, Math.max(0, Number(model.home_win_prob) || 0.33)),
          drawProb: Math.min(1, Math.max(0, Number(model.draw_prob) || 0.33)),
          awayWinProb: Math.min(1, Math.max(0, Number(model.away_win_prob) || 0.34)),
          confidence: Math.min(1, Math.max(0, Number(model.confidence) || 0.5)),
        }
      })

    // Calculate ensemble prediction and confidence
    const { homeWinProb, drawProb, awayWinProb, confidence } =
      this.calculateEnsemblePrediction(modelPredictions)

    // Determine predicted winner
    const maxProb = Math.max(homeWinProb, drawProb, awayWinProb)
    let predictedWinner: 'Home' | 'Draw' | 'Away'
    if (homeWinProb === maxProb) {
      predictedWinner = 'Home'
    } else if (drawProb === maxProb) {
      predictedWinner = 'Draw'
    } else {
      predictedWinner = 'Away'
    }

    // Calculate agreement score
    const winnerCounts = [
      modelPredictions.filter((m) => m.homeWinProb > Math.max(m.drawProb, m.awayWinProb))
        .length,
      modelPredictions.filter((m) => m.drawProb > Math.max(m.homeWinProb, m.awayWinProb))
        .length,
      modelPredictions.filter((m) => m.awayWinProb > Math.max(m.homeWinProb, m.drawProb))
        .length,
    ]
    const agreementScore = modelPredictions.length > 0 ? Math.max(...winnerCounts) / modelPredictions.length : 0

    // Determine confidence label
    let confidenceLabel: 'Low' | 'Medium' | 'High'
    if (confidence < 40) {
      confidenceLabel = 'Low'
    } else if (confidence < 70) {
      confidenceLabel = 'Medium'
    } else {
      confidenceLabel = 'High'
    }

    // Detect value bets
    const oddsObj = dataObj.odds as Record<string, unknown> | undefined
    const odds: BettingOdds = {
      homeWin: Number(oddsObj?.home_win) || 1.95,
      draw: Number(oddsObj?.draw) || 3.5,
      awayWin: Number(oddsObj?.away_win) || 4.0,
      over2_5: Number(oddsObj?.over_2_5) || 1.92,
      under2_5: Number(oddsObj?.under_2_5) || 1.92,
      btts: Number(oddsObj?.btts) || 1.5,
    }

    const tempPrediction: Omit<PredictionResult, 'valueBets'> = {
      homeWinProb,
      drawProb,
      awayWinProb,
      confidence,
      confidenceLabel,
      predictedWinner,
      matchId,
      timestamp: Date.now(),
      modelPredictions,
      agreementScore,
    }

    const prediction: PredictionResult = {
      ...tempPrediction,
      valueBets: this.detectValueBets(tempPrediction, odds),
    }

    return prediction
  }

  /**
   * Calculate ensemble prediction from multiple models using voting
   *
   * Formula:
   * - Average probabilities across all models
   * - Weight by individual model confidence scores
   * - Apply calibration factor from metadata
   * - Cap maximum confidence at 95%
   */
  calculateEnsemblePrediction(predictions: ModelPrediction[]): {
    homeWinProb: number
    drawProb: number
    awayWinProb: number
    confidence: number
  } {
    if (predictions.length === 0) {
      return {
        homeWinProb: 0.33,
        drawProb: 0.33,
        awayWinProb: 0.34,
        confidence: 0,
      }
    }

    // Weighted average by model confidence
    const totalConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0)
    const weights = predictions.map((p) => p.confidence / Math.max(totalConfidence, 0.01))

    const homeWinProb = predictions.reduce((sum, p, i) => sum + p.homeWinProb * weights[i], 0)
    const drawProb = predictions.reduce((sum, p, i) => sum + p.drawProb * weights[i], 0)
    const awayWinProb = predictions.reduce((sum, p, i) => sum + p.awayWinProb * weights[i], 0)

    // Calculate agreement percentage (how many models agree on winner)
    const maxProb = Math.max(homeWinProb, drawProb, awayWinProb)
    let winnerAgreement = 0

    if (homeWinProb === maxProb) {
      winnerAgreement = predictions.filter(
        (p) => p.homeWinProb > Math.max(p.drawProb, p.awayWinProb)
      ).length
    } else if (drawProb === maxProb) {
      winnerAgreement = predictions.filter(
        (p) => p.drawProb > Math.max(p.homeWinProb, p.awayWinProb)
      ).length
    } else {
      winnerAgreement = predictions.filter(
        (p) => p.awayWinProb > Math.max(p.homeWinProb, p.drawProb)
      ).length
    }

    const agreementPercentage = (winnerAgreement / predictions.length) * 100
    const calibrationFactor = this.modelMetadataCache?.calibrationFactor || 0.95

    // Confidence = (agreement % * calibration factor), capped at 95%
    let confidence = agreementPercentage * calibrationFactor
    confidence = Math.min(95, confidence)

    return {
      homeWinProb: Math.round(homeWinProb * 10000) / 10000,
      drawProb: Math.round(drawProb * 10000) / 10000,
      awayWinProb: Math.round(awayWinProb * 10000) / 10000,
      confidence: Math.round(confidence * 100) / 100,
    }
  }

  /**
   * Detect value betting opportunities by comparing predicted vs. implied probabilities
   *
   * Formula:
   * - Implied probability = 1 / decimal_odds
   * - Value exists when: predicted_prob > implied_prob (by 3%+ threshold)
   * - ROI = (predicted_prob / implied_prob) - 1
   */
  detectValueBets(
    prediction: Omit<PredictionResult, 'valueBets'>,
    odds: BettingOdds
  ): ValueBet[] {
    const valueBets: ValueBet[] = []

    // Check Home Win value
    const homeImplied = 1 / odds.homeWin
    if (prediction.homeWinProb > homeImplied + VALUE_BET_THRESHOLD) {
      valueBets.push({
        selection: 'Home Win',
        predictedProbability: prediction.homeWinProb,
        impliedProbability: homeImplied,
        edge: ((prediction.homeWinProb - homeImplied) / homeImplied) * 100,
        recommendedOdds: odds.homeWin,
        estimatedROI: (prediction.homeWinProb / homeImplied) * 100 - 100,
      })
    }

    // Check Draw value
    const drawImplied = 1 / odds.draw
    if (prediction.drawProb > drawImplied + VALUE_BET_THRESHOLD) {
      valueBets.push({
        selection: 'Draw',
        predictedProbability: prediction.drawProb,
        impliedProbability: drawImplied,
        edge: ((prediction.drawProb - drawImplied) / drawImplied) * 100,
        recommendedOdds: odds.draw,
        estimatedROI: (prediction.drawProb / drawImplied) * 100 - 100,
      })
    }

    // Check Away Win value
    const awayImplied = 1 / odds.awayWin
    if (prediction.awayWinProb > awayImplied + VALUE_BET_THRESHOLD) {
      valueBets.push({
        selection: 'Away Win',
        predictedProbability: prediction.awayWinProb,
        impliedProbability: awayImplied,
        edge: ((prediction.awayWinProb - awayImplied) / awayImplied) * 100,
        recommendedOdds: odds.awayWin,
        estimatedROI: (prediction.awayWinProb / awayImplied) * 100 - 100,
      })
    }

    // Check Over 2.5 value
    const over2_5Implied = 1 / odds.over2_5
    const estimatedOver2_5Prob = Math.min(0.65, Math.max(0.35, (prediction.homeWinProb + prediction.awayWinProb) * 0.5))

    if (estimatedOver2_5Prob > over2_5Implied + VALUE_BET_THRESHOLD) {
      valueBets.push({
        selection: 'Over 2.5 Goals',
        predictedProbability: estimatedOver2_5Prob,
        impliedProbability: over2_5Implied,
        edge: ((estimatedOver2_5Prob - over2_5Implied) / over2_5Implied) * 100,
        recommendedOdds: odds.over2_5,
        estimatedROI: (estimatedOver2_5Prob / over2_5Implied) * 100 - 100,
      })
    }

    // Sort by edge percentage descending
    return valueBets.sort((a, b) => b.edge - a.edge)
  }

  /**
   * Fetch model metadata (versions, types, confidence thresholds)
   *
   * Cached for 1 hour to prevent excessive API calls.
   */
  async getModelMetadata(): Promise<ModelMetadata> {
    try {
      // Return cached metadata if fresh
      if (
        this.modelMetadataCache &&
        Date.now() - this.modelMetadataCacheTime < CACHE_TTL_METADATA
      ) {
        return this.modelMetadataCache
      }

      const token = await AsyncStorage.getItem('auth_token')
      const response = await axios.get(`${API_BASE_URL}/models/metadata`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: REQUEST_TIMEOUT_MS,
      })

      const respData = response.data as Record<string, unknown>
      const metadata: ModelMetadata = {
        modelCount: (respData.model_count as number) || 3,
        modelTypes: (respData.model_types as string[]) || [
          'Logistic Regression',
          'Random Forest',
          'Gradient Boosting',
        ],
        modelVersions: (respData.model_versions as string[]) || ['1.0', '1.0', '1.0'],
        confidenceThreshold: (respData.confidence_threshold as number) || 0.6,
        lastUpdated: (respData.last_updated as string) || new Date().toISOString(),
        calibrationFactor: (respData.calibration_factor as number) || 0.95,
      }

      this.modelMetadataCache = metadata
      this.modelMetadataCacheTime = Date.now()

      return metadata
    } catch {
      // Return default metadata on error
      return {
        modelCount: 3,
        modelTypes: ['Logistic Regression', 'Random Forest', 'Gradient Boosting'],
        modelVersions: ['1.0', '1.0', '1.0'],
        confidenceThreshold: 0.6,
        lastUpdated: new Date().toISOString(),
        calibrationFactor: 0.95,
      }
    }
  }

  /**
   * Clear prediction cache
   */
  clearCache(): void {
    this.predictionCache.clear()
  }

  /**
   * Clear metadata cache (forces re-fetch on next call)
   */
  clearMetadataCache(): void {
    this.modelMetadataCache = null
    this.modelMetadataCacheTime = 0
  }
}

// ─── Export ───────────────────────────────────────────────────

export const matchAnalyticsService = new MatchAnalyticsService()

export default matchAnalyticsService
