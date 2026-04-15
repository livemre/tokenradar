'use client';

import useSWR from 'swr';
import { Activity, Shield, Coins, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatsData {
  total: number;
  safe: number;
  safePercent: number;
  recent5min: number;
  ratePerMin: number;
  today: number;
  trending: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function StatsBar() {
  const t = useTranslations('stats');
  const { data } = useSWR<StatsData>('/api/tokens/stats', fetcher, {
    refreshInterval: 60_000,
    keepPreviousData: true,
  });

  const total = data?.total ?? 0;
  const safePercent = data?.safePercent ?? 0;
  const recent5min = data?.recent5min ?? 0;
  const today = data?.today ?? 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
      <StatCard
        icon={<Coins size={14} />}
        label={t('totalTokens')}
        value={total.toLocaleString()}
        gradient="from-blue-500/10 to-purple-500/10"
        iconColor="text-accent"
      />
      <StatCard
        icon={<Shield size={14} />}
        label={t('safeRate')}
        value={`${safePercent}%`}
        valueColor={safePercent > 30 ? 'text-safe' : 'text-danger'}
        gradient="from-emerald-500/10 to-green-500/10"
        iconColor="text-safe"
      />
      <StatCard
        icon={<Activity size={14} />}
        label={t('last5min')}
        value={recent5min.toLocaleString()}
        gradient="from-green-500/10 to-cyan-500/10"
        iconColor="text-safe"
      />
      <StatCard
        icon={<Clock size={14} />}
        label={t('last24h')}
        value={today.toLocaleString()}
        gradient="from-orange-500/10 to-yellow-500/10"
        iconColor="text-warning"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  valueColor,
  gradient,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  gradient: string;
  iconColor: string;
}) {
  return (
    <div className={`glass-card p-3 bg-gradient-to-br ${gradient}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
        <span className={iconColor}>{icon}</span>
        {label}
      </div>
      <div className={`text-lg font-bold font-mono ${valueColor || ''}`}>
        {value}
      </div>
    </div>
  );
}
