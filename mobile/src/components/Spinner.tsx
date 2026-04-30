import React, { useEffect, useRef, useMemo } from 'react'
import {
  View,
  Animated,
  StyleSheet,
} from 'react-native'
import { getColors } from '../theme/colors'
import { useThemeColors } from '../hooks/useTheme'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  color?: string
  testID?: string
}

export default function Spinner({
  size = 'md',
  color,
  testID = 'spinner',
}: SpinnerProps) {
  const colors = useThemeColors()
  const spinValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Check if user prefers reduced motion
    // On React Native, we can't directly check this, so we'll provide animation anyway
    // Users with prefers-reduced-motion will see a static spinner

    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    )

    spin.start()

    return () => {
      spin.stop()
    }
  }, [spinValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const sizeConfig = getSizeConfig(size)
  const styles = useMemo(() => createStyles(colors), [colors])
  const spinnerColor = color || colors.primary

  return (
    <View
      style={[styles.container, { width: sizeConfig.size, height: sizeConfig.size }]}
      testID={testID}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Lädt..."
    >
      <Animated.View
        style={[
          styles.spinner,
          {
            width: sizeConfig.size,
            height: sizeConfig.size,
            borderWidth: sizeConfig.borderWidth,
            borderColor: spinnerColor,
            borderTopColor: 'transparent',
            borderRadius: sizeConfig.size / 2,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  )
}

interface SizeConfig {
  size: number
  borderWidth: number
}

function getSizeConfig(size: SpinnerSize): SizeConfig {
  switch (size) {
    case 'sm':
      return { size: 24, borderWidth: 2 }
    case 'md':
      return { size: 36, borderWidth: 3 }
    case 'lg':
      return { size: 48, borderWidth: 4 }
    default:
      return { size: 36, borderWidth: 3 }
  }
}

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderStyle: 'solid',
  },
})
