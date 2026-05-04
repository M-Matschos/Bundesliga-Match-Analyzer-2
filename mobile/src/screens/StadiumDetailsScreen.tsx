/**
 * Stadium Details Screen — Stadium information and history
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
import { getColors, SPACING, RADIUS, TYPOGRAPHY } from '../theme/colors'
import { useTheme } from '../context/ThemeContext'

interface StadiumData {
  stadium_id: string
  name: string
  city: string
  country: string
  capacity: number
  year_opened: number
  current_team: string
  image_url?: string
}

interface StadiumTeamHistory {
  team_name: string
  years_active: string
  appearances: number
}

export default function StadiumDetailsScreen({ route, navigation }: any) {
  const { stadiumId } = route.params
  const [stadium, setStadium] = useState<StadiumData | null>(null)
  const [teamHistory, setTeamHistory] = useState<StadiumTeamHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { mode } = useTheme()
  const colors = getColors(mode)

  useEffect(() => {
    fetchStadium()
  }, [])

  const fetchStadium = async () => {
    setLoading(true)
    try {
      // Mock data
      const mockStadium: StadiumData = {
        stadium_id: stadiumId,
        name: 'Allianz Arena',
        city: 'Munich',
        country: 'Germany',
        capacity: 75024,
        year_opened: 2006,
        current_team: 'Bayern Munich',
      }

      const mockHistory: StadiumTeamHistory[] = [
        { team_name: 'Bayern Munich', years_active: '2006-present', appearances: 18 },
        { team_name: 'TSV 1860 Munich', years_active: '2006-2017', appearances: 11 },
      ]

      setStadium(mockStadium)
      setTeamHistory(mockHistory)
    } catch (error) {
      console.error('Failed to fetch stadium:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchStadium()
    setRefreshing(false)
  }

  if (loading && !stadium) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.blueLight} />
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue} />}
    >
      {stadium && (
        <>
          {/* Header */}
          <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: colors.primary, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.text }}>{stadium.name}</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.md, color: colors.blueLight, marginTop: SPACING.xs }}>
              {stadium.city}, {stadium.country}
            </Text>
          </View>

          {/* Stadium Info */}
          <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Stadium Information</Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md }}>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, marginBottom: SPACING.xs }}>Capacity</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.lg, fontWeight: '600', color: colors.text }}>
                  {stadium.capacity.toLocaleString()}
                </Text>
              </View>

              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md }}>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, marginBottom: SPACING.xs }}>Year Opened</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.lg, fontWeight: '600', color: colors.text }}>{stadium.year_opened}</Text>
              </View>

              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md }}>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, marginBottom: SPACING.xs }}>Current Team</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.lg, fontWeight: '600', color: colors.text }}>{stadium.current_team}</Text>
              </View>

              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md }}>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, marginBottom: SPACING.xs }}>Age</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.lg, fontWeight: '600', color: colors.text }}>
                  {new Date().getFullYear() - stadium.year_opened} years
                </Text>
              </View>
            </View>
          </View>

          {/* Team History */}
          {teamHistory.length > 0 && (
            <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Team History</Text>

              {teamHistory.map((team, idx) => (
                <View key={idx} style={{ backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md }}>
                  <Text style={{ fontSize: TYPOGRAPHY.body.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.xs }}>
                    {team.team_name}
                  </Text>
                  <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond, marginBottom: SPACING.xs }}>
                    {team.years_active}
                  </Text>
                  <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted }}>
                    {team.appearances} appearances
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Footer */}
          <View style={{ height: SPACING.xl }} />
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({})
