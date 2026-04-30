/**
 * Match Oracle — Metrics Dashboard (v2.0+ Trust Feature)
 * Zeigt Model-Transparenz: Genauigkeit, Kalibrierung, ROI-Trend
 */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { getColors, SPACING, RADIUS, typography } from '../theme/colors'
import { metricsService, MetricsDashboard, ROITrendPoint } from '../services/api'
import AccuracyCard from '../components/AccuracyCard'
import { useToast } from '../context/ToastContext'

const PERIOD_OPTIONS: Array<'7d' | '30d' | '90d' | '1y' | 'all'> = ['7d', '30d', '90d', '1y']

export default function MetricsScreen() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d')
  const { mode } = useTheme()
  const colors = getColors(mode)
  const [dashboard, setDashboard] = useState<MetricsDashboard | null>(null)
  const { mode } = useTheme()
  const colors = getColors(mode)
  const [loading, setLoading] = useState(false)
  const { mode } = useTheme()
  const colors = getColors(mode)
  const [refreshing, setRefreshing] = useState(false)
  const { mode } = useTheme()
  const colors = getColors(mode)
  const [error, setError] = useState<string | null>(null)
  const { mode } = useTheme()
  const colors = getColors(mode)
  const { showToast } = useToast()

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Konvertiere 7d → 7, 30d → 30, etc.
      const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365, 'all': 3650 }
      const days = daysMap[period]

      const data = await metricsService.getDashboard(days)
      setDashboard(data)
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Fehler beim Laden der Metriken'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [period, showToast])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchMetrics().finally(() => setRefreshing(false))
  }, [fetchMetrics])

  if (loading && !dashboard) {
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
          Lade Modell-Metriken...
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={{ padding: SPACING.lg, paddingBottom: SPACING.md }}>
        <Text style={{ ...typography.headingLG, color: colors.text, marginBottom: SPACING.sm }}>
          📊 Modell-Transparenz
        </Text>
        <Text style={{ ...typography.bodySM, color: colors.textMuted }}>
          Sehe die historische Genauigkeit unserer Prognosen
        </Text>
      </View>

      {/* Period Selector */}
      <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
        <Text style={{ ...typography.labelMD, color: colors.textSecond, marginBottom: SPACING.sm }}>
          Zeitraum
        </Text>
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          {PERIOD_OPTIONS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={{
                flex: 1,
                paddingVertical: SPACING.sm,
                paddingHorizontal: SPACING.sm,
                backgroundColor: period === p ? colors.blue : colors.surfaceHigh,
                borderRadius: RADIUS.md,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  ...typography.labelSM,
                  color: period === p ? colors.text : colors.textSecond,
                }}
              >
                {p === '7d' ? '7T'
                : p === '30d' ? '30T'
                : p === '90d' ? '90T'
                : p === '1y' ? '1J'
                : 'Alle'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {error && (
        <View
          style={{
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
            backgroundColor: `${colors.red}20`,
            borderRadius: RADIUS.md,
            padding: SPACING.md,
          }}
        >
          <Text style={{ ...typography.bodyMD, color: colors.red }}>
            ⚠️ {error}
          </Text>
        </View>
      )}

      {dashboard && (
        <>
          {/* Overall Accuracy */}
          <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
            <Text style={{ ...typography.labelMD, color: colors.textSecond, marginBottom: SPACING.md }}>
              Gesamtgenauigkeit
            </Text>
            <AccuracyCard
              label="Alle Prognosen"
              accuracy={dashboard.overall_accuracy.accuracy_percent}
              sampleSize={dashboard.overall_accuracy.sample_size}
              period={`${dashboard.overall_accuracy.period_days} Tage`}
              detailed={true}
            />
          </View>

          {/* Accuracy by Confidence */}
          <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
            <Text style={{ ...typography.labelMD, color: colors.textSecond, marginBottom: SPACING.md }}>
              Nach Konfidenz-Level
            </Text>
            {dashboard.accuracy_by_confidence.map((acc) => (
              <AccuracyCard
                key={acc.confidence_level}
                label={
                  acc.confidence_level === 'HIGH'
                    ? '🟢 Hohe Konfidenz'
                    : acc.confidence_level === 'MEDIUM'
                      ? '🟡 Mittlere Konfidenz'
                      : '🔴 Niedrige Konfidenz'
                }
                accuracy={acc.accuracy_percent}
                sampleSize={acc.sample_size}
              />
            ))}
          </View>

          {/* Accuracy by League */}
          <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
            <Text style={{ ...typography.labelMD, color: colors.textSecond, marginBottom: SPACING.md }}>
              Nach Liga
            </Text>
            {Object.entries(dashboard.accuracy_by_league).map(([league, accuracy]) => (
              <AccuracyCard
                key={league}
                label={league === 'bundesliga' ? '🏆 Bundesliga' : '🏆 2. Bundesliga'}
                accuracy={accuracy}
              />
            ))}
          </View>

          {/* Calibration Info */}
          <View
            style={{
              marginHorizontal: SPACING.lg,
              marginBottom: SPACING.md,
              backgroundColor: colors.surfaceHigh,
              borderRadius: RADIUS.md,
              padding: SPACING.md,
            }}
          >
            <Text style={{ ...typography.headingSM, color: colors.text, marginBottom: SPACING.sm }}>
              📈 Kalibrierung
            </Text>
            <Text style={{ ...typography.bodySM, color: colors.textMuted, marginBottom: SPACING.sm }}>
              {dashboard.calibration_curve.length} Konfidenz-Bereiche analysiert
            </Text>
            <Text style={{ ...typography.bodySM, color: colors.textSecond }}>
              ✓ Wenn unser Modell sagt 70% → sollte das Match ~70% der Zeit gewinnen
            </Text>

            {/* Show a few calibration points */}
            <View style={{ marginTop: SPACING.md, gap: SPACING.sm }}>
              {dashboard.calibration_curve.slice(0, 5).map((point, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: SPACING.xs,
                  }}
                >
                  <Text style={{ ...typography.bodySM, color: colors.textSecond }}>
                    {(point.predicted_probability * 100).toFixed(0)}%
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 4,
                      backgroundColor: colors.surface,
                      marginHorizontal: SPACING.sm,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${point.actual_win_rate * 100}%`,
                        height: '100%',
                        backgroundColor: colors.blue,
                      }}
                    />
                  </View>
                  <Text style={{ ...typography.bodySM, color: colors.blue, width: 35 }}>
                    {(point.actual_win_rate * 100).toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ROI Trend */}
          <View
            style={{
              marginHorizontal: SPACING.lg,
              marginBottom: SPACING.lg,
              backgroundColor: colors.surfaceHigh,
              borderRadius: RADIUS.md,
              padding: SPACING.md,
            }}
          >
            <Text style={{ ...typography.headingSM, color: colors.text, marginBottom: SPACING.md }}>
              💰 ROI-Trend (7-Tage-Durchschnitt)
            </Text>
            {dashboard.roi_trend.length > 0 ? (
              <View style={{ gap: SPACING.sm }}>
                {dashboard.roi_trend.slice(-7).map((point, idx) => {
                  const dateObj = new Date(point.date)
                  const dateStr = dateObj.toLocaleDateString('de-DE', {
                    month: 'short',
                    day: 'numeric',
                  })
                  const isPositive = point.roi_percent >= 0

                  return (
                    <View
                      key={idx}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: SPACING.xs,
                      }}
                    >
                      <Text style={{ ...typography.bodySM, color: colors.textSecond }}>
                        {dateStr}
                      </Text>
                      <View
                        style={{
                          flex: 1,
                          marginHorizontal: SPACING.sm,
                          height: 6,
                          backgroundColor: colors.surface,
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            width: `${Math.min(Math.abs(point.roi_percent) * 2, 100)}%`,
                            height: '100%',
                            backgroundColor: isPositive ? colors.green : colors.red,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          ...typography.labelSM,
                          color: isPositive ? colors.green : colors.red,
                          width: 50,
                          textAlign: 'right',
                        }}
                      >
                        {isPositive ? '+' : ''}{point.roi_percent.toFixed(1)}%
                      </Text>
                    </View>
                  )
                })}
              </View>
            ) : (
              <Text style={{ ...typography.bodySM, color: colors.textMuted }}>
                Noch keine Wettdaten verfügbar
              </Text>
            )}
          </View>

          {/* Last Updated + Model Info */}
          <View
            style={{
              marginHorizontal: SPACING.lg,
              marginBottom: SPACING.lg,
              backgroundColor: `${colors.blue}10`,
              borderRadius: RADIUS.md,
              padding: SPACING.md,
            }}
          >
            <Text style={{ ...typography.bodySM, color: colors.textMuted }}>
              ℹ️ Zuletzt aktualisiert: {new Date(dashboard.last_updated).toLocaleString('de-DE')}
            </Text>
            <Text style={{ ...typography.bodySM, color: colors.textMuted, marginTop: SPACING.xs }}>
              Gesamt-Prognosen: {dashboard.total_predictions_analyzed}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  )
}
