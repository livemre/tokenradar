'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Token } from '@/lib/types/token';
import { SafetyBadge } from './SafetyBadge';
import { SourceLabel } from './SourceLabel';
import { formatUSD, truncateAddress, timeAgo } from '@/lib/utils/format';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslations } from 'next-intl';

interface TokenTableProps {
  tokens: Token[];
  isLoading: boolean;
}

export function TokenTable({ tokens, isLoading }: TokenTableProps) {
  const t = useTranslations('table');
  return (
    <div className="glass-card overflow-hidden relative">
      {isLoading && (
        <div className="absolute top-2 right-2 z-10">
          <Spinner size={14} />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
              <th className="text-left py-3 px-4 font-medium">{t('token')}</th>
              <th className="text-left py-3 px-2 font-medium">{t('source')}</th>
              <th className="text-right py-3 px-2 font-medium">{t('price')}</th>
              <th className="text-right py-3 px-2 font-medium">{t('mcap')}</th>
              <th className="text-right py-3 px-2 font-medium hidden md:table-cell">{t('liquidity')}</th>
              <th className="text-right py-3 px-2 font-medium hidden md:table-cell">{t('holders')}</th>
              <th className="text-right py-3 px-2 font-medium">{t('safety')}</th>
              <th className="text-right py-3 px-4 font-medium">{t('age')}</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <TokenRow key={token.mint} token={token} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TokenRow({ token }: { token: Token }) {
  const [imgError, setImgError] = useState(false);

  return (
    <tr className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
      <td className="py-3 px-4">
        <Link href={`/tokens/${token.mint}`} className="flex items-center gap-2 hover:text-bright transition-colors">
          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-white/10">
            {token.image_url && !imgError ? (
              <img
                src={token.image_url}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <span className="text-xs font-bold text-muted">
                {token.symbol?.[0] || '?'}
              </span>
            )}
          </div>
          <span className="font-medium truncate max-w-[120px]">
            {token.symbol || truncateAddress(token.mint)}
          </span>
        </Link>
      </td>
      <td className="py-3 px-2">
        <SourceLabel source={token.source} />
      </td>
      <td className="py-3 px-2 text-right font-mono text-xs">
        {formatUSD(token.price_usd)}
      </td>
      <td className="py-3 px-2 text-right font-mono text-xs">
        {formatUSD(token.market_cap_usd)}
      </td>
      <td className="py-3 px-2 text-right font-mono text-xs hidden md:table-cell">
        {formatUSD(token.liquidity_usd)}
      </td>
      <td className="py-3 px-2 text-right font-mono text-xs hidden md:table-cell">
        {token.holder_count?.toLocaleString() || '-'}
      </td>
      <td className="py-3 px-2 text-right">
        {token.enriched ? (
          <SafetyBadge level={token.safety_level} score={token.safety_score} />
        ) : (
          <span className="text-xs text-muted">...</span>
        )}
      </td>
      <td className="py-3 px-4 text-right text-xs text-muted">
        {timeAgo(token.detected_at)}
      </td>
    </tr>
  );
}
