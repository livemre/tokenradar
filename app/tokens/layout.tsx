import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Token Radar — Track Solana Memecoins in Real-Time',
  description:
    'Live feed of new Solana memecoins from Pump.fun, Raydium & Moonshot. Safety scores, holder analysis, price charts, and instant swap — all free, no signup required.',
  alternates: {
    canonical: 'https://tokenradar.site/tokens',
  },
};

export default function TokensLayout({ children }: { children: React.ReactNode }) {
  return children;
}
