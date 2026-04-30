import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { colors } from '../../theme/colors'

export function StatsBarSkeleton() {
  const opacity = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    // Shimmer animation
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
  }, [opacity])

  return (
    <View style={styles.container}>
      <View style={styles.statRow}>
        <Animated.View style={[styles.statBlock, styles.labelBlock, { opacity }]} />
        <Animated.View style={[styles.statBlock, styles.valueBlock, { opacity }]} />
      </View>
      <View style={styles.statRow}>
        <Animated.View style={[styles.statBlock, styles.labelBlock, { opacity }]} />
        <Animated.View style={[styles.statBlock, styles.valueBlock, { opacity }]} />
      </View>
      <View style={styles.statRow}>
        <Animated.View style={[styles.statBlock, styles.labelBlock, { opacity }]} />
        <Animated.View style={[styles.statBlock, styles.valueBlock, { opacity }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderColor: colors.border,
    borderWidth: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statBlock: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 6,
  },
  labelBlock: {
    height: 14,
    width: '50%',
  },
  valueBlock: {
    height: 14,
    width: '30%',
  },
})
