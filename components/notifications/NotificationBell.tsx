'use client';

import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

export function NotificationBell({ unreadCount, onClick }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Notifications"
      className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      <Bell size={18} className="text-muted" />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white px-1"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
