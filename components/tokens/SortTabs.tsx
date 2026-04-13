'use client';

import { ArrowUpDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'detected_at', label: 'Newest' },
  { value: 'market_cap_usd', label: 'Market Cap' },
  { value: 'holder_count', label: 'Holders' },
  { value: 'safety_score', label: 'Safety' },
  { value: 'liquidity_usd', label: 'Liquidity' },
];

interface SortTabsProps {
  sort: string;
  order: 'asc' | 'desc';
  onSortChange: (sort: string) => void;
  onOrderToggle: () => void;
}

export function SortTabs({ sort, order, onSortChange, onOrderToggle }: SortTabsProps) {
  return (
    <div className="flex items-center gap-1">
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSortChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            sort === opt.value
              ? 'bg-white/10 text-foreground'
              : 'text-muted hover:bg-white/5 hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
      <button
        onClick={onOrderToggle}
        className="ml-1 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
        title={order === 'desc' ? 'Descending' : 'Ascending'}
      >
        <ArrowUpDown size={14} className={order === 'asc' ? 'rotate-180' : ''} />
      </button>
    </div>
  );
}
