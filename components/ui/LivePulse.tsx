'use client';

import { useTranslations } from 'next-intl';

export function LivePulse({ connected }: { connected: boolean }) {
  const t = useTranslations('status');
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full ${
            connected ? 'bg-safe' : 'bg-danger'
          }`}
        />
        {connected && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-safe animate-ping opacity-75" />
        )}
      </div>
      <span className="text-xs font-mono text-muted">
        {connected ? t('live') : t('offline')}
      </span>
    </div>
  );
}
