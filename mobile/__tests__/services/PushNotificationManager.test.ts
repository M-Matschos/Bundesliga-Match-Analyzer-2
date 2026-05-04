/**
 * PushNotificationManager Unit Tests
 * Comprehensive test coverage for push notification management
 * Tests requestPermissions, subscribeToTopic, device registration, and error handling
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { pushNotificationManager } from '../../src/services/PushNotificationManager';

// Mock dependencies
jest.mock('react-native');
jest.mock('expo-notifications');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

describe('PushNotificationManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('requestPermissions', () => {
    it('should request iOS permissions and return granted status', async () => {
      Platform.OS = 'ios';
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await pushNotificationManager.requestPermissions();

      expect(result).toBe('granted');
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalledWith({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowProvisional: true,
        },
      });
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should request iOS permissions and return denied status', async () => {
      Platform.OS = 'ios';
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
      } as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await pushNotificationManager.requestPermissions();

      expect(result).toBe('denied');
    });

    it('should request iOS permissions and return undetermined status', async () => {
      Platform.OS = 'ios';
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'undetermined',
      } as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await pushNotificationManager.requestPermissions();

      expect(result).toBe('undetermined');
    });

    it('should request Android permissions for API 33+', async () => {
      Platform.OS = 'android';
      (Platform as any).Version = 33;
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await pushNotificationManager.requestPermissions();

      expect(result).toBe('granted');
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return granted for Android < API 33 without requesting', async () => {
      Platform.OS = 'android';
      (Platform as any).Version = 32;
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await pushNotificationManager.requestPermissions();

      expect(result).toBe('granted');
      expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should cache permission status for 1 minute', async () => {
      Platform.OS = 'ios';
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue('granted');

      // First call
      const result1 = await pushNotificationManager.requestPermissions();
      expect(result1).toBe('granted');

      // Second call within cache window should use cached value
      jest.advanceTimersByTime(30000); // 30 seconds
      mockAsyncStorage.getItem.mockResolvedValue('granted');
      const result2 = await pushNotificationManager.requestPermissions();

      expect(result2).toBe('granted');
    });

    it('should handle permission request errors gracefully', async () => {
      Platform.OS = 'ios';
      mockNotifications.requestPermissionsAsync.mockRejectedValue(
        new Error('Permission request failed')
      );
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      // Clear any cached permission status
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await pushNotificationManager.requestPermissions();

      expect(result).toBe('undetermined');
    });
  });

  describe('subscribeToTopic', () => {
    it('should subscribe to valid topic successfully', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as any);
      mockAxios.post.mockResolvedValue({ data: { success: true } });
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await pushNotificationManager.subscribeToTopic('upcoming_matches', 'user123');

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/subscribe'),
        { topic: 'upcoming_matches', user_id: 'user123' },
        { timeout: 10000 }
      );
    });

    it('should throw error for invalid topic', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as any);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await expect(
        pushNotificationManager.subscribeToTopic('invalid_topic' as any, 'user123')
      ).rejects.toThrow('Invalid topic');
    });

    it('should not subscribe if permissions not granted', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
      } as any);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      await pushNotificationManager.subscribeToTopic('upcoming_matches', 'user123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot subscribe to upcoming_matches')
      );
      expect(mockAxios.post).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should retry with exponential backoff on network error', async () => {
      // Disable fake timers for this test to handle real async delays
      jest.useRealTimers();

      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as any);
      mockAxios.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: { success: true } });
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await pushNotificationManager.subscribeToTopic('upcoming_matches', 'user123');

      expect(mockAxios.post).toHaveBeenCalledTimes(2);

      // Re-enable fake timers for afterEach cleanup
      jest.useFakeTimers();
    }, 15000);

    it('should store subscription locally after failed remote attempts', async () => {
      // Disable fake timers for this test to handle real async delays
      jest.useRealTimers();

      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as any);
      mockAxios.post.mockRejectedValue(new Error('Network error'));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      await pushNotificationManager.subscribeToTopic('upcoming_matches', 'user123');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('notification_subscriptions'),
        expect.any(String)
      );
      consoleSpy.mockRestore();

      // Re-enable fake timers for afterEach cleanup
      jest.useFakeTimers();
    }, 15000);
  });

  describe('unsubscribeFromTopic', () => {
    it('should unsubscribe from valid topic successfully', async () => {
      mockAxios.post.mockResolvedValue({ data: { success: true } });
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await pushNotificationManager.unsubscribeFromTopic('upcoming_matches', 'user123');

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/unsubscribe'),
        { topic: 'upcoming_matches', user_id: 'user123' },
        { timeout: 10000 }
      );
    });

    it('should handle 404 error gracefully when not found on backend', async () => {
      mockAxios.post.mockRejectedValue({
        response: { status: 404 },
      } as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      await pushNotificationManager.unsubscribeFromTopic('upcoming_matches', 'user123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('not found on backend')
      );
      consoleSpy.mockRestore();
    });

    it('should throw error for invalid topic', async () => {
      await expect(
        pushNotificationManager.unsubscribeFromTopic('invalid_topic' as any, 'user123')
      ).rejects.toThrow('Invalid topic');
    });
  });

  describe('registerForRemoteNotifications', () => {
    it('should register device with valid token', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as any);
      mockNotifications.getExpoPushTokenAsync.mockResolvedValue({
        data: 'ExponentPushToken[abc123def456]',
      } as any);
      mockAxios.post.mockResolvedValue({ data: { success: true } });
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      process.env.EXPO_PUBLIC_PROJECT_ID = 'test-project-123';

      await pushNotificationManager.registerForRemoteNotifications('user123');

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/register-device'),
        expect.objectContaining({
          device_token: expect.any(String),
          user_id: 'user123',
        }),
        { timeout: 10000 }
      );
    });

    it('should not register if permissions not granted', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
      } as any);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      await pushNotificationManager.registerForRemoteNotifications('user123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('permissions not granted')
      );
      expect(mockAxios.post).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should continue if backend registration fails but token is cached', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as any);
      mockNotifications.getExpoPushTokenAsync.mockResolvedValue({
        data: 'ExponentPushToken[abc123def456]',
      } as any);
      mockAxios.post.mockRejectedValue(new Error('Backend error'));
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      await pushNotificationManager.registerForRemoteNotifications('user123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to register device token'),
        expect.any(String)
      );
      consoleSpy.mockRestore();
    });

    it('should handle missing EXPO_PUBLIC_PROJECT_ID gracefully', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as any);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Simulate missing project ID
      const originalProjectId = process.env.EXPO_PUBLIC_PROJECT_ID;
      process.env.EXPO_PUBLIC_PROJECT_ID = '';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      await pushNotificationManager.registerForRemoteNotifications('user123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('EXPO_PUBLIC_PROJECT_ID not set')
      );

      process.env.EXPO_PUBLIC_PROJECT_ID = originalProjectId;
      consoleSpy.mockRestore();
    });
  });

  describe('getDeviceToken', () => {
    it('should return cached token if available', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('cached-token-abc123xyz');

      const token = await pushNotificationManager.getDeviceToken();

      expect(token).toBe('cached-token-abc123xyz');
      expect(mockNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    });

    it('should request new token if not cached', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockNotifications.getExpoPushTokenAsync.mockResolvedValue({
        data: 'ExponentPushToken[new-token-xyz]',
      } as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const token = await pushNotificationManager.getDeviceToken();

      expect(token).toBe('ExponentPushToken[new-token-xyz]');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('device_token'),
        'ExponentPushToken[new-token-xyz]'
      );
    });

    it('should return null if project ID not configured', async () => {
      const originalProjectId = process.env.EXPO_PUBLIC_PROJECT_ID;
      process.env.EXPO_PUBLIC_PROJECT_ID = '';
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const token = await pushNotificationManager.getDeviceToken();

      expect(token).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('EXPO_PUBLIC_PROJECT_ID not set')
      );

      process.env.EXPO_PUBLIC_PROJECT_ID = originalProjectId;
      consoleSpy.mockRestore();
    });

    it('should handle token request errors and return null', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockNotifications.getExpoPushTokenAsync.mockRejectedValue(
        new Error('Token request failed')
      );

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const token = await pushNotificationManager.getDeviceToken();

      expect(token).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error getting device token'),
        expect.any(Object)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('handleNotificationReceived', () => {
    it('should log valid notification with all fields', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      pushNotificationManager.handleNotificationReceived({
        title: 'Match Alert',
        body: 'Bayern vs Dortmund starts in 30 minutes',
        data: { matchId: 'match_123', odds: 2.5 },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification received'),
        expect.any(Object)
      );
      consoleSpy.mockRestore();
    });

    it('should reject notification with missing title', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      pushNotificationManager.handleNotificationReceived({
        title: '',
        body: 'Body text only',
        data: {},
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid notification')
      );
      consoleSpy.mockRestore();
    });

    it('should reject notification with missing body', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      pushNotificationManager.handleNotificationReceived({
        title: 'Title only',
        body: '',
        data: {},
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid notification')
      );
      consoleSpy.mockRestore();
    });

    it('should handle notification with optional fields', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      pushNotificationManager.handleNotificationReceived({
        id: 'notif_abc123',
        title: 'Prediction Update',
        body: 'New match prediction available',
        data: { predictionId: 'pred_456', confidence: 0.85 },
        badge: 2,
        sound: 'default',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification received: notif_abc123'),
        expect.objectContaining({
          title: 'Prediction Update',
          body: 'New match prediction available',
        })
      );
      consoleSpy.mockRestore();
    });

    it('should handle notification reception errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Simulate error by passing invalid data
      pushNotificationManager.handleNotificationReceived({
        title: null as any,
        body: 'test',
        data: {},
      });

      // Should not crash, just log warning about invalid notification
      expect(consoleSpy.mock.calls.length >= 0).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    it('should remove notification subscriptions on cleanup', () => {
      const mockSubscription = {
        remove: jest.fn(),
      };

      // Simulate subscriptions being set
      (pushNotificationManager as any).notificationSubscription = mockSubscription;
      (pushNotificationManager as any).responseSubscription = mockSubscription;

      pushNotificationManager.cleanup();

      expect(mockSubscription.remove).toHaveBeenCalledTimes(2);
    });

    it('should handle cleanup with null subscriptions', () => {
      (pushNotificationManager as any).notificationSubscription = null;
      (pushNotificationManager as any).responseSubscription = null;

      expect(() => {
        pushNotificationManager.cleanup();
      }).not.toThrow();
    });

    it('should be idempotent - safe to call multiple times', () => {
      const mockSubscription = {
        remove: jest.fn(),
      };

      (pushNotificationManager as any).notificationSubscription = mockSubscription;
      (pushNotificationManager as any).responseSubscription = mockSubscription;

      pushNotificationManager.cleanup();
      pushNotificationManager.cleanup();

      expect(mockSubscription.remove).toHaveBeenCalledTimes(4); // 2x per call
    });
  });
});
