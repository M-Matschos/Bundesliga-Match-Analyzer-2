/**
 * usePushNotifications Hook
 * Custom React hook for managing push notification state and operations
 * Integrates with PushNotificationManager and NotificationService
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { pushNotificationManager, PermissionStatus } from '../services/PushNotificationManager';
import { notificationService, NotificationPreferences, Notification } from '../services/NotificationService';

interface UsePushNotificationsResult {
  permissionStatus: PermissionStatus;
  preferences: NotificationPreferences | null;
  history: Notification[];
  loading: boolean;
  error: string | null;
  requestPermissions: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  refreshHistory: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
}

/**
 * Hook for managing push notification permissions, preferences, and history
 */
export function usePushNotifications(): UsePushNotificationsResult {
  const { user } = useAuth();

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [history, setHistory] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const permissionCheckRef = useRef(false);

  /**
   * Initialize permissions and preferences on mount
   */
  useEffect(() => {
    if (!user?.id || permissionCheckRef.current) {
      return;
    }

    permissionCheckRef.current = true;
    initializeNotifications();
  }, [user?.id]);

  /**
   * Initialize notification system
   */
  const initializeNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Check permissions
      const status = await pushNotificationManager.requestPermissions();
      setPermissionStatus(status);

      // Register device
      if (status === 'granted') {
        await pushNotificationManager.registerForRemoteNotifications(user.id);
      }

      // Load preferences
      const prefs = await notificationService.getPreferences(user.id);
      setPreferences(prefs);

      // Load history
      const hist = await notificationService.getHistory(user.id, 50);
      setHistory(hist);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize notifications';
      setError(message);
      console.error('Error initializing notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async () => {
    try {
      setError(null);
      const status = await pushNotificationManager.requestPermissions();
      setPermissionStatus(status);

      if (status === 'granted' && user?.id) {
        // Register device if permissions granted
        await pushNotificationManager.registerForRemoteNotifications(user.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request permissions';
      setError(message);
      console.error('Error requesting permissions:', err);
    }
  }, [user?.id]);

  /**
   * Update notification preferences
   */
  const updatePreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>) => {
      try {
        setError(null);

        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        // Optimistic update
        const updated = { ...preferences, ...prefs };
        setPreferences(updated);

        // Update backend
        await notificationService.updatePreferences(user.id, prefs);
      } catch (err) {
        // Revert on error
        const current = await notificationService.getPreferences(user.id);
        setPreferences(current);

        const message = err instanceof Error ? err.message : 'Failed to update preferences';
        setError(message);
        console.error('Error updating preferences:', err);
        throw err;
      }
    },
    [user?.id, preferences]
  );

  /**
   * Refresh notification history
   */
  const refreshHistory = useCallback(async () => {
    try {
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const hist = await notificationService.getHistory(user.id, 50);
      setHistory(hist);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh history';
      setError(message);
      console.error('Error refreshing history:', err);
    }
  }, [user?.id]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      await notificationService.markAsRead(notificationId);

      // Update local state
      setHistory(hist =>
        hist.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(message);
      console.error('Error marking notification as read:', err);
    }
  }, []);

  return {
    permissionStatus,
    preferences,
    history,
    loading,
    error,
    requestPermissions,
    updatePreferences,
    refreshHistory,
    markAsRead,
  };
}
