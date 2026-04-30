import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { useNotification } from '../context/NotificationContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { MatchCardSkeleton } from '../components/skeletons/MatchCardSkeleton'
import MatchPredictionCard from '../components/MatchPredictionCard'
import AccuracyCard from '../components/AccuracyCard'
import { getColors, SPACING, RADIUS, TYPOGRAPHY } from '../theme/colors'
import { matchService, predictionService } from '../services/api'
import type { DashboardScreenProps } from '../navigation/types'

interface Match {
  match_id: string
  kickoff: string
  status: string
  league: string
  home_team: { name: string; logo_url?: string }
  away_team: { name: string; logo_url?: string }
}

type TabType = 'weekend' | 'week' | 'statistics'

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('weekend')

  const { isLoggedIn } = useAuth()
  const { mode } = useTheme()
  const colors = getColors(mode)
  const toast = useToast()
  const { unreadCount } = useNotification()

  useEffect(() => {
    if (isLoggedIn) {
      fetchMatches()
    }
  }, [isLoggedIn])

  const fetchMatches = async () => {
    try {
      setError(null)
      const response = await matchService.getMatches({
        days: 7,
        league: 'all',
        limit: 20,
      })
      setMatches(response || [])
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || 'Fehler beim Laden'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchMatches()
  }

  const handleRetry = () => {
    setLoading(true)
    fetchMatches()
  }

  const handleMatchPress = (item: Match) => {
    // Navigiere zum Team-Details Screen (Home-Team)
    navigation.navigate('TeamDetails', {
      teamId: item.home_team.name,
    })
  }

  if (!isLoggedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textMuted, textAlign: 'center', marginTop: 32 }}>
          Bitte melden Sie sich an
        </Text>
      </View>
    )
  }

  if (error && matches.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: TYPOGRAPHY.heading.md, color: colors.red, marginBottom: 12, textAlign: 'center' }}>
          Fehler beim Laden
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond, marginBottom: 24, textAlign: 'center' }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          style={{ backgroundColor: colors.blue, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 }}
        >
          <Text style={{ fontSize: TYPOGRAPHY.body.md, color: colors.text }}>Erneut versuchen</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'weekend':
        return (
          <>
            <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.sm }}>
                Kommende Spiele
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond }}>
                Nächste 7 Tage
              </Text>
            </View>
            {loading ? (
              <View style={{ paddingHorizontal: SPACING.sm }}>
                {Array(4).fill(0).map((_, i) => (
                  <MatchCardSkeleton key={i} />
                ))}
              </View>
            ) : matches.length > 0 ? (
              matches.map(item => (
                <TouchableOpacity
                  key={item.match_id}
                  style={{ paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs }}
                  onPress={() => handleMatchPress(item)}
                >
                  <MatchPredictionCard match={item} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ paddingVertical: SPACING.xl, alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond }}>
                  Keine Spiele verfügbar
                </Text>
              </View>
            )}
          </>
        )
      case 'week':
        return (
          <>
            <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.sm }}>
                Diese Woche
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond }}>
                Alle Spiele der Woche
              </Text>
            </View>
            {loading ? (
              <View style={{ paddingHorizontal: SPACING.sm }}>
                {Array(3).fill(0).map((_, i) => (
                  <MatchCardSkeleton key={i} />
                ))}
              </View>
            ) : (
              <View style={{ paddingHorizontal: SPACING.sm }}>
                <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: SPACING.lg }}>
                  Keine weiteren Spiele diese Woche
                </Text>
              </View>
            )}
          </>
        )
      case 'statistics':
        return (
          <>
            <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.sm }}>
                Performance Statistiken
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond }}>
                Ihre Vorhersage-Genauigkeit
              </Text>
            </View>
            <View style={{ paddingHorizontal: SPACING.sm, gap: SPACING.md }}>
              <AccuracyCard
                label="Heute"
                accuracy={72.5}
                sampleSize={8}
                period="heute"
                detailed={true}
              />
              <AccuracyCard
                label="Diese Woche"
                accuracy={68.3}
                sampleSize={28}
                period="7 Tage"
                detailed={true}
              />
              <AccuracyCard
                label="Dieser Monat"
                accuracy={65.8}
                sampleSize={96}
                period="30 Tage"
                detailed={true}
              />
              <AccuracyCard
                label="Gesamtzeit"
                accuracy={63.2}
                sampleSize={512}
                period="alle Zeiten"
                detailed={true}
              />
            </View>
            <View style={{ paddingHorizontal: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.md }}>
              <Text style={{ fontSize: TYPOGRAPHY.heading.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.md }}>
                ROI-Metriken
              </Text>
              <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                <View style={{ flex: 1, backgroundColor: colors.surfaceHigh, borderRadius: RADIUS.md, padding: SPACING.md, borderLeftWidth: 4, borderLeftColor: colors.greenLight }}>
                  <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond, marginBottom: SPACING.xs }}>ROI Heute</Text>
                  <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.greenLight }}>+12.5%</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: colors.surfaceHigh, borderRadius: RADIUS.md, padding: SPACING.md, borderLeftWidth: 4, borderLeftColor: colors.yellow }}>
                  <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond, marginBottom: SPACING.xs }}>ROI Woche</Text>
                  <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.yellow }}>+8.3%</Text>
                </View>
              </View>
            </View>
          </>
        )
    }
  }

  return (
    <ErrorBoundary>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.blue}
          />
        }
      >
        {/* Header mit Benachrichtigungen */}
        <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, paddingTop: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: TYPOGRAPHY.heading.lg, fontWeight: 'bold', color: colors.text }}>
              Match Oracle
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.sm, color: colors.textSecond }}>
              Fußball-Vorhersagen
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationHistory')}
            style={{
              position: 'relative',
              padding: SPACING.sm,
            }}
          >
            <Text style={{ fontSize: 24 }}>🔔</Text>
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: colors.red,
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.sm, marginVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          {(['weekend', 'week', 'statistics'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingVertical: SPACING.md,
                paddingHorizontal: SPACING.sm,
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: colors.blue,
              }}
            >
              <Text style={{
                fontSize: TYPOGRAPHY.body.sm,
                fontWeight: activeTab === tab ? '600' : '400',
                color: activeTab === tab ? colors.blue : colors.textSecond,
              }}>
                {tab === 'weekend' ? '🏆 Wochenende' : tab === 'week' ? '📅 Woche' : '📊 Statistiken'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={{ paddingBottom: SPACING.xl }}>
          {renderTabContent()}
        </View>

        {/* Action Button */}
        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.blue,
              paddingVertical: SPACING.md,
              paddingHorizontal: SPACING.lg,
              borderRadius: RADIUS.lg,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => navigation.navigate('WeekendCalculator')}
          >
            <Text style={{ fontSize: TYPOGRAPHY.body.md, fontWeight: '600', color: colors.text }}>
              🎲 Kelly-Kalkulator
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
