/**
 * Analytics Context
 *
 * Global state management for match predictions and model metadata.
 * Provides centralized caching and error handling for analytics features.
 *
 * Phase D1: Task 3
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  matchAnalyticsService,
  PredictionResult,
  ModelMetadata,
} from '../services/MatchAnalyticsService'

// ─── Types ───────────────────────────────────────────────────

/**
 * Analytics context state interface
 */
export interface AnalyticsContextType {
  // Model metadata
  modelMetadata: ModelMetadata | null
  modelLoading: boolean
  modelError: string | null

  // Prediction cache
  predictions: Record<string, PredictionResult>

  // Actions
  fetchModelMetadata: () => Promise<void>
  clearCache: () => void
  clearModelCache: () => void
}

/**
 * Analytics provider props
 */
interface AnalyticsProviderProps {
  children: React.ReactNode
}

// ─── Context Creation ───────────────────────────────────────

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

// ─── Provider Component ───────────────────────────────────────

/**
 * AnalyticsProvider Component
 *
 * Wraps application with analytics context. Should be placed in provider hierarchy
 * after ThemeProvider but before other feature providers.
 *
 * @example
 * ```typescript
 * <GestureHandlerRootView>
 *   <ThemeProvider>
 *     <AnalyticsProvider>
 *       <NotificationProvider>
 *         <Navigation />
 *       </NotificationProvider>
 *     </AnalyticsProvider>
 *   </ThemeProvider>
 * </GestureHandlerRootView>
 * ```
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps): React.ReactElement {
  // Model metadata state
  const [modelMetadata, setModelMetadata] = useState<ModelMetadata | null>(null)
  const [modelLoading, setModelLoading] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)

  // Global prediction cache (keyed by matchId)
  const [predictions, setPredictions] = useState<Record<string, PredictionResult>>({})

  /**
   * Fetch and cache model metadata from backend
   *
   * Called on provider mount to initialize model information.
   * Handles errors gracefully with fallback to default metadata.
   */
  const fetchModelMetadata = useCallback(async (): Promise<void> => {
    try {
      setModelLoading(true)
      setModelError(null)

      const metadata = await matchAnalyticsService.getModelMetadata()

      setModelMetadata(metadata)
      setModelError(null)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load model metadata'
      setModelError(errorMsg)

      // Set default metadata on error
      setModelMetadata({
        modelCount: 3,
        modelTypes: ['Logistic Regression', 'Random Forest', 'Gradient Boosting'],
        modelVersions: ['1.0', '1.0', '1.0'],
        confidenceThreshold: 0.6,
        lastUpdated: new Date().toISOString(),
        calibrationFactor: 0.95,
      })
    } finally {
      setModelLoading(false)
    }
  }, [])

  /**
   * Clear prediction cache
   */
  const clearCache = useCallback((): void => {
    setPredictions({})
    matchAnalyticsService.clearCache()
  }, [])

  /**
   * Clear model metadata cache (forces re-fetch on next fetch)
   */
  const clearModelCache = useCallback((): void => {
    setModelMetadata(null)
    setModelError(null)
    matchAnalyticsService.clearMetadataCache()
  }, [])

  /**
   * Fetch model metadata on mount
   */
  useEffect(() => {
    fetchModelMetadata()
  }, [fetchModelMetadata])

  /**
   * Context value
   */
  const value: AnalyticsContextType = {
    modelMetadata,
    modelLoading,
    modelError,
    predictions,
    fetchModelMetadata,
    clearCache,
    clearModelCache,
  }

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

// ─── Hook ───────────────────────────────────────────────────

/**
 * useAnalytics Hook
 *
 * Access analytics context. Must be used within AnalyticsProvider.
 *
 * @returns {AnalyticsContextType} Analytics context value
 * @throws {Error} If used outside AnalyticsProvider
 *
 * @example
 * ```typescript
 * const { modelMetadata, predictions } = useAnalytics()
 *
 * return (
 *   <View>
 *     <Text>Models: {modelMetadata?.modelCount}</Text>
 *   </View>
 * )
 * ```
 */
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext)

  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }

  return context
}

export type { AnalyticsProviderProps }
