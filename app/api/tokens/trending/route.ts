import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
  const pageSize = Math.min(Math.max(1, parseInt(searchParams.get('pageSize') || '30') || 30), 100);
  const period = searchParams.get('period') || '6h';
  const source = searchParams.get('source');
  const safety = searchParams.get('safety');

  const supabase = createServerSupabase();

  const LIST_COLUMNS = 'mint,name,symbol,image_url,source,safety_level,safety_score,price_usd,market_cap_usd,liquidity_usd,holder_count,volume_24h_usd,detected_at,enriched,enriched_at,trending_score';

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // First try: tokens with trending_score > 0
  let query = supabase
    .from('tokens')
    .select(LIST_COLUMNS, { count: 'exact' })
    .eq('enriched', true)
    .gt('trending_score', 0)
    .gte('detected_at', thirtyDaysAgo)
    .not('symbol', 'is', null)
    .order('trending_score', { ascending: false, nullsFirst: false });

  if (source) query = query.eq('source', source);
  if (safety) query = query.eq('safety_level', safety);
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  let { data: tokens, error, count } = await query;

  // Fallback: if no scored tokens, show top tokens by market cap (potential tokens)
  if (!error && (!tokens || tokens.length === 0) && page === 1) {
    let fallbackQuery = supabase
      .from('tokens')
      .select(LIST_COLUMNS, { count: 'exact' })
      .eq('enriched', true)
      .gte('detected_at', thirtyDaysAgo)
      .not('symbol', 'is', null)
      .not('price_usd', 'is', null)
      .gte('liquidity_usd', 100)
      .order('market_cap_usd', { ascending: false, nullsFirst: false });

    if (source) fallbackQuery = fallbackQuery.eq('source', source);
    if (safety) fallbackQuery = fallbackQuery.eq('safety_level', safety);
    fallbackQuery = fallbackQuery.range(0, pageSize - 1);

    const fallback = await fallbackQuery;
    if (!fallback.error) {
      tokens = fallback.data;
      count = fallback.count;
    }
  }

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch trending tokens' }, { status: 500 });
  }

  if (!tokens || tokens.length === 0) {
    const res = NextResponse.json({ data: [], total: 0, page, pageSize, totalPages: 0 });
    res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res;
  }

  // Fetch change metrics from snapshots for each token
  const periodHours = period === '1h' ? 1 : period === '24h' ? 24 : period === '7d' ? 168 : period === '30d' ? 720 : 6;
  const periodCutoff = new Date(Date.now() - periodHours * 60 * 60 * 1000).toISOString();

  const metricsMap = new Map<string, {
    volume_change_pct: number | null;
    holder_change_pct: number | null;
    price_change_pct: number | null;
    liquidity_change_pct: number | null;
  }>();

  const pctChange = (oldVal: number | null, newVal: number | null) => {
    if (oldVal === null || newVal === null || oldVal === 0) return null;
    return Math.round(((newVal - oldVal) / oldVal) * 1000) / 10;
  };

  const snapshotPromises = tokens.map(async (token) => {
    const { data: snapshots } = await supabase
      .from('token_snapshots')
      .select('price_usd, volume_24h_usd, holder_count, liquidity_usd')
      .eq('mint', token.mint)
      .gte('snapshot_at', periodCutoff)
      .order('snapshot_at', { ascending: true })
      .limit(1);

    const old = snapshots?.[0];
    if (!old) {
      metricsMap.set(token.mint, { volume_change_pct: null, holder_change_pct: null, price_change_pct: null, liquidity_change_pct: null });
      return;
    }

    metricsMap.set(token.mint, {
      volume_change_pct: pctChange(old.volume_24h_usd, token.volume_24h_usd),
      holder_change_pct: pctChange(old.holder_count, token.holder_count),
      price_change_pct: pctChange(old.price_usd, token.price_usd),
      liquidity_change_pct: pctChange(old.liquidity_usd, token.liquidity_usd),
    });
  });

  await Promise.allSettled(snapshotPromises);

  const enrichedData = tokens.map((token) => ({
    ...token,
    trending_metrics: metricsMap.get(token.mint) || {
      volume_change_pct: null,
      holder_change_pct: null,
      price_change_pct: null,
      liquidity_change_pct: null,
    },
  }));

  const res = NextResponse.json({
    data: enrichedData,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  });

  res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  return res;
}
