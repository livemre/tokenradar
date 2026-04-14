'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bookmark } from 'lucide-react';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { useAuth } from '@/lib/context/AuthContext';
import { TokenCard } from './TokenCard';
import type { Token } from '@/lib/types/token';

export function FavoritesList() {
  const t = useTranslations('favorites');
  const { favorites, isLoading: favsLoading } = useFavorites();
  const { user, openLoginModal } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch token data for favorited mints
  useEffect(() => {
    const mints = [...favorites];
    if (mints.length === 0) {
      setTokens([]);
      return;
    }

    setLoading(true);
    fetch(`/api/tokens/favorites?mints=${mints.join(',')}`)
      .then((r) => r.json())
      .then((res) => {
        setTokens(res.data || []);
      })
      .finally(() => setLoading(false));
  }, [favorites]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <Bookmark size={28} className="text-muted" />
        </div>
        <p className="text-lg font-medium">{t('noFavoritesTitle')}</p>
        <p className="text-sm text-muted mt-2 max-w-xs mx-auto">{t('noFavoritesDesc')}</p>
        <button
          onClick={openLoginModal}
          className="mt-4 px-4 py-2 rounded-lg bg-safe/10 text-safe text-sm font-semibold hover:bg-safe/20 transition-all btn-press"
        >
          {t('signInToSave')}
        </button>
      </div>
    );
  }

  if (favsLoading || loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 w-full rounded-xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }

  if (favorites.size === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <Bookmark size={28} className="text-muted" />
        </div>
        <p className="text-lg font-medium">{t('noFavoritesTitle')}</p>
        <p className="text-sm text-muted mt-2 max-w-xs mx-auto">{t('noFavoritesDescLoggedIn')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{t('count', { count: tokens.length })}</p>
      {tokens.map((token) => (
        <TokenCard key={token.mint} token={token} />
      ))}
    </div>
  );
}
