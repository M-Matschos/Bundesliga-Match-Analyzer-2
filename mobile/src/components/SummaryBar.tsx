/**
 * Summary Bar — Aggregate Statistics
 */
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { getColors, SPACING, RADIUS } from '../theme/colors'
import { useTheme } from '../context/ThemeContext'

interface SummaryData {
  total_matches: number
  high_confidence: number
  medium_confidence: number
  low_confidence: number
  value_bets_found: number
}

interface SummaryBarProps {
  summary: SummaryData
}

export default function SummaryBar({ summary }: SummaryBarProps) {
  const { mode } = useTheme()
  const colors = getColors(mode)
  const styles = createStyles(colors)

  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.label}>Gesamt</Text>
        <Text style={styles.value}>{summary.total_matches}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <Text style={styles.label}>Hohes Vertrauen</Text>
        <Text style={[styles.value, { color: colors.greenLight }]}>
          {summary.high_confidence}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <Text style={styles.label}>Value Bets</Text>
        <Text style={[styles.value, { color: colors.valueBet }]}>
          {summary.value_bets_found}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <Text style={styles.label}>Mittel</Text>
        <Text style={styles.value}>{summary.medium_confidence}</Text>
      </View>
    </View>
  )
}

const createStyles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      marginHorizontal: SPACING.lg,
      marginVertical: SPACING.md,
      alignItems: 'center',
    },
    stat: {
      flex: 1,
      alignItems: 'center',
    },
    label: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 4,
      fontWeight: '500',
    },
    value: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.blueLight,
    },
    divider: {
      width: 1,
      height: 40,
      backgroundColor: colors.border,
      marginHorizontal: SPACING.sm,
    },
  })
