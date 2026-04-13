'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence } from 'framer-motion';
import { TokenCard } from './TokenCard';
import { TokenCardSkeleton } from './TokenCardSkeleton';
import { TokenFilters } from './TokenFilters';
import type { Token, TokenSource, SafetyLevel } from '@/lib/types/token';
import { Eye, EyeOff, Radio, Compass, ArrowRight } from 'lucide-react';

function isAlive(t: Token): boolean {
  return !!(t.name || t.price_usd || (t.holder_count && t.holder_count > 0));
}

interface TokenFeedProps {
  tokens: Token[];
  newTokenIds: Set<string>;
  onSwitchToExplore?: () => void;
}

export function TokenFeed({ tokens, newTokenIds, onSwitchToExplore }: TokenFeedProps) {
  const t = useTranslations('feed');
  const [filters, setFilters] = useState<{
    source?: TokenSource;
    safety?: SafetyLevel;
  }>({});
  const [showDead, setShowDead] = useState(false);

  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      if (!showDead && !isAlive(t)) return false;
      if (filters.source && t.source !== filters.source) return false;
      if (filters.safety && t.safety_level !== filters.safety) return false;
      return true;
    });
  }, [tokens, filters, showDead]);

  const deadCount = useMemo(() => tokens.filter((t) => !isAlive(t)).length, [tokens]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <TokenFilters onFilterChange={setFilters} />
        <button
          onClick={() => setShowDead(!showDead)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-white/5 transition-all btn-press"
          title={showDead ? 'Hide dead tokens' : 'Show all tokens'}
        >
          {showDead ? <EyeOff size={12} /> : <Eye size={12} />}
          {showDead ? t('hideDead') : t('showHidden', { count: deadCount })}
        </button>
      </div>

      {tokens.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <TokenCardSkeleton key={i} />
          ))}
          <div className="text-center mt-6 space-y-3">
            <p className="text-xs text-muted">
              {t('waiting')}
            </p>
            {onSwitchToExplore && (
              <button
                onClick={onSwitchToExplore}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-muted hover:text-foreground hover:bg-white/[0.08] hover:border-white/[0.12] transition-all btn-press"
              >
                <Compass size={15} />
                {t('exploreOlderTokens')}
                <ArrowRight size={13} className="opacity-50" />
              </button>
            )}
          </div>
        </div>
      ) : filteredTokens.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Radio size={24} className="text-muted" />
          </div>
          <p className="font-medium text-muted">{t('noLiveTokens')}</p>
          <p className="text-xs text-muted mt-2 max-w-xs mx-auto">
            {t('analysisMessage')}
          </p>
          {onSwitchToExplore && (
            <button
              onClick={onSwitchToExplore}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-safe/10 border border-safe/20 text-sm font-semibold text-safe hover:bg-safe/15 transition-all btn-press"
            >
              <Compass size={15} />
              {t('exploreOlderTokens')}
              <ArrowRight size={13} />
            </button>
          )}
          {deadCount > 0 && (
            <button
              onClick={() => setShowDead(true)}
              className="mt-3 block mx-auto text-xs text-muted hover:text-foreground underline transition-colors"
            >
              {t('showUnverified', { count: deadCount })}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">
              {t('liveTokens', { count: filteredTokens.length })}
            </span>
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {filteredTokens.map((token) => (
                <TokenCard
                  key={token.mint}
                  token={token}
                  isNew={newTokenIds.has(token.mint)}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
