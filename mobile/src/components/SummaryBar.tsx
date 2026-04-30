/**
import { useTheme } from '../context/ThemeContext'
 * Summary Bar — Aggregate Statistics
import { useTheme } from '../context/ThemeContext'
 */
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { getColors, SPACING, RADIUS } from '../theme/colors'

interface SummaryBarProps {
  totalMatches: number
  highConfidence: number
  valueBets: number
  avgConfidence?: number
}

export default function SummaryBar({
  totalMatches,
  highConfidence,
  valueBets,
  avgConfidence,
}: SummaryBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.label}>Gesamt</Text>
        <Text style={styles.value}>{totalMatches}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <Text style={styles.label}>Hohes Vertrauen</Text>
        <Text style={[styles.value, { color: colors.greenLight }]}>
          {highConfidence}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <Text style={styles.label}>Value Bets</Text>
        <Text style={[styles.value, { color: colors.valueBet }]}>
          {valueBets}
        </Text>
      </View>

      {avgConfidence !== undefined && (
        <>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.label}>Ø Konfidenz</Text>
            <Text style={styles.value}>{Math.round(avgConfidence * 100)}%</Text>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
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
