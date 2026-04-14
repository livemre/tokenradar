'use client';

import { Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { useAuth } from '@/lib/context/AuthContext';

interface FavoriteButtonProps {
  mint: string;
  size?: number;
  className?: string;
}

export function FavoriteButton({ mint, size = 16, className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user, openLoginModal } = useAuth();
  const active = isFavorite(mint);

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          openLoginModal();
          return;
        }
        toggleFavorite(mint);
      }}
      className={`p-1.5 rounded-lg transition-colors ${
        active
          ? 'text-accent bg-accent/10'
          : 'text-muted hover:text-foreground hover:bg-white/5'
      } ${className}`}
      aria-label={active ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <Bookmark
        size={size}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={active ? 0 : 2}
      />
    </motion.button>
  );
}
