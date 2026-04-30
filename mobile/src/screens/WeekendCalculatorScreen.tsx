/**
 * WeekendCalculatorScreen
 * Hauptfeature: Alle Bundesliga-Spiele des Wochenendes auf Knopfdruck berechnen
 */
import React, { useState, useCallback, useEffect } from 'react'
import {
  View, ScrollView, TouchableOpacity, Text,
  ActivityIndicator, StyleSheet
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { weekendService, WeekendResult, Match } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import MatchPredictionCard from '../components/MatchPredictionCard'
import { MatchCardSkeleton } from '../components/skeletons/MatchCardSkeleton'
import SummaryBar from '../components/SummaryBar'
import ProgressBar from '../components/ProgressBar'
import { getColors, TYPOGRAPHY, SPACING, RADIUS } from '../theme/colors'
import { useWeekendCache } from '../hooks/useWeekendCache'
import type { WeekendCalculatorScreenProps } from '../navigation/types'

// ─── Liga-Button Config ───────────────────────────────────────

const LEAGUE_BUTTONS = [
  { label: '⚡  BL1 + BL2 berechnen',  leagues: ['bundesliga', 'bundesliga2'] },
  { label: '🏆  Nur Bundesliga 1',      leagues: ['bundesliga'] },
  { label: '🥈  Nur Bundesliga 2',      leagues: ['bundesliga2'] },
  { label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿  Premier League',       leagues: ['premier-league'] },
  { label: '🌍  Alle Ligen',            leagues: ['bundesliga', 'bundesliga2', 'premier-league', 'championship'] },
] as const


// ─── Haupt-Screen ─────────────────────────────────────────────

export default function WeekendCalculatorScreen({ navigation }: WeekendCalculatorScreenProps) {
  const [loading, setLoading]         = useState(false)
  const [progress, setProgress]       = useState(0)
  const [currentMatch, setCurrentMatch] = useState('')
  const [results, setResults]         = useState<WeekendResult | null>(null)
  const [totalMatches, setTotalMatches] = useState(0)
  const [activeTab, setActiveTab]     = useState<'all' | 'value' | 'high'>('all')
  const [error, setError]             = useState<string | null>(null)
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([])

  const { isLoggedIn } = useAuth()
  const { mode } = useTheme()
  const colors = getColors(mode)
  const toast = useToast()
  const { cachedResult, saveToCache, clearCache } = useWeekendCache(selectedLeagues)

  useEffect(() => {
    if (cachedResult && !results) {
      setResults(cachedResult)
    }
  }, [cachedResult, results])

  const handleCalculate = useCallback(async (leagues: string[]) => {
    if (!isLoggedIn) {
      toast.error('Bitte melden Sie sich an')
      return
    }

    setSelectedLeagues(leagues)
    setLoading(true)
    setProgress(0)
    setCurrentMatch('')
    setResults(null)
    setError(null)

    try {
      const job = await weekendService.startCalculation({ leagues: leagues as any })
      setTotalMatches(job.total_matches)

      if (job.total_matches === 0) {
        toast.error('Keine Spiele für dieses Wochenende gefunden')
        setLoading(false)
        return
      }

      const result = await weekendService.waitForCompletion(
        job.job_id,
        (done, match) => {
          setProgress(Math.round((done / job.total_matches) * 100))
          if (match) setCurrentMatch(match)
        }
      )

      setResults(result)
      await saveToCache(result)
      toast.success(`${result.matches.length} Spiele berechnet!`)
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || 'Berechnung fehlgeschlagen'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn, toast, saveToCache])

  const handleMatchPress = useCallback((match: Match) => {
    navigation.navigate('TeamDetails', {
      teamId: match.home_team.name,
    })
  }, [navigation])

  // Spiele filtern je nach aktivem Tab
  const filteredMatches = results?.matches.filter(m => {
    if (activeTab === 'value') return m.prediction?.value_bet?.exists
    if (activeTab === 'high')  return m.prediction?.confidence_label === 'HOCH'
    return true
  }) ?? []

  return (
    <ErrorBoundary>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}>

        {/* Header */}
        <Text style={{ fontSize: TYPOGRAPHY.display.xs, fontWeight: '700', color: colors.text, marginBottom: SPACING.xs }}>⚡ Kelly-Kalkulator</Text>
        <Text style={{ fontSize: TYPOGRAPHY.body.lg, color: colors.textSecond, marginBottom: SPACING.lg }}>Alle Wochenend-Prognosen berechnen</Text>

        {/* Risk/Reward Info */}
        {!loading && !results && (
          <View style={{ backgroundColor: colors.surfaceHigh, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.lg, borderLeftWidth: 4, borderLeftColor: colors.blue }}>
            <Text style={{ fontSize: TYPOGRAPHY.heading.sm, fontWeight: '600', color: colors.text, marginBottom: SPACING.xs }}>📊 Wie es funktioniert</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond, marginBottom: SPACING.sm }}>• Kelly-Kriterium für optimales Staking</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond, marginBottom: SPACING.sm }}>• Risk/Reward-Analyse für jeden Tipp</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond }}>• Value-Bet-Identifikation</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && !results && (
          <View style={{ backgroundColor: colors.red, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.lg }}>
            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: SPACING.sm }}>{error}</Text>
            <TouchableOpacity
              style={{ backgroundColor: colors.blue, padding: SPACING.sm, borderRadius: RADIUS.sm }}
              onPress={() => setError(null)}
            >
              <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '500' }}>Erneut versuchen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Auswahl-Buttons (nur wenn idle) */}
        {!loading && !results && !error && (
          <View style={{ gap: SPACING.md }}>
            {LEAGUE_BUTTONS.map((btn) => (
              <TouchableOpacity
                key={btn.label}
                style={{ backgroundColor: colors.blue, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, alignItems: 'center' }}
                onPress={() => handleCalculate([...btn.leagues])}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#FFF', fontSize: TYPOGRAPHY.body.lg, fontWeight: '600' }}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Ladeanimation mit Skeletons */}
        {loading && (
          <>
            <View style={{ alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.md }}>
              <ActivityIndicator size="large" color={colors.blue} />
              <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text }}>Berechne Prognosen...</Text>
              <ProgressBar progress={progress} />
              <Text style={{ fontSize: TYPOGRAPHY.body.md, color: colors.textSecond }}>{progress}% — {totalMatches} Spiele</Text>
              {!!currentMatch && (
                <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond, fontStyle: 'italic', maxWidth: '80%', textAlign: 'center' }} numberOfLines={1}>
                  🔄 {currentMatch}
                </Text>
              )}
            </View>
            <View style={{ paddingHorizontal: SPACING.sm }}>
              {Array(5).fill(0).map((_, i) => (
                <MatchCardSkeleton key={i} />
              ))}
            </View>
          </>
        )}

        {/* Ergebnisse */}
        {results && !loading && (
          <>
            {/* Zusammenfassung */}
            <SummaryBar summary={results.summary!} />

            {/* Filter-Tabs */}
            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginVertical: SPACING.md }}>
              {[
                { key: 'all',   label: `Alle (${results.matches.length})` },
                { key: 'high',  label: `🎯 High (${results.summary?.high_confidence ?? 0})` },
                { key: 'value', label: `💰 Value (${results.summary?.value_bets_found ?? 0})` },
              ].map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={{
                    flex: 1,
                    paddingVertical: SPACING.sm,
                    borderRadius: RADIUS.md,
                    backgroundColor: activeTab === tab.key ? colors.blue : colors.surface,
                    alignItems: 'center',
                  }}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <Text style={{
                    fontSize: TYPOGRAPHY.body.sm,
                    color: activeTab === tab.key ? '#FFF' : colors.textSecond,
                    fontWeight: activeTab === tab.key ? '700' : '500',
                  }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Neu berechnen */}
            <TouchableOpacity
              style={{ backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1, borderColor: colors.border }}
              onPress={() => setResults(null)}
            >
              <Text style={{ color: colors.blue, fontWeight: '600' }}>🔄  Neu berechnen</Text>
            </TouchableOpacity>

            {/* Spiel-Kacheln */}
            {filteredMatches.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.textSecond, marginTop: SPACING.xl, fontSize: TYPOGRAPHY.body.sm }}>
                Keine Spiele in dieser Kategorie
              </Text>
            ) : (
              <FlashList
                data={filteredMatches}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs }}
                    onPress={() => handleMatchPress(item)}
                  >
                    <MatchPredictionCard match={item} />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.match_id}
                estimatedItemSize={200}
                scrollEnabled={false}
                nestedScrollEnabled={true}
              />
            )}
          </>
        )}

      </ScrollView>
    </ErrorBoundary>
  )
}
