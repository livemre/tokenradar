'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bookmark, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export function UserMenu() {
  const t = useTranslations('auth');
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden ring-1 ring-white/10 hover:ring-white/20 transition-all"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <User size={16} className="text-muted" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#12121a] shadow-2xl shadow-black/60 z-50 overflow-hidden"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-sm font-medium truncate">
                {profile?.display_name || t('user')}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/tokens?tab=favorites"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <Bookmark size={14} />
                {t('myFavorites')}
              </Link>
              <button
                onClick={() => { signOut(); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <LogOut size={14} />
                {t('signOut')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
