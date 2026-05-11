/**
 * NotificationCard Component
 * Reusable card for displaying individual notifications with actions
 * Supports theming, accessibility, and interactive states
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  AccessibilityInfo,
} from 'react-native';
import { Text, IconButton, Divider } from 'react-native-paper';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import { getColors } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { Notification } from '../services/NotificationService';

interface INotificationCardProps {
  notification: Notification;
  onPress?: (notificationId: string) => void;
  onMarkAsRead?: (notificationId: string) => Promise<void>;
  onDelete?: (notificationId: string) => Promise<void>;
  showActions?: boolean;
  isLoading?: boolean;
}

/**
 * NotificationCard Component
 * Displays a single notification with optional actions
 */
export function NotificationCard({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
  showActions = true,
  isLoading = false,
}: INotificationCardProps) {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme ?? 'light');

  /**
   * Get icon for notification type
   */
  const getNotificationIcon = useCallback((): string => {
    switch (notification.type) {
      case 'upcoming_match':
        return 'sports-soccer';
      case 'prediction_update':
        return 'analytics';
      case 'value_bet':
        return 'trending-up';
      case 'odds_change':
        return 'show-chart';
      case 'news':
        return 'newspaper';
      default:
        return 'notifications';
    }
  }, [notification.type]);

  /**
   * Get color for notification type
   */
  const getTypeColor = useCallback((): string => {
    switch (notification.type) {
      case 'upcoming_match':
        return colors.primary;
      case 'prediction_update':
        return colors.secondary;
      case 'value_bet':
        return colors.tertiary;
      case 'odds_change':
        return colors.warning ?? colors.primary;
      case 'news':
        return colors.info ?? colors.secondary;
      default:
        return colors.primary;
    }
  }, [
    notification.type,
    colors.primary,
    colors.secondary,
    colors.tertiary,
    colors.warning,
    colors.info,
  ]);

  /**
   * Format notification type for display
   */
  const getTypeLabel = useCallback((): string => {
    return notification.type
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [notification.type]);

  /**
   * Format timestamp for display with relative time
   */
  const getTimeString = useCallback((): string => {
    const date = new Date(notification.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }, [notification.timestamp]);

  /**
   * Handle mark as read action
   */
  const handleMarkAsRead = useCallback(async () => {
    if (onMarkAsRead && !notification.read) {
      try {
        await onMarkAsRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  }, [notification.id, notification.read, onMarkAsRead]);

  /**
   * Handle delete action
   */
  const handleDelete = useCallback(async () => {
    if (onDelete) {
      try {
        await onDelete(notification.id);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  }, [notification.id, onDelete]);

  /**
   * Handle card press
   */
  const handleCardPress = useCallback(() => {
    if (onPress) {
      onPress(notification.id);
    }
  }, [notification.id, onPress]);

  const typeColor = getTypeColor();
  const typeLabel = getTypeLabel();
  const timeString = getTimeString();

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      disabled={isLoading}
      activeOpacity={0.7}
      testID={`notification-card-${notification.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${typeLabel}: ${notification.title}`}
      accessibilityHint={`${notification.body}. ${timeString}`}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: notification.read
              ? colors.surface
              : colors.surfaceVariant,
            borderLeftColor: typeColor,
          },
        ]}
        testID={`card-container-${notification.id}`}
      >
        {/* Icon and Content */}
        <View style={styles.contentWrapper}>
          {/* Type Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${typeColor}20` },
            ]}
            testID={`icon-container-${notification.id}`}
          >
            <MaterialIcon
              name={getNotificationIcon()}
              size={24}
              color={typeColor}
              testID={`notification-icon-${notification.id}`}
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            {/* Type Label */}
            <Text
              variant="labelSmall"
              style={[styles.typeLabel, { color: typeColor }]}
              testID={`type-label-${notification.id}`}
            >
              {typeLabel}
            </Text>

            {/* Title */}
            <Text
              variant="bodyMedium"
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontWeight: notification.read ? '400' : '600',
                },
              ]}
              numberOfLines={1}
              testID={`title-${notification.id}`}
            >
              {notification.title}
            </Text>

            {/* Body */}
            <Text
              variant="bodySmall"
              style={[styles.body, { color: colors.textSecondary }]}
              numberOfLines={2}
              testID={`body-${notification.id}`}
            >
              {notification.body}
            </Text>

            {/* Timestamp */}
            <Text
              variant="labelSmall"
              style={[styles.timestamp, { color: colors.textSecondary }]}
              testID={`timestamp-${notification.id}`}
            >
              {timeString}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {showActions && (
          <View style={styles.actions} testID={`actions-${notification.id}`}>
            {!notification.read && onMarkAsRead && (
              <IconButton
                icon="done"
                size={20}
                onPress={handleMarkAsRead}
                disabled={isLoading}
                testID={`mark-read-button-${notification.id}`}
                accessibilityLabel="Mark as read"
                accessibilityRole="button"
              />
            )}
            {onDelete && (
              <IconButton
                icon="delete"
                size={20}
                iconColor="error"
                onPress={handleDelete}
                disabled={isLoading}
                testID={`delete-button-${notification.id}`}
                accessibilityLabel="Delete notification"
                accessibilityRole="button"
              />
            )}
          </View>
        )}

        {/* Unread Indicator Dot */}
        {!notification.read && (
          <View
            style={[styles.unreadDot, { backgroundColor: colors.primary }]}
            testID={`unread-dot-${notification.id}`}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 4,
    position: 'relative',
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContent: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  body: {
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
});
