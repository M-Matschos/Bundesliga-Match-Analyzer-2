import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { colors } from '../theme/colors'
import { typography } from '../theme/typography'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onDismiss: () => void
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  const translateY = useRef(new Animated.Value(200)).current

  useEffect(() => {
    // Slide in animation
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [translateY])

  const handleDismiss = () => {
    // Slide out animation
    Animated.timing(translateY, {
      toValue: 200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss()
    })
  }

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: colors.green, borderLeftColor: colors.greenLight }
      case 'error':
        return { backgroundColor: colors.red, borderLeftColor: colors.orange }
      case 'info':
      default:
        return { backgroundColor: colors.blue, borderLeftColor: colors.blueLight }
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'info':
      default:
        return 'ℹ'
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          getToastStyle(),
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={styles.icon}>{getIcon()}</Text>
          <Text
            style={[
              typography.bodySM,
              {
                color: colors.text,
                flex: 1,
                marginLeft: 12,
              },
            ]}
            numberOfLines={2}
          >
            {message}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleDismiss}
          style={{
            paddingLeft: 12,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 20 }}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  toast: {
    borderRadius: 8,
    borderLeftWidth: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
})
