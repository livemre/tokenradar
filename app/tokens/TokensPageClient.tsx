'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { StatsBar } from '@/components/layout/StatsBar';
import { Footer } from '@/components/layout/Footer';
import { TokenFeed } from '@/components/tokens/TokenFeed';
import { TokenExplorer } from '@/components/tokens/TokenExplorer';
import { FavoritesList } from '@/components/tokens/FavoritesList';
import { TrendingFeed } from '@/components/tokens/TrendingFeed';
import { useTokenFeed } from '@/lib/hooks/useTokenFeed';
import { useNotificationContext } from '@/lib/context/NotificationContext';
import type { TokenSource } from '@/lib/types/token';
import { Radio, Compass, TrendingUp, Eye } from 'lucide-react';

type Tab = 'live' | 'explore' | 'trending' | 'favorites';

function TokensContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('tokens');
  const { addNotification } = useNotificationContext();
  const { tokens, isConnected, newTokenIds } = useTokenFeed(addNotification);
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'explore') return 'explore';
    if (tab === 'trending') return 'trending';
    if (tab === 'favorites') return 'favorites';
    return 'live';
  });
  const [exploreSource, setExploreSource] = useState<TokenSource | ''>('');
  const [autoFocusSearch, setAutoFocusSearch] = useState(
    () => searchParams.get('tab') === 'explore'
  );

  // React to URL changes (e.g. clicking search trigger from header)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'explore') {
      setActiveTab('explore');
      setAutoFocusSearch(true);
    } else if (tab === 'trending') {
      setActiveTab('trending');
    } else if (tab === 'favorites') {
      setActiveTab('favorites');
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header isConnected={isConnected} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('title')} <span className="text-gradient-brand">{t('titleHighlight')}</span>
              </h1>
              <p className="text-sm text-muted mt-1">
                {t('subtitle')}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono">{tokens.length}</span>
              <span className="text-xs text-muted block">{t('tracked')}</span>
            </div>
          </div>
          <StatsBar />
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-6 p-1 bg-white/[0.03] rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
          {([
            { id: 'live' as Tab, icon: <Radio size={14} className={activeTab === 'live' ? 'text-safe' : ''} />, label: t('tabs.live'), extra: activeTab === 'live' && isConnected ? <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" /> : null },
            { id: 'explore' as Tab, icon: <Compass size={14} />, label: t('tabs.explore') },
            { id: 'trending' as Tab, icon: <TrendingUp size={14} className={activeTab === 'trending' ? 'text-warning' : ''} />, label: t('tabs.trending') },
            { id: 'favorites' as Tab, icon: <Eye size={14} className={activeTab === 'favorites' ? 'text-accent' : ''} />, label: t('tabs.favorites') },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors btn-press ${
                activeTab === tab.id
                  ? 'text-foreground bg-white/10'
                  : 'text-muted hover:text-foreground hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.extra}
            </button>
          ))}
        </div>

        {/* Tab content with cross-fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'live' ? (
              <TokenFeed tokens={tokens} newTokenIds={newTokenIds} onSwitchToExplore={(source) => { setExploreSource(source || ''); setActiveTab('explore'); }} />
            ) : activeTab === 'explore' ? (
              <TokenExplorer autoFocusSearch={autoFocusSearch} onSearchFocused={() => setAutoFocusSearch(false)} initialSource={exploreSource} />
            ) : activeTab === 'trending' ? (
              <TrendingFeed />
            ) : (
              <FavoritesList />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default function TokensPageClient() {
  return (
    <Suspense>
      <TokensContent />
    </Suspense>
  );
}
