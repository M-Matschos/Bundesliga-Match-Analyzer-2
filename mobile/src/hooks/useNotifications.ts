/**
 * useNotifications Hook für Firebase Cloud Messaging Integration
 * Verwaltet Device-Token-Registrierung, Match-Subscriptions und Notification-Handling
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAuth } from './useAuth';

let messaging: any = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (e) {
  console.warn('Firebase Messaging nicht verfügbar');
}

type RemoteMessage = any;

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data: Record<string, any>;
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  deviceToken: string | null;
  isRegistered: boolean;
  subscriptions: number[];
  notifications: PushNotification[];
  unreadCount: number;
  lastNotification: PushNotification | null;
}

interface UseNotificationsOptions {
  autoRegister?: boolean;
  onNotificationReceived?: (notification: PushNotification) => void;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { autoRegister = true, onNotificationReceived } = options;
  const { user } = useAuth();

  const [state, setState] = useState<NotificationState>({
    deviceToken: null,
    isRegistered: false,
    subscriptions: [],
    notifications: [],
    unreadCount: 0,
    lastNotification: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notificationListenerRef = useRef<(() => void) | null>(null);
  const foregroundListenerRef = useRef<(() => void) | null>(null);

  /**
   * Hole Device-Token von Firebase
   */
  const getDeviceToken = useCallback(async () => {
    try {
      console.log('🔑 Hole Firebase Device-Token...');
      const token = await messaging().getToken();
      console.log(`✓ Device-Token erhalten: ${token?.substring(0, 20)}...`);
      setState((prev) => ({ ...prev, deviceToken: token }));
      return token;
    } catch (err) {
      const errorMessage = `Fehler beim Abrufen des Device-Tokens: ${err}`;
      console.error(errorMessage);
      setError(errorMessage);
      return null;
    }
  }, []);

  /**
   * Registriere Gerät auf dem Backend
   */
  const registerDevice = useCallback(
    async (token: string) => {
      if (!user?.id) {
        console.warn('⚠️  Kein Benutzer angemeldet - kann Gerät nicht registrieren');
        return;
      }

      try {
        setLoading(true);
        console.log('📱 Registriere Gerät auf dem Backend...');

        const response = await fetch(`${API_BASE_URL}/notifications/register-device`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            device_token: token,
            platform: 'ios',
          }),
        });

        if (!response.ok) {
          throw new Error(`Backend-Fehler: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✓ Gerät registriert:', data.message);

        setState((prev) => ({ ...prev, isRegistered: true }));
        setError(null);
        console.log('✓ Benachrichtigungen aktiviert - Gerät erfolgreich registriert');
      } catch (err) {
        const errorMessage = `Fehler beim Registrieren des Geräts: ${err}`;
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  /**
   * Abonniere Benachrichtigungen für ein Match
   */
  const subscribeToMatch = useCallback(
    async (matchId: number) => {
      if (!user?.id) {
        console.warn('⚠️  Kein Benutzer angemeldet - kann Match nicht abonnieren');
        return;
      }

      try {
        setLoading(true);
        console.log(`📋 Abonniere Match ${matchId}...`);

        const response = await fetch(`${API_BASE_URL}/notifications/subscribe-match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            match_id: matchId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Backend-Fehler: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✓ Match ${matchId} abonniert`);

        setState((prev) => ({
          ...prev,
          subscriptions: [...prev.subscriptions, matchId],
        }));

        setError(null);
        console.log(`✓ Benachrichtigungen für Match ${matchId} aktiviert`);
      } catch (err) {
        const errorMessage = `Fehler beim Abonnieren: ${err}`;
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  /**
   * Beende Abo für ein Match
   */
  const unsubscribeFromMatch = useCallback(
    async (matchId: number) => {
      if (!user?.id) {
        console.warn('⚠️  Kein Benutzer angemeldet - kann Abo nicht beenden');
        return;
      }

      try {
        setLoading(true);
        console.log(`❌ Beende Abo für Match ${matchId}...`);

        const response = await fetch(`${API_BASE_URL}/notifications/unsubscribe-match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            match_id: matchId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Backend-Fehler: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✓ Abo für Match ${matchId} beendet`);

        setState((prev) => ({
          ...prev,
          subscriptions: prev.subscriptions.filter((id) => id !== matchId),
        }));

        setError(null);
        console.log(`✓ Benachrichtigungen für Match ${matchId} deaktiviert`);
      } catch (err) {
        const errorMessage = `Fehler beim Beenden des Abos: ${err}`;
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  /**
   * Markiere Benachrichtigung als gelesen
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        console.log(`✓ Markiere Benachrichtigung ${notificationId} als gelesen...`);

        const response = await fetch(
          `${API_BASE_URL}/notifications/mark-as-read/${notificationId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`Backend-Fehler: ${response.statusText}`);
        }

        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      } catch (err) {
        console.error(`Fehler beim Markieren als gelesen: ${err}`);
      }
    },
    []
  );

  /**
   * Verarbeite eingehende Benachrichtigung
   */
  const handleNotificationReceived = useCallback(
    (remoteMessage: RemoteMessage) => {
      console.log('📬 Benachrichtigung empfangen:', remoteMessage);

      const notification: PushNotification = {
        id: remoteMessage.messageId || `${Date.now()}`,
        title: remoteMessage.notification?.title || 'Benachrichtigung',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data || {},
        timestamp: new Date().toISOString(),
        read: false,
      };

      if (remoteMessage.notification?.title === '⚽ GOAL') {
        console.log(`✓ ${remoteMessage.notification?.title}: ${remoteMessage.notification?.body}`);
      } else {
        console.log(`ℹ️ ${remoteMessage.notification?.title}: ${remoteMessage.notification?.body}`);
      }

      setState((prev) => ({
        ...prev,
        notifications: [notification, ...prev.notifications],
        unreadCount: prev.unreadCount + 1,
        lastNotification: notification,
      }));

      onNotificationReceived?.(notification);
    },
    [onNotificationReceived]
  );

  /**
   * Initialisiere Firebase Messaging
   */
  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        console.log('🔥 Initialisiere Firebase Cloud Messaging...');

        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.warn('⚠️  Benachrichtigungsberechtigung nicht erteilt - bitte aktivieren Sie Benachrichtigungen in den Einstellungen');
          return;
        }

        console.log('✓ Benachrichtigungsberechtigung erteilt');

        const token = await getDeviceToken();
        if (token && autoRegister && user?.id) {
          await registerDevice(token);
        }

        notificationListenerRef.current = messaging().onNotificationOpenedApp(
          (message: RemoteMessage) => {
            console.log('📲 App wurde von Benachrichtigung geöffnet:', message);
            handleNotificationReceived(message);
          }
        );

        foregroundListenerRef.current = messaging().onMessage((message: RemoteMessage) => {
          handleNotificationReceived(message);
        });

        console.log('✓ Firebase Messaging initialisiert');
      } catch (err) {
        const errorMessage = `Fehler beim Initialisieren von Firebase: ${err}`;
        console.error(errorMessage);
        setError(errorMessage);
      }
    };

    if (user?.id) {
      initializeMessaging();
    }

    return () => {
      if (notificationListenerRef.current) {
        notificationListenerRef.current();
      }
      if (foregroundListenerRef.current) {
        foregroundListenerRef.current();
      }
    };
  }, [user?.id, getDeviceToken, registerDevice, handleNotificationReceived, autoRegister]);

  return {
    deviceToken: state.deviceToken,
    isRegistered: state.isRegistered,
    subscriptions: state.subscriptions,
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    lastNotification: state.lastNotification,
    loading,
    error,
    getDeviceToken,
    registerDevice,
    subscribeToMatch,
    unsubscribeFromMatch,
    markAsRead,
  };
}
