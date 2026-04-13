'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { Token } from '@/lib/types/token';
import { SafetyBadge } from './SafetyBadge';
import { SourceLabel } from './SourceLabel';
import { FavoriteButton } from './FavoriteButton';
import { PriceChart } from './PriceChart';
import { SwapWidget } from './SwapWidget';
import { Card } from '@/components/ui/Card';
import { formatUSD, formatPercent, truncateAddress, timeAgo, formatLocalTime } from '@/lib/utils/format';
import {
  Shield,
  Clock,
  Users,
  Droplets,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  Rocket,
  TrendingUp,
  DollarSign,
  Activity,
} from 'lucide-react';

type DetailTab = 'overview' | 'chart' | 'trade' | 'safety';

export function TokenDetail({ token }: { token: Token }) {
  const t = useTranslations('detail');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [imgError, setImgError] = useState(false);

  const copyMint = () => {
    navigator.clipboard.writeText(token.mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { key: DetailTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: t('tabs.overview'), icon: <BarChart3 size={14} /> },
    { key: 'chart', label: t('tabs.chart'), icon: <TrendingUp size={14} /> },
    { key: 'trade', label: t('tabs.trade'), icon: <ArrowRightLeft size={14} /> },
    { key: 'safety', label: t('tabs.safety'), icon: <Shield size={14} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Hero section — always visible */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          {/* Token image */}
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden ring-2 ring-white/10 shrink-0">
            {token.image_url && !imgError ? (
              <img
                src={token.image_url}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-2xl font-bold text-muted">{token.symbol?.[0] || '?'}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{token.symbol || 'Unknown'}</h1>
              {token.name && <span className="text-sm text-muted">{token.name}</span>}
              <SourceLabel source={token.source} />
              <SafetyBadge level={token.safety_level} score={token.safety_score} />
              <FavoriteButton mint={token.mint} size={20} />
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-muted">
              <span className="font-mono">{truncateAddress(token.mint, 8)}</span>
              <button onClick={copyMint} className="hover:text-foreground transition-colors btn-press">
                {copied ? <Check size={14} className="text-safe" /> : <Copy size={14} />}
              </button>
              <a
                href={`https://solscan.io/token/${token.mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Key metric on right (desktop) */}
          <div className="text-right hidden sm:block shrink-0">
            <div className="text-2xl font-bold font-mono">{formatUSD(token.price_usd)}</div>
            <div className="text-sm text-muted font-mono">{t('mcap')} {formatUSD(token.market_cap_usd)}</div>
          </div>
        </div>

        {/* Mobile price (visible on sm down) */}
        <div className="sm:hidden mt-4 flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wider">{t('price')}</div>
            <div className="text-xl font-bold font-mono">{formatUSD(token.price_usd)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted uppercase tracking-wider">{t('mcap')}</div>
            <div className="text-lg font-semibold font-mono">{formatUSD(token.market_cap_usd)}</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          <MiniStat label={t('stats.marketCap')} value={formatUSD(token.market_cap_usd)} icon={<DollarSign size={12} />} />
          <MiniStat label={t('stats.price')} value={formatUSD(token.price_usd)} icon={<TrendingUp size={12} />} />
          <MiniStat label={t('stats.liquidity')} value={formatUSD(token.liquidity_usd)} icon={<Droplets size={12} />} />
          <MiniStat label={t('stats.volume24h')} value={formatUSD(token.volume_24h_usd)} icon={<Activity size={12} />} />
          <MiniStat label={t('stats.holders')} value={token.holder_count?.toLocaleString() || '-'} icon={<Users size={12} />} />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all btn-press ${
              activeTab === tab.key
                ? 'bg-white/10 text-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Chart with stats sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
                <Card className="p-0 overflow-hidden">
                  <PriceChart mint={token.mint} />
                </Card>

                {/* Side stats panel (desktop) */}
                <div className="space-y-3">
                  <Card className="p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">{t('sidebar.keyMetrics')}</h3>
                    <div className="space-y-3">
                      <StatRow label={t('stats.price')} value={formatUSD(token.price_usd)} icon={<TrendingUp size={12} />} />
                      <StatRow label={t('stats.marketCap')} value={formatUSD(token.market_cap_usd)} icon={<DollarSign size={12} />} />
                      <StatRow label={t('stats.liquidity')} value={formatUSD(token.liquidity_usd)} icon={<Droplets size={12} />} />
                      <StatRow label={t('stats.volume24h')} value={formatUSD(token.volume_24h_usd)} icon={<Activity size={12} />} />
                      <StatRow label={t('stats.holders')} value={token.holder_count?.toLocaleString() || '-'} icon={<Users size={12} />} />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">{t('sidebar.safety')}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <SafetyBadge level={token.safety_level} score={token.safety_score} />
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted">{t('safety.mintAuthority')}</span>
                        <span className={token.mint_authority ? 'text-danger' : 'text-safe'}>
                          {token.mint_authority === null ? t('safety.unknown') : token.mint_authority ? t('safety.enabled') : t('safety.revoked')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">{t('safety.freezeAuthority')}</span>
                        <span className={token.freeze_authority ? 'text-danger' : 'text-safe'}>
                          {token.freeze_authority === null ? t('safety.unknown') : token.freeze_authority ? t('safety.enabled') : t('safety.revoked')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">{t('safety.top10Holders')}</span>
                        <span className={token.top_holder_pct !== null && token.top_holder_pct > 50 ? 'text-danger' : ''}>
                          {formatPercent(token.top_holder_pct)}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">{t('sidebar.info')}</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted">{t('info.source')}</span>
                        <SourceLabel source={token.source} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">{t('info.detected')}</span>
                        <span title={formatLocalTime(token.detected_at)}>{timeAgo(token.detected_at)}</span>
                      </div>
                      {token.enriched_at && (
                        <div className="flex justify-between">
                          <span className="text-muted">{t('info.analyzed')}</span>
                          <span title={formatLocalTime(token.enriched_at)}>{timeAgo(token.enriched_at)}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Trade links */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <CompactTradeLink label="Jupiter" href={`https://jup.ag/swap/SOL-${token.mint}`} color="#00ff88" />
                {token.source === 'pumpfun' && (
                  <CompactTradeLink label="Pump.fun" href={`https://pump.fun/coin/${token.mint}`} color="#9945FF" />
                )}
                <CompactTradeLink label="DexScreener" href={`https://dexscreener.com/solana/${token.mint}`} color="#4ade80" />
                <CompactTradeLink label="Birdeye" href={`https://birdeye.so/token/${token.mint}?chain=solana`} color="#f59e0b" />
                <CompactTradeLink label="Solscan" href={`https://solscan.io/token/${token.mint}`} color="#8b5cf6" />
                {token.source === 'raydium' && token.pool_address && (
                  <CompactTradeLink label="Raydium" href={`https://raydium.io/swap/?inputMint=sol&outputMint=${token.mint}`} color="#2BFFB1" />
                )}
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
              <Card className="p-0 overflow-hidden">
                <PriceChart mint={token.mint} />
              </Card>

              {/* Side stats panel */}
              <div className="space-y-3">
                <Card className="p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">{t('chart.marketData')}</h3>
                  <div className="space-y-3">
                    <StatRow label={t('stats.price')} value={formatUSD(token.price_usd)} icon={<TrendingUp size={12} />} highlight />
                    <StatRow label={t('stats.marketCap')} value={formatUSD(token.market_cap_usd)} icon={<DollarSign size={12} />} />
                    <StatRow label={t('stats.liquidity')} value={formatUSD(token.liquidity_usd)} icon={<Droplets size={12} />} />
                    <StatRow label={t('stats.volume24h')} value={formatUSD(token.volume_24h_usd)} icon={<Activity size={12} />} />
                    <StatRow label={t('stats.holders')} value={token.holder_count?.toLocaleString() || '-'} icon={<Users size={12} />} />
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">{t('chart.quickTrade')}</h3>
                  <div className="space-y-2">
                    <a
                      href={`https://jup.ag/swap/SOL-${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-safe/10 text-safe border border-safe/30 hover:bg-safe/20 transition-all btn-press"
                    >
                      <ArrowRightLeft size={14} />
                      {t('chart.buyOnJupiter')}
                    </a>
                    <a
                      href={`https://dexscreener.com/solana/${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-medium bg-white/5 text-muted border border-white/5 hover:bg-white/10 hover:text-foreground transition-all btn-press"
                    >
                      <BarChart3 size={12} />
                      DexScreener
                    </a>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'trade' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ArrowRightLeft size={18} />
                  {t('trade.header')}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <TradeLink
                    label={t('chart.buyOnJupiter')}
                    href={`https://jup.ag/swap/SOL-${token.mint}`}
                    icon={<ArrowRightLeft size={16} />}
                    color="#00ff88"
                    primary
                  />
                  {token.source === 'pumpfun' && (
                    <TradeLink
                      label="Pump.fun"
                      href={`https://pump.fun/coin/${token.mint}`}
                      icon={<Rocket size={16} />}
                      color="#9945FF"
                    />
                  )}
                  <TradeLink
                    label="DexScreener"
                    href={`https://dexscreener.com/solana/${token.mint}`}
                    icon={<BarChart3 size={16} />}
                    color="#4ade80"
                  />
                  <TradeLink
                    label="Birdeye"
                    href={`https://birdeye.so/token/${token.mint}?chain=solana`}
                    icon={<BarChart3 size={16} />}
                    color="#f59e0b"
                  />
                  <TradeLink
                    label="Solscan"
                    href={`https://solscan.io/token/${token.mint}`}
                    icon={<ExternalLink size={16} />}
                    color="#8b5cf6"
                  />
                  {token.source === 'raydium' && token.pool_address && (
                    <TradeLink
                      label="Raydium"
                      href={`https://raydium.io/swap/?inputMint=sol&outputMint=${token.mint}`}
                      icon={<ArrowRightLeft size={16} />}
                      color="#2BFFB1"
                    />
                  )}
                </div>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ArrowRightLeft size={18} />
                  {t('trade.quickSwap')}
                </h2>
                <SwapWidget tokenMint={token.mint} tokenSymbol={token.symbol || 'TOKEN'} />
              </Card>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-6">
              <Card>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield size={18} />
                  {t('safety.analysis')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SafetyRow
                    label={t('safety.mintAuthority')}
                    value={token.mint_authority === null ? t('safety.unknown') : token.mint_authority ? t('safety.enabled') : t('safety.revoked')}
                    isRisk={token.mint_authority === true}
                  />
                  <SafetyRow
                    label={t('safety.freezeAuthority')}
                    value={token.freeze_authority === null ? t('safety.unknown') : token.freeze_authority ? t('safety.enabled') : t('safety.revoked')}
                    isRisk={token.freeze_authority === true}
                  />
                  <SafetyRow
                    label={t('safety.top10Holders')}
                    value={formatPercent(token.top_holder_pct)}
                    isRisk={token.top_holder_pct !== null && token.top_holder_pct > 50}
                  />
                  <SafetyRow
                    label={t('safety.rugStatus')}
                    value={token.is_rugged ? t('safety.rugged') : t('safety.notRugged')}
                    isRisk={token.is_rugged}
                  />
                </div>
              </Card>

              {token.risk_details && token.risk_details.length > 0 && (
                <Card>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    {t('safety.riskDetails')}
                  </h2>
                  <div className="space-y-2">
                    {token.risk_details.map((risk, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"
                      >
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: risk.level === 'danger' ? '#ff3366' : risk.level === 'warn' ? '#ffaa00' : '#666' }}
                        />
                        <div>
                          <span className="text-sm font-medium">{risk.name}</span>
                          <p className="text-xs text-muted">{risk.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Meta info */}
              <div className="text-xs text-muted flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {t('info.detected')} {timeAgo(token.detected_at)}
                </span>
                {token.enriched_at && (
                  <span>{t('info.analyzed')} {timeAgo(token.enriched_at)}</span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───── Sub-components ───── */

function MiniStat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
      <div className="text-[10px] text-muted flex items-center justify-center gap-1 uppercase tracking-wider">
        {icon} {label}
      </div>
      <div className="text-lg font-semibold font-mono mt-1">{value}</div>
    </div>
  );
}

function StatRow({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-xs text-muted">
        {icon}
        {label}
      </span>
      <span className={`font-mono text-sm ${highlight ? 'font-bold text-foreground' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
}

function CompactTradeLink({ label, href, color }: { label: string; href: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] btn-press"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
      <ExternalLink size={10} className="opacity-50" />
    </a>
  );
}

function TradeLink({
  label,
  href,
  icon,
  color,
  primary = false,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] btn-press ${
        primary ? 'text-black' : ''
      }`}
      style={{
        backgroundColor: primary ? color : `${color}15`,
        color: primary ? '#000' : color,
        border: `1px solid ${color}${primary ? '' : '30'}`,
      }}
    >
      {icon}
      {label}
      <ExternalLink size={12} className="opacity-50" />
    </a>
  );
}

function SafetyRow({ label, value, isRisk }: { label: string; value: string; isRisk: boolean }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
      <span className="text-sm text-muted">{label}</span>
      <span className={`text-sm font-medium ${isRisk ? 'text-danger' : 'text-safe'}`}>
        {value}
      </span>
    </div>
  );
}
