'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence } from 'framer-motion';
import { useTokenList } from '@/lib/hooks/useTokenList';
import { TokenCard } from './TokenCard';
import { TokenCardSkeleton } from './TokenCardSkeleton';
import { TokenRowSkeleton } from './TokenRowSkeleton';
import { TokenTable } from './TokenTable';
import { TokenSearch } from './TokenSearch';
import { TokenFilters } from './TokenFilters';
import { SortTabs } from './SortTabs';
import { Pagination } from './Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { RotateCw, LayoutGrid, LayoutList, SearchX } from 'lucide-react';

type ViewMode = 'cards' | 'table';

interface TokenExplorerProps {
  autoFocusSearch?: boolean;
  onSearchFocused?: () => void;
}

export function TokenExplorer({ autoFocusSearch, onSearchFocused }: TokenExplorerProps = {}) {
  const {
    tokens,
    total,
    page,
    totalPages,
    isLoading,
    filters,
    setPage,
    updateFilter,
    resetFilters,
  } = useTokenList();

  const t = useTranslations('explorer');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const hasActiveFilters = filters.search || filters.source || filters.safety || filters.minMcap || filters.maxMcap || filters.minHolders;

  return (
    <div className="space-y-4">
      {/* Search */}
      <TokenSearch
        value={filters.search}
        onChange={(v) => updateFilter('search', v)}
        autoFocus={autoFocusSearch}
        onFocused={onSearchFocused}
      />

      {/* Filters + Sort + View toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <TokenFilters
          onFilterChange={(f) => {
            if (f.source !== undefined) updateFilter('source', f.source || '');
            if (f.safety !== undefined) updateFilter('safety', f.safety || '');
          }}
        />
        <div className="flex items-center gap-2">
          <SortTabs
            sort={filters.sort}
            order={filters.order}
            onSortChange={(s) => updateFilter('sort', s)}
            onOrderToggle={() => updateFilter('order', filters.order === 'desc' ? 'asc' : 'desc')}
          />
          {/* View toggle */}
          <div className="flex gap-1 ml-2 border-l border-border pl-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors btn-press ${
                viewMode === 'cards' ? 'bg-white/10 text-foreground' : 'text-muted hover:bg-white/5'
              }`}
              title={t('cardView')}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors btn-press ${
                viewMode === 'table' ? 'bg-white/10 text-foreground' : 'text-muted hover:bg-white/5'
              }`}
              title={t('tableView')}
            >
              <LayoutList size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">
            {t('results', { count: total.toLocaleString() })}
          </span>
          <button
            onClick={resetFilters}
            className="text-xs text-muted hover:text-foreground flex items-center gap-1 transition-colors btn-press"
          >
            <RotateCw size={10} />
            {t('clearFilters')}
          </button>
        </div>
      )}

      {/* Results */}
      {isLoading && tokens.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            viewMode === 'cards' ? <TokenCardSkeleton key={i} /> : <TokenRowSkeleton key={i} />
          ))}
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <SearchX size={24} className="text-muted" />
          </div>
          <p className="font-medium text-muted">{t('noTokens')}</p>
          <p className="text-sm text-muted mt-2">
            {hasActiveFilters ? t('adjustFilters') : t('noDatabase')}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-sm bg-white/5 rounded-lg hover:bg-white/10 transition-colors btn-press"
            >
              {t('clearAllFilters')}
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <>
          <TokenTable tokens={tokens} isLoading={isLoading} />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      ) : (
        <>
          <div className="space-y-2 relative">
            {isLoading && (
              <div className="absolute top-0 right-0 z-10">
                <Spinner size={16} />
              </div>
            )}
            <AnimatePresence initial={false}>
              {tokens.map((token) => (
                <TokenCard key={token.mint} token={token} isNew={false} />
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
