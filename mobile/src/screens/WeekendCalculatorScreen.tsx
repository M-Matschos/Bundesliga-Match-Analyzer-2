/**
 * WeekendCalculatorScreen
 * Hauptfeature: Alle Bundesliga-Spiele des Wochenendes auf Knopfdruck berechnen
 */
import React, { useState, useCallback } from 'react'
import {
  View, ScrollView, TouchableOpacity, Text,
  ActivityIndicator, StyleSheet, Alert
} from 'react-native'
import { weekendService, WeekendResult, Match } from '../services/api'
import MatchPredictionCard from '../components/MatchPredictionCard'
import SummaryBar from '../components/SummaryBar'
import ProgressBar from '../components/ProgressBar'
import { COLORS, FONTS, SPACING } from '../theme/colors'

// ─── Liga-Button Config ───────────────────────────────────────

const LEAGUE_BUTTONS = [
  { label: '⚡  BL1 + BL2 berechnen',  leagues: ['bundesliga', 'bundesliga2'], color: COLORS.primary },
  { label: '🏆  Nur Bundesliga 1',      leagues: ['bundesliga'],               color: COLORS.blue },
  { label: '🥈  Nur Bundesliga 2',      leagues: ['bundesliga2'],              color: COLORS.blueLight },
  { label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿  Premier League',       leagues: ['premier-league'],           color: COLORS.purple },
  { label: '🌍  Alle Ligen',            leagues: ['bundesliga', 'bundesliga2', 'premier-league', 'championship'], color: COLORS.green },
] as const


// ─── Haupt-Screen ─────────────────────────────────────────────

export default function WeekendCalculatorScreen() {
  const [loading, setLoading]         = useState(false)
  const [progress, setProgress]       = useState(0)
  const [currentMatch, setCurrentMatch] = useState('')
  const [results, setResults]         = useState<WeekendResult | null>(null)
  const [totalMatches, setTotalMatches] = useState(0)
  const [activeTab, setActiveTab]     = useState<'all' | 'value' | 'high'>('all')

  const handleCalculate = useCallback(async (leagues: string[]) => {
    setLoading(true)
    setProgress(0)
    setCurrentMatch('')
    setResults(null)

    try {
      // Job starten
      const job = await weekendService.startCalculation({ leagues: leagues as any })
      setTotalMatches(job.total_matches)

      if (job.total_matches === 0) {
        Alert.alert('Keine Spiele', 'Für dieses Wochenende wurden keine Spiele gefunden.')
        setLoading(false)
        return
      }

      // Auf Ergebnis warten mit Fortschrittsanzeige
      const result = await weekendService.waitForCompletion(
        job.job_id,
        (done, match) => {
          setProgress(Math.round((done / job.total_matches) * 100))
          if (match) setCurrentMatch(match)
        }
      )

      setResults(result)
    } catch (err: any) {
      Alert.alert('Fehler', err.message || 'Berechnung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }, [])

  // Spiele filtern je nach aktivem Tab
  const filteredMatches = results?.matches.filter(m => {
    if (activeTab === 'value') return m.prediction?.value_bet?.exists
    if (activeTab === 'high')  return m.prediction?.confidence_label === 'HOCH'
    return true
  }) ?? []

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <Text style={styles.title}>⚡ Wochenend-Kalkulator</Text>
      <Text style={styles.subtitle}>Alle Prognosen auf einen Knopfdruck</Text>

      {/* ── Auswahl-Buttons (nur wenn idle) ── */}
      {!loading && !results && (
        <View style={styles.buttonContainer}>
          {LEAGUE_BUTTONS.map((btn) => (
            <TouchableOpacity
              key={btn.label}
              style={[styles.calcButton, { backgroundColor: btn.color }]}
              onPress={() => handleCalculate([...btn.leagues])}
              activeOpacity={0.8}
            >
              <Text style={styles.calcButtonText}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Ladeanimation ── */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.blue} />
          <Text style={styles.loadingTitle}>Berechne Prognosen...</Text>
          <ProgressBar progress={progress} />
          <Text style={styles.progressText}>{progress}% — {totalMatches} Spiele</Text>
          {!!currentMatch && (
            <Text style={styles.currentMatch} numberOfLines={1}>
              🔄 {currentMatch}
            </Text>
          )}
        </View>
      )}

      {/* ── Ergebnisse ── */}
      {results && !loading && (
        <>
          {/* Zusammenfassung */}
          <SummaryBar summary={results.summary!} />

          {/* Filter-Tabs */}
          <View style={styles.tabs}>
            {[
              { key: 'all',   label: `Alle (${results.matches.length})` },
              { key: 'high',  label: `🎯 High Conf. (${results.summary?.high_confidence ?? 0})` },
              { key: 'value', label: `💰 Value Bets (${results.summary?.value_bets_found ?? 0})` },
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Neu berechnen */}
          <TouchableOpacity style={styles.recalcButton} onPress={() => setResults(null)}>
            <Text style={styles.recalcText}>🔄  Neu berechnen</Text>
          </TouchableOpacity>

          {/* Spiel-Kacheln */}
          {filteredMatches.length === 0 ? (
            <Text style={styles.emptyText}>Keine Spiele in dieser Kategorie</Text>
          ) : (
            filteredMatches.map(match => (
              <MatchPredictionCard key={match.match_id} match={match} />
            ))
          )}
        </>
      )}

    </ScrollView>
  )
}


// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },

  // Buttons
  buttonContainer: {
    gap: SPACING.sm,
  },
  calcButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  calcButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  currentMatch: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    maxWidth: '80%',
    textAlign: 'center',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.blue,
  },
  tabText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  recalcButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recalcText: {
    color: COLORS.blue,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: SPACING.xl,
    fontSize: 14,
  },
})
