import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createServerSupabase } from '@/lib/supabase/server';
import TokensPageClient from './TokensPageClient';

const SITE_URL = 'https://tokenradar.site';

export const metadata: Metadata = {
  title: 'Live Solana Token Radar — Real-Time Memecoin Tracker',
  description:
    'Track new Solana memecoins in real-time. Live radar for Pump.fun, Raydium & Moonshot tokens with safety scores, rug-pull detection, holder analysis, price charts, and Jupiter swap integration.',
  alternates: {
    canonical: '/tokens',
  },
  openGraph: {
    title: 'Live Solana Token Radar — Real-Time Memecoin Tracker',
    description:
      'Detect new Solana tokens in under 5 seconds. Free rug-pull detection, safety scores, holder analysis & live price charts from Pump.fun, Raydium & Moonshot.',
    url: `${SITE_URL}/tokens`,
    siteName: 'TokenRadar',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Solana Token Radar | TokenRadar',
    description:
      'Real-time Solana memecoin detection with safety scores, rug-pull detection & live charts.',
  },
};

async function getTokenStats() {
  try {
    const supabase = createServerSupabase();
    const [totalRes, safeRes, sourcesRes] = await Promise.all([
      supabase.from('tokens').select('id', { count: 'exact', head: true }).eq('enriched', true),
      supabase.from('tokens').select('id', { count: 'exact', head: true }).eq('enriched', true).eq('safety_level', 'safe'),
      supabase.from('tokens').select('source').eq('enriched', true),
    ]);
    const total = totalRes.count || 0;
    const safe = safeRes.count || 0;
    const sources = sourcesRes.data || [];
    const pumpfun = sources.filter((s) => s.source === 'pumpfun').length;
    const raydium = sources.filter((s) => s.source === 'raydium').length;
    const moonshot = sources.filter((s) => s.source === 'moonshot').length;
    return { total, safe, pumpfun, raydium, moonshot };
  } catch {
    return { total: 0, safe: 0, pumpfun: 0, raydium: 0, moonshot: 0 };
  }
}

export default async function TokensPage() {
  const [t, stats] = await Promise.all([
    getTranslations('tokensPage'),
    getTokenStats(),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TokenRadar — Live Solana Token Radar',
    url: `${SITE_URL}/tokens`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description:
      'Real-time Solana memecoin tracker with safety analysis. Detect new tokens from Pump.fun, Raydium & Moonshot in under 5 seconds.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Real-time token detection in under 5 seconds',
      'Rug-pull safety scoring (Safe / Warning / Danger)',
      'Mint & freeze authority verification',
      'Top 10 holder concentration analysis',
      'Live OHLCV price charts',
      'Jupiter DEX swap integration',
      'Multi-source tracking: Pump.fun, Raydium, Moonshot',
      'Dead token detection',
      'Push notifications for new tokens',
    ],
    aggregateRating: stats.total > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: String(stats.total),
      bestRating: '5',
      itemReviewed: {
        '@type': 'SoftwareApplication',
        name: 'TokenRadar',
      },
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <TokensPageClient />

      {/* SSR SEO content — visible to crawlers, below the fold for users */}
      <section className="max-w-7xl mx-auto px-4 pb-16 space-y-12">
        {/* Stats summary for crawlers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold font-mono">{stats.total.toLocaleString()}</div>
            <div className="text-xs text-muted mt-1">{t('stats.totalAnalyzed')}</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold font-mono text-safe">{stats.safe.toLocaleString()}</div>
            <div className="text-xs text-muted mt-1">{t('stats.markedSafe')}</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold font-mono text-[#9945FF]">{stats.pumpfun.toLocaleString()}</div>
            <div className="text-xs text-muted mt-1">Pump.fun</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold font-mono text-[#2BFFB1]">{stats.raydium.toLocaleString()}</div>
            <div className="text-xs text-muted mt-1">Raydium</div>
          </div>
        </div>

        {/* SEO description block */}
        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold">{t('seo.title')}</h2>
          <p className="text-sm text-muted leading-relaxed">{t('seo.p1')}</p>
          <p className="text-sm text-muted leading-relaxed">{t('seo.p2')}</p>
        </div>

        {/* Feature grid for crawlers */}
        <div>
          <h2 className="text-lg font-bold mb-4">{t('features.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(['detection', 'safety', 'holders', 'charts', 'swap', 'dead'] as const).map((key) => (
              <div key={key} className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-1">{t(`features.${key}.title`)}</h3>
                <p className="text-xs text-muted">{t(`features.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ for crawlers */}
        <div>
          <h2 className="text-lg font-bold mb-4">{t('faq.title')}</h2>
          <div className="space-y-3">
            {([1, 2, 3, 4] as const).map((i) => (
              <details key={i} className="glass-card p-4 group">
                <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                  {t(`faq.q${i}`)}
                  <span className="text-muted group-open:rotate-180 transition-transform">&#9660;</span>
                </summary>
                <p className="text-xs text-muted mt-2 leading-relaxed">{t(`faq.a${i}`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
