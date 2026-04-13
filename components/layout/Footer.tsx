'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Radar, ExternalLink, Heart, Copy, Check } from 'lucide-react';

const DONATE_ADDRESS = '5AxTtcGWCTrt9zL5Vy6JhGRhhuTe5ngS2dn3S8mYQt2G';

export function Footer() {
  const t = useTranslations('footer');
  const td = useTranslations('donate');
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(DONATE_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-border mt-auto">
      {/* Donate banner */}
      <div className="border-b border-border bg-gradient-to-r from-safe/[0.03] to-accent/[0.03]">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-safe/10 flex items-center justify-center">
                <Heart size={18} className="text-safe" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">{td('title')}</h4>
                <p className="text-xs text-muted">{td('desc')}</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 w-full sm:w-auto sm:justify-end">
              <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 min-w-0">
                <span className="text-xs font-mono text-muted truncate">{DONATE_ADDRESS}</span>
              </div>
              <button
                onClick={copyAddress}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-safe/10 text-safe text-xs font-medium hover:bg-safe/20 transition-all btn-press"
              >
                {copied ? (
                  <>
                    <Check size={13} />
                    {td('copied')}
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    SOL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Radar size={18} className="text-safe" />
              <span className="font-bold">TokenRadar</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">{t('resources')}</h4>
            <div className="space-y-2">
              <Link href="/blog" className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors">
                Blog
              </Link>
              <FooterLink href="https://dexscreener.com" label="DexScreener" />
              <FooterLink href="https://birdeye.so" label="Birdeye" />
              <FooterLink href="https://pump.fun" label="Pump.fun" />
              <FooterLink href="https://jup.ag" label="Jupiter" />
            </div>
          </div>

          {/* Explorers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">{t('explorers')}</h4>
            <div className="space-y-2">
              <FooterLink href="https://solscan.io" label="Solscan" />
              <FooterLink href="https://explorer.solana.com" label="Solana Explorer" />
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-4 flex items-center justify-between text-[10px] text-muted">
          <span>{t('branding')}</span>
          <span>{t('disclaimer')}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
    >
      {label}
      <ExternalLink size={10} className="opacity-50" />
    </a>
  );
}
