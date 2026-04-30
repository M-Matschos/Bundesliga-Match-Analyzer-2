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
      style={[
        styles.notificationItem,
        !item.read && styles.notificationItemUnread,
      ]}
      onPress={() => handleNotificationPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <Text
          style={[styles.notificationTitle, !item.read && styles.textBold]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.notificationBody, !item.read && styles.textBold]}
          numberOfLines={2}
        >
          {item.body}
        </Text>
        <Text style={styles.notificationTime}>
          {formatTime(item.receivedAt)}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Keine Benachrichtigungen</Text>
      <Text style={styles.emptyDescription}>
        Hier erscheinen alle deine Bundesliga-Benachrichtigungen
      </Text>
    </View>
  )

  if (initializationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Fehler beim Laden</Text>
        <Text style={styles.errorDescription}>{initializationError}</Text>
      </View>
    )
  }

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initialisiere Benachrichtigungen...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Benachrichtigungen</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>
              {unreadCount} ungelesen
            </Text>
          )}
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
          >
            <Text style={styles.clearButtonText}>Löschen</Text>
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
          notifications.length === 0 ? styles.emptyListContainer : undefined
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.large,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  clearButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 6,
    backgroundColor: colors.error + '20',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationItemUnread: {
    backgroundColor: colors.blue + '08',
  },
  notificationContent: {
    flex: 1,
    marginRight: SPACING.medium,
  },
  notificationTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    fontWeight: '500',
  },
  notificationBody: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  textBold: {
    fontWeight: '600',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: SPACING.large,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: SPACING.small,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: SPACING.large,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginBottom: SPACING.small,
  },
  errorDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
