'use client';

import { useTranslations } from 'next-intl';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { UserMenu } from './UserMenu';

export function AuthSection() {
  const t = useTranslations('auth');
  const { user, isLoading, openLoginModal } = useAuth();

  if (isLoading) {
    return <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />;
  }

  if (user) {
    return <UserMenu />;
  }

  return (
    <button
      onClick={openLoginModal}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-safe/10 text-safe text-xs font-semibold hover:bg-safe/20 transition-all btn-press"
    >
      <LogIn size={14} />
      <span className="hidden sm:inline">{t('signIn')}</span>
    </button>
  );
}
