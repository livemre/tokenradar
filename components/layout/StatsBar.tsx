'use client';

import type { Token } from '@/lib/types/token';
import { Activity, TrendingUp, Shield, Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatsBarProps {
  tokens: Token[];
}

export function StatsBar({ tokens }: StatsBarProps) {
  const t = useTranslations('stats');
  const totalTokens = tokens.length;
  const safeTokens = tokens.filter((t) => t.safety_level === 'safe').length;
  const safePercent = totalTokens > 0 ? Math.round((safeTokens / totalTokens) * 100) : 0;

  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const recentCount = tokens.filter(
    (t) => new Date(t.detected_at).getTime() > fiveMinAgo
  ).length;
  const tokensPerMin = totalTokens > 0 ? Math.round(recentCount / 5) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
      <StatCard
        icon={<Activity size={14} />}
        label={t('rate')}
        value={`${tokensPerMin}/min`}
        gradient="from-green-500/10 to-cyan-500/10"
        iconColor="text-safe"
      />
      <StatCard
        icon={<Coins size={14} />}
        label={t('totalTokens')}
        value={totalTokens.toString()}
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
        icon={<TrendingUp size={14} />}
        label={t('last5min')}
        value={recentCount.toString()}
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
