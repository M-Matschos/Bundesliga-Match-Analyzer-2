/**
 * Firebase Cloud Messaging Configuration
 * Handles FCM initialization, token management, and notification behavior
 */

import * as Notifications from 'expo-notifications'
import messaging from '@react-native-firebase/messaging'

/**
 * Initialize Firebase Cloud Messaging
 * - Request notification permissions (iOS)
 * - Setup foreground message handler
 * - Setup notification opened handler
 * - Setup background message handler
 * - Check for initial notification
 */
export async function initializeFirebaseMessaging(): Promise<void> {
  try {
    // Request notification permissions
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (!enabled) {
      console.warn('Notification permissions not granted')
      return
    }

    // Setup foreground message listener
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage)
      // Display notification using Expo Notifications
      await Notifications.presentNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || 'Notification',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data || {},
        },
      })
    })

    // Setup notification opened listener
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened:', remoteMessage)
    })

    // Setup background message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage)
    })

    // Check for initial notification
    const initialNotification = await messaging().getInitialNotification()
    if (initialNotification) {
      console.log('Initial notification:', initialNotification)
    }

    console.log('Firebase Messaging initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Firebase Messaging:', error)
  }
}

/**
 * Get device FCM token
 */
export async function getDeviceToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken()
    console.log('FCM device token obtained:', token)
    return token
  } catch (error) {
    console.error('Failed to get FCM device token:', error)
    return null
  }
}

/**
 * Register listener for device token refresh
 * Returns unsubscribe function
 */
export function onDeviceTokenRefresh(
  callback: (token: string) => void
): () => void {
  const unsubscribe = messaging().onTokenRefresh((token) => {
    console.log('FCM token refreshed:', token)
    callback(token)
  })

  return unsubscribe
}

/**
 * Configure notification behavior for Expo Notifications
 * - Show alerts
 * - Play sound
 * - Set badge
 */
export function configureNotificationBehavior(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })
}

/**
 * Enable Firebase Analytics
 */
export async function enableFirebaseAnalytics(): Promise<void> {
  try {
    await messaging().setAutoInitEnabled(true)
    console.log('Firebase Analytics enabled')
  } catch (error) {
    console.error('Failed to enable Firebase Analytics:', error)
  }
}
