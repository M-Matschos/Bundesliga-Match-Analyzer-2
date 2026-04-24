/**
 * Dashboard Screen — Hauptseite mit neuesten Predictions
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { COLORS, SPACING, RADIUS, formatProb } from '../theme/colors'
import { api } from '../services/api'

interface Match {
  id: string
  home_team: string
  away_team: string
  kickoff: string
  league: string
  status: string
}

interface Prediction {
  home_win_prob: number
  draw_prob: number
  away_win_prob: number
  confidence: number
  expected_goals_home: number
  expected_goals_away: number
}

export default function DashboardScreen({ navigation }: any) {
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({})
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    try {
      // Fetch upcoming matches
      const response = await api.get('/matches/upcoming?days=7&limit=10')
      const data = response.data

      setMatches(data.matches || [])

      // Fetch predictions for each match
      const preds: Record<string, Prediction> = {}
      for (const match of data.matches || []) {
        try {
          const predResponse = await api.get(`/predictions/${match.id}`)
          preds[match.id] = predResponse.data
        } catch (err) {
          console.warn(`Failed to fetch prediction for ${match.id}`)
        }
      }
      setPredictions(preds)
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchMatches()
    setRefreshing(false)
  }

  const getOutcomeColor = (home: number, draw: number, away: number) => {
    const max = Math.max(home, draw, away)
    if (max === home) return COLORS.greenLight
    if (max === draw) return COLORS.yellow
    return COLORS.red
  }

  const getOutcomeLabel = (home: number, draw: number, away: number) => {
    const max = Math.max(home, draw, away)
    if (max === home) return 'Sieg'
    if (max === draw) return 'Remis'
    return 'Niederlage'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading && matches.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.blueLight} />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>⚽ Match Oracle</Text>
        <Text style={styles.subtitle}>Bundesliga Prognosen für diese Woche</Text>
      </View>

      {/* Upcoming Matches */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kommende Spiele</Text>

        {matches.length === 0 ? (
          <Text style={styles.emptyText}>Keine Spiele für die nächsten 7 Tage</Text>
        ) : (
          matches.map((match) => {
            const pred = predictions[match.id]
            if (!pred) return null

            const outcome = getOutcomeLabel(
              pred.home_win_prob,
              pred.draw_prob,
              pred.away_win_prob
            )
            const outcomeColor = getOutcomeColor(
              pred.home_win_prob,
              pred.draw_prob,
              pred.away_win_prob
            )

            return (
              <TouchableOpacity
                key={match.id}
                style={styles.matchCard}
                onPress={() =>
                  navigation.navigate('MatchDetail', { matchId: match.id })
                }
              >
                {/* Date & League */}
                <View style={styles.matchHeader}>
                  <Text style={styles.matchDate}>{formatDate(match.kickoff)}</Text>
                  <Text style={styles.leagueTag}>{match.league.toUpperCase()}</Text>
                </View>

                {/* Teams */}
                <View style={styles.teamsContainer}>
                  <View style={styles.teamSection}>
                    <Text style={styles.teamName}>{match.home_team}</Text>
                    <Text style={styles.probability}>
                      {formatProb(pred.home_win_prob)}
                    </Text>
                  </View>

                  <View style={styles.centerSection}>
                    <Text style={[styles.vs, { color: outcomeColor }]}>VS</Text>
                    <Text style={styles.outcome}>{outcome}</Text>
                  </View>

                  <View style={styles.teamSection}>
                    <Text style={styles.teamName}>{match.away_team}</Text>
                    <Text style={styles.probability}>
                      {formatProb(pred.away_win_prob)}
                    </Text>
                  </View>
                </View>

                {/* Expected Goals */}
                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>xG Home</Text>
                    <Text style={styles.statValue}>
                      {pred.expected_goals_home.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>xG Away</Text>
                    <Text style={styles.statValue}>
                      {pred.expected_goals_away.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Konfidenz</Text>
                    <Text style={styles.statValue}>
                      {formatProb(pred.confidence)}
                    </Text>
                  </View>
                </View>

                {/* Draw Probability */}
                <View style={styles.drawSection}>
                  <Text style={styles.drawLabel}>Remis:</Text>
                  <Text style={styles.drawProb}>{formatProb(pred.draw_prob)}</Text>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('WeekendCalculator')}
        >
          <Text style={styles.actionButtonText}>📊 Wochenende berechnen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('VirtualBetting')}
        >
          <Text style={styles.actionButtonText}>💰 Virtuelle Wetten</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Spacing */}
      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecond,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  matchCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.blueLight,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  matchDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  leagueTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.blueLight,
    backgroundColor: COLORS.surfaceHigh,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  teamSection: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  probability: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.blueLight,
  },
  centerSection: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  vs: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  outcome: {
    fontSize: 12,
    color: COLORS.textSecond,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.blueLight,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  drawSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.valueBetBg,
    borderRadius: RADIUS.md,
  },
  drawLabel: {
    fontSize: 12,
    color: COLORS.textSecond,
    marginRight: SPACING.sm,
  },
  drawProb: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.valueBet,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.blueLight,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
})
