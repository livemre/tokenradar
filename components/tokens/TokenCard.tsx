'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Token } from '@/lib/types/token';
import { SafetyBadge } from './SafetyBadge';
import { SourceLabel } from './SourceLabel';
import { FavoriteButton } from './FavoriteButton';
import { formatUSD, truncateAddress } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { Clock, Users, Droplets } from 'lucide-react';

interface TokenCardProps {
  token: Token;
  isNew?: boolean;
}

function useLiveAge(detectedAt: string) {
  const [age, setAge] = useState('');

  useEffect(() => {
    const update = () => {
      const seconds = Math.floor((Date.now() - new Date(detectedAt).getTime()) / 1000);
      if (seconds < 60) {
        setAge(`${seconds}s`);
      } else if (seconds < 3600) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        setAge(`${m}m ${s}s`);
      } else if (seconds < 86400) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        setAge(`${h}h ${m}m`);
      } else {
        setAge(`${Math.floor(seconds / 86400)}d`);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [detectedAt]);

  return age;
}

export function TokenCard({ token, isNew = false }: TokenCardProps) {
  const age = useLiveAge(token.detected_at);
  const [imgError, setImgError] = useState(false);

  const glowClass = token.enriched
    ? token.safety_level === 'safe'
      ? 'glow-safe'
      : token.safety_level === 'warning'
        ? 'glow-warning'
        : token.safety_level === 'danger'
          ? 'glow-danger'
          : ''
    : '';

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: -20, scale: 0.98 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`glass-card-interactive ${glowClass} ${isNew ? 'glow-new' : ''}`}
    >
      <Link href={`/tokens/${token.mint}`} className="block p-4 rounded-xl">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Image + Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-white/10">
              {token.image_url && !imgError ? (
                <img
                  src={token.image_url}
                  alt=""
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
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                <span className="flex items-center gap-1 font-mono age-pulse">
                  <Clock size={10} />
                  {age}
                </span>
                {token.holder_count != null && token.holder_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {token.holder_count.toLocaleString()}
                  </span>
                )}
                {token.liquidity_usd != null && (
                  <span className="flex items-center gap-1">
                    <Droplets size={10} />
                    {formatUSD(token.liquidity_usd)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Price (desktop) */}
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

          {/* Right: Safety badge + Favorite */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-end gap-1">
              {token.enriched ? (
                <SafetyBadge level={token.safety_level} score={token.safety_score} />
              ) : (
                <Skeleton className="w-16 h-6" />
              )}
              {/* Mobile price */}
              <span className="sm:hidden text-sm font-mono text-muted">
                {token.market_cap_usd ? formatUSD(token.market_cap_usd) : '-'}
              </span>
            </div>
            <FavoriteButton mint={token.mint} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
