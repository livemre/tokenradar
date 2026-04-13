import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  Radar,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Radio,
  Layers,
  Eye,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { FadeIn, HeroAnimation, HeroCTA, StatsAnimation } from '@/components/landing/AnimatedSection';
import { DonateSection } from '@/components/landing/DonateSection';

export default async function LandingPage() {
  const t = await getTranslations('landing');

  const features = [
    {
      icon: <Zap size={22} />,
      title: t('features.realtime.title'),
      desc: t('features.realtime.desc'),
      gradient: 'from-yellow-500/20 to-orange-500/20',
      iconColor: 'text-yellow-400',
    },
    {
      icon: <Shield size={22} />,
      title: t('features.safety.title'),
      desc: t('features.safety.desc'),
      gradient: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-safe',
    },
    {
      icon: <BarChart3 size={22} />,
      title: t('features.charts.title'),
      desc: t('features.charts.desc'),
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-accent',
    },
    {
      icon: <Radio size={22} />,
      title: t('features.multiDex.title'),
      desc: t('features.multiDex.desc'),
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-pumpfun',
    },
  ];

  const sources = [
    { name: 'Pump.fun', color: '#9945FF', desc: t('sources.pumpfun') },
    { name: 'Raydium', color: '#2BFFB1', desc: t('sources.raydium') },
    { name: 'Moonshot', color: '#FFD700', desc: t('sources.moonshot') },
  ];

  const stats = [
    { value: '< 5s', label: t('stats.speed') },
    { value: '24/7', label: t('stats.monitoring') },
    { value: '3 DEX', label: t('stats.sources') },
    { value: 'Free', label: t('stats.noSignup') },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background grid & glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(0,255,136,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,191,255,0.06)_0%,transparent_70%)]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar size={22} className="text-safe" />
            <span className="font-bold text-lg">
              Token<span className="text-gradient-brand">Radar</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-sm text-muted hover:text-foreground transition-colors hidden sm:block"
            >
              Blog
            </Link>
            <LanguageSwitcher />
            <Link
              href="/tokens"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-safe/10 text-safe text-sm font-semibold hover:bg-safe/20 transition-all btn-press"
            >
              {t('launchApp')}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <HeroAnimation>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-muted mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
              {t('badge')}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              {t('title1')}
              <br />
              <span className="text-gradient-brand">{t('title2')}</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </HeroAnimation>

          <HeroCTA className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tokens"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4aa] text-black font-bold text-base hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all btn-press"
            >
              {t('openDashboard')}
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/tokens?tab=explore"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-foreground font-semibold text-base hover:bg-white/10 transition-all btn-press"
            >
              <Eye size={16} />
              {t('exploreTokens')}
            </Link>
          </HeroCTA>

          {/* Stats row */}
          <StatsAnimation className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">{s.value}</div>
                <div className="text-xs text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </StatsAnimation>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t.rich('features.heading', {
                highlight: (chunks) => <span className="text-gradient-brand">{chunks}</span>,
              })}
            </h2>
            <p className="mt-4 text-muted max-w-xl mx-auto">
              {t('features.subheading')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div className={`glass-card-interactive p-6 bg-gradient-to-br ${f.gradient} h-full`}>
                  <div className={`${f.iconColor} mb-4`}>{f.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="relative z-10 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t.rich('sources.heading', {
                highlight: (chunks) => <span className="text-gradient-brand">{chunks}</span>,
              })}
            </h2>
            <p className="mt-4 text-muted max-w-xl mx-auto">
              {t('sources.subheading')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {sources.map((s, i) => (
              <FadeIn key={s.name} delay={i * 0.1}>
                <div className="glass-card p-6 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${s.color}15`, border: `1px solid ${s.color}30` }}
                  >
                    <Layers size={20} style={{ color: s.color }} />
                  </div>
                  <h3 className="font-semibold mb-1" style={{ color: s.color }}>
                    {s.name}
                  </h3>
                  <p className="text-xs text-muted">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t.rich('howItWorks.heading', {
                highlight: (chunks) => <span className="text-gradient-brand">{chunks}</span>,
              })}
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: t('howItWorks.detect.title'),
                desc: t('howItWorks.detect.desc'),
              },
              {
                step: '02',
                title: t('howItWorks.analyze.title'),
                desc: t('howItWorks.analyze.desc'),
              },
              {
                step: '03',
                title: t('howItWorks.act.title'),
                desc: t('howItWorks.act.desc'),
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.15}>
                <div className="text-center">
                  <div className="text-4xl font-bold font-mono text-gradient-brand mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t.rich('cta.heading', {
                highlight: (chunks) => <span className="text-gradient-brand">{chunks}</span>,
              })}
            </h2>
            <p className="text-muted mb-8 max-w-lg mx-auto">
              {t('cta.subheading')}
            </p>
            <Link
              href="/tokens"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4aa] text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all btn-press"
            >
              {t('cta.button')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Donate */}
      <DonateSection />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Radar size={16} className="text-safe" />
              <span className="text-sm font-semibold">TokenRadar</span>
              <span className="text-xs text-muted">— {t('footer.tagline')}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/blog"
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <a
                href="https://solscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1"
              >
                Solscan <ExternalLink size={10} />
              </a>
              <a
                href="https://jup.ag"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1"
              >
                Jupiter <ExternalLink size={10} />
              </a>
              <a
                href="https://dexscreener.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1"
              >
                DexScreener <ExternalLink size={10} />
              </a>
            </div>
          </div>
          <div className="text-center mt-6 text-[10px] text-muted">
            {t('footer.disclaimer')}
          </div>
        </div>
      </footer>
    </div>
  );
}
