'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AnimatePresence } from 'framer-motion';
import { Radar, Search } from 'lucide-react';
import { LivePulse } from '@/components/ui/LivePulse';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { AuthSection } from '@/components/auth/AuthSection';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { useNotificationContext } from '@/lib/context/NotificationContext';
import { useAuth } from '@/lib/context/AuthContext';

interface HeaderProps {
  isConnected: boolean;
}

export function Header({ isConnected }: HeaderProps) {
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    preferences,
    markAllRead,
    updatePreferences,
    requestBrowserPermission,
  } = useNotificationContext();

  const { user, openLoginModal } = useAuth();
  const t = useTranslations('header');
  const [showPrefs, setShowPrefs] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setIsOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Radar size={22} className="text-safe" />
            <span className="font-bold text-lg">
              Token<span className="text-gradient-brand">Radar</span>
            </span>
          </Link>

          {/* Center: Search trigger (desktop only) */}
          <Link
            href="/tokens?tab=explore"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-muted cursor-pointer hover:bg-white/[0.05] hover:border-white/10 transition-all w-64"
          >
            <Search size={12} />
            <span>{t('searchPlaceholder')}</span>
            <kbd className="ml-auto px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono">/</kbd>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LivePulse connected={isConnected} />
            <div className="w-px h-5 bg-border" />
            <LanguageSwitcher />
            <div className="w-px h-5 bg-border" />
            <AuthSection />
            <div className="w-px h-5 bg-border" />

            <div className="relative" ref={panelRef}>
              <NotificationBell
                unreadCount={user ? unreadCount : 0}
                onClick={() => {
                  if (!user) {
                    openLoginModal();
                    return;
                  }
                  setIsOpen(!isOpen);
                }}
              />
              <AnimatePresence>
                {isOpen && user && (
                  <NotificationPanel
                    notifications={notifications}
                    onMarkAllRead={markAllRead}
                    onOpenPreferences={() => {
                      setIsOpen(false);
                      setShowPrefs(true);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Preferences modal */}
      <AnimatePresence>
        {showPrefs && (
          <NotificationPreferences
            preferences={preferences}
            onUpdate={updatePreferences}
            onRequestBrowserPermission={requestBrowserPermission}
            onClose={() => setShowPrefs(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
