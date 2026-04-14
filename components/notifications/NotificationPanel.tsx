'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { Notification } from '@/lib/context/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { CheckCheck, Settings, Bell } from 'lucide-react';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onOpenPreferences: () => void;
}

export function NotificationPanel({
  notifications,
  onMarkAllRead,
  onOpenPreferences,
}: NotificationPanelProps) {
  const t = useTranslations('notifications');
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-[min(380px,calc(100vw-2rem))] max-h-[480px] rounded-2xl border border-white/10 overflow-hidden z-50 bg-[#12121a] shadow-2xl shadow-black/60"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold">{t('title')}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onMarkAllRead}
            className="p-1.5 rounded hover:bg-white/5 text-muted hover:text-foreground transition-colors btn-press"
            title={t('markAllRead')}
          >
            <CheckCheck size={14} />
          </button>
          <button
            onClick={onOpenPreferences}
            className="p-1.5 rounded hover:bg-white/5 text-muted hover:text-foreground transition-colors btn-press"
            title={t('settings')}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto max-h-[420px]">
        {notifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <Bell size={20} className="text-muted" />
            </div>
            <p className="text-sm font-medium text-muted">{t('noNotifications')}</p>
            <p className="text-xs text-muted mt-1">
              {t('newAlerts')}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </motion.div>
  );
}
