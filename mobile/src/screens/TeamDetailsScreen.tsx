/**
 * Team Details Screen — Team info, form, and statistics
 */

import React, { useState, useEffect, useCallback } from 'react'
import { RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { getColors, SPACING, RADIUS, TYPOGRAPHY } from '../theme/colors'
import { useTheme } from '../context/ThemeContext'
import { teamService } from '../services/api'
import type { AppStackParamList } from '../navigation/types'

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

interface MatchResult {
  kickoff: string
  home_team: string
  away_team: string
  home_score?: number
  away_score?: number
  result: 'W' | 'D' | 'L'
}

interface H2HRecord {
  opponent_team_name: string
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
}

interface Injury {
  player_name: string
  position: string
  expected_return: string
  severity: 'light' | 'moderate' | 'severe'
}

interface UpcomingFixture {
  opponent: string
  kickoff: string
  competition: string
  location: 'home' | 'away'
}

interface TeamExtendedData {
  last_10_matches: MatchResult[]
  win_percentage: number
  trend: 'up' | 'down' | 'stable'
  h2h_record: H2HRecord[]
  injuries: Injury[]
  upcoming_fixtures: UpcomingFixture[]
  table_position: number
  table_points: number
  table_change: number
  avg_goals_for: number
  avg_goals_against: number
  home_win_percentage: number
  away_win_percentage: number
}

type TeamDetailsScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'TeamDetails'
>
type TeamDetailsScreenRouteProp = RouteProp<AppStackParamList, 'TeamDetails'>

interface TeamDetailsScreenProps {
  route: TeamDetailsScreenRouteProp
  navigation: TeamDetailsScreenNavigationProp
}

export default function TeamDetailsScreen({
  route,
  navigation,
}: TeamDetailsScreenProps) {
  const { teamId } = route.params
  const [team, setTeam] = useState<TeamData | null>(null)
  const [form, setForm] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [extendedData, setExtendedData] = useState<TeamExtendedData | null>(null)
  const [extendedLoading, setExtendedLoading] = useState(false)
  const [extendedError, setExtendedError] = useState<string | null>(null)

  const { mode } = useTheme()
  const colors = getColors(mode)

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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.blueLight} />
      </View>
    )
  }

  const resultColor = (result: string) => {
    if (result === 'W') return colors.greenLight
    if (result === 'D') return colors.yellow
    return colors.red
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue} />}
    >
      {/* Header */}
      {team && (
        <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: colors.primary, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: TYPOGRAPHY.display.xs, fontWeight: 'bold', color: colors.text }}>{team.name}</Text>
          <Text style={{ fontSize: TYPOGRAPHY.body.lg, color: colors.textSecond, marginTop: SPACING.xs }}>{teamId}</Text>
        </View>
      )}

      {/* Form Stats */}
      {form && (
        <>
          <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Letzte 10 Spiele</Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.display.xxs, fontWeight: 'bold', color: colors.greenLight, marginBottom: SPACING.xs }}>
                  {form.metrics.wins}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Siege</Text>
              </View>

              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.display.xxs, fontWeight: 'bold', color: colors.yellow, marginBottom: SPACING.xs }}>
                  {form.metrics.draws}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Remis</Text>
              </View>

              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.display.xxs, fontWeight: 'bold', color: colors.red, marginBottom: SPACING.xs }}>
                  {form.metrics.losses}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Niederlagen</Text>
              </View>

              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.display.xxs, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>
                  {form.metrics.goals_for}:{form.metrics.goals_against}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Tore</Text>
              </View>
            </View>
          </View>

          {/* Match History */}
          <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Spielhistorie</Text>

            {form.recent_matches.map((match, idx) => (
              <View key={idx} style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, alignItems: 'center' }}>
                <View style={{ marginRight: SPACING.md }}>
                  <View style={{ width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: colors.surfaceHigh, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.body.xl, fontWeight: 'bold', color: resultColor(match.result) }}>
                      {match.result}
                    </Text>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: TYPOGRAPHY.body.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.xs }}>
                    {match.home_team} vs {match.away_team}
                  </Text>
                  <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted }}>
                    {new Date(match.kickoff).toLocaleDateString('de-DE')}
                  </Text>
                </View>

                {match.home_score !== undefined && match.away_score !== undefined && (
                  <View style={{ marginLeft: SPACING.md }}>
                    <Text style={{ fontSize: TYPOGRAPHY.body.xl, fontWeight: 'bold', color: colors.blueLight }}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
})
