'use client';

import { useState, useCallback, useEffect } from 'react';
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
  minSafetyScore: number;
  sources: TokenSource[];
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  soundEnabled: true,
  browserNotificationsEnabled: false,
  minSafetyScore: 0,
  sources: ['pumpfun', 'raydium', 'moonshot'],
};

const STORAGE_KEY = 'tokenradar-notification-prefs';
const MAX_NOTIFICATIONS = 50;

function loadPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_PREFERENCES;
}

function savePreferences(prefs: NotificationPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setPreferences(loadPreferences());
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const shouldNotify = useCallback(
    (token: Token): boolean => {
      if (!preferences.sources.includes(token.source)) return false;
      if (token.safety_score !== null && token.safety_score < preferences.minSafetyScore) return false;
      return true;
    },
    [preferences]
  );

  const addNotification = useCallback(
    (token: Token) => {
      if (!shouldNotify(token)) return;

      const notification: Notification = {
        id: `${token.mint}-${Date.now()}`,
        token,
        timestamp: Date.now(),
        read: false,
      };

      setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));

      // Sound
      if (preferences.soundEnabled) {
        playNotificationSound();
      }

      // Browser notification
      if (preferences.browserNotificationsEnabled && document.hidden) {
        sendBrowserNotification(token);
      }
    },
    [shouldNotify, preferences]
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

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    preferences,
    addNotification,
    markAllRead,
    updatePreferences,
    requestBrowserPermission,
  };
}

function sendBrowserNotification(token: Token) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`New Token: $${token.symbol || 'Unknown'}`, {
      body: `Source: ${token.source} | Score: ${token.safety_score ?? 'Pending'}`,
      icon: token.image_url || undefined,
    });
  }
}
