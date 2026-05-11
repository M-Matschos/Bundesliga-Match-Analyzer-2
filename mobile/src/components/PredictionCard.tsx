/**
 * Prediction Card Component
 *
 * Reusable card for displaying match prediction details.
 * Shows probabilities, confidence, and value bets in a compact format.
 * Supports light/dark themes and full accessibility.
 *
 * Phase D1: Task 5
 */

import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  AccessibilityInfo,
  ViewStyle,
} from 'react-native'
import { getColors } from '../theme/colors'
import { SPACING, typography } from '../theme'
import { PredictionResult, ValueBet } from '../services/MatchAnalyticsService'
import { ConfidenceIndicator } from './ConfidenceIndicator'

// ─── Types ───────────────────────────────────────────────────

/**
 * Component props interface
 */
interface PredictionCardProps {
  prediction: PredictionResult | null
  matchName: string
  confidence?: number
  loading?: boolean
  error?: string | null
  style?: ViewStyle
  onRetry?: () => Promise<void>
  testID?: string
  compact?: boolean
}

// ─── Component ───────────────────────────────────────────────────

/**
 * PredictionCard Component
 *
 * Displays match prediction data with:
 * - Win/Draw/Loss probabilities
 * - Confidence score with visual indicator
 * - Value bet opportunities (sorted by edge)
 * - Loading and error states
 * - Full dark mode support
 * - WCAG AA accessibility compliance
 *
 * @example
 * ```tsx
 * <PredictionCard
 *   prediction={predictionResult}
 *   matchName="Bayern Munich vs Borussia Dortmund"
 *   confidence={0.85}
 *   compact={false}
 * />
 * ```
 */
export function PredictionCard({
  prediction,
  matchName,
  confidence = 0,
  loading = false,
  error = null,
  style,
  onRetry,
  testID = 'prediction-card',
  compact = false,
}: PredictionCardProps): React.ReactElement {
  const mode = useColorScheme() ?? 'light'
  const colors = getColors(mode)

  /**
   * Memoized sorted value bets (descending by edge)
   */
  const sortedValueBets = useMemo(
    (): ValueBet[] => {
      if (!prediction?.valueBets) return []
      return [...prediction.valueBets].sort((a, b) => b.edge - a.edge)
    },
    [prediction?.valueBets]
  )

  /**
   * Determine predicted outcome
   */
  const predictedOutcome = useMemo((): string => {
    if (!prediction) return 'N/A'
    const { homeWinProbability, drawProbability, awayWinProbability } =
      prediction
    if (
      homeWinProbability > drawProbability &&
      homeWinProbability > awayWinProbability
    ) {
      return 'Home Win'
    }
    if (
      awayWinProbability > drawProbability &&
      awayWinProbability > homeWinProbability
    ) {
      return 'Away Win'
    }
    return 'Draw'
  }, [prediction])

  /**
   * Get outcome color based on predicted result
   */
  const getOutcomeColor = (): string => {
    switch (predictedOutcome) {
      case 'Home Win':
        return colors.primary
      case 'Away Win':
        return colors.secondary
      case 'Draw':
        return colors.warning
      default:
        return colors.textSecondary
    }
  }

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          compact ? styles.containerCompact : styles.containerFull,
          { backgroundColor: colors.surface, borderColor: colors.border },
          style,
        ]}
        testID={`${testID}-loading`}
        accessible={true}
        accessibilityLabel="Loading prediction"
      >
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading prediction...
        </Text>
      </View>
    )
  }

  // Error state
  if (error) {
    return (
      <View
        style={[
          styles.container,
          compact ? styles.containerCompact : styles.containerFull,
          { backgroundColor: colors.errorLight, borderColor: colors.error },
          style,
        ]}
        testID={`${testID}-error`}
        accessible={true}
        accessibilityLabel={`Error: ${error}`}
        accessibilityRole="alert"
      >
        <Text style={[styles.errorTitle, { color: colors.error }]}>
          Failed to load prediction
        </Text>
        <Text style={[styles.errorMessage, { color: colors.error }]}>
          {error}
        </Text>
        {onRetry && (
          <Text
            style={[styles.retryHint, { color: colors.primary }]}
            accessible={true}
            accessibilityLabel="Tap to retry"
          >
            Tap card to retry
          </Text>
        )}
      </View>
    )
  }

  // No prediction data
  if (!prediction) {
    return (
      <View
        style={[
          styles.container,
          compact ? styles.containerCompact : styles.containerFull,
          { backgroundColor: colors.surface, borderColor: colors.border },
          style,
        ]}
        testID={`${testID}-empty`}
        accessible={true}
        accessibilityLabel="No prediction available"
      >
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No prediction available
        </Text>
      </View>
    )
  }

  // Success state
  return (
    <View
      style={[
        styles.container,
        compact ? styles.containerCompact : styles.containerFull,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
      testID={testID}
      accessible={true}
      accessibilityLabel={`Prediction for ${matchName}: ${predictedOutcome}`}
    >
      {/* Match Name Header */}
      {!compact && (
        <Text
          style={[styles.matchName, { color: colors.text }]}
          accessibilityRole="header"
          numberOfLines={2}
        >
          {matchName}
        </Text>
      )}

      {/* Probabilities Section */}
      <View
        style={[
          styles.probabilitiesContainer,
          { backgroundColor: colors.background },
        ]}
        accessible={true}
        accessibilityLabel="Predicted probabilities"
      >
        <View style={styles.probabilityItem}>
          <Text
            style={[styles.probabilityLabel, { color: colors.textSecondary }]}
          >
            Home
          </Text>
          <Text
            style={[styles.probabilityValue, { color: colors.text }]}
            accessibilityLabel={`Home win probability: ${(
              prediction.homeWinProbability * 100
            ).toFixed(1)}%`}
          >
            {(prediction.homeWinProbability * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.probabilityItem}>
          <Text
            style={[styles.probabilityLabel, { color: colors.textSecondary }]}
          >
            Draw
          </Text>
          <Text
            style={[styles.probabilityValue, { color: colors.text }]}
            accessibilityLabel={`Draw probability: ${(
              prediction.drawProbability * 100
            ).toFixed(1)}%`}
          >
            {(prediction.drawProbability * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.probabilityItem}>
          <Text
            style={[styles.probabilityLabel, { color: colors.textSecondary }]}
          >
            Away
          </Text>
          <Text
            style={[styles.probabilityValue, { color: colors.text }]}
            accessibilityLabel={`Away win probability: ${(
              prediction.awayWinProbability * 100
            ).toFixed(1)}%`}
          >
            {(prediction.awayWinProbability * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Predicted Outcome Badge */}
      <View
        style={[
          styles.outcomeContainer,
          { backgroundColor: getOutcomeColor() + '20' },
        ]}
        accessible={true}
        accessibilityLabel={`Predicted outcome: ${predictedOutcome}`}
      >
        <Text
          style={[
            styles.outcomeText,
            { color: getOutcomeColor() },
          ]}
        >
          {predictedOutcome}
        </Text>
      </View>

      {/* Confidence Indicator */}
      <View
        style={styles.confidenceSection}
        accessible={true}
        accessibilityLabel={`Confidence: ${(confidence * 100).toFixed(0)}%`}
      >
        <Text
          style={[styles.confidenceLabel, { color: colors.textSecondary }]}
        >
          Model Confidence
        </Text>
        <ConfidenceIndicator
          confidence={confidence}
          mode={mode}
          size={compact ? 'small' : 'medium'}
        />
      </View>

      {/* Value Bets Section */}
      {sortedValueBets.length > 0 && !compact && (
        <View
          style={styles.valueBetsSection}
          accessible={true}
          accessibilityLabel={`${sortedValueBets.length} value bet opportunities`}
        >
          <Text
            style={[styles.valueBetsTitle, { color: colors.text }]}
            accessibilityRole="header"
          >
            Value Bets
          </Text>
          {sortedValueBets.slice(0, 3).map((bet, index) => (
            <View
              key={index}
              style={[
                styles.valueBetRow,
                { backgroundColor: colors.successLight },
              ]}
              accessible={true}
              accessibilityLabel={`${bet.betType}: ${bet.odds.toFixed(2)} odds, +${(
                bet.edge * 100
              ).toFixed(1)}% edge`}
            >
              <View style={styles.betInfoContainer}>
                <Text
                  style={[styles.betType, { color: colors.success }]}
                >
                  {bet.betType}
                </Text>
                <Text
                  style={[styles.betOdds, { color: colors.textSecondary }]}
                >
                  {bet.odds.toFixed(2)}
                </Text>
              </View>
              <Text
                style={[styles.betEdge, { color: colors.success }]}
              >
                +{(bet.edge * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Model Agreement Indicator */}
      {prediction.modelAgreement !== undefined && (
        <View
          style={[
            styles.agreementContainer,
            { backgroundColor: colors.background },
          ]}
          accessible={true}
          accessibilityLabel={`Model agreement: ${(
            prediction.modelAgreement * 100
          ).toFixed(0)}%`}
        >
          <Text
            style={[styles.agreementLabel, { color: colors.textSecondary }]}
          >
            Model Agreement
          </Text>
          <View style={styles.agreementBar}>
            <View
              style={[
                styles.agreementFill,
                {
                  width: `${prediction.modelAgreement * 100}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.agreementText, { color: colors.text }]}
          >
            {(prediction.modelAgreement * 100).toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  containerFull: {
    minHeight: 300,
  },
  containerCompact: {
    minHeight: 180,
  },
  matchName: {
    ...typography.heading3,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  probabilitiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 8,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  probabilityItem: {
    alignItems: 'center',
    flex: 1,
  },
  probabilityLabel: {
    ...typography.caption,
    marginBottom: SPACING.xs,
  },
  probabilityValue: {
    ...typography.heading2,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: SPACING.lg,
    opacity: 0.2,
  },
  outcomeContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  outcomeText: {
    ...typography.body,
    fontWeight: '600',
  },
  confidenceSection: {
    marginBottom: SPACING.md,
  },
  confidenceLabel: {
    ...typography.caption,
    marginBottom: SPACING.sm,
  },
  valueBetsSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  valueBetsTitle: {
    ...typography.label,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  valueBetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  betInfoContainer: {
    flex: 1,
  },
  betType: {
    ...typography.body,
    fontWeight: '600',
  },
  betOdds: {
    ...typography.caption,
    marginTop: SPACING.xs,
  },
  betEdge: {
    ...typography.body,
    fontWeight: '700',
  },
  agreementContainer: {
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  agreementLabel: {
    ...typography.caption,
    marginBottom: SPACING.sm,
  },
  agreementBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  agreementFill: {
    height: '100%',
    borderRadius: 4,
  },
  agreementText: {
    ...typography.caption,
    fontWeight: '600',
  },
  loadingText: {
    ...typography.body,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  errorTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    ...typography.caption,
    marginBottom: SPACING.sm,
  },
  retryHint: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
})

export type { PredictionCardProps }
