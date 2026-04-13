'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Notification } from '@/lib/hooks/useNotifications';
import { SourceLabel } from '@/components/tokens/SourceLabel';
import { SafetyBadge } from '@/components/tokens/SafetyBadge';
import { timeAgo, formatUSD } from '@/lib/utils/format';

export function NotificationItem({ notification }: { notification: Notification }) {
  const { token } = notification;
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/tokens/${token.mint}`}
      className={`flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-border btn-press ${
        !notification.read ? 'bg-white/[0.02]' : ''
      }`}
    >
      {/* Unread dot */}
      <div className="w-2 shrink-0">
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-safe" />
        )}
      </div>

      {/* Token image */}
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-white/10">
        {token.image_url && !imgError ? (
          <img
            src={token.image_url}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className="text-xs font-bold text-muted">{token.symbol?.[0] || '?'}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {token.symbol || 'Unknown'}
          </span>
          <SourceLabel source={token.source} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {token.enriched && (
            <SafetyBadge level={token.safety_level} />
          )}
          <span className="text-[10px] text-muted">{timeAgo(new Date(notification.timestamp))}</span>
        </div>
      </div>

      {/* Price */}
      {token.price_usd != null && (
        <span className="text-[10px] font-mono text-muted shrink-0">
          {formatUSD(token.price_usd)}
        </span>
      )}
    </Link>
  );
}
