'use client';

import { useState, useEffect } from 'react';
import type { TokenSource, SafetyLevel } from '@/lib/types/token';
import { COLORS } from '@/lib/utils/constants';
import { useTranslations } from 'next-intl';

interface TokenFiltersProps {
  onFilterChange: (filters: {
    source?: TokenSource;
    safety?: SafetyLevel;
  }) => void;
  defaultSource?: TokenSource | '';
}

function getSources(t: ReturnType<typeof useTranslations>): { value: TokenSource | ''; label: string; color?: string }[] {
  return [
    { value: '', label: t('allSources') },
    { value: 'pumpfun', label: 'Pump.fun', color: COLORS.pumpfun },
    { value: 'raydium', label: 'Raydium', color: COLORS.raydium },
    { value: 'moonshot', label: 'Moonshot', color: COLORS.moonshot },
  ];
}

function getSafetyLevels(t: ReturnType<typeof useTranslations>): { value: SafetyLevel | ''; label: string; color?: string }[] {
  return [
    { value: '', label: t('allSafety') },
    { value: 'safe', label: t('safe'), color: COLORS.safe },
    { value: 'warning', label: t('warning'), color: COLORS.warning },
    { value: 'danger', label: t('danger'), color: COLORS.danger },
  ];
}

export function TokenFilters({ onFilterChange, defaultSource }: TokenFiltersProps) {
  const t = useTranslations('filters');
  const sources = getSources(t);
  const safetyLevels = getSafetyLevels(t);
  const [activeSource, setActiveSource] = useState<TokenSource | ''>(defaultSource || '');
  const [activeSafety, setActiveSafety] = useState<SafetyLevel | ''>('');

  // Sync when defaultSource changes externally (e.g. navigating from Live Feed)
  useEffect(() => {
    if (defaultSource !== undefined && defaultSource !== activeSource) {
      setActiveSource(defaultSource);
    }
  }, [defaultSource]);

  const handleSourceChange = (source: TokenSource | '') => {
    setActiveSource(source);
    onFilterChange({
      source: source || undefined,
      safety: activeSafety || undefined,
    });
  };

  const handleSafetyChange = (safety: SafetyLevel | '') => {
    setActiveSafety(safety);
    onFilterChange({
      source: activeSource || undefined,
      safety: safety || undefined,
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Source filters */}
      <div className="flex gap-1">
        {sources.map((s) => (
          <button
            key={s.value}
            onClick={() => handleSourceChange(s.value as TokenSource | '')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all btn-press ${
              activeSource === s.value
                ? 'bg-white/10 text-foreground'
                : 'text-muted hover:bg-white/5'
            }`}
            style={
              activeSource === s.value && s.color
                ? { color: s.color, backgroundColor: `${s.color}15`, border: `1px solid ${s.color}30` }
                : undefined
            }
          >
            {activeSource === s.value && s.color && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
            )}
            {s.label}
          </button>
        ))}
      </div>

      <div className="w-px bg-border" />

      {/* Safety filters */}
      <div className="flex gap-1">
        {safetyLevels.map((s) => (
          <button
            key={s.value}
            onClick={() => handleSafetyChange(s.value as SafetyLevel | '')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all btn-press ${
              activeSafety === s.value
                ? 'bg-white/10 text-foreground'
                : 'text-muted hover:bg-white/5'
            }`}
            style={
              activeSafety === s.value && s.color
                ? { color: s.color, backgroundColor: `${s.color}15`, border: `1px solid ${s.color}30` }
                : undefined
            }
          >
            {activeSafety === s.value && s.color && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
            )}
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
