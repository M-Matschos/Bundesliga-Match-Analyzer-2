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
import { COLORS, SPACING, RADIUS } from '../theme/colors'

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

  useEffect(() => {
    fetchPlayer()
  }, [])

  const fetchPlayer = async () => {
    setLoading(true)
    try {
      // In real app: await playerService.getPlayer(playerId)
      // For now, mock data
      setPlayer({
        player_id: playerId,
        name: 'Player Name',
        position: 'Midfielder',
        team: 'Bayern Munich',
        jersey_number: 10,
        nationality: 'Germany',
        date_of_birth: '1995-01-15',
        height: 183,
        weight: 78,
        stats: {
          appearances: 28,
          starts: 25,
          substitutions: 3,
          minutes_played: 2250,
          goals: 8,
          assists: 5,
          yellow_cards: 2,
          red_cards: 0,
          avg_rating: 7.3,
          passes_completed: 1850,
          pass_accuracy: 0.89,
          tackles: 45,
          interceptions: 32,
          clearances: 18,
        },
      })
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
      {player && (
        <>
          <View style={styles.header}>
            <View style={styles.playerInfo}>
              <View style={styles.jersey}>
                <Text style={styles.jerseyNumber}>{player.jersey_number}</Text>
              </View>
              <View style={styles.nameSection}>
                <Text style={styles.name}>{player.name}</Text>
                <Text style={styles.position}>{player.position}</Text>
                <Text style={styles.team}>{player.team}</Text>
              </View>
            </View>
          </View>

          {/* Personal Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Persönliche Infos</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Nationalität</Text>
                <Text style={styles.infoValue}>{player.nationality}</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Geburtsdatum</Text>
                <Text style={styles.infoValue}>
                  {new Date(player.date_of_birth).toLocaleDateString('de-DE')}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Größe</Text>
                <Text style={styles.infoValue}>{player.height} cm</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Gewicht</Text>
                <Text style={styles.infoValue}>{player.weight} kg</Text>
              </View>
            </View>
          </View>

          {/* Season Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saisonstatistiken</Text>

            <View style={styles.statsGrid}>
              {/* Appearances */}
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{player.stats.appearances}</Text>
                <Text style={styles.statLabel}>Einsätze</Text>
              </View>

              {/* Goals */}
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.greenLight }]}>
                  {player.stats.goals}
                </Text>
                <Text style={styles.statLabel}>Tore</Text>
              </View>

              {/* Assists */}
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.blueLight }]}>
                  {player.stats.assists}
                </Text>
                <Text style={styles.statLabel}>Vorlagen</Text>
              </View>

              {/* Rating */}
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{player.stats.avg_rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Ø Bewertung</Text>
              </View>

              {/* Yellow Cards */}
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.yellow }]}>
                  {player.stats.yellow_cards}
                </Text>
                <Text style={styles.statLabel}>Gelb</Text>
              </View>

              {/* Red Cards */}
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.red }]}>
                  {player.stats.red_cards}
                </Text>
                <Text style={styles.statLabel}>Rot</Text>
              </View>

              {/* Pass Accuracy */}
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {(player.stats.pass_accuracy * 100).toFixed(0)}%
                </Text>
                <Text style={styles.statLabel}>Pass-Quote</Text>
              </View>

              {/* Minutes Played */}
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{player.stats.minutes_played}</Text>
                <Text style={styles.statLabel}>Minuten</Text>
              </View>
            </View>
          </View>

          {/* Defensive Stats (if applicable) */}
          {(player.stats.tackles > 0 || player.stats.interceptions > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Defensive</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.tackles}</Text>
                  <Text style={styles.statLabel}>Tacklings</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.interceptions}</Text>
                  <Text style={styles.statLabel}>Ballgewinne</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.clearances}</Text>
                  <Text style={styles.statLabel}>Klärungen</Text>
                </View>
              </View>
            </View>
          )}

          {/* Goalkeeper Stats (if applicable) */}
          {player.stats.saves !== undefined && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Torwart</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.saves}</Text>
                  <Text style={styles.statLabel}>Paraden</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.clean_sheets}</Text>
                  <Text style={styles.statLabel}>Zu-Null-Spiele</Text>
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
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jersey: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  jerseyNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.blueLight,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  position: {
    fontSize: 13,
    color: COLORS.blueLight,
    marginTop: 2,
  },
  team: {
    fontSize: 12,
    color: COLORS.textSecond,
    marginTop: 2,
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
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  infoBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.blueLight,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
})
