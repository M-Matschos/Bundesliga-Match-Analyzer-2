/**
 * NotificationPreferencesContext
 * Global state for notification preferences management
 * Provides context for app-wide access to user notification settings
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { notificationService, NotificationPreferences } from '../services/NotificationService';

interface NotificationPreferencesContextType {
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences(prefs: Partial<NotificationPreferences>): Promise<void>;
  refetchPreferences(): Promise<void>;
}

const NotificationPreferencesContext = createContext<NotificationPreferencesContextType | undefined>(
  undefined
);

interface NotificationPreferencesProviderProps {
  children: ReactNode;
}

/**
 * NotificationPreferencesProvider
 * Wraps app with notification preferences context
 * Should be placed after AnalyticsProvider in provider hierarchy
 */
export function NotificationPreferencesProvider({
  children,
}: NotificationPreferencesProviderProps) {
  const { user } = useAuth();

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load preferences on mount or when user changes
   */
  useEffect(() => {
    if (!user?.id) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    loadPreferences(user.id);
  }, [user?.id]);

  /**
   * Load preferences from service
   */
  const loadPreferences = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const prefs = await notificationService.getPreferences(userId);
      setPreferences(prefs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load preferences';
      setError(message);
      console.error('Error loading notification preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update preferences and sync with backend
   */
  const updatePreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        setError(null);

        // Optimistic update
        const updated = { ...preferences, ...prefs };
        setPreferences(updated);

        // Sync with backend
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
   * Refetch preferences from backend
   */
  const refetchPreferences = useCallback(async () => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    await loadPreferences(user.id);
  }, [user?.id]);

  const value: NotificationPreferencesContextType = {
    preferences,
    loading,
    error,
    updatePreferences,
    refetchPreferences,
  };

  return (
    <NotificationPreferencesContext.Provider value={value}>
      {children}
    </NotificationPreferencesContext.Provider>
  );
}

/**
 * Hook to access notification preferences context
 * Must be used within NotificationPreferencesProvider
 */
export function useNotificationPreferences(): NotificationPreferencesContextType {
  const context = useContext(NotificationPreferencesContext);

  if (context === undefined) {
    throw new Error('useNotificationPreferences must be used within NotificationPreferencesProvider');
  }

  return context;
}
