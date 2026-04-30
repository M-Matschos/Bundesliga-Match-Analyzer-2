/**
 * NotificationHistoryScreen
 * Displays all push notifications received by the user
 * Shows notification title, timestamp, and read status
 */

import React from 'react'
import { useTheme } from '../context/ThemeContext'
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { useNotification } from '../context/NotificationContext'
import { getColors } from '../theme/colors'
import { SPACING } from '../theme/spacing'

export default function NotificationHistoryScreen() {
  const {
    notifications,
    unreadCount,
    isInitialized,
    initializationError,
    clearNotifications,
    markAsRead,
  } = useNotification()
  const { mode } = useTheme()
  const colors = getColors(mode)
  const [refreshing, setRefreshing] = React.useState(false)

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true)
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    setRefreshing(false)
  }, [])

  const handleClear = () => {
    clearNotifications()
  }

  const handleNotificationPress = (id: string) => {
    markAsRead(id)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Gerade eben'
    if (diffMins < 60) return `vor ${diffMins}min`
    if (diffHours < 24) return `vor ${diffHours}h`
    if (diffDays < 7) return `vor ${diffDays}d`

    return new Date(date).toLocaleDateString('de-DE')
  }

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.medium,
        backgroundColor: !item.read ? colors.blue + '08' : colors.surface,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onPress={() => handleNotificationPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1, marginRight: SPACING.medium }}>
        <Text
          style={{
            fontSize: 14,
            color: colors.text,
            marginBottom: 4,
            fontWeight: !item.read ? '600' : '500',
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecond,
            marginBottom: 6,
            fontWeight: !item.read ? '600' : '400',
          }}
          numberOfLines={2}
        >
          {item.body}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>
          {formatTime(item.receivedAt)}
        </Text>
      </View>
      {!item.read && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.blue,
          }}
        />
      )}
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={{ alignItems: 'center', paddingHorizontal: SPACING.lg }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          marginBottom: SPACING.sm,
        }}
      >
        Keine Benachrichtigungen
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecond,
          textAlign: 'center',
        }}
      >
        Hier erscheinen alle deine Bundesliga-Benachrichtigungen
      </Text>
    </View>
  )

  if (initializationError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.red,
            marginBottom: SPACING.sm,
          }}
        >
          Fehler beim Laden
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecond,
            textAlign: 'center',
          }}
        >
          {initializationError}
        </Text>
      </View>
    )
  }

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 14, color: colors.textSecond }}>
          Initialisiere Benachrichtigungen...
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.lg,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
            }}
          >
            Benachrichtigungen
          </Text>
          {unreadCount > 0 && (
            <Text style={{ fontSize: 12, color: colors.textSecond, marginTop: 4 }}>
              {unreadCount} ungelesen
            </Text>
          )}
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity
            style={{
              paddingHorizontal: SPACING.medium,
              paddingVertical: SPACING.sm,
              borderRadius: 6,
              backgroundColor: colors.red + '20',
            }}
            onPress={handleClear}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.red,
              }}
            >
              Löschen
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        contentContainerStyle={
          notifications.length === 0
            ? {
                flexGrow: 1,
                justifyContent: 'center',
              }
            : undefined
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.blue}
            colors={[colors.blue]}
          />
        }
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginHorizontal: SPACING.lg,
            }}
          />
        )}
      />
    </View>
  )
}
