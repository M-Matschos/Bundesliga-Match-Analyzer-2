/**
 * Analytics Screen
 *
 * Main dashboard for match predictions and betting insights.
 * Displays upcoming matches with ensemble predictions, confidence scores,
 * and value bet opportunities.
 *
 * Phase D1: Task 4
 */

import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  AccessibilityInfo,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAnalytics } from '../context/AnalyticsContext'
import { useMatchPrediction } from '../hooks/useMatchPrediction'
import { getColors } from '../theme/colors'
import { spacing, typography } from '../theme'
import { PredictionCard } from '../components/PredictionCard'
import { ConfidenceIndicator } from '../components/ConfidenceIndicator'

// ─── Types ───────────────────────────────────────────────────

/**
 * Upcoming match data for display
 */
interface UpcomingMatch {
  matchId: string
  homeTeamId: string
  homeTeamName: string
  homeTeamLogo?: string
  awayTeamId: string
  awayTeamName: string
  awayTeamLogo?: string
  matchDate: string // ISO timestamp
  leagueId: string
  homeTeamForm: number[]
  awayTeamForm: number[]
  homeTeamGoalsFor: number
  homeTeamGoalsAgainst: number
  awayTeamGoalsFor: number
  awayTeamGoalsAgainst: number
  homeTeamRating: number
  awayTeamRating: number
}

// ─── Constants ───────────────────────────────────────────────────

/**
 * Demo upcoming matches for development/testing
 */
const DEMO_MATCHES: UpcomingMatch[] = [
  {
    matchId: 'match_001',
    homeTeamId: 'team_001',
    homeTeamName: 'Bayern Munich',
    homeTeamLogo: 'https://example.com/logos/bayern.png',
    awayTeamId: 'team_002',
    awayTeamName: 'Borussia Dortmund',
    awayTeamLogo: 'https://example.com/logos/bvb.png',
    matchDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    leagueId: 'bundesliga',
    homeTeamForm: [1, 1, 0.5, 1, 1],
    awayTeamForm: [1, 0.5, 0.5, 1, 0.5],
    homeTeamGoalsFor: 28,
    homeTeamGoalsAgainst: 8,
    awayTeamGoalsFor: 24,
    awayTeamGoalsAgainst: 12,
    homeTeamRating: 78,
    awayTeamRating: 72,
  },
  {
    matchId: 'match_002',
    homeTeamId: 'team_003',
    homeTeamName: 'Bayer Leverkusen',
    homeTeamLogo: 'https://example.com/logos/leverkusen.png',
    awayTeamId: 'team_004',
    awayTeamName: 'RB Leipzig',
    awayTeamLogo: 'https://example.com/logos/leipzig.png',
    matchDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    leagueId: 'bundesliga',
    homeTeamForm: [1, 1, 1, 0.5, 1],
    awayTeamForm: [0.5, 1, 0.5, 1, 1],
    homeTeamGoalsFor: 22,
    homeTeamGoalsAgainst: 10,
    awayTeamGoalsFor: 20,
    awayTeamGoalsAgainst: 14,
    homeTeamRating: 76,
    awayTeamRating: 74,
  },
  {
    matchId: 'match_003',
    homeTeamId: 'team_005',
    homeTeamName: 'Eintracht Frankfurt',
    homeTeamLogo: 'https://example.com/logos/frankfurt.png',
    awayTeamId: 'team_006',
    awayTeamName: 'TSG Hoffenheim',
    awayTeamLogo: 'https://example.com/logos/hoffenheim.png',
    matchDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    leagueId: 'bundesliga',
    homeTeamForm: [1, 0.5, 1, 1, 0.5],
    awayTeamForm: [0.5, 0.5, 1, 0.5, 1],
    homeTeamGoalsFor: 18,
    homeTeamGoalsAgainst: 16,
    awayTeamGoalsFor: 16,
    awayTeamGoalsAgainst: 18,
    homeTeamRating: 70,
    awayTeamRating: 68,
  },
]

// ─── Component ───────────────────────────────────────────────────

/**
 * AnalyticsScreen Component
 *
 * Main dashboard for match predictions. Displays:
 * - Header with model metadata and refresh button
 * - Pull-to-refresh FlatList of upcoming matches
 * - Prediction cards with confidence indicators
 * - Value bet opportunities
 * - Loading, error, and empty states
 */
export function AnalyticsScreen(): React.ReactElement {
  const mode = useColorScheme() ?? 'light'
  const colors = getColors(mode)
  const insets = useSafeAreaInsets()
  const { modelMetadata, modelLoading } = useAnalytics()
  const [refreshing, setRefreshing] = useState(false)

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true)
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }, [])

  /**
   * Render individual match card with prediction
   */
  const renderMatchCard = useCallback(
    ({ item }: { item: UpcomingMatch }): React.ReactElement => {
      return (
        <MatchCardWithPrediction
          match={item}
          mode={mode}
          onRefresh={handleRefresh}
        />
      )
    },
    [mode, handleRefresh]
  )

  /**
   * Render list header with model info and metadata
   */
  const renderListHeader = (): React.ReactElement => (
    <View
      style={[styles.header, { backgroundColor: colors.background }]}
      accessible={true}
      accessibilityLabel="Analytics dashboard header"
    >
      <Text
        style={[styles.headerTitle, { color: colors.text }]}
        accessibilityRole="header"
      >
        Match Analytics
      </Text>

      {modelMetadata && (
        <View
          style={[styles.modelInfoBadge, { backgroundColor: colors.surface }]}
          accessible={true}
          accessibilityLabel={`Using ${modelMetadata.modelCount} prediction models`}
        >
          <Text style={[styles.modelInfoText, { color: colors.textSecondary }]}>
            Models: {modelMetadata.modelCount} •{' '}
            {modelMetadata.confidenceThreshold * 100}% threshold
          </Text>
        </View>
      )}

      <Text
        style={[styles.subheader, { color: colors.textSecondary }]}
        accessibilityLabel="Upcoming matches section"
      >
        Upcoming Matches
      </Text>
    </View>
  )

  /**
   * Render empty state
   */
  const renderEmptyState = (): React.ReactElement => (
    <View
      style={[styles.emptyState, { backgroundColor: colors.background }]}
      accessible={true}
      accessibilityLabel="No matches available"
    >
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        No upcoming matches available.
      </Text>
      <Text
        style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}
      >
        Check back later for new predictions.
      </Text>
    </View>
  )

  /**
   * Render loading state
   */
  if (modelLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
        accessible={true}
        accessibilityLabel="Loading analytics"
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
          accessibilityLabel="Loading match predictions"
        />
      </View>
    )
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <FlatList
        data={DEMO_MATCHES}
        renderItem={renderMatchCard}
        keyExtractor={(item) => item.matchId}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
        scrollEnabled={true}
        accessibilityLabel="Match list"
        testID="analytics-match-list"
      />
    </View>
  )
}

// ─── Sub-Component ───────────────────────────────────────────────────

/**
 * MatchCardWithPrediction Sub-Component
 *
 * Displays a single match with prediction data, confidence indicator,
 * and value bet opportunities.
 */
interface MatchCardWithPredictionProps {
  match: UpcomingMatch
  mode: 'light' | 'dark'
  onRefresh: () => Promise<void>
}

function MatchCardWithPrediction({
  match,
  mode,
  onRefresh,
}: MatchCardWithPredictionProps): React.ReactElement {
  const colors = getColors(mode)
  const { prediction, loading, error, confidence } = useMatchPrediction(
    match.matchId,
    {
      matchId: match.matchId,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      homeTeamForm: match.homeTeamForm,
      awayTeamForm: match.awayTeamForm,
      homeTeamGoalsFor: match.homeTeamGoalsFor,
      homeTeamGoalsAgainst: match.homeTeamGoalsAgainst,
      awayTeamGoalsFor: match.awayTeamGoalsFor,
      awayTeamGoalsAgainst: match.awayTeamGoalsAgainst,
      homeTeamRating: match.homeTeamRating,
      awayTeamRating: match.awayTeamRating,
    }
  )

  /**
   * Format date for display (e.g., "May 15, 2:30 PM")
   */
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Determine predicted winner
   */
  const getPredictedWinner = (): string => {
    if (!prediction) return 'N/A'
    const { homeWinProbability, drawProbability, awayWinProbability } =
      prediction
    if (homeWinProbability > drawProbability &&
        homeWinProbability > awayWinProbability) {
      return 'Home'
    }
    if (awayWinProbability > drawProbability &&
        awayWinProbability > homeWinProbability) {
      return 'Away'
    }
    return 'Draw'
  }

  /**
   * Sort value bets by edge descending
   */
  const sortedValueBets = prediction?.valueBets?.sort(
    (a, b) => b.edge - a.edge
  ) ?? []

  if (loading) {
    return (
      <View
        style={[styles.cardContainer, { borderColor: colors.border }]}
        testID={`match-card-loading-${match.matchId}`}
      >
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View
        style={[
          styles.cardContainer,
          { borderColor: colors.border, backgroundColor: colors.errorLight },
        ]}
        accessible={true}
        accessibilityLabel={`Error loading prediction for ${match.homeTeamName} vs ${match.awayTeamName}`}
        testID={`match-card-error-${match.matchId}`}
      >
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      </View>
    )
  }

  return (
    <View
      style={[styles.cardContainer, { borderColor: colors.border }]}
      accessible={true}
      accessibilityLabel={`Match prediction: ${match.homeTeamName} vs ${match.awayTeamName}`}
      testID={`match-card-${match.matchId}`}
    >
      {/* Match Header with Teams and Date */}
      <View style={styles.cardHeader}>
        <View style={styles.teamContainer}>
          <Text style={[styles.teamName, { color: colors.text }]}>
            {match.homeTeamName}
          </Text>
          <Text style={[styles.teamRating, { color: colors.textSecondary }]}>
            {match.homeTeamRating}
          </Text>
        </View>
        <Text
          style={[styles.vs, { color: colors.textSecondary }]}
          accessible={true}
          accessibilityLabel="versus"
        >
          vs
        </Text>
        <View style={styles.teamContainer}>
          <Text style={[styles.teamName, { color: colors.text }]}>
            {match.awayTeamName}
          </Text>
          <Text style={[styles.teamRating, { color: colors.textSecondary }]}>
            {match.awayTeamRating}
          </Text>
        </View>
      </View>

      <Text
        style={[styles.matchDate, { color: colors.textSecondary }]}
        accessible={true}
        accessibilityLabel={`Match date: ${formatDate(match.matchDate)}`}
      >
        {formatDate(match.matchDate)}
      </Text>

      {/* Prediction Content */}
      {prediction && (
        <>
          {/* Probabilities */}
          <View
            style={[styles.probabilitiesContainer, { backgroundColor: colors.surface }]}
            accessible={true}
            accessibilityLabel="Predicted probabilities"
          >
            <View style={styles.probabilityItem}>
              <Text style={[styles.probabilityLabel, { color: colors.textSecondary }]}>
                Home
              </Text>
              <Text style={[styles.probabilityValue, { color: colors.text }]}>
                {(prediction.homeWinProbability * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.probabilityItem}>
              <Text style={[styles.probabilityLabel, { color: colors.textSecondary }]}>
                Draw
              </Text>
              <Text style={[styles.probabilityValue, { color: colors.text }]}>
                {(prediction.drawProbability * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.probabilityItem}>
              <Text style={[styles.probabilityLabel, { color: colors.textSecondary }]}>
                Away
              </Text>
              <Text style={[styles.probabilityValue, { color: colors.text }]}>
                {(prediction.awayWinProbability * 100).toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Predicted Winner Badge */}
          <View
            style={[styles.predictionBadge, { backgroundColor: colors.primaryLight }]}
            accessible={true}
            accessibilityLabel={`Predicted winner: ${getPredictedWinner()}`}
          >
            <Text style={[styles.predictionText, { color: colors.primary }]}>
              Predicted: {getPredictedWinner()}
            </Text>
          </View>

          {/* Confidence Indicator */}
          <View
            style={styles.confidenceContainer}
            accessible={true}
            accessibilityLabel={`Confidence: ${(confidence * 100).toFixed(0)}%`}
          >
            <ConfidenceIndicator
              confidence={confidence}
              mode={mode}
              size="medium"
            />
          </View>

          {/* Value Bets */}
          {sortedValueBets.length > 0 && (
            <View
              style={styles.valueBetsContainer}
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
                    styles.valueBetItem,
                    { backgroundColor: colors.successLight },
                  ]}
                  accessible={true}
                  accessibilityLabel={`${bet.betType}: edge ${(bet.edge * 100).toFixed(1)}%`}
                >
                  <Text
                    style={[
                      styles.valueBetLabel,
                      { color: colors.success },
                    ]}
                  >
                    {bet.betType}
                  </Text>
                  <Text
                    style={[
                      styles.valueBetEdge,
                      { color: colors.success },
                    ]}
                  >
                    +{(bet.edge * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.heading1,
    marginBottom: spacing.sm,
  },
  subheader: {
    ...typography.label,
    marginTop: spacing.md,
  },
  modelInfoBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  modelInfoText: {
    ...typography.caption,
  },
  cardContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    ...typography.body,
    fontWeight: '600',
  },
  teamRating: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  vs: {
    ...typography.body,
    marginHorizontal: spacing.md,
  },
  matchDate: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  probabilitiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 8,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  probabilityItem: {
    alignItems: 'center',
  },
  probabilityLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  probabilityValue: {
    ...typography.heading3,
    fontWeight: '700',
  },
  predictionBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  predictionText: {
    ...typography.body,
    fontWeight: '600',
  },
  confidenceContainer: {
    marginBottom: spacing.md,
  },
  valueBetsContainer: {
    marginTop: spacing.md,
  },
  valueBetsTitle: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  valueBetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  valueBetLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  valueBetEdge: {
    ...typography.caption,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    ...typography.caption,
  },
  errorText: {
    ...typography.body,
  },
})

export type { UpcomingMatch }
