/**
 * Season Stats Screen — Historical trends and season-by-season statistics
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { getColors, SPACING, RADIUS, TYPOGRAPHY } from '../theme/colors'
import { useTheme } from '../context/ThemeContext'

interface SeasonStats {
  season: string
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  points: number
  matches_played: number
}

interface SeasonStatsData {
  entity_id: string
  entity_name: string
  entity_type: 'team' | 'league'
  seasons: SeasonStats[]
}

export default function SeasonStatsScreen({ route, navigation }: any) {
  const { entityId, entityType = 'team' } = route.params
  const [data, setData] = useState<SeasonStatsData | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { mode } = useTheme()
  const colors = getColors(mode)

  useEffect(() => {
    fetchSeasonStats()
  }, [])

  const fetchSeasonStats = async () => {
    setLoading(true)
    try {
      // Mock data
      const mockData: SeasonStatsData = {
        entity_id: entityId,
        entity_name: 'Bayern Munich',
        entity_type: 'team',
        seasons: [
          {
            season: '2025-26',
            wins: 28,
            draws: 4,
            losses: 2,
            goals_for: 92,
            goals_against: 18,
            points: 88,
            matches_played: 34,
          },
          {
            season: '2024-25',
            wins: 26,
            draws: 5,
            losses: 3,
            goals_for: 85,
            goals_against: 24,
            points: 83,
            matches_played: 34,
          },
          {
            season: '2023-24',
            wins: 24,
            draws: 6,
            losses: 4,
            goals_for: 78,
            goals_against: 28,
            points: 78,
            matches_played: 34,
          },
          {
            season: '2022-23',
            wins: 22,
            draws: 7,
            losses: 5,
            goals_for: 71,
            goals_against: 32,
            points: 73,
            matches_played: 34,
          },
          {
            season: '2021-22',
            wins: 20,
            draws: 8,
            losses: 6,
            goals_for: 65,
            goals_against: 38,
            points: 68,
            matches_played: 34,
          },
        ],
      }

      setData(mockData)
      if (mockData.seasons.length > 0) {
        setSelectedSeason(mockData.seasons[0].season)
      }
    } catch (error) {
      console.error('Failed to fetch season stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchSeasonStats()
    setRefreshing(false)
  }

  if (loading && !data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.blueLight} />
      </View>
    )
  }

  const currentSeason = data?.seasons.find((s) => s.season === selectedSeason)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue} />}
    >
      {data && (
        <>
          {/* Header */}
          <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: colors.primary, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.text }}>{data.entity_name}</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.md, color: colors.blueLight, marginTop: SPACING.xs }}>Historical Statistics</Text>
          </View>

          {/* Season Selector */}
          <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Season</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.lg, paddingHorizontal: SPACING.lg }}>
              {data.seasons.map((season) => (
                <TouchableOpacity
                  key={season.season}
                  onPress={() => setSelectedSeason(season.season)}
                  style={{
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    marginRight: SPACING.md,
                    backgroundColor: selectedSeason === season.season ? colors.blue : colors.surface,
                    borderRadius: RADIUS.full,
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.body.md,
                      fontWeight: '600',
                      color: selectedSeason === season.season ? colors.text : colors.textSecond,
                    }}
                  >
                    {season.season}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Current Season Stats */}
          {currentSeason && (
            <>
              {/* Overall Record */}
              <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Overall Record</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.greenLight, marginBottom: SPACING.xs }}>
                      {currentSeason.wins}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Wins</Text>
                  </View>

                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.yellow, marginBottom: SPACING.xs }}>
                      {currentSeason.draws}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Draws</Text>
                  </View>

                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.red, marginBottom: SPACING.xs }}>
                      {currentSeason.losses}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Losses</Text>
                  </View>

                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>
                      {currentSeason.points}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Points</Text>
                  </View>
                </View>
              </View>

              {/* Goals Record */}
              <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Goals</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.greenLight, marginBottom: SPACING.xs }}>
                      {currentSeason.goals_for}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Goals For</Text>
                  </View>

                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.red, marginBottom: SPACING.xs }}>
                      {currentSeason.goals_against}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Goals Against</Text>
                  </View>

                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>
                      {currentSeason.goals_for - currentSeason.goals_against}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Goal Diff</Text>
                  </View>

                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>
                      {currentSeason.matches_played}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Matches</Text>
                  </View>
                </View>
              </View>

              {/* Averages */}
              <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Averages</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>
                      {(currentSeason.goals_for / currentSeason.matches_played).toFixed(2)}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Goals Per Match</Text>
                  </View>

                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>
                      {(currentSeason.goals_against / currentSeason.matches_played).toFixed(2)}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Goals Against/Match</Text>
                  </View>

                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>
                      {(currentSeason.points / currentSeason.matches_played).toFixed(2)}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Points Per Match</Text>
                  </View>

                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>
                      {((currentSeason.wins / currentSeason.matches_played) * 100).toFixed(0)}%
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>Win Rate</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Footer */}
          <View style={{ height: SPACING.xl }} />
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({})
