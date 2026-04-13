import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase/server';
import TokenPageClient from './TokenPageClient';

interface Props {
  params: Promise<{ mint: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mint } = await params;
  const supabase = createServerSupabase();

  const { data: token } = await supabase
    .from('tokens')
    .select('name,symbol,safety_level,price_usd,market_cap_usd,source')
    .eq('mint', mint)
    .single();

  if (!token || !token.name) {
    return {
      title: `Token ${mint.slice(0, 8)}...`,
      description: `View safety analysis, price chart, and holder data for Solana token ${mint.slice(0, 8)}... on TokenRadar.`,
    };
  }

  const name = token.name;
  const symbol = token.symbol ? `($${token.symbol.toUpperCase()})` : '';
  const safety = token.safety_level ? ` — ${token.safety_level.charAt(0).toUpperCase() + token.safety_level.slice(1)}` : '';
  const price = token.price_usd ? ` $${token.price_usd < 0.01 ? token.price_usd.toExponential(2) : token.price_usd.toFixed(4)}` : '';

  const title = `${name} ${symbol}${safety}`;
  const description = `${name} ${symbol} on Solana${price ? ` — Price:${price}` : ''}. Safety score, rug-pull analysis, holder concentration, live chart & swap on TokenRadar.`;

  return {
    title,
    description,
    openGraph: {
      title: `${name} ${symbol} — TokenRadar`,
      description,
      url: `https://tokenradar.site/tokens/${mint}`,
    },
    twitter: {
      card: 'summary',
      title: `${name} ${symbol}${safety}`,
      description,
    },
  };
}

export default async function TokenPage({ params }: Props) {
  const { mint } = await params;
  return <TokenPageClient mint={mint} />;
}
