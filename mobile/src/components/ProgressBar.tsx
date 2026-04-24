/**
 * Progress Bar — Visual Progress Indicator
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, SPACING, RADIUS } from '../theme/colors'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showPercentage?: boolean
}

export default function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0
  const progressWidth = `${Math.min(percentage, 100)}%`

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
          )}
        </View>
      )}

      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            { width: progressWidth },
            percentage < 33 && { backgroundColor: COLORS.red },
            percentage >= 33 && percentage < 66 && { backgroundColor: COLORS.yellow },
            percentage >= 66 && { backgroundColor: COLORS.greenLight },
          ]}
        />
      </View>

      {total > 0 && (
        <Text style={styles.counter}>
          {current} / {total}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  percentage: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.blueLight,
  },
  barContainer: {
    height: 8,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.blueLight,
    borderRadius: RADIUS.full,
  },
  counter: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
})
