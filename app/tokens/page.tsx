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
import { useTokenFeed } from '@/lib/hooks/useTokenFeed';
import { useNotificationContext } from '@/lib/context/NotificationContext';
import { Radio, Compass, Heart } from 'lucide-react';

type Tab = 'live' | 'explore' | 'favorites';

function TokensContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('tokens');
  const { addNotification } = useNotificationContext();
  const { tokens, isConnected, newTokenIds } = useTokenFeed(addNotification);
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'explore') return 'explore';
    if (tab === 'favorites') return 'favorites';
    return 'live';
  });
  const [autoFocusSearch, setAutoFocusSearch] = useState(
    () => searchParams.get('tab') === 'explore'
  );

  // React to URL changes (e.g. clicking search trigger from header)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'explore') {
      setActiveTab('explore');
      setAutoFocusSearch(true);
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
          <StatsBar tokens={tokens} />
        </div>

        {/* Tab switcher with animated indicator */}
        <div className="flex gap-1 mb-6 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/5 relative">
          <button
            onClick={() => setActiveTab('live')}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors btn-press ${
              activeTab === 'live'
                ? 'text-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Radio size={14} className={activeTab === 'live' ? 'text-safe' : ''} />
            {t('tabs.live')}
            {activeTab === 'live' && isConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors btn-press ${
              activeTab === 'explore'
                ? 'text-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Compass size={14} />
            {t('tabs.explore')}
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors btn-press ${
              activeTab === 'favorites'
                ? 'text-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Heart size={14} className={activeTab === 'favorites' ? 'text-[#ff3366]' : ''} />
            {t('tabs.favorites')}
          </button>

          {/* Sliding background */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg bg-white/10"
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              left: activeTab === 'live' ? '4px' : activeTab === 'explore' ? 'calc(33.33%)' : 'calc(66.66%)',
              width: 'calc(33.33% - 4px)',
            }}
          />
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
              <TokenFeed tokens={tokens} newTokenIds={newTokenIds} />
            ) : activeTab === 'explore' ? (
              <TokenExplorer autoFocusSearch={autoFocusSearch} onSearchFocused={() => setAutoFocusSearch(false)} />
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

export default function TokensPage() {
  return (
    <Suspense>
      <TokensContent />
    </Suspense>
  );
}
