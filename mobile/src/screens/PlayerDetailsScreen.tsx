/**
 * Player Details Screen — Player profile and statistics
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
import { playerService, Player } from '../services/api'

interface PlayerStats {
  appearances: number
  starts: number
  substitutions: number
  minutes_played: number
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
  avg_rating: number
  passes_completed: number
  pass_accuracy: number
  tackles: number
  interceptions: number
  clearances: number
  saves?: number
  clean_sheets?: number
}

interface PlayerData {
  player_id: string
  name: string
  position: string
  team: string
  jersey_number: number
  nationality: string
  date_of_birth: string
  height: number
  weight: number
  stats: PlayerStats
}

export default function PlayerDetailsScreen({ route, navigation }: any) {
  const { playerId } = route.params
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { mode } = useTheme()
  const colors = getColors(mode)

  useEffect(() => {
    fetchPlayer()
  }, [])

  const fetchPlayer = async () => {
    setLoading(true)
    try {
      const player = await playerService.getPlayer(playerId)
      setPlayer(player)
    } catch (error) {
      console.error('Failed to fetch player:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchPlayer()
    setRefreshing(false)
  }

  if (loading && !player) {
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
      {/* Header */}
      {player && (
        <>
          <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: colors.primary, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 60, height: 60, borderRadius: RADIUS.md, backgroundColor: colors.surfaceHigh, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md }}>
                <Text style={{ fontSize: TYPOGRAPHY.display.xs, fontWeight: 'bold', color: colors.blueLight }}>{player.jersey_number}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.text }}>{player.name}</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.md, color: colors.blueLight, marginTop: 2 }}>{player.position}</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond, marginTop: 2 }}>{player.team}</Text>
              </View>
            </View>
          </View>

          {/* Personal Info */}
          <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Persönliche Infos</Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md }}>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, marginBottom: SPACING.xs }}>Nationalität</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.lg, fontWeight: '600', color: colors.text }}>{player.nationality}</Text>
              </View>

              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md }}>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, marginBottom: SPACING.xs }}>Geburtsdatum</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.lg, fontWeight: '600', color: colors.text }}>
                  {new Date(player.date_of_birth).toLocaleDateString('de-DE')}
                </Text>
              </View>

              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md }}>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, marginBottom: SPACING.xs }}>Größe</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.lg, fontWeight: '600', color: colors.text }}>{player.height} cm</Text>
              </View>

              <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md }}>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, marginBottom: SPACING.xs }}>Gewicht</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.lg, fontWeight: '600', color: colors.text }}>{player.weight} kg</Text>
              </View>
            </View>
          </View>

          {/* Season Stats */}
          <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Saisonstatistiken</Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
              {/* Appearances */}
              <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>{player.stats.appearances}</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Einsätze</Text>
              </View>

              {/* Goals */}
              <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.greenLight, marginBottom: SPACING.xs }}>
                  {player.stats.goals}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Tore</Text>
              </View>

              {/* Assists */}
              <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>
                  {player.stats.assists}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Vorlagen</Text>
              </View>

              {/* Rating */}
              <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>{player.stats.avg_rating.toFixed(1)}</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Ø Bewertung</Text>
              </View>

              {/* Yellow Cards */}
              <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.yellow, marginBottom: SPACING.xs }}>
                  {player.stats.yellow_cards}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Gelb</Text>
              </View>

              {/* Red Cards */}
              <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.red, marginBottom: SPACING.xs }}>
                  {player.stats.red_cards}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Rot</Text>
              </View>

              {/* Pass Accuracy */}
              <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>
                  {(player.stats.pass_accuracy * 100).toFixed(0)}%
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Pass-Quote</Text>
              </View>

              {/* Minutes Played */}
              <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>{player.stats.minutes_played}</Text>
                <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Minuten</Text>
              </View>
            </View>
          </View>

          {/* Defensive Stats (if applicable) */}
          {(player.stats.tackles > 0 || player.stats.interceptions > 0) && (
            <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Defensive</Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
                <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                  <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>{player.stats.tackles}</Text>
                  <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Tacklings</Text>
                </View>

                <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                  <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>{player.stats.interceptions}</Text>
                  <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Ballgewinne</Text>
                </View>

                <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                  <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>{player.stats.clearances}</Text>
                  <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Klärungen</Text>
                </View>
              </View>
            </View>
          )}

          {/* Goalkeeper Stats (if applicable) */}
          {player.stats.saves !== undefined && (
            <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>Torwart</Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
                <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                  <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>{player.stats.saves}</Text>
                  <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Paraden</Text>
                </View>

                <View style={{ flex: 1, minWidth: '30%', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
                  <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.blueLight, marginBottom: SPACING.xs }}>{player.stats.clean_sheets}</Text>
                  <Text style={{ fontSize: TYPOGRAPHY.body.xs, color: colors.textMuted, textAlign: 'center' }}>Zu-Null-Spiele</Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}

      {/* Footer */}
      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
