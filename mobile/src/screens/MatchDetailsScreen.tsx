/**
 * Match Details Screen — Full match data, live updates, betting
 *
 * Features:
 * - Match header with teams, date, live score
 * - Live match statistics (possession, shots, corners)
 * - Event timeline (goals, cards, substitutions)
 * - Betting odds comparison from multiple bookmakers
 * - Expert predictions with confidence
 * - H2H statistics
 * - Team lineups and formations
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
import { getColors, SPACING, TYPOGRAPHY, RADIUS } from '../theme/colors'
import { useTheme } from '../context/ThemeContext'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Tabs from '../components/Tabs'
import { useToast } from '../context/ToastContext'

// ============================================================================
// TYPES
// ============================================================================

interface Team {
  id: string
  name: string
  logo: string
  formation: string
}

interface MatchScore {
  home_team: Team
  away_team: Team
  home_score: number
  away_score: number
  match_date: string
  status: 'scheduled' | 'live' | 'finished' | 'postponed'
  kickoff_time: string
  minute: number
}

interface MatchStats {
  possession: { home: number; away: number }
  shots: { home: number; away: number }
  shots_on_target: { home: number; away: number }
  corners: { home: number; away: number }
  fouls: { home: number; away: number }
  offsides: { home: number; away: number }
  passes: { home: number; away: number }
  pass_accuracy: { home: number; away: number }
}

interface MatchEvent {
  id: string
  type: 'goal' | 'card' | 'substitution' | 'injury'
  minute: number
  team: 'home' | 'away'
  player: string
  detail?: string
}

interface BettingOdds {
  bookmaker: string
  home_win: number
  draw: number
  away_win: number
  total_under_2_5: number
  total_over_2_5: number
}

interface Prediction {
  home_win_prob: number
  draw_prob: number
  away_win_prob: number
  confidence: number
  predicted_goals: number
  top_factors: string[]
}

interface H2H {
  matches_total: number
  home_wins: number
  draws: number
  away_wins: number
  total_goals: number
  avg_goals: number
}

interface LineupPlayer {
  id: string
  name: string
  number: number
  position: string
}

interface Lineup {
  team: 'home' | 'away'
  formation: string
  players: LineupPlayer[]
}

interface MatchDetailsData {
  score: MatchScore
  stats: MatchStats
  events: MatchEvent[]
  odds: BettingOdds[]
  predictions: Prediction
  h2h: H2H
  lineups: Lineup[]
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function MatchDetailsScreen({ route, navigation }: any) {
  const { matchId } = route.params || {}
  const { showToast } = useToast()

  // State
  const [match, setMatch] = useState<MatchDetailsData | null>(null)
  const { mode } = useTheme()
  const colors = getColors(mode)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedOddsBookmaker, setSelectedOddsBookmaker] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchMatchDetails()
  }, [matchId])

  const fetchMatchDetails = async () => {
    setLoading(true)
    try {
      // Mock data
      const mockMatch: MatchDetailsData = {
        score: {
          home_team: { id: '1', name: 'Bayern Munich', logo: '⚽', formation: '4-2-3-1' },
          away_team: { id: '2', name: 'Dortmund', logo: '⚽', formation: '4-1-4-1' },
          home_score: 2,
          away_score: 1,
          match_date: '2026-05-01',
          status: 'finished',
          kickoff_time: '19:30',
          minute: 90,
        },
        stats: {
          possession: { home: 62, away: 38 },
          shots: { home: 18, away: 12 },
          shots_on_target: { home: 8, away: 5 },
          corners: { home: 7, away: 4 },
          fouls: { home: 10, away: 14 },
          offsides: { home: 2, away: 1 },
          passes: { home: 524, away: 318 },
          pass_accuracy: { home: 87, away: 83 },
        },
        events: [
          { id: '1', type: 'goal', minute: 15, team: 'home', player: 'Robert Lewandowski' },
          { id: '2', type: 'card', minute: 32, team: 'away', player: 'Marco Reus', detail: 'Yellow' },
          { id: '3', type: 'goal', minute: 52, team: 'away', player: 'Karim Adeyemi' },
          { id: '4', type: 'goal', minute: 78, team: 'home', player: 'Serge Gnabry' },
        ],
        odds: [
          { bookmaker: 'Bet365', home_win: 1.50, draw: 4.00, away_win: 6.00, total_under_2_5: 1.95, total_over_2_5: 1.85 },
          { bookmaker: 'Betfair', home_win: 1.52, draw: 3.95, away_win: 5.90, total_under_2_5: 1.93, total_over_2_5: 1.87 },
          { bookmaker: 'DraftKings', home_win: 1.48, draw: 4.05, away_win: 6.10, total_under_2_5: 1.97, total_over_2_5: 1.83 },
        ],
        predictions: {
          home_win_prob: 0.65,
          draw_prob: 0.20,
          away_win_prob: 0.15,
          confidence: 0.78,
          predicted_goals: 2.5,
          top_factors: ['Home advantage', 'Better form', 'Key players availability'],
        },
        h2h: {
          matches_total: 15,
          home_wins: 8,
          draws: 4,
          away_wins: 3,
          total_goals: 45,
          avg_goals: 3.0,
        },
        lineups: [
          {
            team: 'home',
            formation: '4-2-3-1',
            players: [
              { id: '1', name: 'Manuel Neuer', number: 1, position: 'GK' },
              { id: '2', name: 'Dayot Upamecano', number: 2, position: 'DEF' },
              { id: '3', name: 'Benjamin Pavard', number: 3, position: 'DEF' },
            ],
          },
          {
            team: 'away',
            formation: '4-1-4-1',
            players: [
              { id: '10', name: 'Gregor Kobel', number: 1, position: 'GK' },
              { id: '11', name: 'Thomas Meunier', number: 2, position: 'DEF' },
              { id: '12', name: 'Nico Schlotterbeck', number: 3, position: 'DEF' },
            ],
          },
        ],
      }
      setMatch(mockMatch)
      showToast('Match data loaded', 'success')
    } catch (error) {
      console.error('Failed to fetch match:', error)
      showToast('Failed to load match data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchMatchDetails()
    setRefreshing(false)
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => {
    if (!match) return null
    const { score, predictions } = match

    return (
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        {/* Teams and Score */}
        <View style={styles.scoreSection}>
          {/* Home Team */}
          <View style={styles.teamContainer}>
            <Text style={styles.teamLogo}>{score.home_team.logo}</Text>
            <Text style={[styles.teamName, { color: colors.text }]}>{score.home_team.name}</Text>
          </View>

          {/* Score */}
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreValue, { color: colors.primary }]}>{score.home_score}</Text>
            <Text style={[styles.scoreSeparator, { color: colors.textMuted }]}>—</Text>
            <Text style={[styles.scoreValue, { color: colors.primary }]}>{score.away_score}</Text>
            <Text style={[styles.matchStatus, { color: colors.textMuted }]}>
              {score.status === 'live' ? `${score.minute}'` : 'FT'}
            </Text>
          </View>

          {/* Away Team */}
          <View style={styles.teamContainer}>
            <Text style={styles.teamLogo}>{score.away_team.logo}</Text>
            <Text style={[styles.teamName, { color: colors.text }]}>{score.away_team.name}</Text>
          </View>
        </View>

        {/* Match Info */}
        <View style={styles.matchInfo}>
          <Text style={[styles.matchDate, { color: colors.textSecond }]}>
            {score.match_date} @ {score.kickoff_time}
          </Text>
        </View>

        {/* Prediction Card */}
        <View style={[styles.predictionCard, { backgroundColor: colors.primary + '15', borderLeftColor: colors.primary }]}>
          <View style={styles.predictionRow}>
            <Text style={[styles.predictionLabel, { color: colors.textSecond }]}>AI Prediction:</Text>
            <Text style={[styles.predictionConfidence, { color: colors.primary }]}>
              {(predictions.confidence * 100).toFixed(0)}% confident
            </Text>
          </View>
          <View style={styles.predictionOdds}>
            <View style={styles.predictionOdd}>
              <Text style={[styles.oddValue, { color: colors.primary }]}>
                {(predictions.home_win_prob * 100).toFixed(0)}%
              </Text>
              <Text style={[styles.oddLabel, { color: colors.textMuted }]}>Home Win</Text>
            </View>
            <View style={styles.predictionOdd}>
              <Text style={[styles.oddValue, { color: colors.primary }]}>
                {(predictions.draw_prob * 100).toFixed(0)}%
              </Text>
              <Text style={[styles.oddLabel, { color: colors.textMuted }]}>Draw</Text>
            </View>
            <View style={styles.predictionOdd}>
              <Text style={[styles.oddValue, { color: colors.primary }]}>
                {(predictions.away_win_prob * 100).toFixed(0)}%
              </Text>
              <Text style={[styles.oddLabel, { color: colors.textMuted }]}>Away Win</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  const renderStats = () => {
    if (!match) return null
    const { stats } = match

    const statRows = [
      {
        id: 'possession',
        stat: 'Possession',
        home: `${stats.possession.home}%`,
        away: `${stats.possession.away}%`,
      },
      {
        id: 'shots',
        stat: 'Shots',
        home: stats.shots.home,
        away: stats.shots.away,
      },
      {
        id: 'shots_on_target',
        stat: 'Shots on Target',
        home: stats.shots_on_target.home,
        away: stats.shots_on_target.away,
      },
      {
        id: 'corners',
        stat: 'Corners',
        home: stats.corners.home,
        away: stats.corners.away,
      },
      {
        id: 'fouls',
        stat: 'Fouls',
        home: stats.fouls.home,
        away: stats.fouls.away,
      },
      {
        id: 'passes',
        stat: 'Passes',
        home: stats.passes.home,
        away: stats.passes.away,
      },
      {
        id: 'pass_accuracy',
        stat: 'Pass Accuracy',
        home: `${stats.pass_accuracy.home}%`,
        away: `${stats.pass_accuracy.away}%`,
      },
    ]

    return (
      <View style={[styles.section, { paddingHorizontal: SPACING.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Match Statistics</Text>
        <Table
          columns={[
            { key: 'stat', label: 'Stat', align: 'left' },
            { key: 'home', label: `${match.score.home_team.name}`, align: 'center' },
            { key: 'away', label: `${match.score.away_team.name}`, align: 'right' },
          ]}
          data={statRows}
          striped
          dense
        />
      </View>
    )
  }

  const renderEvents = () => {
    if (!match || !match.events.length) return null

    return (
      <View style={[styles.section, { paddingHorizontal: SPACING.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Match Events</Text>
        <View style={styles.eventsList}>
          {match.events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[styles.eventCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}
              onPress={() => setSelectedEvent(event)}
            >
              <Text style={[styles.eventMinute, { color: colors.primary }]}>{event.minute}'</Text>
              <View style={styles.eventContent}>
                <Text style={[styles.eventPlayer, { color: colors.text }]}>{event.player}</Text>
                <Text style={[styles.eventType, { color: colors.textSecond }]}>
                  {event.type === 'goal' && '⚽ Goal'}
                  {event.type === 'card' && '🟨 Card'}
                  {event.type === 'substitution' && '🔄 Substitution'}
                  {event.type === 'injury' && '🚑 Injury'}
                </Text>
              </View>
              <Text
                style={[
                  styles.eventTeam,
                  { color: event.team === 'home' ? colors.primary : colors.blue },
                ]}
              >
                {event.team === 'home' ? match.score.home_team.name : match.score.away_team.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }

  const renderOdds = () => {
    if (!match || !match.odds.length) return null

    return (
      <View style={[styles.section, { paddingHorizontal: SPACING.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Betting Odds</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.oddsScroll}>
          {match.odds.map((bookmaker) => (
            <TouchableOpacity
              key={bookmaker.bookmaker}
              style={[styles.oddsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setSelectedOddsBookmaker(bookmaker.bookmaker)}
            >
              <Text style={[styles.bookmaderName, { color: colors.text }]}>{bookmaker.bookmaker}</Text>
              <View style={styles.oddsGrid}>
                <View style={styles.oddsItem}>
                  <Text style={[styles.oddsLabel, { color: colors.textMuted }]}>1</Text>
                  <Text style={[styles.oddsValue, { color: colors.primary }]}>
                    {bookmaker.home_win.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.oddsItem}>
                  <Text style={[styles.oddsLabel, { color: colors.textMuted }]}>X</Text>
                  <Text style={[styles.oddsValue, { color: colors.primary }]}>
                    {bookmaker.draw.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.oddsItem}>
                  <Text style={[styles.oddsLabel, { color: colors.textMuted }]}>2</Text>
                  <Text style={[styles.oddsValue, { color: colors.primary }]}>
                    {bookmaker.away_win.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={[styles.oddsDivider, { backgroundColor: colors.border }]} />
              <View style={styles.oddsGrid}>
                <View style={styles.oddsItem}>
                  <Text style={[styles.oddsLabel, { color: colors.textMuted }]}>U2.5</Text>
                  <Text style={[styles.oddsValue, { color: colors.primary }]}>
                    {bookmaker.total_under_2_5.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.oddsItem}>
                  <Text style={[styles.oddsLabel, { color: colors.textMuted }]}>O2.5</Text>
                  <Text style={[styles.oddsValue, { color: colors.primary }]}>
                    {bookmaker.total_over_2_5.toFixed(2)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  }

  const renderH2H = () => {
    if (!match) return null
    const { h2h } = match

    return (
      <View style={[styles.section, { paddingHorizontal: SPACING.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Head to Head</Text>
        <View style={styles.h2hStats}>
          <View style={[styles.h2hCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.h2hNumber, { color: colors.primary }]}>{h2h.matches_total}</Text>
            <Text style={[styles.h2hLabel, { color: colors.textMuted }]}>Total Matches</Text>
          </View>
          <View style={[styles.h2hCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.h2hNumber, { color: colors.primary }]}>{h2h.home_wins}</Text>
            <Text style={[styles.h2hLabel, { color: colors.textMuted }]}>Home Wins</Text>
          </View>
          <View style={[styles.h2hCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.h2hNumber, { color: colors.textSecond }]}>{h2h.draws}</Text>
            <Text style={[styles.h2hLabel, { color: colors.textMuted }]}>Draws</Text>
          </View>
          <View style={[styles.h2hCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.h2hNumber, { color: colors.blue }]}>{h2h.away_wins}</Text>
            <Text style={[styles.h2hLabel, { color: colors.textMuted }]}>Away Wins</Text>
          </View>
        </View>
        <View style={[styles.h2hAvg, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.h2hAvgLabel, { color: colors.text }]}>Average Goals:</Text>
          <Text style={[styles.h2hAvgValue, { color: colors.primary }]}>{h2h.avg_goals.toFixed(2)}</Text>
        </View>
      </View>
    )
  }

  const renderLineups = () => {
    if (!match) return null

    return (
      <View style={[styles.section, { paddingHorizontal: SPACING.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Lineups</Text>
        <View style={styles.lineupsContainer}>
          {match.lineups.map((lineup) => (
            <View key={`${lineup.team}`} style={[styles.teamLineup, { backgroundColor: colors.surface }]}>
              <Text style={[styles.lineupTeamName, { color: colors.text }]}>
                {lineup.team === 'home' ? match.score.home_team.name : match.score.away_team.name}
              </Text>
              <Text style={[styles.lineupFormation, { color: colors.textMuted }]}>{lineup.formation}</Text>
              <View style={styles.playersList}>
                {lineup.players.slice(0, 5).map((player) => (
                  <View key={player.id} style={styles.playerItem}>
                    <Text style={[styles.playerNumber, { color: colors.primary }]}>{player.number}</Text>
                    <View style={styles.playerInfo}>
                      <Text style={[styles.playerName, { color: colors.text }]}>{player.name}</Text>
                      <Text style={[styles.playerPosition, { color: colors.textMuted }]}>{player.position}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    )
  }

  function renderPrediction() {
    if (!match) return null
    const { predictions } = match

    return (
      <View style={[styles.section, { paddingHorizontal: SPACING.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Prediction Details</Text>
        <View style={[styles.predictionDetails, { backgroundColor: colors.surface }]}>
          <Text style={[styles.predictionDetailLabel, { color: colors.textSecond }]}>Expected Goals: </Text>
          <Text style={[styles.predictionDetailValue, { color: colors.primary }]}>
            {predictions.predicted_goals.toFixed(1)}
          </Text>
        </View>
        <View style={[styles.predictionFactors, { backgroundColor: colors.surface }]}>
          <Text style={[styles.predictionFactorsTitle, { color: colors.text }]}>Top Factors:</Text>
          {predictions.top_factors.map((factor, index) => (
            <Text key={index} style={[styles.predictionFactor, { color: colors.textSecond }]}>
              • {factor}
            </Text>
          ))}
        </View>
      </View>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading && !match) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {renderHeader()}

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'stats', label: 'Stats' },
          { id: 'events', label: 'Events' },
          { id: 'odds', label: 'Odds' },
          { id: 'h2h', label: 'H2H' },
          { id: 'lineups', label: 'Lineups' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {renderPrediction()}
          {renderOdds()}
        </>
      )}
      {activeTab === 'stats' && renderStats()}
      {activeTab === 'events' && renderEvents()}
      {activeTab === 'odds' && renderOdds()}
      {activeTab === 'h2h' && renderH2H()}
      {activeTab === 'lineups' && renderLineups()}

      {/* Footer */}
      <View style={{ height: SPACING.xl }} />

      {/* Event Detail Modal */}
      <Modal
        visible={!!selectedEvent}
        title={selectedEvent?.player || ''}
        onClose={() => setSelectedEvent(null)}
      >
        {selectedEvent && (
          <View>
            <View style={[styles.modalRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalLabel, { color: colors.textSecond }]}>Type:</Text>
              <Text style={[styles.modalValue, { color: colors.text }]}>{selectedEvent.type}</Text>
            </View>
            <View style={[styles.modalRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalLabel, { color: colors.textSecond }]}>Minute:</Text>
              <Text style={[styles.modalValue, { color: colors.text }]}>{selectedEvent.minute}'</Text>
            </View>
            <View style={[styles.modalRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalLabel, { color: colors.textSecond }]}>Team:</Text>
              <Text style={[styles.modalValue, { color: colors.text }]}>{selectedEvent.team}</Text>
            </View>
            {selectedEvent.detail && (
              <View style={[styles.modalRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalLabel, { color: colors.textSecond }]}>Detail:</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>{selectedEvent.detail}</Text>
              </View>
            )}
          </View>
        )}
      </Modal>
    </ScrollView>
  )
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    fontSize: TYPOGRAPHY.display.md,
    marginBottom: SPACING.xs,
  },
  teamName: {
    fontSize: TYPOGRAPHY.body.sm,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
  },
  scoreValue: {
    fontSize: TYPOGRAPHY.display.lg,
    fontWeight: 'bold',
  },
  scoreSeparator: {
    fontSize: TYPOGRAPHY.display.sm,
    marginVertical: SPACING.xs,
  },
  matchStatus: {
    fontSize: TYPOGRAPHY.body.sm,
    marginTop: SPACING.xs,
  },
  matchInfo: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  matchDate: {
    fontSize: TYPOGRAPHY.body.md,
  },
  predictionCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  predictionLabel: {
    fontSize: TYPOGRAPHY.body.md,
    fontWeight: '600',
  },
  predictionConfidence: {
    fontSize: TYPOGRAPHY.body.md,
    fontWeight: '700',
  },
  predictionOdds: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  predictionOdd: {
    alignItems: 'center',
  },
  oddValue: {
    fontSize: TYPOGRAPHY.heading.md,
    fontWeight: 'bold',
  },
  oddLabel: {
    fontSize: TYPOGRAPHY.caption.xs,
    marginTop: SPACING.xs,
  },

  // Section
  section: {
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.heading.md,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },

  // Events
  eventsList: {
    gap: SPACING.md,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
  },
  eventMinute: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
  },
  eventContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  eventPlayer: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventType: {
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  eventTeam: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Odds
  oddsScroll: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  oddsCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginRight: SPACING.md,
    minWidth: 140,
    borderWidth: 1,
  },
  bookmaderName: {
    fontSize: TYPOGRAPHY.body.md,
    fontWeight: '700',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  oddsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  oddsItem: {
    alignItems: 'center',
  },
  oddsLabel: {
    fontSize: TYPOGRAPHY.body.xs,
    marginBottom: SPACING.xs,
  },
  oddsValue: {
    fontSize: TYPOGRAPHY.body.xl,
    fontWeight: 'bold',
  },
  oddsDivider: {
    height: 1,
    marginVertical: SPACING.md,
  },

  // H2H
  h2hStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  h2hCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  h2hNumber: {
    fontSize: TYPOGRAPHY.display.xxs,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  h2hLabel: {
    fontSize: TYPOGRAPHY.body.xs,
    textAlign: 'center',
  },
  h2hAvg: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  h2hAvgLabel: {
    fontSize: TYPOGRAPHY.body.md,
    fontWeight: '600',
  },
  h2hAvgValue: {
    fontSize: TYPOGRAPHY.heading.md,
    fontWeight: 'bold',
  },

  // Lineups
  lineupsContainer: {
    gap: SPACING.lg,
  },
  teamLineup: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  lineupTeamName: {
    fontSize: TYPOGRAPHY.body.lg,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  lineupFormation: {
    fontSize: TYPOGRAPHY.body.sm,
    marginBottom: SPACING.md,
  },
  playersList: {
    gap: SPACING.sm,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  playerNumber: {
    fontSize: TYPOGRAPHY.body.xl,
    fontWeight: 'bold',
    minWidth: 30,
  },
  playerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  playerName: {
    fontSize: TYPOGRAPHY.body.md,
  },
  playerPosition: {
    fontSize: TYPOGRAPHY.body.xs,
    marginTop: SPACING.xs,
  },

  // Prediction details
  predictionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  predictionDetailLabel: {
    fontSize: TYPOGRAPHY.body.md,
  },
  predictionDetailValue: {
    fontSize: TYPOGRAPHY.heading.md,
    fontWeight: 'bold',
  },
  predictionFactors: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  predictionFactorsTitle: {
    fontSize: TYPOGRAPHY.body.md,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  predictionFactor: {
    fontSize: TYPOGRAPHY.body.sm,
    marginBottom: SPACING.sm,
  },

  // Modal
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  modalLabel: {
    fontSize: TYPOGRAPHY.body.md,
    fontWeight: '600',
  },
  modalValue: {
    fontSize: TYPOGRAPHY.body.md,
  },
})
