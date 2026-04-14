'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

interface FavoritesContextValue {
  favorites: Set<string>;
  isFavorite: (mint: string) => boolean;
  toggleFavorite: (mint: string) => void;
  favoritesCount: number;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useMemo(() => createBrowserSupabase(), []);

  // Load favorites when user signs in
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      supabase
        .from('favorites')
        .select('token_mint')
        .eq('user_id', user.id)
        .then(({ data }) => {
          setFavorites(new Set((data || []).map((f: { token_mint: string }) => f.token_mint)));
          setIsLoading(false);
        });
    } else {
      setFavorites(new Set());
      setIsLoading(false);
    }
  }, [user, supabase]);

  const isFavorite = useCallback(
    (mint: string) => favorites.has(mint),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (mint: string) => {
      if (!user) return;

      const removing = favorites.has(mint);
      const prev = new Set(favorites);

      // Optimistic update
      setFavorites(() => {
        const next = new Set(prev);
        if (removing) next.delete(mint);
        else next.add(mint);
        return next;
      });

      const { error } = removing
        ? await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('token_mint', mint)
        : await supabase
            .from('favorites')
            .insert({ user_id: user.id, token_mint: mint });

      if (error) setFavorites(prev); // rollback on failure
    },
    [favorites, user, supabase]
  );

  const value = useMemo(() => ({
    favorites,
    isFavorite,
    toggleFavorite,
    favoritesCount: favorites.size,
    isLoading,
  }), [favorites, isFavorite, toggleFavorite, isLoading]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
