'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TokenSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onFocused?: () => void;
}

export function TokenSearch({ value, onChange, placeholder, autoFocus, onFocused }: TokenSearchProps) {
  const t = useTranslations('search');
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Auto-focus when navigated from header search trigger
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      onFocused?.();
    }
  }, [autoFocus, onFocused]);

  const handleChange = (v: string) => {
    setLocalValue(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(v), 300);
  };

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder || t('placeholder')}
        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm placeholder:text-white/20 outline-none focus:border-white/20 focus:shadow-[0_0_0_2px_rgba(0,191,255,0.1)] transition-all focus-ring"
      />
      {localValue ? (
        <button
          onClick={() => { setLocalValue(''); onChange(''); inputRef.current?.focus(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors btn-press"
        >
          <X size={14} />
        </button>
      ) : (
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-muted pointer-events-none">
          /
        </kbd>
      )}
    </div>
  );
}
