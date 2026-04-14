'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendingBadgeProps {
  value: number | null;
  label: string;
  compact?: boolean;
}

export function TrendingBadge({ value, label, compact = false }: TrendingBadgeProps) {
  if (value === null) return null;

  const isPositive = value > 0;
  const color = isPositive ? 'text-safe' : 'text-danger';
  const bgColor = isPositive ? 'bg-safe/10' : 'bg-danger/10';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const sign = isPositive ? '+' : '';
  const displayValue = Math.abs(value) >= 1000
    ? `${(value / 1000).toFixed(0)}K`
    : Math.abs(value) >= 100
      ? Math.round(value).toString()
      : value.toFixed(1);

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${color} ${bgColor}`}>
      <Icon size={10} />
      {sign}{displayValue}%
      {!compact && <span className="opacity-70">{label}</span>}
    </span>
  );
}
