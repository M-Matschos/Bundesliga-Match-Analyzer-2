/**
 * useWebSocket Hook für Echtzeit-Match-Events
 * Verwaltet WebSocket-Verbindung und Event-Streaming
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useToast } from '@react-native-toast-community/toast';

interface WebSocketEvent {
  message_type: 'event' | 'subscription' | 'heartbeat' | 'connection_established';
  match_id: number;
  event?: {
    event_type: string;
    match_id: number;
    timestamp: string;
    data: Record<string, any>;
  };
  data?: Record<string, any>;
  timestamp: string;
}

interface UseWebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onError?: (error: string) => void;
}

export function useWebSocket(
  matchId: number,
  onEvent: (event: WebSocketEvent) => void,
  options: UseWebSocketOptions = {}
) {
  const {
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
  } = options;

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    eventsReceived: 0,
    lastEventTime: null as string | null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toast = useToast();

  /**
   * Stellt WebSocket-Verbindung her
   */
  const connect = useCallback(() => {
    try {
      // Bestimme Backend-URL
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'localhost:8000';
      const wsUrl = `ws://${backendUrl}/api/v1/ws/match/${matchId}`;

      console.log(`🔌 Verbinde mit WebSocket: ${wsUrl}`);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`✅ WebSocket verbunden für Match ${matchId}`);
        setConnected(true);
        setError(null);
        reconnectCountRef.current = 0;

        // Zeige Connection Toast
        toast.show({
          type: 'success',
          text1: 'Verbunden',
          text2: `Live-Updates für Match ${matchId} aktiv`,
          duration: 2000,
        });

        // Starte Heartbeat
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data);

          // Aktualisiere Statistiken
          setStatistics((prev) => ({
            eventsReceived: prev.eventsReceived + 1,
            lastEventTime: new Date().toISOString(),
          }));

          // Rufe Callback auf
          onEvent(message);

          // Log wichtige Events
          if (message.event?.event_type === 'goal') {
            console.log(`⚽ TOR! ${message.event?.data?.scorer}`);
          } else if (message.event?.event_type === 'yellow_card') {
            console.log(`💛 GELBE KARTE! ${message.event?.data?.player}`);
          } else if (message.event?.event_type === 'red_card') {
            console.log(`🔴 ROTE KARTE! ${message.event?.data?.player}`);
          }
        } catch (err) {
          console.error('❌ Fehler beim Parsing der WebSocket-Nachricht:', err);
        }
      };

      ws.onerror = (event) => {
        const errorMessage = `WebSocket-Fehler: ${event}`;
        console.error(errorMessage);
        setError(errorMessage);

        toast.show({
          type: 'error',
          text1: 'Verbindungsfehler',
          text2: errorMessage,
          duration: 3000,
        });
      };

      ws.onclose = () => {
        console.log('❌ WebSocket getrennt');
        setConnected(false);
        stopHeartbeat();

        // Versuche Reconnect
        attemptReconnect();
      };

      wsRef.current = ws;
    } catch (err) {
      const errorMessage = `Fehler beim Verbinden: ${err}`;
      console.error(errorMessage);
      setError(errorMessage);
      attemptReconnect();
    }
  }, [matchId, onEvent, toast]);

  /**
   * Versucht Reconnect mit exponential backoff
   */
  const attemptReconnect = useCallback(() => {
    if (reconnectCountRef.current < reconnectAttempts) {
      reconnectCountRef.current += 1;
      const delay = reconnectInterval * Math.pow(2, reconnectCountRef.current - 1);

      console.log(
        `🔄 Reconnect-Versuch ${reconnectCountRef.current}/${reconnectAttempts} in ${delay}ms`
      );

      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, delay);
    } else {
      console.error('❌ Maximale Reconnect-Versuche erreicht');
      toast.show({
        type: 'error',
        text1: 'Verbindung fehlgeschlagen',
        text2: 'Konnte sich nach mehreren Versuchen nicht verbinden',
        duration: 4000,
      });
    }
  }, [reconnectAttempts, reconnectInterval, connect, toast]);

  /**
   * Stellt Heartbeat her zur Überprüfung der Verbindung
   */
  const startHeartbeat = useCallback(() => {
    heartbeatTimerRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // Sende Heartbeat
        wsRef.current.send(
          JSON.stringify({
            message_type: 'heartbeat',
            match_id: matchId,
            timestamp: new Date().toISOString(),
          })
        );
      }
    }, heartbeatInterval);
  }, [matchId, heartbeatInterval]);

  /**
   * Stoppt Heartbeat
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  /**
   * Sendet eine Nachricht via WebSocket
   */
  const sendMessage = useCallback((message: Record<string, any>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        console.log('📤 Nachricht gesendet:', message);
      } catch (err) {
        console.error('❌ Fehler beim Senden:', err);
      }
    } else {
      console.warn('⚠️  WebSocket nicht verbunden');
    }
  }, []);

  /**
   * Disconnected und bereinigt Ressourcen
   */
  const disconnect = useCallback(() => {
    console.log('🔌 Trenne WebSocket-Verbindung');

    stopHeartbeat();

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
  }, [stopHeartbeat]);

  /**
   * Setzt den Reconnect-Counter zurück
   */
  const resetReconnectCounter = useCallback(() => {
    reconnectCountRef.current = 0;
  }, []);

  // Verbinde beim Mounten
  useEffect(() => {
    connect();

    // Cleanup beim Unmounten
    return () => {
      disconnect();
    };
  }, [matchId]); // Wird nur bei Änderung von matchId aufgerufen

  return {
    connected,
    error,
    sendMessage,
    disconnect,
    resetReconnectCounter,
    statistics,
  };
}
