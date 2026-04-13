'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Heart, Copy, Check } from 'lucide-react';
import { FadeIn } from './AnimatedSection';

const DONATE_ADDRESS = '5AxTtcGWCTrt9zL5Vy6JhGRhhuTe5ngS2dn3S8mYQt2G';

export function DonateSection() {
  const td = useTranslations('donate');
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(DONATE_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative z-10 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <FadeIn>
          <div className="glass-card p-6 sm:p-8 bg-gradient-to-br from-safe/[0.04] to-accent/[0.04]">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-safe/10 flex items-center justify-center shrink-0">
                <Heart size={22} className="text-safe" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-lg font-semibold mb-1">{td('title')}</h3>
                <p className="text-sm text-muted">{td('desc')}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 min-w-0">
                <span className="text-xs sm:text-sm font-mono text-muted truncate">
                  {DONATE_ADDRESS}
                </span>
              </div>
              <button
                onClick={copyAddress}
                className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-safe/10 text-safe text-sm font-semibold hover:bg-safe/20 transition-all btn-press"
              >
                {copied ? (
                  <>
                    <Check size={15} />
                    {td('copied')}
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    SOL
                  </>
                )}
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
