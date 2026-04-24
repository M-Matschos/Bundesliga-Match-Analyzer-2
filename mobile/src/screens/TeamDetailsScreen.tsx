/**
 * Team Details Screen — Team info, form, and statistics
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { COLORS, SPACING, RADIUS } from '../theme/colors'
import { teamService } from '../services/api'

interface TeamData {
  team_id: string
  name: string
  logo: string
}

interface FormMatch {
  kickoff: string
  home_team: string
  away_team: string
  home_score?: number
  away_score?: number
  result: 'W' | 'D' | 'L'
}

interface FormData {
  recent_matches: FormMatch[]
  metrics: {
    wins: number
    draws: number
    losses: number
    goals_for: number
    goals_against: number
  }
}

export default function TeamDetailsScreen({ route, navigation }: any) {
  const { teamId } = route.params
  const [team, setTeam] = useState<TeamData | null>(null)
  const [form, setForm] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [teamData, formData] = await Promise.all([
        teamService.getTeam(teamId),
        teamService.getTeamForm(teamId),
      ])
      setTeam(teamData)
      setForm(formData)
    } catch (error) {
      console.error('Failed to fetch team data:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  if (loading && !team) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.blueLight} />
      </View>
    )
  }

  const resultColor = (result: string) => {
    if (result === 'W') return COLORS.greenLight
    if (result === 'D') return COLORS.yellow
    return COLORS.red
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      {team && (
        <View style={styles.header}>
          <Text style={styles.title}>{team.name}</Text>
          <Text style={styles.teamId}>{teamId}</Text>
        </View>
      )}

      {/* Form Stats */}
      {form && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Letzte 10 Spiele</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: COLORS.greenLight }]}>
                  {form.metrics.wins}
                </Text>
                <Text style={styles.statLabel}>Siege</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: COLORS.yellow }]}>
                  {form.metrics.draws}
                </Text>
                <Text style={styles.statLabel}>Remis</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: COLORS.red }]}>
                  {form.metrics.losses}
                </Text>
                <Text style={styles.statLabel}>Niederlagen</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {form.metrics.goals_for}:{form.metrics.goals_against}
                </Text>
                <Text style={styles.statLabel}>Tore</Text>
              </View>
            </View>
          </View>

          {/* Match History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spielhistorie</Text>

            {form.recent_matches.map((match, idx) => (
              <View key={idx} style={styles.matchRow}>
                <View style={styles.matchLeft}>
                  <View style={styles.resultBadge}>
                    <Text
                      style={[
                        styles.resultText,
                        { color: resultColor(match.result) },
                      ]}
                    >
                      {match.result}
                    </Text>
                  </View>
                </View>

                <View style={styles.matchCenter}>
                  <Text style={styles.matchTeams}>
                    {match.home_team} vs {match.away_team}
                  </Text>
                  <Text style={styles.matchDate}>
                    {new Date(match.kickoff).toLocaleDateString('de-DE')}
                  </Text>
                </View>

                {match.home_score !== undefined && match.away_score !== undefined && (
                  <View style={styles.matchRight}>
                    <Text style={styles.score}>
                      {match.home_score}:{match.away_score}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      )}

      {/* Footer */}
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
  },
  teamId: {
    fontSize: 14,
    color: COLORS.textSecond,
    marginTop: SPACING.xs,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.blueLight,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  matchRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  matchLeft: {
    marginRight: SPACING.md,
  },
  resultBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchCenter: {
    flex: 1,
  },
  matchTeams: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  matchDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  matchRight: {
    marginLeft: SPACING.md,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.blueLight,
  },
})
