/**
 * NotificationToast Component
 * Displays incoming notifications as transient overlays (Toast notifications)
 * Auto-dismisses after 4 seconds or on tap
 */

import React, { useEffect, useState } from 'react'
import {
  Animated,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { getColors } from '../theme/colors'
import { SPACING } from '../theme/spacing'

export interface ToastNotification {
  id: string
  title: string
  body: string
  matchId?: string
  screen?: string
  action?: string
  type?: 'info' | 'success' | 'warning' | 'error'
}

interface NotificationToastProps {
  notification: ToastNotification | null
  onDismiss: () => void
  onPress?: (notification: ToastNotification) => void
  duration?: number
}

const windowHeight = Dimensions.get('window').height
const TOAST_HEIGHT = 80

export default function NotificationToast({
  notification,
  onDismiss,
  onPress,
  duration = 4000,
}: NotificationToastProps) {
  const [slideAnim] = useState(new Animated.Value(-TOAST_HEIGHT))

  useEffect(() => {
    if (notification) {
      // Slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()

      // Auto-dismiss
      const timer = setTimeout(() => {
        dismissToast()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [notification])

  const dismissToast = () => {
    // Slide out
    Animated.timing(slideAnim, {
      toValue: -TOAST_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss()
    })
  }

  if (!notification) {
    return null
  }

  const getBackgroundColor = () => {
    const themeColors = getColors('dark')
    switch (notification.type) {
      case 'success':
        return themeColors.green
      case 'error':
        return themeColors.red
      case 'warning':
        return themeColors.yellow
      default:
        return themeColors.blue
    }
  }

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.toast,
          {
            backgroundColor: getBackgroundColor(),
          },
        ]}
        onPress={() => {
          if (onPress) {
            onPress(notification)
          }
          dismissToast()
        }}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={dismissToast}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: SPACING.medium,
    paddingTop: SPACING.medium,
  },
  toast: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: TOAST_HEIGHT - SPACING.medium,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    marginRight: SPACING.small,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  body: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
  },
  closeButton: {
    padding: SPACING.small,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})
