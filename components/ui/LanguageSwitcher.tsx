'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

const locales = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'tr', label: 'TR', flag: '🇹🇷' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'ko', label: 'KO', flag: '🇰🇷' },
  { code: 'ja', label: 'JA', flag: '🇯🇵' },
  { code: 'zh', label: 'ZH', flag: '🇨🇳' },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (code: string) => {
    setOpen(false);
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: code }),
    });
    router.refresh();
  };

  const current = locales.find((l) => l.code === locale) || locales[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-white/5 transition-all btn-press"
        aria-label="Change language"
      >
        <Globe size={14} />
        <span className="font-medium">{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-xl bg-[#1a1a2e] border border-white/10 shadow-xl z-50">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                l.code === locale
                  ? 'text-foreground bg-white/5'
                  : 'text-muted hover:text-foreground hover:bg-white/5'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="font-medium">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
