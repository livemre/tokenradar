'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { TrendingToken } from '@/lib/types/token';
import { SafetyBadge } from './SafetyBadge';
import { SourceLabel } from './SourceLabel';
import { FavoriteButton } from './FavoriteButton';
import { TrendingBadge } from './TrendingBadge';
import { formatUSD, truncateAddress } from '@/lib/utils/format';
import { Flame } from 'lucide-react';

interface TrendingTokenCardProps {
  token: TrendingToken;
  rank: number;
}

export const TrendingTokenCard = memo(function TrendingTokenCard({ token, rank }: TrendingTokenCardProps) {
  const [imgError, setImgError] = useState(false);
  const metrics = token.trending_metrics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.03 }}
      className="glass-card-interactive"
    >
      <Link href={`/tokens/${token.mint}`} className="block p-4 rounded-xl">
        <div className="flex items-center justify-between gap-4">
          {/* Rank + Image + Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-lg font-bold text-muted w-6 text-center shrink-0 font-mono">
              {rank + 1}
            </span>

            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-white/10">
              {token.image_url && !imgError ? (
                <img
                  src={token.image_url}
                  alt={token.symbol ? `${token.symbol} logo` : 'Token logo'}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              ) : (
                <span className="text-base font-bold text-muted">
                  {token.symbol?.[0] || '?'}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">
                  {token.symbol || truncateAddress(token.mint)}
                </span>
                <SourceLabel source={token.source} />
                {token.trending_score >= 50 && (
                  <Flame size={12} className="text-warning shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <TrendingBadge value={metrics.volume_change_pct} label="vol" />
                <TrendingBadge value={metrics.holder_change_pct} label="holders" />
                <TrendingBadge value={metrics.price_change_pct} label="price" compact />
              </div>
            </div>
          </div>

          {/* Price + MCap */}
          <div className="hidden sm:block text-right shrink-0">
            {token.price_usd != null ? (
              <span className="text-sm font-mono font-semibold">
                {formatUSD(token.price_usd)}
              </span>
            ) : (
              <span className="text-sm font-mono text-muted">--</span>
            )}
            {token.market_cap_usd != null && (
              <span className="block text-xs text-muted font-mono">
                MCap {formatUSD(token.market_cap_usd)}
              </span>
            )}
          </div>

          {/* Safety + Favorite */}
          <div className="flex items-center gap-2 shrink-0">
            <SafetyBadge level={token.safety_level} score={token.safety_score} />
            <FavoriteButton mint={token.mint} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
