/**
 * Match Oracle — Accuracy Metric Card
 * Zeigt einzelne Genauigkeitsmetrik mit Farbcodierung (grün >65%, gelb 50-65%, rot <50%)
 */
import React from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { getColors, SPACING, RADIUS, typography } from '../theme/colors'

interface AccuracyCardProps {
  label: string
  accuracy: number
  sampleSize?: number
  period?: string
  detailed?: boolean
}

export default function AccuracyCard({
  label,
  accuracy,
  sampleSize,
  period = 'letzte 30 Tage',
  detailed = false,
}: AccuracyCardProps) {
  const { mode } = useTheme()
  const colors = getColors(mode)

  const getColor = (acc: number) => {
    if (acc >= 65) return colors.greenLight
    if (acc >= 50) return colors.yellow
    return colors.red
  }

  const color = getColor(accuracy)

  return (
    <View
      style={{
        backgroundColor: colors.surfaceHigh,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
    >
      {/* Label + Period */}
      <View style={{ marginBottom: SPACING.sm }}>
        <Text style={{ ...typography.labelMD, color: colors.textSecond }}>
          {label}
        </Text>
        <Text style={{ ...typography.bodyXS, color: colors.textMuted, marginTop: 2 }}>
          {period}
        </Text>
      </View>

      {/* Main Accuracy Percentage */}
      <View style={{ marginBottom: detailed ? SPACING.md : 0 }}>
        <Text
          style={{
            ...typography.headingLG,
            color,
            marginBottom: 4,
          }}
        >
          {accuracy.toFixed(1)}%
        </Text>

        {detailed && sampleSize && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.sm,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: color,
              }}
            />
            <Text style={{ ...typography.bodySM, color: colors.textSecond }}>
              {sampleSize} Prognosen analysiert
            </Text>
          </View>
        )}
      </View>

      {/* Rating Message */}
      <View
        style={{
          backgroundColor: `${color}20`,
          borderRadius: RADIUS.sm,
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.sm,
          marginTop: detailed ? SPACING.sm : 0,
          alignSelf: 'flex-start',
          borderColor: color,
          borderWidth: 1,
        }}
      >
        <Text style={{ ...typography.labelSM, color }}>
          {accuracy >= 65
            ? '✓ Gut kalibriert'
            : accuracy >= 50
              ? '⚠ Über Durchschnitt'
              : '⚠ Unter Erwartung'}
        </Text>
      </View>
    </View>
  )
}
