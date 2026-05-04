/**
 * NotificationService - Notification Preferences and History Management
 * Handles preference fetching/updating and notification history retrieval
 * Implements 5-minute cache expiry for preferences, 10-minute for history
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const PREFERENCES_CACHE_KEY = 'notification_preferences';
const PREFERENCES_CACHE_TIMESTAMP_KEY = 'notification_preferences_timestamp';
const HISTORY_CACHE_KEY = 'notification_history';
const HISTORY_CACHE_TIMESTAMP_KEY = 'notification_history_timestamp';

const PREFERENCES_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const HISTORY_CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

/**
 * Notification Preferences Structure
 * Controls granular notification type filtering
 */
export interface NotificationPreferences {
  upcomingMatches: boolean;
  predictionUpdates: boolean;
  valueBetAlerts: boolean;
  matchReminders: boolean;
  oddChangesAlerts: boolean;
  newsAndUpdates: boolean;
  notificationsEnabled: boolean;
}

/**
 * Single Notification Item
 * Represents a received notification with metadata
 */
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'upcoming_match' | 'prediction_update' | 'value_bet' | 'odds_change' | 'news';
  matchId?: string;
  odds?: number;
  timestamp: string; // ISO 8601 format
  read: boolean;
  data?: Record<string, any>;
}

/**
 * Default notification preferences
 */
const DEFAULT_PREFERENCES: NotificationPreferences = {
  upcomingMatches: true,
  predictionUpdates: true,
  valueBetAlerts: true,
  matchReminders: true,
  oddChangesAlerts: false,
  newsAndUpdates: true,
  notificationsEnabled: true,
};

/**
 * NotificationService
 * Centralized service for notification preferences and history management
 */
export class NotificationService {
  /**
   * Get user's notification preferences
   * Fetches from backend with 5-minute local cache fallback
   * @param userId - User ID
   * @returns Notification preferences object
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      // Check cache validity
      const cached = await this.getFromCache<NotificationPreferences>(
        PREFERENCES_CACHE_KEY,
        PREFERENCES_CACHE_TIMESTAMP_KEY,
        PREFERENCES_CACHE_EXPIRY
      );

      if (cached) {
        return cached;
      }

      // Fetch from backend
      try {
        const response = await axios.get(
          `${API_BASE_URL}/notifications/preferences`,
          {
            params: { user_id: userId },
            timeout: 10000,
          }
        );

        const preferences = this.normalizePreferences(response.data);

        // Cache the result
        await this.setCache(
          PREFERENCES_CACHE_KEY,
          preferences,
          PREFERENCES_CACHE_TIMESTAMP_KEY
        );

        return preferences;
      } catch (error) {
        console.warn('Failed to fetch preferences from backend:', error);

        // Fallback to cached version even if expired
        const fallback = await AsyncStorage.getItem(PREFERENCES_CACHE_KEY);
        if (fallback) {
          return JSON.parse(fallback);
        }

        // Last resort: return defaults
        return DEFAULT_PREFERENCES;
      }
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  /**
   * Update user's notification preferences
   * Updates both backend and local cache
   * @param userId - User ID
   * @param preferences - New preference values
   * @throws Error on backend failure (caller should handle)
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      // First update cache optimistically
      const current = await this.getPreferences(userId);
      const updated = { ...current, ...preferences };

      // Try to update backend
      try {
        await axios.put(
          `${API_BASE_URL}/notifications/preferences`,
          { user_id: userId, preferences: updated },
          { timeout: 10000 }
        );
      } catch (error) {
        console.error('Backend preference update failed:', error);
        throw error; // Re-throw for caller to handle
      }

      // Update local cache after successful backend update
      await this.setCache(
        PREFERENCES_CACHE_KEY,
        updated,
        PREFERENCES_CACHE_TIMESTAMP_KEY
      );

      console.log('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get notification history for user
   * Fetches from backend with 10-minute cache
   * @param userId - User ID
   * @param limit - Maximum notifications to return (default: 50)
   * @returns Array of notifications sorted by timestamp (newest first)
   */
  async getHistory(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      // Check cache validity
      const cacheKey = `${HISTORY_CACHE_KEY}_${limit}`;
      const timestampKey = `${HISTORY_CACHE_TIMESTAMP_KEY}_${limit}`;

      const cached = await this.getFromCache<Notification[]>(
        cacheKey,
        timestampKey,
        HISTORY_CACHE_EXPIRY
      );

      if (cached) {
        return cached;
      }

      // Fetch from backend
      try {
        const response = await axios.get(
          `${API_BASE_URL}/notifications/history`,
          {
            params: { user_id: userId, limit },
            timeout: 10000,
          }
        );

        const history = Array.isArray(response.data) ? response.data : response.data.notifications || [];

        // Ensure sorted by timestamp (newest first)
        const sorted = history.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeB - timeA;
        });

        // Cache the result
        await this.setCache(
          cacheKey,
          sorted,
          timestampKey
        );

        return sorted;
      } catch (error) {
        console.warn('Failed to fetch notification history:', error);

        // Fallback to cache even if expired
        const fallback = await AsyncStorage.getItem(cacheKey);
        if (fallback) {
          return JSON.parse(fallback);
        }

        return [];
      }
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }

  /**
   * Mark a notification as read
   * @param notificationId - Notification ID
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/notifications/mark-read`,
        { notification_id: notificationId },
        { timeout: 10000 }
      );

      // Invalidate history cache since state changed
      await AsyncStorage.removeItem(HISTORY_CACHE_TIMESTAMP_KEY);

      console.log(`Notification ${notificationId} marked as read`);
    } catch (error) {
      console.warn('Error marking notification as read:', error);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Clear all notification history
   * @param userId - User ID
   */
  async clearHistory(userId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/notifications/history`,
        {
          params: { user_id: userId },
          timeout: 10000,
        }
      );

      // Clear all history cache entries
      await AsyncStorage.removeItem(HISTORY_CACHE_KEY);
      await AsyncStorage.removeItem(HISTORY_CACHE_TIMESTAMP_KEY);

      console.log('Notification history cleared');
    } catch (error) {
      console.error('Error clearing notification history:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Get cached value if not expired
   */
  private async getFromCache<T>(
    cacheKey: string,
    timestampKey: string,
    expiryMs: number
  ): Promise<T | null> {
    try {
      const [data, timestamp] = await Promise.all([
        AsyncStorage.getItem(cacheKey),
        AsyncStorage.getItem(timestampKey),
      ]);

      if (!data || !timestamp) {
        return null;
      }

      const cacheTime = parseInt(timestamp, 10);
      if (Date.now() - cacheTime > expiryMs) {
        // Cache expired
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      console.warn('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Set cache with timestamp
   */
  private async setCache<T>(
    cacheKey: string,
    data: T,
    timestampKey: string
  ): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(cacheKey, JSON.stringify(data)),
        AsyncStorage.setItem(timestampKey, Date.now().toString()),
      ]);
    } catch (error) {
      console.warn('Error writing to cache:', error);
    }
  }

  /**
   * Normalize preferences from backend response
   * Handles snake_case to camelCase conversion
   */
  private normalizePreferences(data: any): NotificationPreferences {
    return {
      upcomingMatches: data.upcoming_matches ?? DEFAULT_PREFERENCES.upcomingMatches,
      predictionUpdates: data.prediction_updates ?? DEFAULT_PREFERENCES.predictionUpdates,
      valueBetAlerts: data.value_bet_alerts ?? DEFAULT_PREFERENCES.valueBetAlerts,
      matchReminders: data.match_reminders ?? DEFAULT_PREFERENCES.matchReminders,
      oddChangesAlerts: data.odd_changes_alerts ?? DEFAULT_PREFERENCES.oddChangesAlerts,
      newsAndUpdates: data.news_and_updates ?? DEFAULT_PREFERENCES.newsAndUpdates,
      notificationsEnabled: data.notifications_enabled ?? DEFAULT_PREFERENCES.notificationsEnabled,
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
