'use client';

import { use } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TokenDetail } from '@/components/tokens/TokenDetail';
import { TokenDetailSkeleton } from '@/components/tokens/TokenDetailSkeleton';
import { useTokenDetail } from '@/lib/hooks/useTokenDetail';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function TokenPageClient({ mint }: { mint: string }) {
  const { token, isLoading, error } = useTokenDetail(mint);
  const t = useTranslations('detail');

  return (
    <div className="flex flex-col min-h-screen">
      <Header isConnected={true} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Link
          href="/tokens"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-6 btn-press"
        >
          <ArrowLeft size={14} />
          {t('backToRadar')}
        </Link>

        {isLoading ? (
          <TokenDetailSkeleton />
        ) : error || !token ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <SearchX size={28} className="text-muted" />
            </div>
            <p className="text-lg font-medium">{t('tokenNotFound')}</p>
            <p className="text-sm text-muted mt-2">
              {t('tokenNotFoundDesc')}
            </p>
            <Link
              href="/tokens"
              className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors btn-press"
            >
              <ArrowLeft size={14} />
              {t('backToRadar')}
            </Link>
          </div>
        ) : (
          <TokenDetail token={token} />
        )}
      </main>

      <Footer />
    </div>
  );
}
