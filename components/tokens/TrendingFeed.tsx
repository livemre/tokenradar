'use client';

import { useTranslations } from 'next-intl';
import { AnimatePresence } from 'framer-motion';
import { useTrendingTokens } from '@/lib/hooks/useTrendingTokens';
import { TrendingTokenCard } from './TrendingTokenCard';
import { TrendingPeriodTabs } from './TrendingPeriodTabs';
import { TokenFilters } from './TokenFilters';
import { Pagination } from './Pagination';
import { TrendingUp } from 'lucide-react';
import type { TrendingPeriod } from '@/lib/types/token';

export function TrendingFeed() {
  const t = useTranslations('trending');
  const {
    tokens,
    total,
    page,
    totalPages,
    isLoading,
    filters,
    setPage,
    updateFilter,
  } = useTrendingTokens();

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <TokenFilters
          onFilterChange={(f) => {
            if (f.source !== undefined) updateFilter('source', f.source || '');
            if (f.safety !== undefined) updateFilter('safety', f.safety || '');
          }}
        />
        <TrendingPeriodTabs
          period={filters.period as TrendingPeriod}
          onPeriodChange={(p) => updateFilter('period', p)}
        />
      </div>

      {/* Results */}
      {isLoading && tokens.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 w-full rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <TrendingUp size={24} className="text-muted" />
          </div>
          <p className="font-medium text-muted">{t('noTrending')}</p>
          <p className="text-sm text-muted mt-2 max-w-sm mx-auto">{t('noTrendingDesc')}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">
              {t('trendingCount', { count: total })}
            </span>
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {tokens.map((token, i) => (
                <TrendingTokenCard key={token.mint} token={token} rank={i + (page - 1) * 30} />
              ))}
            </AnimatePresence>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
