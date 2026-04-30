/**
 * MatchPredictionCard
 * Zeigt ein Spiel mit Prognose, Logos, Wahrscheinlichkeiten und Value-Bet-Badge
 */
import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native'
import { Match } from '../services/api'
import { getColors, SPACING, RADIUS, confidenceColor, formatProb } from '../theme/colors'
import { useTheme } from '../context/ThemeContext'

interface Props {
  match: Match
  onPress?: () => void
}

export default function MatchPredictionCard({ match, onPress }: Props) {
  const { mode } = useTheme()
  const colors = getColors(mode)
  const styles = useMemo(() => createStyles(colors), [colors])

  const pred = match.prediction
  if (!pred) return null

  const kickoffDate = new Date(match.kickoff)
  const timeStr = kickoffDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  const dateStr = kickoffDate.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })

  const isValueBet = pred.value_bet?.exists
  const confColor  = confidenceColor(pred.confidence_label)

  return (
    <TouchableOpacity style={[styles.card, isValueBet && styles.cardValueBet]} onPress={onPress} activeOpacity={0.85}>

      {/* Value Bet Banner */}
      {isValueBet && (
        <View style={styles.valueBetBanner}>
          <Text style={styles.valueBetText}>
            💰 VALUE BET  +{pred.value_bet!.edge_percent}%  |  Beste Quote: {pred.value_bet!.best_odds} @ {pred.value_bet!.best_bookmaker}
          </Text>
        </View>
      )}

      {/* Teams + Zeit */}
      <View style={styles.teamsRow}>
        <TeamSide team={match.home_team} side="home" />
        <View style={styles.centerInfo}>
          <Text style={styles.timeText}>{timeStr}</Text>
          <Text style={styles.dateText}>{dateStr}</Text>
          <View style={[styles.confBadge, { backgroundColor: confColor }]}>
            <Text style={styles.confText}>{pred.confidence_label}</Text>
          </View>
        </View>
        <TeamSide team={match.away_team} side="away" />
      </View>

      {/* Wahrscheinlichkeits-Balken */}
      <ProbabilityBar
        homeWin={pred.home_win}
        draw={pred.draw}
        awayWin={pred.away_win}
      />

      {/* Prozente */}
      <View style={styles.probLabels}>
        <Text style={styles.probLabel}>{formatProb(pred.home_win)}</Text>
        <Text style={styles.probLabel}>{formatProb(pred.draw)}</Text>
        <Text style={styles.probLabel}>{formatProb(pred.away_win)}</Text>
      </View>

      {/* Wahrscheinlichster Spielstand */}
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Wahrscheinlichster Spielstand:</Text>
        <Text style={styles.scoreValue}>
          {pred.most_likely_score}  ({formatProb(pred.most_likely_score_prob)})
        </Text>
      </View>

      {/* Zusatz-Märkte */}
      <View style={styles.marketsRow}>
        <MarketBadge label="Über 2.5" prob={pred.over_2_5_prob} />
        <MarketBadge label="BTTS" prob={pred.btts_prob} />
        <MarketBadge label="xG Heim" value={pred.expected_goals_home.toString()} />
        <MarketBadge label="xG Auswärts" value={pred.expected_goals_away.toString()} />
      </View>

      {/* Tipico Button */}
      {match.tipico_deeplink && (
        <TouchableOpacity
          style={styles.tipicoButton}
          onPress={() => Linking.openURL(match.tipico_deeplink!)}
        >
          <Text style={styles.tipicoButtonText}>🎯  Bei Tipico wetten</Text>
        </TouchableOpacity>
      )}

    </TouchableOpacity>
  )
}


// ─── Sub-Komponenten ──────────────────────────────────────────

function TeamSide({ team, side }: { team: Match['home_team'], side: 'home' | 'away' }) {
  return (
    <View style={[styles.teamSide, side === 'away' && styles.teamSideRight]}>
      <Image
        source={{ uri: team.logo_url }}
        style={styles.teamLogo}
        defaultSource={require('../../assets/logos/placeholder.png')}
      />
      <Text style={styles.teamName} numberOfLines={2}>{team.name}</Text>
    </View>
  )
}

function ProbabilityBar({ homeWin, draw, awayWin }: { homeWin: number; draw: number; awayWin: number }) {
  return (
    <View style={styles.probBar}>
      <View style={[styles.probSegHome,  { flex: homeWin }]} />
      <View style={[styles.probSegDraw,  { flex: draw    }]} />
      <View style={[styles.probSegAway,  { flex: awayWin }]} />
    </View>
  )
}

function MarketBadge({ label, prob, value }: { label: string; prob?: number; value?: string }) {
  const display = value ?? (prob !== undefined ? formatProb(prob) : '-')
  return (
    <View style={styles.marketBadge}>
      <Text style={styles.marketLabel}>{label}</Text>
      <Text style={styles.marketValue}>{display}</Text>
    </View>
  )
}


// ─── Styles ───────────────────────────────────────────────────

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardValueBet: {
    borderColor: colors.valueBet,
    borderWidth: 2,
  },
  valueBetBanner: {
    backgroundColor: colors.valueBetBg,
    borderRadius: RADIUS.sm,
    padding: 6,
    marginBottom: SPACING.sm,
  },
  valueBetText: {
    color: colors.valueBet,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  teamSide: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  teamSideRight: {
    alignItems: 'center',
  },
  teamLogo: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  teamName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerInfo: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  timeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  confBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  confText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  probBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: 6,
  },
  probSegHome: { backgroundColor: colors.blue },
  probSegDraw: { backgroundColor: colors.textMuted },
  probSegAway: { backgroundColor: colors.orange },
  probLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  probLabel: {
    color: colors.textSecond,
    fontSize: 13,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  scoreValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  marketsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  marketBadge: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  marketLabel: {
    color: colors.textMuted,
    fontSize: 9,
  },
  marketValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  tipicoButton: {
    backgroundColor: '#C30D23',
    borderRadius: RADIUS.md,
    padding: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  tipicoButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
})
