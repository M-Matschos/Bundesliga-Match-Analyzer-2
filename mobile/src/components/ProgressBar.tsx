import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'
import { typography } from '../theme/typography'

interface ProgressBarProps {
  // Support both direct progress (0-100) and calculated (current/total)
  progress?: number
  current?: number
  total?: number
  label?: string
  showPercentage?: boolean
  accessibilityLabel?: string  // For VoiceOver announcement
}

export default function ProgressBar({
  progress,
  current,
  total,
  label,
  showPercentage = true,
  accessibilityLabel,
}: ProgressBarProps) {
  // Calculate percentage from either progress or current/total
  const percentage = progress !== undefined
    ? Math.min(100, Math.max(0, progress))
    : total && total > 0
    ? (current || 0 / total) * 100
    : 0

  const progressWidth = `${Math.min(percentage, 100)}%`

  const getProgressColor = () => {
    if (percentage < 33) return colors.red
    if (percentage < 66) return colors.yellow
    return colors.green
  }

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || 'Progress'}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percentage) }}
    >
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
          testID="progress-bar-fill"
          style={[
            styles.bar,
            { width: progressWidth, backgroundColor: getProgressColor() },
          ]}
        />
      </View>

      {current !== undefined && total && total > 0 && (
        <Text style={styles.counter}>
          {current} / {total}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    ...typography.labelMD,
    color: colors.text,
  },
  percentage: {
    ...typography.labelMD,
    color: colors.blue,
  },
  barContainer: {
    height: 8,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: {
    height: '100%',
    borderRadius: 100,
  },
  counter: {
    ...typography.labelSM,
    color: colors.textMuted,
    textAlign: 'right',
  },
})
