/**
 * Match Oracle — Breaking News Alerts Screen
 * Real-time Monitoring von Fußball-News mit NLP-Klassifikation
 */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native'
import { getColors, SPACING, RADIUS, typography } from '../theme/colors'

interface Alert {
  id: string
  alert_type: string
  priority: string
  title: string
  description?: string
  relevance_score: number
  team_id?: string
  player_id?: string
  source: string
  published_at: string
  is_verified: boolean
  nlp_tags?: string
}

const PRIORITY_COLORS = {
  critical: colors.red,
  high: colors.orange,
  medium: colors.yellow,
  low: colors.textMuted,
}

const ALERT_TYPE_ICONS = {
  injury: '🤕',
  suspension: '🚫',
  tactical: '🎯',
  manager: '👨‍💼',
  transfer: '↔️',
  weather: '⛈️',
  odds: '📊',
  team_news: '📰',
  external: '🌐',
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const { mode } = useTheme()
  const colors = getColors(mode)
  const [loading, setLoading] = useState(false)
  const { mode } = useTheme()
  const colors = getColors(mode)
  const [refreshing, setRefreshing] = useState(false)
  const { mode } = useTheme()
  const colors = getColors(mode)
  const [stats, setStats] = useState({ critical: 0, high: 0, total_24h: 0 })
  const { mode } = useTheme()
  const colors = getColors(mode)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      // TODO: Ersetze mit echtem API call
      // const response = await metricsService.getDashboard()
      // setAlerts(response.alerts)

      // Mock data
      setAlerts([
        {
          id: 'alert_001',
          alert_type: 'injury',
          priority: 'critical',
          title: 'Bayern: Sané verletzt sich im Training',
          description: 'Leroy Sané hat sich im Training eine Zerrung zugezogen und fällt wochenlang aus.',
          relevance_score: 0.92,
          team_id: 'bayern',
          player_id: 'sane',
          source: 'twitter',
          published_at: new Date().toISOString(),
          is_verified: true,
        },
        {
          id: 'alert_002',
          alert_type: 'tactical',
          priority: 'high',
          title: 'BVB wechselt zu 3-5-2 Formation',
          description: 'Edin Terzic hat die Formation für das nächste Spiel auf 3-5-2 umgestellt.',
          relevance_score: 0.78,
          team_id: 'bvb',
          source: 'official',
          published_at: new Date(Date.now() - 3600000).toISOString(),
          is_verified: true,
        },
      ])

      setStats({ critical: 1, high: 2, total_24h: 8 })
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchAlerts().finally(() => setRefreshing(false))
  }, [fetchAlerts])

  if (loading && alerts.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={{ ...typography.bodyMD, color: colors.textSecond, marginTop: SPACING.md }}>
          Lade Breaking News...
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={alerts}
      keyExtractor={(item) => item.id}
      onEndReachedThreshold={0.1}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View style={{ backgroundColor: colors.background }}>
          {/* Header */}
          <View style={{ padding: SPACING.lg, paddingBottom: SPACING.md }}>
            <Text style={{ ...typography.headingLG, color: colors.text, marginBottom: SPACING.sm }}>
              🚨 Breaking News Alerts
            </Text>
            <Text style={{ ...typography.bodySM, color: colors.textMuted }}>
              Real-time Überwachung von Fußball-Events die deine Wetten beeinflussen
            </Text>
          </View>

          {/* Stats Bar */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: SPACING.lg,
              marginBottom: SPACING.lg,
              gap: SPACING.md,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: `${colors.red}20`,
                borderRadius: RADIUS.md,
                padding: SPACING.md,
                alignItems: 'center',
              }}
            >
              <Text style={{ ...typography.labelSM, color: colors.red }}>
                KRITISCH
              </Text>
              <Text style={{ ...typography.headingMD, color: colors.red }}>
                {stats.critical}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: `${colors.orange}20`,
                borderRadius: RADIUS.md,
                padding: SPACING.md,
                alignItems: 'center',
              }}
            >
              <Text style={{ ...typography.labelSM, color: colors.orange }}>
                WICHTIG
              </Text>
              <Text style={{ ...typography.headingMD, color: colors.orange }}>
                {stats.high}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: `${colors.blue}20`,
                borderRadius: RADIUS.md,
                padding: SPACING.md,
                alignItems: 'center',
              }}
            >
              <Text style={{ ...typography.labelSM, color: colors.blue }}>
                HEUTE
              </Text>
              <Text style={{ ...typography.headingMD, color: colors.blue }}>
                {stats.total_24h}
              </Text>
            </View>
          </View>
        </View>
      }
      renderItem={({ item: alert }) => (
        <View
          style={{
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
            backgroundColor: colors.surfaceHigh,
            borderRadius: RADIUS.md,
            overflow: 'hidden',
            borderLeftWidth: 4,
            borderLeftColor: PRIORITY_COLORS[alert.priority as keyof typeof PRIORITY_COLORS],
          }}
        >
          {/* Header */}
          <View style={{ padding: SPACING.md, paddingBottom: SPACING.sm }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.sm,
                gap: SPACING.sm,
              }}
            >
              <Text style={{ fontSize: 20 }}>
                {ALERT_TYPE_ICONS[alert.alert_type as keyof typeof ALERT_TYPE_ICONS] || '📢'}
              </Text>
              <Text style={{ ...typography.labelMD, color: colors.textSecond }}>
                {alert.alert_type.toUpperCase()}
              </Text>
              {alert.is_verified && (
                <View
                  style={{
                    backgroundColor: colors.green,
                    paddingHorizontal: SPACING.xs,
                    paddingVertical: 2,
                    borderRadius: RADIUS.sm,
                  }}
                >
                  <Text style={{ ...typography.labelXS, color: colors.text }}>
                    ✓ BESTÄTIGT
                  </Text>
                </View>
              )}
            </View>

            <Text style={{ ...typography.headingSM, color: colors.text, marginBottom: SPACING.xs }}>
              {alert.title}
            </Text>

            {alert.description && (
              <Text
                style={{ ...typography.bodySM, color: colors.textMuted }}
                numberOfLines={3}
              >
                {alert.description}
              </Text>
            )}
          </View>

          {/* Meta Info */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingHorizontal: SPACING.md,
              paddingBottom: SPACING.md,
              gap: SPACING.sm,
            }}
          >
            {/* Relevance Score */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: RADIUS.sm,
                paddingVertical: SPACING.xs,
                paddingHorizontal: SPACING.sm,
              }}
            >
              <Text style={{ ...typography.labelXS, color: colors.blue }}>
                Score: {(alert.relevance_score * 100).toFixed(0)}%
              </Text>
            </View>

            {/* Team */}
            {alert.team_id && (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: RADIUS.sm,
                  paddingVertical: SPACING.xs,
                  paddingHorizontal: SPACING.sm,
                }}
              >
                <Text style={{ ...typography.labelXS, color: colors.text }}>
                  🏆 {alert.team_id.toUpperCase()}
                </Text>
              </View>
            )}

            {/* Player */}
            {alert.player_id && (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: RADIUS.sm,
                  paddingVertical: SPACING.xs,
                  paddingHorizontal: SPACING.sm,
                }}
              >
                <Text style={{ ...typography.labelXS, color: colors.text }}>
                  👤 {alert.player_id}
                </Text>
              </View>
            )}

            {/* Time */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: RADIUS.sm,
                paddingVertical: SPACING.xs,
                paddingHorizontal: SPACING.sm,
                marginLeft: 'auto',
              }}
            >
              <Text style={{ ...typography.labelXS, color: colors.textMuted }}>
                {new Date(alert.published_at).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: 'row',
              borderTopColor: colors.border,
              borderTopWidth: 1,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: SPACING.md,
                alignItems: 'center',
              }}
            >
              <Text style={{ ...typography.labelSM, color: colors.blue }}>
                ✓ Hilfreich
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: SPACING.md,
                alignItems: 'center',
                borderLeftColor: colors.border,
                borderLeftWidth: 1,
              }}
            >
              <Text style={{ ...typography.labelSM, color: colors.textMuted }}>
                ✕ Schließen
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View
          style={{
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.lg,
            alignItems: 'center',
          }}
        >
          <Text style={{ ...typography.bodyMD, color: colors.textMuted }}>
            Keine Alerts verfügbar
          </Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: SPACING.lg }}
    />
  )
}
