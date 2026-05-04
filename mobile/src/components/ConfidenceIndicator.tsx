/**
 * Confidence Indicator Component
 *
 * Visual representation of model confidence as a circular progress indicator.
 * Color-coded based on confidence level (red/yellow/green).
 * Supports multiple sizes and full dark mode compatibility.
 *
 * Phase D1: Task 6
 */

import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { getColors } from '../theme/colors'
import { spacing, typography } from '../theme'

// ─── Types ───────────────────────────────────────────────────

/**
 * Confidence level categories
 */
type ConfidenceLevel = 'low' | 'medium' | 'high'

/**
 * Component size options
 */
type IndicatorSize = 'small' | 'medium' | 'large'

/**
 * Component props interface
 */
interface ConfidenceIndicatorProps {
  confidence: number
  mode: 'light' | 'dark'
  size?: IndicatorSize
  showLabel?: boolean
  showPercentage?: boolean
  style?: ViewStyle
  testID?: string
}

// ─── Constants ───────────────────────────────────────────────────

/**
 * Size configurations for different indicator sizes
 */
const SIZE_CONFIG: Record<IndicatorSize, { radius: number; strokeWidth: number; labelSize: number }> = {
  small: {
    radius: 24,
    strokeWidth: 3,
    labelSize: 12,
  },
  medium: {
    radius: 40,
    strokeWidth: 4,
    labelSize: 16,
  },
  large: {
    radius: 60,
    strokeWidth: 5,
    labelSize: 20,
  },
}

// ─── Component ───────────────────────────────────────────────────

/**
 * ConfidenceIndicator Component
 *
 * Displays model confidence as a circular progress indicator with:
 * - Smooth color gradient (red → yellow → green)
 * - Multiple size options (small, medium, large)
 * - Full accessibility support
 * - Dark mode compatible
 *
 * Confidence Ranges:
 * - 0.0–0.4: Low (Red) — Low confidence, unreliable prediction
 * - 0.4–0.7: Medium (Yellow) — Moderate confidence, caution recommended
 * - 0.7–1.0: High (Green) — High confidence, reliable prediction
 *
 * @example
 * ```tsx
 * <ConfidenceIndicator
 *   confidence={0.82}
 *   mode="dark"
 *   size="medium"
 *   showLabel={true}
 *   showPercentage={true}
 * />
 * ```
 */
export function ConfidenceIndicator({
  confidence,
  mode,
  size = 'medium',
  showLabel = true,
  showPercentage = true,
  style,
  testID = 'confidence-indicator',
}: ConfidenceIndicatorProps): React.ReactElement {
  const colors = getColors(mode)
  const config = SIZE_CONFIG[size]
  const percentValue = Math.round(confidence * 100)

  /**
   * Determine confidence level and color
   */
  const { level, color, label } = useMemo(() => {
    let lv: ConfidenceLevel
    let col: string

    if (confidence < 0.4) {
      lv = 'low'
      col = colors.error
    } else if (confidence < 0.7) {
      lv = 'medium'
      col = colors.warning
    } else {
      lv = 'high'
      col = colors.success
    }

    const lbl =
      lv === 'low'
        ? 'Low Confidence'
        : lv === 'medium'
          ? 'Medium Confidence'
          : 'High Confidence'

    return { level: lv, color: col, label: lbl }
  }, [confidence, colors])

  /**
   * Get accessibility label
   */
  const getAccessibilityLabel = (): string => {
    return `Model confidence: ${percentValue}%, ${label}`
  }

  /**
   * Calculate rotation angle for progress circle (0-360 degrees)
   */
  const rotationAngle = useMemo(() => {
    return (confidence * 360)
  }, [confidence])

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: percentValue,
        text: `${percentValue}%`,
      }}
      testID={testID}
    >
      {/* Circular Progress Indicator */}
      <View
        style={[
          styles.circleContainer,
          {
            width: config.radius * 2,
            height: config.radius * 2,
          },
        ]}
      >
        {/* Background circle */}
        <View
          style={[
            styles.circle,
            {
              width: config.radius * 2,
              height: config.radius * 2,
              borderRadius: config.radius,
              borderWidth: config.strokeWidth,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        />

        {/* Progress arc overlay (simulated with border) */}
        <View
          style={[
            styles.progressArc,
            {
              width: config.radius * 2,
              height: config.radius * 2,
              borderRadius: config.radius,
              borderWidth: config.strokeWidth,
              borderColor: color,
              borderTopColor: color,
              borderRightColor: confidence > 0.25 ? color : colors.border,
              borderBottomColor: confidence > 0.5 ? color : colors.border,
              borderLeftColor: confidence > 0.75 ? color : colors.border,
            },
          ]}
        />

        {/* Center content with percentage */}
        <View
          style={[
            styles.centerContent,
            {
              width: config.radius * 1.6,
              height: config.radius * 1.6,
              borderRadius: config.radius * 0.8,
            },
          ]}
        >
          {showPercentage && (
            <Text
              style={[
                styles.percentageText,
                {
                  fontSize: config.labelSize + 2,
                  color: color,
                  fontWeight: '700',
                },
              ]}
              accessible={false}
            >
              {percentValue}%
            </Text>
          )}
        </View>
      </View>

      {/* Label and confidence level */}
      {showLabel && (
        <View style={styles.labelContainer} accessible={false}>
          <Text
            style={[styles.label, { color: colors.text }]}
            numberOfLines={1}
          >
            {label}
          </Text>
          <View
            style={[
              styles.levelIndicator,
              { backgroundColor: color + '30' },
            ]}
          >
            <Text
              style={[
                styles.levelText,
                { color: color },
              ]}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

/**
 * Simplified Bar Variant
 *
 * Alternative horizontal bar representation of confidence
 */
interface ConfidenceBarProps {
  confidence: number
  mode: 'light' | 'dark'
  height?: number
  showLabel?: boolean
  showPercentage?: boolean
  style?: ViewStyle
  testID?: string
}

export function ConfidenceBar({
  confidence,
  mode,
  height = 8,
  showLabel = true,
  showPercentage = true,
  style,
  testID = 'confidence-bar',
}: ConfidenceBarProps): React.ReactElement {
  const colors = getColors(mode)
  const percentValue = Math.round(confidence * 100)

  /**
   * Determine color based on confidence
   */
  const { color } = useMemo(() => {
    let col: string
    if (confidence < 0.4) {
      col = colors.error
    } else if (confidence < 0.7) {
      col = colors.warning
    } else {
      col = colors.success
    }
    return { color: col }
  }, [confidence, colors])

  return (
    <View
      style={[styles.barContainer, style]}
      accessible={true}
      accessibilityLabel={`Model confidence: ${percentValue}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: percentValue,
      }}
      testID={testID}
    >
      {showLabel && (
        <View style={styles.barHeader}>
          <Text
            style={[styles.barLabel, { color: colors.text }]}
          >
            Confidence
          </Text>
          {showPercentage && (
            <Text
              style={[styles.barPercentage, { color: colors.text }]}
            >
              {percentValue}%
            </Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.barBackground,
          {
            height,
            backgroundColor: colors.border,
            borderRadius: height / 2,
          },
        ]}
      >
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.max(confidence * 100, 2)}%`,
              height,
              backgroundColor: color,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  circle: {
    position: 'absolute',
  },
  progressArc: {
    position: 'absolute',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    ...typography.heading2,
  },
  labelContainer: {
    alignItems: 'center',
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  levelIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  levelText: {
    ...typography.caption,
    fontWeight: '600',
  },
  barContainer: {
    width: '100%',
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  barLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  barPercentage: {
    ...typography.body,
    fontWeight: '700',
  },
  barBackground: {
    overflow: 'hidden',
  },
  barFill: {
    overflow: 'hidden',
  },
})

export type { ConfidenceIndicatorProps, ConfidenceBarProps, ConfidenceLevel, IndicatorSize }
