/**
 * NotificationContext & Provider
 * Manages push notification state, history, and unread count
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import * as Notifications from 'expo-notifications'
import {
  configureNotificationBehavior,
  initializeFirebaseMessaging,
} from '../config/firebase.config'
import { useNavigation } from '@react-navigation/native'

export interface NotificationPayload {
  id: string
  title: string
  body: string
  matchId?: string
  screen?: string
  action?: string
  receivedAt: Date
  read: boolean
}

interface NotificationContextType {
  notifications: NotificationPayload[]
  lastNotification: NotificationPayload | null
  unreadCount: number
  isInitialized: boolean
  initializationError: string | null
  clearNotifications: () => void
  markAsRead: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({
  children,
}: NotificationProviderProps): React.ReactElement {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([])
  const [lastNotification, setLastNotification] =
    useState<NotificationPayload | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [initializationError, setInitializationError] = useState<string | null>(
    null
  )
  const navigation = useNavigation<any>()

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Configure notification behavior
        configureNotificationBehavior()

        // Initialize Firebase messaging
        await initializeFirebaseMessaging()

        // Setup foreground notification listener
        const unsubscribeForeground =
          Notifications.addNotificationReceivedListener((notification) => {
            const payload: NotificationPayload = {
              id: notification.request.identifier,
              title: notification.request.content.title || 'Notification',
              body: notification.request.content.body || '',
              matchId: notification.request.content.data?.matchId,
              screen: notification.request.content.data?.screen,
              action: notification.request.content.data?.action,
              receivedAt: new Date(),
              read: false,
            }

            setNotifications((prev) => {
              const updated = [payload, ...prev]
              // Limit to 50 notifications
              return updated.slice(0, 50)
            })

            setLastNotification(payload)
            setUnreadCount((prev) => prev + 1)
          })

        // Setup notification tap listener
        const unsubscribeTap =
          Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data

            // Mark as read
            if (response.notification.request.identifier) {
              markAsRead(response.notification.request.identifier)
            }

            // Navigate if screen info provided
            if (data?.screen) {
              navigation.navigate(data.screen, data)
            }
          })

        setIsInitialized(true)

        return () => {
          unsubscribeForeground.remove()
          unsubscribeTap.remove()
        }
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown initialization error'
        setInitializationError(errorMessage)
        console.error('Notification initialization error:', err)
      }
    }

    const cleanup = initializeNotifications()

    return () => {
      cleanup.then((unsubscribe) => unsubscribe?.())
    }
  }, [navigation])

  const clearNotifications = () => {
    setNotifications([])
    setLastNotification(null)
    setUnreadCount(0)
    console.log('Notifications cleared')
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )

    setUnreadCount((prev) => {
      const notification = notifications.find((n) => n.id === id)
      return notification && !notification.read ? prev - 1 : prev
    })
  }

  const value: NotificationContextType = {
    notifications,
    lastNotification,
    unreadCount,
    isInitialized,
    initializationError,
    clearNotifications,
    markAsRead,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
