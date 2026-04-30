/**
 * Tests: Firebase Cloud Messaging Configuration
 * Coverage: FCM initialization, token management, message handlers
 */

import {
  initializeFirebaseMessaging,
  getDeviceToken,
  onDeviceTokenRefresh,
  configureNotificationBehavior,
  enableFirebaseAnalytics,
} from '../../src/config/firebase.config'
import * as Notifications from 'expo-notifications'
import messaging from '@react-native-firebase/messaging'

// Mock Firebase Messaging
jest.mock('@react-native-firebase/messaging')
jest.mock('expo-notifications')

describe('Firebase Cloud Messaging Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.log = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()
  })

  describe('initializeFirebaseMessaging()', () => {
    it('should request notification permissions on iOS', async () => {
      const mockRequestPermission = jest.fn().mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      )
      ;(messaging as jest.Mock).mockReturnValue({
        requestPermission: mockRequestPermission,
        onMessage: jest.fn().mockReturnValue(() => {}),
        onNotificationOpenedApp: jest.fn().mockReturnValue(() => {}),
        setBackgroundMessageHandler: jest.fn().mockResolvedValue(undefined),
        getInitialNotification: jest.fn().mockResolvedValue(null),
      })

      await initializeFirebaseMessaging()

      expect(mockRequestPermission).toHaveBeenCalled()
    })

    it('should log warning if notification permissions are not granted', async () => {
      ;(messaging as jest.Mock).mockReturnValue({
        requestPermission: jest
          .fn()
          .mockResolvedValue(messaging.AuthorizationStatus.DENIED),
        onMessage: jest.fn().mockReturnValue(() => {}),
      })

      await initializeFirebaseMessaging()

      expect(console.warn).toHaveBeenCalledWith(
        'Notification permissions not granted'
      )
    })

    it('should accept PROVISIONAL authorization status', async () => {
      ;(messaging as jest.Mock).mockReturnValue({
        requestPermission: jest
          .fn()
          .mockResolvedValue(messaging.AuthorizationStatus.PROVISIONAL),
        onMessage: jest.fn().mockReturnValue(() => {}),
        onNotificationOpenedApp: jest.fn().mockReturnValue(() => {}),
        setBackgroundMessageHandler: jest.fn().mockResolvedValue(undefined),
        getInitialNotification: jest.fn().mockResolvedValue(null),
      })

      await initializeFirebaseMessaging()

      expect(console.log).toHaveBeenCalledWith(
        'Firebase Messaging initialized successfully'
      )
    })

    it('should setup foreground message listener', async () => {
      const mockOnMessage = jest.fn().mockReturnValue(() => {})
      ;(messaging as jest.Mock).mockReturnValue({
        requestPermission: jest.fn().mockResolvedValue(
          messaging.AuthorizationStatus.AUTHORIZED
        ),
        onMessage: mockOnMessage,
        onNotificationOpenedApp: jest.fn().mockReturnValue(() => {}),
        setBackgroundMessageHandler: jest.fn().mockResolvedValue(undefined),
        getInitialNotification: jest.fn().mockResolvedValue(null),
      })

      await initializeFirebaseMessaging()

      expect(mockOnMessage).toHaveBeenCalled()
    })

    it('should setup notification opened listener', async () => {
      const mockOnNotificationOpenedApp = jest.fn().mockReturnValue(() => {})
      ;(messaging as jest.Mock).mockReturnValue({
        requestPermission: jest.fn().mockResolvedValue(
          messaging.AuthorizationStatus.AUTHORIZED
        ),
        onMessage: jest.fn().mockReturnValue(() => {}),
        onNotificationOpenedApp: mockOnNotificationOpenedApp,
        setBackgroundMessageHandler: jest.fn().mockResolvedValue(undefined),
        getInitialNotification: jest.fn().mockResolvedValue(null),
      })

      await initializeFirebaseMessaging()

      expect(mockOnNotificationOpenedApp).toHaveBeenCalled()
    })

    it('should setup background message handler', async () => {
      const mockSetBackgroundMessageHandler = jest
        .fn()
        .mockResolvedValue(undefined)
      ;(messaging as jest.Mock).mockReturnValue({
        requestPermission: jest.fn().mockResolvedValue(
          messaging.AuthorizationStatus.AUTHORIZED
        ),
        onMessage: jest.fn().mockReturnValue(() => {}),
        onNotificationOpenedApp: jest.fn().mockReturnValue(() => {}),
        setBackgroundMessageHandler: mockSetBackgroundMessageHandler,
        getInitialNotification: jest.fn().mockResolvedValue(null),
      })

      await initializeFirebaseMessaging()

      expect(mockSetBackgroundMessageHandler).toHaveBeenCalled()
    })

    it('should check for initial notification on launch', async () => {
      const mockGetInitialNotification = jest
        .fn()
        .mockResolvedValue(null)
      ;(messaging as jest.Mock).mockReturnValue({
        requestPermission: jest.fn().mockResolvedValue(
          messaging.AuthorizationStatus.AUTHORIZED
        ),
        onMessage: jest.fn().mockReturnValue(() => {}),
        onNotificationOpenedApp: jest.fn().mockReturnValue(() => {}),
        setBackgroundMessageHandler: jest.fn().mockResolvedValue(undefined),
        getInitialNotification: mockGetInitialNotification,
      })

      await initializeFirebaseMessaging()

      expect(mockGetInitialNotification).toHaveBeenCalled()
    })

    it('should handle initialization errors gracefully', async () => {
      const testError = new Error('FCM initialization failed')
      ;(messaging as jest.Mock).mockImplementation(() => {
        throw testError
      })

      await initializeFirebaseMessaging()

      expect(console.error).toHaveBeenCalledWith(
        'Failed to initialize Firebase Messaging:',
        testError
      )
    })
  })

  describe('getDeviceToken()', () => {
    it('should return device token from Firebase Messaging', async () => {
      const mockToken = 'test_device_token_123abc'
      ;(messaging as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
      })

      const result = await getDeviceToken()

      expect(result).toBe(mockToken)
    })

    it('should log token when retrieved successfully', async () => {
      const mockToken = 'test_device_token_456def'
      ;(messaging as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockResolvedValue(mockToken),
      })

      await getDeviceToken()

      expect(console.log).toHaveBeenCalledWith(
        'FCM device token obtained:',
        mockToken
      )
    })

    it('should return null if token retrieval fails', async () => {
      const testError = new Error('Failed to get token')
      ;(messaging as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockRejectedValue(testError),
      })

      const result = await getDeviceToken()

      expect(result).toBeNull()
    })

    it('should log error if token retrieval fails', async () => {
      const testError = new Error('Failed to get token')
      ;(messaging as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockRejectedValue(testError),
      })

      await getDeviceToken()

      expect(console.error).toHaveBeenCalledWith(
        'Failed to get FCM device token:',
        testError
      )
    })
  })

  describe('onDeviceTokenRefresh()', () => {
    it('should register token refresh listener', () => {
      const mockUnsubscribe = jest.fn()
      const mockOnTokenRefresh = jest
        .fn()
        .mockReturnValue(mockUnsubscribe)
      ;(messaging as jest.Mock).mockReturnValue({
        onTokenRefresh: mockOnTokenRefresh,
      })

      const callback = jest.fn()
      onDeviceTokenRefresh(callback)

      expect(mockOnTokenRefresh).toHaveBeenCalled()
    })

    it('should call callback with new token when refresh occurs', () => {
      let capturedCallback: ((token: string) => void) | null = null
      const mockUnsubscribe = jest.fn()
      const mockOnTokenRefresh = jest
        .fn()
        .mockImplementation((cb) => {
          capturedCallback = cb
          return mockUnsubscribe
        })
      ;(messaging as jest.Mock).mockReturnValue({
        onTokenRefresh: mockOnTokenRefresh,
      })

      const callback = jest.fn()
      onDeviceTokenRefresh(callback)

      const newToken = 'new_token_789ghi'
      capturedCallback?.(newToken)

      expect(callback).toHaveBeenCalledWith(newToken)
    })

    it('should log token refresh event', () => {
      let capturedCallback: ((token: string) => void) | null = null
      const mockUnsubscribe = jest.fn()
      const mockOnTokenRefresh = jest
        .fn()
        .mockImplementation((cb) => {
          capturedCallback = cb
          return mockUnsubscribe
        })
      ;(messaging as jest.Mock).mockReturnValue({
        onTokenRefresh: mockOnTokenRefresh,
      })

      onDeviceTokenRefresh(jest.fn())

      const newToken = 'new_token_789ghi'
      capturedCallback?.(newToken)

      expect(console.log).toHaveBeenCalledWith(
        'FCM token refreshed:',
        newToken
      )
    })

    it('should return unsubscribe function', () => {
      const mockUnsubscribe = jest.fn()
      const mockOnTokenRefresh = jest
        .fn()
        .mockReturnValue(mockUnsubscribe)
      ;(messaging as jest.Mock).mockReturnValue({
        onTokenRefresh: mockOnTokenRefresh,
      })

      const result = onDeviceTokenRefresh(jest.fn())

      expect(result).toBe(mockUnsubscribe)
    })
  })

  describe('configureNotificationBehavior()', () => {
    it('should set notification handler for local notifications', () => {
      const mockSetNotificationHandler = jest.fn()
      ;(Notifications.setNotificationHandler as jest.Mock).mockImplementation(
        mockSetNotificationHandler
      )

      configureNotificationBehavior()

      expect(mockSetNotificationHandler).toHaveBeenCalled()
    })

    it('should show alerts when notifications are received', async () => {
      let capturedHandler: any = null
      ;(Notifications.setNotificationHandler as jest.Mock).mockImplementation(
        (handler) => {
          capturedHandler = handler
        }
      )

      configureNotificationBehavior()

      const result = await capturedHandler?.handleNotification?.()

      expect(result?.shouldShowAlert).toBe(true)
    })

    it('should play sound when notifications are received', async () => {
      let capturedHandler: any = null
      ;(Notifications.setNotificationHandler as jest.Mock).mockImplementation(
        (handler) => {
          capturedHandler = handler
        }
      )

      configureNotificationBehavior()

      const result = await capturedHandler?.handleNotification?.()

      expect(result?.shouldPlaySound).toBe(true)
    })

    it('should set badge when notifications are received', async () => {
      let capturedHandler: any = null
      ;(Notifications.setNotificationHandler as jest.Mock).mockImplementation(
        (handler) => {
          capturedHandler = handler
        }
      )

      configureNotificationBehavior()

      const result = await capturedHandler?.handleNotification?.()

      expect(result?.shouldSetBadge).toBe(true)
    })
  })

  describe('enableFirebaseAnalytics()', () => {
    it('should enable auto initialization', async () => {
      const mockSetAutoInitEnabled = jest.fn().mockResolvedValue(undefined)
      ;(messaging as jest.Mock).mockReturnValue({
        setAutoInitEnabled: mockSetAutoInitEnabled,
      })

      await enableFirebaseAnalytics()

      expect(mockSetAutoInitEnabled).toHaveBeenCalledWith(true)
    })

    it('should log success when analytics enabled', async () => {
      ;(messaging as jest.Mock).mockReturnValue({
        setAutoInitEnabled: jest.fn().mockResolvedValue(undefined),
      })

      await enableFirebaseAnalytics()

      expect(console.log).toHaveBeenCalledWith('Firebase Analytics enabled')
    })

    it('should log error if enabling analytics fails', async () => {
      const testError = new Error('Analytics failed')
      ;(messaging as jest.Mock).mockReturnValue({
        setAutoInitEnabled: jest.fn().mockRejectedValue(testError),
      })

      await enableFirebaseAnalytics()

      expect(console.error).toHaveBeenCalledWith(
        'Failed to enable Firebase Analytics:',
        testError
      )
    })
  })
})
