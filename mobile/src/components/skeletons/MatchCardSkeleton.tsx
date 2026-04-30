import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, AccessibilityInfo, useWindowDimensions } from 'react-native'
import { colors } from '../../theme/colors'
import { useReducedMotionEnabled } from 'react-native-screens'

export function MatchCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.6)).current
  const reduceMotion = useReducedMotionEnabled()

  useEffect(() => {
    // Skip animation if user prefers reduced motion
    if (reduceMotion) {
      opacity.setValue(0.7)
      return
    }

    // Shimmer animation: fade in/out
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [opacity, reduceMotion])

  return (
    <View style={styles.container} testID="match-card-skeleton">
      {/* Header: Teams Row */}
      <Animated.View style={[styles.skeletonBlock, styles.headerBlock, { opacity }]} testID="skeleton-header" />

      {/* Body: Probability Bars */}
      <View style={styles.barsSection} testID="skeleton-shimmer">
        <Animated.View style={[styles.skeletonBlock, styles.barBlock1, { opacity }]} testID="skeleton-team-home" />
        <Animated.View style={[styles.skeletonBlock, styles.barBlock2, { opacity }]} testID="skeleton-team-away" />
        <Animated.View style={[styles.skeletonBlock, styles.barBlock3, { opacity }]} />
      </View>

      {/* Footer: Stats */}
      <View style={styles.statsSection} testID="skeleton-stats">
        <Animated.View style={[styles.skeletonBlock, styles.statBlock1, { opacity }]} />
        <Animated.View style={[styles.skeletonBlock, styles.statBlock2, { opacity }]} />
      </View>

      {/* xG Row */}
      <Animated.View style={[styles.skeletonBlock, styles.xgBlock, { opacity }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderColor: colors.border,
    borderWidth: 1,
  },
  skeletonBlock: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 8,
  },
  headerBlock: {
    height: 48,
    marginBottom: 16,
  },
  barsSection: {
    marginBottom: 16,
  },
  barBlock1: {
    height: 20,
    marginBottom: 8,
  },
  barBlock2: {
    height: 20,
    marginBottom: 8,
  },
  barBlock3: {
    height: 20,
    marginBottom: 12,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBlock1: {
    height: 16,
    flex: 1,
    marginRight: 8,
  },
  statBlock2: {
    height: 16,
    flex: 1,
    marginLeft: 8,
  },
  xgBlock: {
    height: 16,
    width: '60%',
  },
})
