/**
import { useTheme } from '../context/ThemeContext'
 * Match Details Screen — Full match data, live updates, betting
import { useTheme } from '../context/ThemeContext'
 *
import { useTheme } from '../context/ThemeContext'
 * Features:
import { useTheme } from '../context/ThemeContext'
 * - Match header with teams, date, live score
import { useTheme } from '../context/ThemeContext'
 * - Live match statistics (possession, shots, corners)
import { useTheme } from '../context/ThemeContext'
 * - Event timeline (goals, cards, substitutions)
import { useTheme } from '../context/ThemeContext'
 * - Betting odds comparison from multiple bookmakers
import { useTheme } from '../context/ThemeContext'
 * - Expert predictions with confidence
import { useTheme } from '../context/ThemeContext'
 * - H2H statistics
import { useTheme } from '../context/ThemeContext'
 * - Team lineups and formations
import { useTheme } from '../context/ThemeContext'
 */
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
import { useTheme } from '../context/ThemeContext'
  View,
import { useTheme } from '../context/ThemeContext'
  Text,
import { useTheme } from '../context/ThemeContext'
  ScrollView,
import { useTheme } from '../context/ThemeContext'
  ActivityIndicator,
import { useTheme } from '../context/ThemeContext'
  StyleSheet,
import { useTheme } from '../context/ThemeContext'
  RefreshControl,
import { useTheme } from '../context/ThemeContext'
  TouchableOpacity,
import { useTheme } from '../context/ThemeContext'
} from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { getColors, SPACING, TYPOGRAPHY, RADIUS } from '../theme/colors'
import { useTheme } from '../context/ThemeContext'
import Table from '../components/Table'
import { useTheme } from '../context/ThemeContext'
import Modal from '../components/Modal'
import { useTheme } from '../context/ThemeContext'
import Tabs from '../components/Tabs'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
// ============================================================================
import { useTheme } from '../context/ThemeContext'
// TYPES
import { useTheme } from '../context/ThemeContext'
// ============================================================================
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface Team {
import { useTheme } from '../context/ThemeContext'
  id: string
import { useTheme } from '../context/ThemeContext'
  name: string
import { useTheme } from '../context/ThemeContext'
  logo: string
import { useTheme } from '../context/ThemeContext'
  formation: string
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface MatchScore {
import { useTheme } from '../context/ThemeContext'
  home_team: Team
import { useTheme } from '../context/ThemeContext'
  away_team: Team
import { useTheme } from '../context/ThemeContext'
  home_score: number
import { useTheme } from '../context/ThemeContext'
  away_score: number
import { useTheme } from '../context/ThemeContext'
  match_date: string
import { useTheme } from '../context/ThemeContext'
  status: 'scheduled' | 'live' | 'finished' | 'postponed'
import { useTheme } from '../context/ThemeContext'
  kickoff_time: string
import { useTheme } from '../context/ThemeContext'
  minute: number
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface MatchStats {
import { useTheme } from '../context/ThemeContext'
  possession: { home: number; away: number }
import { useTheme } from '../context/ThemeContext'
  shots: { home: number; away: number }
import { useTheme } from '../context/ThemeContext'
  shots_on_target: { home: number; away: number }
import { useTheme } from '../context/ThemeContext'
  corners: { home: number; away: number }
import { useTheme } from '../context/ThemeContext'
  fouls: { home: number; away: number }
import { useTheme } from '../context/ThemeContext'
  offsides: { home: number; away: number }
import { useTheme } from '../context/ThemeContext'
  passes: { home: number; away: number }
import { useTheme } from '../context/ThemeContext'
  pass_accuracy: { home: number; away: number }
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface MatchEvent {
import { useTheme } from '../context/ThemeContext'
  id: string
import { useTheme } from '../context/ThemeContext'
  type: 'goal' | 'card' | 'substitution' | 'injury'
import { useTheme } from '../context/ThemeContext'
  minute: number
import { useTheme } from '../context/ThemeContext'
  team: 'home' | 'away'
import { useTheme } from '../context/ThemeContext'
  player: string
import { useTheme } from '../context/ThemeContext'
  detail?: string
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface BettingOdds {
import { useTheme } from '../context/ThemeContext'
  bookmaker: string
import { useTheme } from '../context/ThemeContext'
  home_win: number
import { useTheme } from '../context/ThemeContext'
  draw: number
import { useTheme } from '../context/ThemeContext'
  away_win: number
import { useTheme } from '../context/ThemeContext'
  total_under_2_5: number
import { useTheme } from '../context/ThemeContext'
  total_over_2_5: number
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface Prediction {
import { useTheme } from '../context/ThemeContext'
  home_win_prob: number
import { useTheme } from '../context/ThemeContext'
  draw_prob: number
import { useTheme } from '../context/ThemeContext'
  away_win_prob: number
import { useTheme } from '../context/ThemeContext'
  confidence: number
import { useTheme } from '../context/ThemeContext'
  predicted_goals: number
import { useTheme } from '../context/ThemeContext'
  top_factors: string[]
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface H2H {
import { useTheme } from '../context/ThemeContext'
  matches_total: number
import { useTheme } from '../context/ThemeContext'
  home_wins: number
import { useTheme } from '../context/ThemeContext'
  draws: number
import { useTheme } from '../context/ThemeContext'
  away_wins: number
import { useTheme } from '../context/ThemeContext'
  total_goals: number
import { useTheme } from '../context/ThemeContext'
  avg_goals: number
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface LineupPlayer {
import { useTheme } from '../context/ThemeContext'
  id: string
import { useTheme } from '../context/ThemeContext'
  name: string
import { useTheme } from '../context/ThemeContext'
  number: number
import { useTheme } from '../context/ThemeContext'
  position: string
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface Lineup {
import { useTheme } from '../context/ThemeContext'
  team: 'home' | 'away'
import { useTheme } from '../context/ThemeContext'
  formation: string
import { useTheme } from '../context/ThemeContext'
  players: LineupPlayer[]
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface MatchDetailsData {
import { useTheme } from '../context/ThemeContext'
  score: MatchScore
import { useTheme } from '../context/ThemeContext'
  stats: MatchStats
import { useTheme } from '../context/ThemeContext'
  events: MatchEvent[]
import { useTheme } from '../context/ThemeContext'
  odds: BettingOdds[]
import { useTheme } from '../context/ThemeContext'
  predictions: Prediction
import { useTheme } from '../context/ThemeContext'
  h2h: H2H
import { useTheme } from '../context/ThemeContext'
  lineups: Lineup[]
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
// ============================================================================
import { useTheme } from '../context/ThemeContext'
// COMPONENT
import { useTheme } from '../context/ThemeContext'
// ============================================================================
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
export default function MatchDetailsScreen({ route, navigation }: any) {
import { useTheme } from '../context/ThemeContext'
  const { matchId } = route.params || {}
import { useTheme } from '../context/ThemeContext'
  const { showToast } = useToast()
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // State
import { useTheme } from '../context/ThemeContext'
  const [match, setMatch] = useState<MatchDetailsData | null>(null)
  const { mode } = useTheme()
  const colors = getColors(mode)
import { useTheme } from '../context/ThemeContext'
  const [loading, setLoading] = useState(false)
  const { mode } = useTheme()
  const colors = getColors(mode)
import { useTheme } from '../context/ThemeContext'
  const [refreshing, setRefreshing] = useState(false)
  const { mode } = useTheme()
  const colors = getColors(mode)
import { useTheme } from '../context/ThemeContext'
  const [selectedOddsBookmaker, setSelectedOddsBookmaker] = useState<string | null>(null)
  const { mode } = useTheme()
  const colors = getColors(mode)
import { useTheme } from '../context/ThemeContext'
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null)
  const { mode } = useTheme()
  const colors = getColors(mode)
import { useTheme } from '../context/ThemeContext'
  const [activeTab, setActiveTab] = useState('overview')
  const { mode } = useTheme()
  const colors = getColors(mode)
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  useEffect(() => {
import { useTheme } from '../context/ThemeContext'
    fetchMatchDetails()
import { useTheme } from '../context/ThemeContext'
  }, [matchId])
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const fetchMatchDetails = async () => {
import { useTheme } from '../context/ThemeContext'
    setLoading(true)
import { useTheme } from '../context/ThemeContext'
    try {
import { useTheme } from '../context/ThemeContext'
      const match = await matchService.getMatch(matchId)
import { useTheme } from '../context/ThemeContext'
      setMatch(match as any)
import { useTheme } from '../context/ThemeContext'
      showToast('Match data loaded', 'success')
import { useTheme } from '../context/ThemeContext'
    } catch (error) {
import { useTheme } from '../context/ThemeContext'
      console.error('Failed to fetch match:', error)
import { useTheme } from '../context/ThemeContext'
      showToast('Failed to load match data', 'error')
import { useTheme } from '../context/ThemeContext'
    } finally {
import { useTheme } from '../context/ThemeContext'
      setLoading(false)
import { useTheme } from '../context/ThemeContext'
    }
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const onRefresh = async () => {
import { useTheme } from '../context/ThemeContext'
    setRefreshing(true)
import { useTheme } from '../context/ThemeContext'
    await fetchMatchDetails()
import { useTheme } from '../context/ThemeContext'
    setRefreshing(false)
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // ============================================================================
import { useTheme } from '../context/ThemeContext'
  // RENDER HELPERS
import { useTheme } from '../context/ThemeContext'
  // ============================================================================
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const renderHeader = () => {
import { useTheme } from '../context/ThemeContext'
    if (!match) return null
import { useTheme } from '../context/ThemeContext'
    const { score, predictions } = match
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
    return (
import { useTheme } from '../context/ThemeContext'
      <View style={styles.header}>
import { useTheme } from '../context/ThemeContext'
        {/* Teams and Score */}
import { useTheme } from '../context/ThemeContext'
        <View style={styles.scoreSection}>
import { useTheme } from '../context/ThemeContext'
          {/* Home Team */}
import { useTheme } from '../context/ThemeContext'
          <View style={styles.teamContainer}>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.teamLogo}>{score.home_team.logo}</Text>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.teamName}>{score.home_team.name}</Text>
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
          {/* Score */}
import { useTheme } from '../context/ThemeContext'
          <View style={styles.scoreContainer}>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.scoreValue}>{score.home_score}</Text>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.scoreSeparator}>—</Text>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.scoreValue}>{score.away_score}</Text>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.matchStatus}>
import { useTheme } from '../context/ThemeContext'
              {score.status === 'live' ? `${score.minute}'` : 'FT'}
import { useTheme } from '../context/ThemeContext'
            </Text>
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
          {/* Away Team */}
import { useTheme } from '../context/ThemeContext'
          <View style={styles.teamContainer}>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.teamLogo}>{score.away_team.logo}</Text>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.teamName}>{score.away_team.name}</Text>
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
        {/* Match Info */}
import { useTheme } from '../context/ThemeContext'
        <View style={styles.matchInfo}>
import { useTheme } from '../context/ThemeContext'
          <Text style={styles.matchDate}>{score.match_date} @ {score.kickoff_time}</Text>
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
        {/* Prediction Card */}
import { useTheme } from '../context/ThemeContext'
        <View style={styles.predictionCard}>
import { useTheme } from '../context/ThemeContext'
          <View style={styles.predictionRow}>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.predictionLabel}>AI Prediction:</Text>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.predictionConfidence}>
import { useTheme } from '../context/ThemeContext'
              {(predictions.confidence * 100).toFixed(0)}% confident
import { useTheme } from '../context/ThemeContext'
            </Text>
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'
          <View style={styles.predictionOdds}>
import { useTheme } from '../context/ThemeContext'
            <View style={styles.predictionOdd}>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.oddValue}>
import { useTheme } from '../context/ThemeContext'
                {(predictions.home_win_prob * 100).toFixed(0)}%
import { useTheme } from '../context/ThemeContext'
              </Text>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.oddLabel}>Home Win</Text>
import { useTheme } from '../context/ThemeContext'
            </View>
import { useTheme } from '../context/ThemeContext'
            <View style={styles.predictionOdd}>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.oddValue}>
import { useTheme } from '../context/ThemeContext'
                {(predictions.draw_prob * 100).toFixed(0)}%
import { useTheme } from '../context/ThemeContext'
              </Text>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.oddLabel}>Draw</Text>
import { useTheme } from '../context/ThemeContext'
            </View>
import { useTheme } from '../context/ThemeContext'
            <View style={styles.predictionOdd}>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.oddValue}>
import { useTheme } from '../context/ThemeContext'
                {(predictions.away_win_prob * 100).toFixed(0)}%
import { useTheme } from '../context/ThemeContext'
              </Text>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.oddLabel}>Away Win</Text>
import { useTheme } from '../context/ThemeContext'
            </View>
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'
    )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const renderStats = () => {
import { useTheme } from '../context/ThemeContext'
    if (!match) return null
import { useTheme } from '../context/ThemeContext'
    const { stats } = match
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
    const statRows = [
import { useTheme } from '../context/ThemeContext'
      {
import { useTheme } from '../context/ThemeContext'
        id: 'possession',
import { useTheme } from '../context/ThemeContext'
        stat: 'Possession',
import { useTheme } from '../context/ThemeContext'
        home: `${stats.possession.home}%`,
import { useTheme } from '../context/ThemeContext'
        away: `${stats.possession.away}%`,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
      {
import { useTheme } from '../context/ThemeContext'
        id: 'shots',
import { useTheme } from '../context/ThemeContext'
        stat: 'Shots',
import { useTheme } from '../context/ThemeContext'
        home: stats.shots.home,
import { useTheme } from '../context/ThemeContext'
        away: stats.shots.away,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
      {
import { useTheme } from '../context/ThemeContext'
        id: 'shots_on_target',
import { useTheme } from '../context/ThemeContext'
        stat: 'Shots on Target',
import { useTheme } from '../context/ThemeContext'
        home: stats.shots_on_target.home,
import { useTheme } from '../context/ThemeContext'
        away: stats.shots_on_target.away,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
      {
import { useTheme } from '../context/ThemeContext'
        id: 'corners',
import { useTheme } from '../context/ThemeContext'
        stat: 'Corners',
import { useTheme } from '../context/ThemeContext'
        home: stats.corners.home,
import { useTheme } from '../context/ThemeContext'
        away: stats.corners.away,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
      {
import { useTheme } from '../context/ThemeContext'
        id: 'fouls',
import { useTheme } from '../context/ThemeContext'
        stat: 'Fouls',
import { useTheme } from '../context/ThemeContext'
        home: stats.fouls.home,
import { useTheme } from '../context/ThemeContext'
        away: stats.fouls.away,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
      {
import { useTheme } from '../context/ThemeContext'
        id: 'passes',
import { useTheme } from '../context/ThemeContext'
        stat: 'Passes',
import { useTheme } from '../context/ThemeContext'
        home: stats.passes.home,
import { useTheme } from '../context/ThemeContext'
        away: stats.passes.away,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
      {
import { useTheme } from '../context/ThemeContext'
        id: 'pass_accuracy',
import { useTheme } from '../context/ThemeContext'
        stat: 'Pass Accuracy',
import { useTheme } from '../context/ThemeContext'
        home: `${stats.pass_accuracy.home}%`,
import { useTheme } from '../context/ThemeContext'
        away: `${stats.pass_accuracy.away}%`,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
    ]
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
    return (
import { useTheme } from '../context/ThemeContext'
      <View style={styles.section}>
import { useTheme } from '../context/ThemeContext'
        <Text style={styles.sectionTitle}>Match Statistics</Text>
import { useTheme } from '../context/ThemeContext'
        <Table
import { useTheme } from '../context/ThemeContext'
          columns={[
import { useTheme } from '../context/ThemeContext'
            { key: 'stat', label: 'Stat', align: 'left' },
import { useTheme } from '../context/ThemeContext'
            { key: 'home', label: `${match.score.home_team.name}`, align: 'center' },
import { useTheme } from '../context/ThemeContext'
            { key: 'away', label: `${match.score.away_team.name}`, align: 'right' },
import { useTheme } from '../context/ThemeContext'
          ]}
import { useTheme } from '../context/ThemeContext'
          data={statRows}
import { useTheme } from '../context/ThemeContext'
          striped
import { useTheme } from '../context/ThemeContext'
          dense
import { useTheme } from '../context/ThemeContext'
        />
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'
    )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const renderEvents = () => {
import { useTheme } from '../context/ThemeContext'
    if (!match || !match.events.length) return null
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
    return (
import { useTheme } from '../context/ThemeContext'
      <View style={styles.section}>
import { useTheme } from '../context/ThemeContext'
        <Text style={styles.sectionTitle}>Match Events</Text>
import { useTheme } from '../context/ThemeContext'
        <View style={styles.eventsList}>
import { useTheme } from '../context/ThemeContext'
          {match.events.map((event) => (
import { useTheme } from '../context/ThemeContext'
            <TouchableOpacity
import { useTheme } from '../context/ThemeContext'
              key={event.id}
import { useTheme } from '../context/ThemeContext'
              style={styles.eventCard}
import { useTheme } from '../context/ThemeContext'
              onPress={() => setSelectedEvent(event)}
import { useTheme } from '../context/ThemeContext'
            >
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.eventMinute}>{event.minute}'</Text>
import { useTheme } from '../context/ThemeContext'
              <View style={styles.eventContent}>
import { useTheme } from '../context/ThemeContext'
                <Text style={styles.eventPlayer}>{event.player}</Text>
import { useTheme } from '../context/ThemeContext'
                <Text style={styles.eventType}>
import { useTheme } from '../context/ThemeContext'
                  {event.type === 'goal' && '⚽ Goal'}
import { useTheme } from '../context/ThemeContext'
                  {event.type === 'card' && '🟨 Card'}
import { useTheme } from '../context/ThemeContext'
                  {event.type === 'substitution' && '🔄 Substitution'}
import { useTheme } from '../context/ThemeContext'
                  {event.type === 'injury' && '🚑 Injury'}
import { useTheme } from '../context/ThemeContext'
                </Text>
import { useTheme } from '../context/ThemeContext'
              </View>
import { useTheme } from '../context/ThemeContext'
              <Text style={[styles.eventTeam, { color: event.team === 'home' ? colors.primary : colors.secondary }]}>
import { useTheme } from '../context/ThemeContext'
                {event.team === 'home' ? match.score.home_team.name : match.score.away_team.name}
import { useTheme } from '../context/ThemeContext'
              </Text>
import { useTheme } from '../context/ThemeContext'
            </TouchableOpacity>
import { useTheme } from '../context/ThemeContext'
          ))}
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'
    )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const renderOdds = () => {
import { useTheme } from '../context/ThemeContext'
    if (!match || !match.odds.length) return null
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
    return (
import { useTheme } from '../context/ThemeContext'
      <View style={styles.section}>
import { useTheme } from '../context/ThemeContext'
        <Text style={styles.sectionTitle}>Betting Odds</Text>
import { useTheme } from '../context/ThemeContext'
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.oddsScroll}>
import { useTheme } from '../context/ThemeContext'
          {match.odds.map((bookmaker) => (
import { useTheme } from '../context/ThemeContext'
            <TouchableOpacity
import { useTheme } from '../context/ThemeContext'
              key={bookmaker.bookmaker}
import { useTheme } from '../context/ThemeContext'
              style={styles.oddsCard}
import { useTheme } from '../context/ThemeContext'
              onPress={() => setSelectedOddsBookmaker(bookmaker.bookmaker)}
import { useTheme } from '../context/ThemeContext'
            >
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.bookmaderName}>{bookmaker.bookmaker}</Text>
import { useTheme } from '../context/ThemeContext'
              <View style={styles.oddsGrid}>
import { useTheme } from '../context/ThemeContext'
                <View style={styles.oddsItem}>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.oddsLabel}>1</Text>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.oddsValue}>{bookmaker.home_win.toFixed(2)}</Text>
import { useTheme } from '../context/ThemeContext'
                </View>
import { useTheme } from '../context/ThemeContext'
                <View style={styles.oddsItem}>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.oddsLabel}>X</Text>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.oddsValue}>{bookmaker.draw.toFixed(2)}</Text>
import { useTheme } from '../context/ThemeContext'
                </View>
import { useTheme } from '../context/ThemeContext'
                <View style={styles.oddsItem}>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.oddsLabel}>2</Text>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.oddsValue}>{bookmaker.away_win.toFixed(2)}</Text>
import { useTheme } from '../context/ThemeContext'
                </View>
import { useTheme } from '../context/ThemeContext'
              </View>
import { useTheme } from '../context/ThemeContext'
              <View style={styles.oddsDivider} />
import { useTheme } from '../context/ThemeContext'
              <View style={styles.oddsGrid}>
import { useTheme } from '../context/ThemeContext'
                <View style={styles.oddsItem}>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.oddsLabel}>U2.5</Text>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.oddsValue}>{bookmaker.total_under_2_5.toFixed(2)}</Text>
import { useTheme } from '../context/ThemeContext'
                </View>
import { useTheme } from '../context/ThemeContext'
                <View style={styles.oddsItem}>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.oddsLabel}>O2.5</Text>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.oddsValue}>{bookmaker.total_over_2_5.toFixed(2)}</Text>
import { useTheme } from '../context/ThemeContext'
                </View>
import { useTheme } from '../context/ThemeContext'
              </View>
import { useTheme } from '../context/ThemeContext'
            </TouchableOpacity>
import { useTheme } from '../context/ThemeContext'
          ))}
import { useTheme } from '../context/ThemeContext'
        </ScrollView>
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'
    )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const renderH2H = () => {
import { useTheme } from '../context/ThemeContext'
    if (!match) return null
import { useTheme } from '../context/ThemeContext'
    const { h2h } = match
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
    return (
import { useTheme } from '../context/ThemeContext'
      <View style={styles.section}>
import { useTheme } from '../context/ThemeContext'
        <Text style={styles.sectionTitle}>Head to Head</Text>
import { useTheme } from '../context/ThemeContext'
        <View style={styles.h2hStats}>
import { useTheme } from '../context/ThemeContext'
          <View style={styles.h2hCard}>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.h2hNumber}>{h2h.matches_total}</Text>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.h2hLabel}>Total Matches</Text>
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'
          <View style={styles.h2hCard}>
import { useTheme } from '../context/ThemeContext'
            <Text style={[styles.h2hNumber, { color: colors.primary }]}>{h2h.home_wins}</Text>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.h2hLabel}>Home Wins</Text>
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'
          <View style={styles.h2hCard}>
import { useTheme } from '../context/ThemeContext'
            <Text style={[styles.h2hNumber, { color: colors.textSecondary }]}>{h2h.draws}</Text>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.h2hLabel}>Draws</Text>
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'
          <View style={styles.h2hCard}>
import { useTheme } from '../context/ThemeContext'
            <Text style={[styles.h2hNumber, { color: colors.secondary }]}>{h2h.away_wins}</Text>
import { useTheme } from '../context/ThemeContext'
            <Text style={styles.h2hLabel}>Away Wins</Text>
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'
        <View style={styles.h2hAvg}>
import { useTheme } from '../context/ThemeContext'
          <Text style={styles.h2hAvgLabel}>Average Goals:</Text>
import { useTheme } from '../context/ThemeContext'
          <Text style={styles.h2hAvgValue}>{h2h.avg_goals.toFixed(2)}</Text>
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'
    )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const renderLineups = () => {
import { useTheme } from '../context/ThemeContext'
    if (!match) return null
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
    return (
import { useTheme } from '../context/ThemeContext'
      <View style={styles.section}>
import { useTheme } from '../context/ThemeContext'
        <Text style={styles.sectionTitle}>Lineups</Text>
import { useTheme } from '../context/ThemeContext'
        <View style={styles.lineupsContainer}>
import { useTheme } from '../context/ThemeContext'
          {match.lineups.map((lineup) => (
import { useTheme } from '../context/ThemeContext'
            <View key={`${lineup.team}`} style={styles.teamLineup}>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.lineupTeamName}>
import { useTheme } from '../context/ThemeContext'
                {lineup.team === 'home' ? match.score.home_team.name : match.score.away_team.name}
import { useTheme } from '../context/ThemeContext'
              </Text>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.lineupFormation}>{lineup.formation}</Text>
import { useTheme } from '../context/ThemeContext'
              <View style={styles.playersList}>
import { useTheme } from '../context/ThemeContext'
                {lineup.players.map((player) => (
import { useTheme } from '../context/ThemeContext'
                  <View key={player.id} style={styles.playerItem}>
import { useTheme } from '../context/ThemeContext'
                    <Text style={styles.playerNumber}>{player.number}</Text>
import { useTheme } from '../context/ThemeContext'
                    <View style={styles.playerInfo}>
import { useTheme } from '../context/ThemeContext'
                      <Text style={styles.playerName}>{player.name}</Text>
import { useTheme } from '../context/ThemeContext'
                      <Text style={styles.playerPosition}>{player.position}</Text>
import { useTheme } from '../context/ThemeContext'
                    </View>
import { useTheme } from '../context/ThemeContext'
                  </View>
import { useTheme } from '../context/ThemeContext'
                ))}
import { useTheme } from '../context/ThemeContext'
              </View>
import { useTheme } from '../context/ThemeContext'
            </View>
import { useTheme } from '../context/ThemeContext'
          ))}
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'
    )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // ============================================================================
import { useTheme } from '../context/ThemeContext'
  // MAIN RENDER
import { useTheme } from '../context/ThemeContext'
  // ============================================================================
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  if (loading && !match) {
import { useTheme } from '../context/ThemeContext'
    return (
import { useTheme } from '../context/ThemeContext'
      <View style={[styles.container, styles.centerContent]}>
import { useTheme } from '../context/ThemeContext'
        <ActivityIndicator size="large" color={colors.primary} />
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'
    )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  return (
import { useTheme } from '../context/ThemeContext'
    <ScrollView
import { useTheme } from '../context/ThemeContext'
      style={styles.container}
import { useTheme } from '../context/ThemeContext'
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
import { useTheme } from '../context/ThemeContext'
    >
import { useTheme } from '../context/ThemeContext'
      {renderHeader()}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      {/* Tabs */}
import { useTheme } from '../context/ThemeContext'
      <Tabs
import { useTheme } from '../context/ThemeContext'
        tabs={[
import { useTheme } from '../context/ThemeContext'
          { id: 'overview', label: 'Overview' },
import { useTheme } from '../context/ThemeContext'
          { id: 'stats', label: 'Stats' },
import { useTheme } from '../context/ThemeContext'
          { id: 'events', label: 'Events' },
import { useTheme } from '../context/ThemeContext'
          { id: 'odds', label: 'Odds' },
import { useTheme } from '../context/ThemeContext'
          { id: 'h2h', label: 'H2H' },
import { useTheme } from '../context/ThemeContext'
          { id: 'lineups', label: 'Lineups' },
import { useTheme } from '../context/ThemeContext'
        ]}
import { useTheme } from '../context/ThemeContext'
        activeTab={activeTab}
import { useTheme } from '../context/ThemeContext'
        onTabChange={setActiveTab}
import { useTheme } from '../context/ThemeContext'
      />
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      {/* Tab Content */}
import { useTheme } from '../context/ThemeContext'
      {activeTab === 'overview' && (
import { useTheme } from '../context/ThemeContext'
        <>
import { useTheme } from '../context/ThemeContext'
          {renderPrediction()}
import { useTheme } from '../context/ThemeContext'
          {renderOdds()}
import { useTheme } from '../context/ThemeContext'
        </>
import { useTheme } from '../context/ThemeContext'
      )}
import { useTheme } from '../context/ThemeContext'
      {activeTab === 'stats' && renderStats()}
import { useTheme } from '../context/ThemeContext'
      {activeTab === 'events' && renderEvents()}
import { useTheme } from '../context/ThemeContext'
      {activeTab === 'odds' && renderOdds()}
import { useTheme } from '../context/ThemeContext'
      {activeTab === 'h2h' && renderH2H()}
import { useTheme } from '../context/ThemeContext'
      {activeTab === 'lineups' && renderLineups()}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      {/* Footer */}
import { useTheme } from '../context/ThemeContext'
      <View style={{ height: SPACING.xl }} />
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      {/* Event Detail Modal */}
import { useTheme } from '../context/ThemeContext'
      <Modal
import { useTheme } from '../context/ThemeContext'
        visible={!!selectedEvent}
import { useTheme } from '../context/ThemeContext'
        title={selectedEvent?.player || ''}
import { useTheme } from '../context/ThemeContext'
        onClose={() => setSelectedEvent(null)}
import { useTheme } from '../context/ThemeContext'
      >
import { useTheme } from '../context/ThemeContext'
        {selectedEvent && (
import { useTheme } from '../context/ThemeContext'
          <View>
import { useTheme } from '../context/ThemeContext'
            <View style={styles.modalRow}>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.modalLabel}>Type:</Text>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.modalValue}>{selectedEvent.type}</Text>
import { useTheme } from '../context/ThemeContext'
            </View>
import { useTheme } from '../context/ThemeContext'
            <View style={styles.modalRow}>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.modalLabel}>Minute:</Text>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.modalValue}>{selectedEvent.minute}'</Text>
import { useTheme } from '../context/ThemeContext'
            </View>
import { useTheme } from '../context/ThemeContext'
            <View style={styles.modalRow}>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.modalLabel}>Team:</Text>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.modalValue}>{selectedEvent.team}</Text>
import { useTheme } from '../context/ThemeContext'
            </View>
import { useTheme } from '../context/ThemeContext'
            {selectedEvent.detail && (
import { useTheme } from '../context/ThemeContext'
              <View style={styles.modalRow}>
import { useTheme } from '../context/ThemeContext'
                <Text style={styles.modalLabel}>Detail:</Text>
import { useTheme } from '../context/ThemeContext'
                <Text style={styles.modalValue}>{selectedEvent.detail}</Text>
import { useTheme } from '../context/ThemeContext'
              </View>
import { useTheme } from '../context/ThemeContext'
            )}
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'
        )}
import { useTheme } from '../context/ThemeContext'
      </Modal>
import { useTheme } from '../context/ThemeContext'
    </ScrollView>
import { useTheme } from '../context/ThemeContext'
  )
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // ============================================================================
import { useTheme } from '../context/ThemeContext'
  // HELPER: Render Prediction Section
import { useTheme } from '../context/ThemeContext'
  // ============================================================================
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  function renderPrediction() {
import { useTheme } from '../context/ThemeContext'
    if (!match) return null
import { useTheme } from '../context/ThemeContext'
    const { predictions } = match
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
    return (
import { useTheme } from '../context/ThemeContext'
      <View style={styles.section}>
import { useTheme } from '../context/ThemeContext'
        <Text style={styles.sectionTitle}>AI Prediction Details</Text>
import { useTheme } from '../context/ThemeContext'
        <View style={styles.predictionDetails}>
import { useTheme } from '../context/ThemeContext'
          <Text style={styles.predictionDetailLabel}>Expected Goals: </Text>
import { useTheme } from '../context/ThemeContext'
          <Text style={styles.predictionDetailValue}>{predictions.predicted_goals.toFixed(1)}</Text>
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'
        <View style={styles.predictionFactors}>
import { useTheme } from '../context/ThemeContext'
          <Text style={styles.predictionFactorsTitle}>Top Factors:</Text>
import { useTheme } from '../context/ThemeContext'
          {predictions.top_factors.map((factor, index) => (
import { useTheme } from '../context/ThemeContext'
            <Text key={index} style={styles.predictionFactor}>
import { useTheme } from '../context/ThemeContext'
              • {factor}
import { useTheme } from '../context/ThemeContext'
            </Text>
import { useTheme } from '../context/ThemeContext'
          ))}
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'
    )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
// ============================================================================
import { useTheme } from '../context/ThemeContext'
// STYLES
import { useTheme } from '../context/ThemeContext'
// ============================================================================
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
const styles = StyleSheet.create({
import { useTheme } from '../context/ThemeContext'
  container: {
import { useTheme } from '../context/ThemeContext'
    flex: 1,
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.background,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  centerContent: {
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'center',
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // Header
import { useTheme } from '../context/ThemeContext'
  header: {
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
    paddingHorizontal: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
    paddingVertical: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
    borderBottomWidth: 1,
import { useTheme } from '../context/ThemeContext'
    borderBottomColor: colors.border,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  scoreSection: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'space-around',
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  teamContainer: {
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    flex: 1,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  teamLogo: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.display.md,
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  teamName: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.sm,
import { useTheme } from '../context/ThemeContext'
    color: colors.textSecondary,
import { useTheme } from '../context/ThemeContext'
    textAlign: 'center',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  scoreContainer: {
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    marginHorizontal: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  scoreValue: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.display.lg,
import { useTheme } from '../context/ThemeContext'
    fontWeight: 'bold',
import { useTheme } from '../context/ThemeContext'
    color: colors.primary,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  scoreSeparator: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.display.sm,
import { useTheme } from '../context/ThemeContext'
    color: colors.textSecondary,
import { useTheme } from '../context/ThemeContext'
    marginVertical: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  matchStatus: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.sm,
import { useTheme } from '../context/ThemeContext'
    color: colors.textMuted,
import { useTheme } from '../context/ThemeContext'
    marginTop: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  matchInfo: {
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  matchDate: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.md,
import { useTheme } from '../context/ThemeContext'
    color: colors.textSecondary,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  predictionCard: {
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.primary + '15',
import { useTheme } from '../context/ThemeContext'
    borderRadius: RADIUS.md,
import { useTheme } from '../context/ThemeContext'
    padding: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    borderLeftWidth: 4,
import { useTheme } from '../context/ThemeContext'
    borderLeftColor: colors.primary,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  predictionRow: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'space-between',
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  predictionLabel: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.md,
import { useTheme } from '../context/ThemeContext'
    color: colors.textSecondary,
import { useTheme } from '../context/ThemeContext'
    fontWeight: '600',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  predictionConfidence: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.md,
import { useTheme } from '../context/ThemeContext'
    color: colors.primary,
import { useTheme } from '../context/ThemeContext'
    fontWeight: '700',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  predictionOdds: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'space-around',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  predictionOdd: {
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  oddValue: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.heading.md,
import { useTheme } from '../context/ThemeContext'
    fontWeight: 'bold',
import { useTheme } from '../context/ThemeContext'
    color: colors.primary,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  oddLabel: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.caption.xs,
import { useTheme } from '../context/ThemeContext'
    color: colors.textMuted,
import { useTheme } from '../context/ThemeContext'
    marginTop: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // Section
import { useTheme } from '../context/ThemeContext'
  section: {
import { useTheme } from '../context/ThemeContext'
    paddingHorizontal: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
    paddingVertical: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  sectionTitle: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.heading.md,
import { useTheme } from '../context/ThemeContext'
    fontWeight: '600',
import { useTheme } from '../context/ThemeContext'
    color: colors.text,
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // Events
import { useTheme } from '../context/ThemeContext'
  eventsList: {
import { useTheme } from '../context/ThemeContext'
    gap: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  eventCard: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
    borderRadius: RADIUS.md,
import { useTheme } from '../context/ThemeContext'
    padding: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    borderLeftWidth: 3,
import { useTheme } from '../context/ThemeContext'
    borderLeftColor: colors.primary,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  eventMinute: {
import { useTheme } from '../context/ThemeContext'
    fontSize: 14,
import { useTheme } from '../context/ThemeContext'
    fontWeight: 'bold',
import { useTheme } from '../context/ThemeContext'
    color: colors.primary,
import { useTheme } from '../context/ThemeContext'
    minWidth: 40,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  eventContent: {
import { useTheme } from '../context/ThemeContext'
    flex: 1,
import { useTheme } from '../context/ThemeContext'
    marginLeft: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  eventPlayer: {
import { useTheme } from '../context/ThemeContext'
    fontSize: 14,
import { useTheme } from '../context/ThemeContext'
    fontWeight: '600',
import { useTheme } from '../context/ThemeContext'
    color: colors.text,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  eventType: {
import { useTheme } from '../context/ThemeContext'
    fontSize: 12,
import { useTheme } from '../context/ThemeContext'
    color: colors.textSecondary,
import { useTheme } from '../context/ThemeContext'
    marginTop: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  eventTeam: {
import { useTheme } from '../context/ThemeContext'
    fontSize: 11,
import { useTheme } from '../context/ThemeContext'
    fontWeight: '600',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // Odds
import { useTheme } from '../context/ThemeContext'
  oddsScroll: {
import { useTheme } from '../context/ThemeContext'
    marginHorizontal: -SPACING.lg,
import { useTheme } from '../context/ThemeContext'
    paddingHorizontal: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  oddsCard: {
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
    borderRadius: RADIUS.md,
import { useTheme } from '../context/ThemeContext'
    padding: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    marginRight: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    minWidth: 140,
import { useTheme } from '../context/ThemeContext'
    borderWidth: 1,
import { useTheme } from '../context/ThemeContext'
    borderColor: colors.border,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  bookmaderName: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.md,
import { useTheme } from '../context/ThemeContext'
    fontWeight: '700',
import { useTheme } from '../context/ThemeContext'
    color: colors.text,
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    textAlign: 'center',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  oddsGrid: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'space-around',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  oddsItem: {
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  oddsLabel: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.xs,
import { useTheme } from '../context/ThemeContext'
    color: colors.textMuted,
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  oddsValue: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.xl,
import { useTheme } from '../context/ThemeContext'
    fontWeight: 'bold',
import { useTheme } from '../context/ThemeContext'
    color: colors.primary,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  oddsDivider: {
import { useTheme } from '../context/ThemeContext'
    height: 1,
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.border,
import { useTheme } from '../context/ThemeContext'
    marginVertical: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // H2H
import { useTheme } from '../context/ThemeContext'
  h2hStats: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    flexWrap: 'wrap',
import { useTheme } from '../context/ThemeContext'
    gap: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  h2hCard: {
import { useTheme } from '../context/ThemeContext'
    flex: 1,
import { useTheme } from '../context/ThemeContext'
    minWidth: '45%',
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
    borderRadius: RADIUS.md,
import { useTheme } from '../context/ThemeContext'
    padding: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  h2hNumber: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.display.xxs,
import { useTheme } from '../context/ThemeContext'
    fontWeight: 'bold',
import { useTheme } from '../context/ThemeContext'
    color: colors.primary,
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  h2hLabel: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.xs,
import { useTheme } from '../context/ThemeContext'
    color: colors.textMuted,
import { useTheme } from '../context/ThemeContext'
    textAlign: 'center',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  h2hAvg: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'space-between',
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.primary + '15',
import { useTheme } from '../context/ThemeContext'
    borderRadius: RADIUS.md,
import { useTheme } from '../context/ThemeContext'
    padding: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  h2hAvgLabel: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.md,
import { useTheme } from '../context/ThemeContext'
    color: colors.text,
import { useTheme } from '../context/ThemeContext'
    fontWeight: '600',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  h2hAvgValue: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.heading.md,
import { useTheme } from '../context/ThemeContext'
    fontWeight: 'bold',
import { useTheme } from '../context/ThemeContext'
    color: colors.primary,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // Lineups
import { useTheme } from '../context/ThemeContext'
  lineupsContainer: {
import { useTheme } from '../context/ThemeContext'
    gap: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  teamLineup: {
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
    borderRadius: RADIUS.md,
import { useTheme } from '../context/ThemeContext'
    padding: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  lineupTeamName: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.lg,
import { useTheme } from '../context/ThemeContext'
    fontWeight: '700',
import { useTheme } from '../context/ThemeContext'
    color: colors.text,
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  lineupFormation: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.sm,
import { useTheme } from '../context/ThemeContext'
    color: colors.textMuted,
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  playersList: {
import { useTheme } from '../context/ThemeContext'
    gap: SPACING.sm,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  playerItem: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    paddingVertical: SPACING.sm,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  playerNumber: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.xl,
import { useTheme } from '../context/ThemeContext'
    fontWeight: 'bold',
import { useTheme } from '../context/ThemeContext'
    color: colors.primary,
import { useTheme } from '../context/ThemeContext'
    minWidth: 30,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  playerInfo: {
import { useTheme } from '../context/ThemeContext'
    flex: 1,
import { useTheme } from '../context/ThemeContext'
    marginLeft: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  playerName: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.md,
import { useTheme } from '../context/ThemeContext'
    color: colors.text,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  playerPosition: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.xs,
import { useTheme } from '../context/ThemeContext'
    color: colors.textMuted,
import { useTheme } from '../context/ThemeContext'
    marginTop: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // Prediction details
import { useTheme } from '../context/ThemeContext'
  predictionDetails: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'space-between',
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
    borderRadius: RADIUS.md,
import { useTheme } from '../context/ThemeContext'
    padding: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  predictionDetailLabel: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.md,
import { useTheme } from '../context/ThemeContext'
    color: colors.textSecondary,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  predictionDetailValue: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.heading.md,
import { useTheme } from '../context/ThemeContext'
    fontWeight: 'bold',
import { useTheme } from '../context/ThemeContext'
    color: colors.primary,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  predictionFactors: {
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
    borderRadius: RADIUS.md,
import { useTheme } from '../context/ThemeContext'
    padding: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  predictionFactorsTitle: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.md,
import { useTheme } from '../context/ThemeContext'
    fontWeight: '600',
import { useTheme } from '../context/ThemeContext'
    color: colors.text,
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  predictionFactor: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.sm,
import { useTheme } from '../context/ThemeContext'
    color: colors.textSecondary,
import { useTheme } from '../context/ThemeContext'
    marginBottom: SPACING.sm,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // Modal
import { useTheme } from '../context/ThemeContext'
  modalRow: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'space-between',
import { useTheme } from '../context/ThemeContext'
    paddingVertical: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    borderBottomWidth: 1,
import { useTheme } from '../context/ThemeContext'
    borderBottomColor: colors.border,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  modalLabel: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.md,
import { useTheme } from '../context/ThemeContext'
    color: colors.textSecondary,
import { useTheme } from '../context/ThemeContext'
    fontWeight: '600',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  modalValue: {
import { useTheme } from '../context/ThemeContext'
    fontSize: TYPOGRAPHY.body.md,
import { useTheme } from '../context/ThemeContext'
    color: colors.text,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
})
import { useTheme } from '../context/ThemeContext'
