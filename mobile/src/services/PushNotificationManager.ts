/**
 * PushNotificationManager - Cross-Platform Push Notification Service
 * Handles iOS/Android notification permissions, subscriptions, and device token management
 * Uses expo-notifications for platform-agnostic implementation
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const NOTIFICATION_TOPICS = ['upcoming_matches', 'value_bets', 'prediction_updates'] as const;
const DEVICE_TOKEN_STORAGE_KEY = 'device_token';
const SUBSCRIPTIONS_STORAGE_KEY = 'notification_subscriptions';

// Types
export type NotificationTopic = typeof NOTIFICATION_TOPICS[number];

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface RemoteNotification {
  id?: string;
  title: string;
  body: string;
  data: Record<string, any>;
  badge?: number;
  sound?: string;
}

export interface SubscriptionRecord {
  topic: NotificationTopic;
  userId: string;
  subscribedAt: number;
}

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async (notification: Notifications.Notification) => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

/**
 * PushNotificationManager Service
 * Manages all push notification lifecycle operations
 */
export class PushNotificationManager {
  private static lastPermissionCheck: { [key: string]: number } = {};
  private notificationSubscription: Notifications.Subscription | null = null;
  private responseSubscription: Notifications.Subscription | null = null;

  /**
   * Request notification permissions from OS
   * Platform-specific: iOS uses expo-notifications, Android 13+ uses runtime permissions
   * @returns Permission status: 'granted' | 'denied' | 'undetermined'
   */
  async requestPermissions(): Promise<PermissionStatus> {
    try {
      // Check cache to avoid repeated permission requests
      const platform = Platform.OS;
      const cacheKey = `permission_${platform}`;
      const lastCheck = PushNotificationManager.lastPermissionCheck[cacheKey];

      if (lastCheck && Date.now() - lastCheck < 60000) { // 1 minute cache
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && ['granted', 'denied', 'undetermined'].includes(cached)) {
          return cached as PermissionStatus;
        }
      }

      let result: PermissionStatus;

      if (Platform.OS === 'ios') {
        // iOS: Request notification permission via expo-notifications
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowProvisional: true,
          },
        });

        if (status === 'granted') {
          result = 'granted';
        } else if (status === 'denied') {
          result = 'denied';
        } else {
          result = 'undetermined';
        }
      } else if (Platform.OS === 'android') {
        // Android: Check runtime permissions (API 33+)
        if (Platform.Version && Platform.Version >= 33) {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status === 'granted') {
            result = 'granted';
          } else if (status === 'denied') {
            result = 'denied';
          } else {
            result = 'undetermined';
          }
        } else {
          // Android < 33: Permissions are pre-granted
          result = 'granted';
        }
      } else {
        // Other platforms default to undetermined
        result = 'undetermined';
      }

      // Cache the result
      PushNotificationManager.lastPermissionCheck[cacheKey] = Date.now();
      await AsyncStorage.setItem(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return 'undetermined';
    }
  }

  /**
   * Subscribe user to a notification topic
   * @param topic - Topic name (upcoming_matches, value_bets, prediction_updates)
   * @param userId - User ID for subscription tracking
   * @throws Error if topic is invalid
   */
  async subscribeToTopic(topic: NotificationTopic, userId: string): Promise<void> {
    try {
      // Validate topic
      if (!NOTIFICATION_TOPICS.includes(topic)) {
        throw new Error(`Invalid topic: ${topic}. Must be one of: ${NOTIFICATION_TOPICS.join(', ')}`);
      }

      // Check permissions first
      const permission = await this.requestPermissions();
      if (permission !== 'granted') {
        console.warn(`Cannot subscribe to ${topic}: notifications not granted`);
        return;
      }

      // Subscribe via backend API with retry logic
      const maxRetries = 2;
      let lastError: AxiosError | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          await axios.post(
            `${API_BASE_URL}/notifications/subscribe`,
            { topic, user_id: userId },
            { timeout: 10000 }
          );

          // Store locally as backup
          await this.storeSubscriptionLocally(topic, userId);
          console.log(`Subscribed to ${topic}`);
          return;
        } catch (error) {
          lastError = error as AxiosError;
          if (attempt < maxRetries) {
            // Exponential backoff: 1s, 2s
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      // If all retries failed, store locally and warn
      await this.storeSubscriptionLocally(topic, userId);
      console.warn(`Failed to subscribe to ${topic} remotely. Stored locally.`, lastError?.message);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe user from a notification topic
   * @param topic - Topic name
   * @param userId - User ID
   */
  async unsubscribeFromTopic(topic: NotificationTopic, userId: string): Promise<void> {
    try {
      // Validate topic
      if (!NOTIFICATION_TOPICS.includes(topic)) {
        throw new Error(`Invalid topic: ${topic}`);
      }

      try {
        // Unsubscribe via backend
        await axios.post(
          `${API_BASE_URL}/notifications/unsubscribe`,
          { topic, user_id: userId },
          { timeout: 10000 }
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError?.response?.status === 404) {
          // Already unsubscribed on backend - that's ok
          console.warn(`Topic ${topic} not found on backend. Proceeding with local cleanup.`);
        } else {
          throw error;
        }
      }

      // Remove from local storage
      await this.removeSubscriptionLocally(topic, userId);
      console.log(`Unsubscribed from ${topic}`);
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Register device for remote notifications
   * Gets FCM device token and sends to backend
   * @param userId - User ID for token association
   */
  async registerForRemoteNotifications(userId: string): Promise<void> {
    try {
      // Request permissions first
      const permission = await this.requestPermissions();
      if (permission !== 'granted') {
        console.warn('Cannot register for notifications: permissions not granted');
        return;
      }

      // Get device token
      const token = await this.getDeviceToken();
      if (!token) {
        console.warn('Unable to get device token');
        return;
      }

      // Send token to backend
      try {
        await axios.post(
          `${API_BASE_URL}/notifications/register-device`,
          { device_token: token, user_id: userId },
          { timeout: 10000 }
        );
        console.log('Device registered for remote notifications');
      } catch (error) {
        console.warn('Failed to register device token with backend:', (error as AxiosError)?.message);
        // Continue - token is still stored locally
      }
    } catch (error) {
      console.error('Error registering for remote notifications:', error);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Get current device FCM token
   * First tries cache, then requests new token if needed
   * @returns Device token or null if unavailable
   */
  async getDeviceToken(): Promise<string | null> {
    try {
      // Try to get from cache first
      const cached = await AsyncStorage.getItem(DEVICE_TOKEN_STORAGE_KEY);
      if (cached) {
        return cached;
      }

      // Request new token from Expo
      const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
      if (!projectId) {
        console.warn('EXPO_PUBLIC_PROJECT_ID not set');
        return null;
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      if (token) {
        // Cache it
        await AsyncStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token);
      }

      return token || null;
    } catch (error) {
      console.warn('Error getting device token:', error);
      return null;
    }
  }

  /**
   * Handle notification received in foreground
   * Parse and process notification data
   * @param notification - Incoming notification
   */
  handleNotificationReceived(notification: RemoteNotification): void {
    try {
      // Validate notification structure
      if (!notification.title || !notification.body) {
        console.warn('Invalid notification: missing title or body');
        return;
      }

      // Parse and log notification
      const id = notification.id || `${Date.now()}`;
      console.log(`Notification received: ${id}`, {
        title: notification.title,
        body: notification.body,
        data: notification.data,
      });

      // Data is available in notification.data if needed for routing
      // UI layer will handle toast/in-app display
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  }

  /**
   * Cleanup subscriptions on app unload
   */
  cleanup(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.remove();
    }
    if (this.responseSubscription) {
      this.responseSubscription.remove();
    }
  }

  // Private helper methods

  private async storeSubscriptionLocally(topic: NotificationTopic, userId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
      const subscriptions: SubscriptionRecord[] = stored ? JSON.parse(stored) : [];

      // Add new subscription if not already present
      const exists = subscriptions.some(
        sub => sub.topic === topic && sub.userId === userId
      );
      if (!exists) {
        subscriptions.push({
          topic,
          userId,
          subscribedAt: Date.now(),
        });
        await AsyncStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subscriptions));
      }
    } catch (error) {
      console.warn('Error storing subscription locally:', error);
    }
  }

  private async removeSubscriptionLocally(topic: NotificationTopic, userId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
      if (!stored) return;

      const subscriptions: SubscriptionRecord[] = JSON.parse(stored);
      const filtered = subscriptions.filter(
        sub => !(sub.topic === topic && sub.userId === userId)
      );

      if (filtered.length === 0) {
        await AsyncStorage.removeItem(SUBSCRIPTIONS_STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (error) {
      console.warn('Error removing subscription locally:', error);
    }
  }
}

// Export singleton instance
export const pushNotificationManager = new PushNotificationManager();
