'use client';

import type { TrendingPeriod } from '@/lib/types/token';

const PERIOD_OPTIONS: { value: TrendingPeriod; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '6h', label: '6H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
];

interface TrendingPeriodTabsProps {
  period: TrendingPeriod;
  onPeriodChange: (period: TrendingPeriod) => void;
}

export function TrendingPeriodTabs({ period, onPeriodChange }: TrendingPeriodTabsProps) {
  return (
    <div className="flex items-center gap-1">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onPeriodChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all btn-press ${
            period === opt.value
              ? 'bg-white/10 text-foreground'
              : 'text-muted hover:bg-white/5 hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
