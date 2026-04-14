'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { Token, TokenSource, SafetyLevel } from '@/lib/types/token';
import { playNotificationSound } from '@/lib/utils/sound';

export interface Notification {
  id: string;
  token: Token;
  timestamp: number;
  read: boolean;
}

export interface NotificationPreferences {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  safetyLevels: SafetyLevel[];
  sources: TokenSource[];
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  soundEnabled: false,
  browserNotificationsEnabled: false,
  safetyLevels: ['safe', 'warning', 'danger', 'unknown'],
  sources: ['pumpfun', 'raydium', 'moonshot'],
};

const STORAGE_KEY = 'tokenradar-notification-prefs';
const MAX_NOTIFICATIONS = 50;

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  preferences: NotificationPreferences;
  addNotification: (token: Token) => void;
  markAllRead: () => void;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  requestBrowserPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function loadPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old minSafetyScore to new safetyLevels
      if ('minSafetyScore' in parsed && !('safetyLevels' in parsed)) {
        delete parsed.minSafetyScore;
      }
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch {}
  return DEFAULT_PREFERENCES;
}

function savePreferences(prefs: NotificationPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

function sendBrowserNotification(token: Token) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const safetyLabel = token.safety_level
      ? token.safety_level.charAt(0).toUpperCase() + token.safety_level.slice(1)
      : 'Pending';
    new Notification(`New Token: $${token.symbol || 'Unknown'}`, {
      body: `Source: ${token.source} | Safety: ${safetyLabel}`,
      icon: token.image_url || undefined,
    });
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setPreferences(loadPreferences());
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (token: Token) => {
      // Skip tokens without a name/symbol (unenriched noise)
      if (!token.symbol) return;
      // Filter based on preferences
      if (!preferences.sources.includes(token.source)) return;
      if (token.safety_level && !preferences.safetyLevels.includes(token.safety_level)) return;

      const notification: Notification = {
        id: `${token.mint}-${Date.now()}`,
        token,
        timestamp: Date.now(),
        read: false,
      };

      setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));

      if (preferences.soundEnabled) {
        playNotificationSound();
      }

      if (preferences.browserNotificationsEnabled && document.hidden) {
        sendBrowserNotification(token);
      }
    },
    [preferences]
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      savePreferences(next);
      return next;
    });
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      updatePreferences({ browserNotificationsEnabled: permission === 'granted' });
    }
  }, [updatePreferences]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    preferences,
    addNotification,
    markAllRead,
    updatePreferences,
    requestBrowserPermission,
  }), [notifications, unreadCount, isOpen, preferences, addNotification, markAllRead, updatePreferences, requestBrowserPermission]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider');
  return ctx;
}
