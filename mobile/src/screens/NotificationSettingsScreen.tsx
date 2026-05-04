/**
 * NotificationSettingsScreen
 * Manages user notification preferences and displays notification history
 * Integrates with NotificationPreferencesContext for global state management
 */

import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  AccessibilityInfo,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Text, Switch, Button, Portal, Dialog } from 'react-native-paper';
import { getColors } from '../styles/colors';
import { spacing } from '../theme/spacing';
import { useNotificationPreferences } from '../context/NotificationPreferencesContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface INotificationSettingsScreenProps {
  // No required props - uses context
}

/**
 * NotificationSettingsScreen Component
 * Displays notification preferences with toggle switches and history
 */
export function NotificationSettingsScreen({}: INotificationSettingsScreenProps) {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme ?? 'light');

  const { preferences, updatePreferences, error: prefError, loading: prefLoading } = useNotificationPreferences();
  const { history, loading: historyLoading, error: historyError, refreshHistory, markAsRead } = usePushNotifications();

  const [clearDialogVisible, setClearDialogVisible] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  /**
   * Handle master notifications toggle
   */
  const handleMasterToggle = useCallback(
    async (value: boolean) => {
      try {
        setUpdateError(null);
        await updatePreferences({ notificationsEnabled: value });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update notifications setting';
        setUpdateError(message);
      }
    },
    [updatePreferences]
  );

  /**
   * Handle individual preference toggle
   */
  const handlePreferenceToggle = useCallback(
    async (key: keyof typeof preferences, value: boolean) => {
      if (!preferences) return;

      try {
        setUpdateError(null);
        await updatePreferences({ [key]: value });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update preference';
        setUpdateError(message);
      }
    },
    [preferences, updatePreferences]
  );

  /**
   * Handle clear history confirmation
   */
  const handleClearHistory = useCallback(async () => {
    try {
      setIsClearing(true);
      setUpdateError(null);
      // In real implementation, would call clearHistory() from service
      // For now, just refresh to show empty state
      await refreshHistory();
      setClearDialogVisible(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clear history';
      setUpdateError(message);
    } finally {
      setIsClearing(false);
    }
  }, [refreshHistory]);

  /**
   * Handle notification item tap (mark as read)
   */
  const handleNotificationTap = useCallback(
    async (notificationId: string) => {
      try {
        setUpdateError(null);
        await markAsRead(notificationId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to mark notification as read';
        setUpdateError(message);
      }
    },
    [markAsRead]
  );

  if (prefLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        testID="notification-settings-loading"
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
          testID="settings-loading-spinner"
        />
      </View>
    );
  }

  if (!preferences) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        testID="notification-settings-error"
      >
        <Text style={[styles.errorText, { color: colors.error }]} testID="settings-error-message">
          {prefError || 'Failed to load notification settings'}
        </Text>
        <Button
          mode="contained"
          onPress={() => {}} // Retry would be implemented here
          testID="settings-error-retry-button"
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      testID="notification-settings-scroll"
    >
      {/* Error Banner */}
      {updateError && (
        <View
          style={[styles.errorBanner, { backgroundColor: colors.error }]}
          testID="settings-error-banner"
        >
          <Text
            style={[styles.errorText, { color: colors.surface }]}
            testID="error-banner-text"
          >
            {updateError}
          </Text>
        </View>
      )}

      {/* Master Toggle Section */}
      <View style={styles.section} testID="master-toggle-section">
        <Text
          variant="headlineSmall"
          style={[styles.sectionTitle, { color: colors.text }]}
          testID="master-toggle-title"
        >
          Notifications
        </Text>
        <View
          style={[styles.preferenceRow, { backgroundColor: colors.surface }]}
          testID="master-toggle-row"
        >
          <Text
            variant="bodyMedium"
            style={[styles.preferenceName, { color: colors.text }]}
            testID="master-toggle-label"
          >
            Enable All Notifications
          </Text>
          <Switch
            value={preferences.notificationsEnabled}
            onValueChange={handleMasterToggle}
            testID="master-toggle-switch"
            accessibilityRole="switch"
            accessibilityLabel="Enable all notifications"
            accessibilityState={{ checked: preferences.notificationsEnabled }}
            disabled={prefLoading}
          />
        </View>
      </View>

      {/* Individual Preferences Section */}
      {preferences.notificationsEnabled && (
        <View style={styles.section} testID="preferences-section">
          <Text
            variant="headlineSmall"
            style={[styles.sectionTitle, { color: colors.text }]}
            testID="preferences-title"
          >
            Notification Types
          </Text>

          {/* Upcoming Matches Toggle */}
          <View
            style={[styles.preferenceRow, { backgroundColor: colors.surface }]}
            testID="upcoming-matches-row"
          >
            <Text
              variant="bodyMedium"
              style={[styles.preferenceName, { color: colors.text }]}
              testID="upcoming-matches-label"
            >
              Upcoming Matches
            </Text>
            <Switch
              value={preferences.upcomingMatches}
              onValueChange={(value) => handlePreferenceToggle('upcomingMatches', value)}
              testID="upcoming-matches-toggle"
              accessibilityRole="switch"
              accessibilityLabel="Upcoming matches notifications"
              accessibilityState={{ checked: preferences.upcomingMatches }}
              disabled={prefLoading}
            />
          </View>

          {/* Prediction Updates Toggle */}
          <View
            style={[styles.preferenceRow, { backgroundColor: colors.surface }]}
            testID="prediction-updates-row"
          >
            <Text
              variant="bodyMedium"
              style={[styles.preferenceName, { color: colors.text }]}
              testID="prediction-updates-label"
            >
              Prediction Updates
            </Text>
            <Switch
              value={preferences.predictionUpdates}
              onValueChange={(value) => handlePreferenceToggle('predictionUpdates', value)}
              testID="prediction-updates-toggle"
              accessibilityRole="switch"
              accessibilityLabel="Prediction updates notifications"
              accessibilityState={{ checked: preferences.predictionUpdates }}
              disabled={prefLoading}
            />
          </View>

          {/* Value Bet Alerts Toggle */}
          <View
            style={[styles.preferenceRow, { backgroundColor: colors.surface }]}
            testID="value-bets-row"
          >
            <Text
              variant="bodyMedium"
              style={[styles.preferenceName, { color: colors.text }]}
              testID="value-bets-label"
            >
              Value Bet Alerts
            </Text>
            <Switch
              value={preferences.valueBetAlerts}
              onValueChange={(value) => handlePreferenceToggle('valueBetAlerts', value)}
              testID="value-bets-toggle"
              accessibilityRole="switch"
              accessibilityLabel="Value bet alerts"
              accessibilityState={{ checked: preferences.valueBetAlerts }}
              disabled={prefLoading}
            />
          </View>

          {/* Match Reminders Toggle */}
          <View
            style={[styles.preferenceRow, { backgroundColor: colors.surface }]}
            testID="match-reminders-row"
          >
            <Text
              variant="bodyMedium"
              style={[styles.preferenceName, { color: colors.text }]}
              testID="match-reminders-label"
            >
              Match Reminders
            </Text>
            <Switch
              value={preferences.matchReminders}
              onValueChange={(value) => handlePreferenceToggle('matchReminders', value)}
              testID="match-reminders-toggle"
              accessibilityRole="switch"
              accessibilityLabel="Match reminders"
              accessibilityState={{ checked: preferences.matchReminders }}
              disabled={prefLoading}
            />
          </View>

          {/* Odds Changes Alerts Toggle */}
          <View
            style={[styles.preferenceRow, { backgroundColor: colors.surface }]}
            testID="odds-changes-row"
          >
            <Text
              variant="bodyMedium"
              style={[styles.preferenceName, { color: colors.text }]}
              testID="odds-changes-label"
            >
              Odds Changes
            </Text>
            <Switch
              value={preferences.oddChangesAlerts}
              onValueChange={(value) => handlePreferenceToggle('oddChangesAlerts', value)}
              testID="odds-changes-toggle"
              accessibilityRole="switch"
              accessibilityLabel="Odds changes alerts"
              accessibilityState={{ checked: preferences.oddChangesAlerts }}
              disabled={prefLoading}
            />
          </View>

          {/* News and Updates Toggle */}
          <View
            style={[styles.preferenceRow, { backgroundColor: colors.surface }]}
            testID="news-updates-row"
          >
            <Text
              variant="bodyMedium"
              style={[styles.preferenceName, { color: colors.text }]}
              testID="news-updates-label"
            >
              News and Updates
            </Text>
            <Switch
              value={preferences.newsAndUpdates}
              onValueChange={(value) => handlePreferenceToggle('newsAndUpdates', value)}
              testID="news-updates-toggle"
              accessibilityRole="switch"
              accessibilityLabel="News and updates"
              accessibilityState={{ checked: preferences.newsAndUpdates }}
              disabled={prefLoading}
            />
          </View>
        </View>
      )}

      {/* Notification History Section */}
      <View style={styles.section} testID="history-section">
        <View style={styles.historyHeader} testID="history-header">
          <Text
            variant="headlineSmall"
            style={[styles.sectionTitle, { color: colors.text }]}
            testID="history-title"
          >
            Recent Notifications ({history.length})
          </Text>
          {history.length > 0 && (
            <Button
              mode="text"
              compact
              onPress={() => setClearDialogVisible(true)}
              testID="clear-history-button"
            >
              Clear
            </Button>
          )}
        </View>

        {historyLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            testID="history-loading-spinner"
          />
        ) : historyError ? (
          <Text
            variant="bodySmall"
            style={[styles.errorText, { color: colors.error }]}
            testID="history-error-text"
          >
            {historyError}
          </Text>
        ) : history.length === 0 ? (
          <Text
            variant="bodyMedium"
            style={[styles.emptyText, { color: colors.textSecondary }]}
            testID="history-empty-text"
          >
            No notifications yet
          </Text>
        ) : (
          <View testID="history-list">
            {history.slice(0, 20).map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationItem,
                  {
                    backgroundColor: notification.read
                      ? colors.surface
                      : colors.surfaceVariant,
                  },
                ]}
                testID={`notification-item-${notification.id}`}
              >
                <View style={styles.notificationContent}>
                  <Text
                    variant="labelMedium"
                    style={[styles.notificationType, { color: colors.primary }]}
                    testID={`notification-type-${notification.id}`}
                  >
                    {notification.type.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.notificationTitle, { color: colors.text }]}
                    numberOfLines={1}
                    testID={`notification-title-${notification.id}`}
                  >
                    {notification.title}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.notificationBody, { color: colors.textSecondary }]}
                    numberOfLines={2}
                    testID={`notification-body-${notification.id}`}
                  >
                    {notification.body}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={[styles.notificationTime, { color: colors.textSecondary }]}
                    testID={`notification-time-${notification.id}`}
                  >
                    {new Date(notification.timestamp).toLocaleString()}
                  </Text>
                </View>
                {!notification.read && (
                  <Button
                    mode="text"
                    compact
                    onPress={() => handleNotificationTap(notification.id)}
                    testID={`notification-mark-read-${notification.id}`}
                  >
                    Mark read
                  </Button>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Clear History Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={clearDialogVisible}
          onDismiss={() => setClearDialogVisible(false)}
          testID="clear-history-dialog"
        >
          <Dialog.Title testID="clear-dialog-title">Clear History?</Dialog.Title>
          <Dialog.Content testID="clear-dialog-content">
            <Text variant="bodyMedium" testID="clear-dialog-message">
              This action will delete all notification history and cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions testID="clear-dialog-actions">
            <Button
              onPress={() => setClearDialogVisible(false)}
              testID="clear-dialog-cancel"
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleClearHistory}
              loading={isClearing}
              disabled={isClearing}
              testID="clear-dialog-confirm"
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
  },
  preferenceName: {
    flex: 1,
  },
  errorBanner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  notificationItem: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  notificationType: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  notificationBody: {
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
