import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '30'), 100);
  const source = searchParams.get('source');
  const safety = searchParams.get('safety');
  const minMcap = searchParams.get('minMcap');
  const maxMcap = searchParams.get('maxMcap');
  const minHolders = searchParams.get('minHolders');
  const enrichedOnly = searchParams.get('enrichedOnly');
  const showAll = searchParams.get('showAll');
  const search = searchParams.get('search')?.trim();
  const sort = searchParams.get('sort') || 'detected_at';
  const order = searchParams.get('order') || 'desc';

  const supabase = createServerSupabase();
  // Select only columns needed by list UI (TokenCard, notifications) to minimize egress
  const LIST_COLUMNS = 'mint,name,symbol,image_url,source,safety_level,safety_score,price_usd,market_cap_usd,liquidity_usd,holder_count,volume_24h_usd,detected_at,enriched';
  let query = supabase.from('tokens').select(LIST_COLUMNS, { count: 'exact' });

  // Default: hide dead tokens (no name, no price, no holders)
  // Unless searching or explicitly requesting all
  if (showAll !== 'true' && !search) {
    query = query.or('name.not.is.null,price_usd.not.is.null,holder_count.gt.0');
  }

  // Text search: match on name, symbol, or mint address
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,symbol.ilike.%${search}%,mint.ilike.%${search}%`
    );
  }

  if (source) query = query.eq('source', source);
  if (safety) query = query.eq('safety_level', safety);
  if (minMcap) query = query.gte('market_cap_usd', parseFloat(minMcap));
  if (maxMcap) query = query.lte('market_cap_usd', parseFloat(maxMcap));
  if (minHolders) query = query.gte('holder_count', parseInt(minHolders));
  if (enrichedOnly === 'true') query = query.eq('enriched', true);

  // Validate sort column to prevent injection
  const allowedSorts = ['detected_at', 'market_cap_usd', 'price_usd', 'holder_count', 'safety_score', 'liquidity_usd', 'volume_24h_usd'];
  const sortCol = allowedSorts.includes(sort) ? sort : 'detected_at';

  query = query.order(sortCol, { ascending: order === 'asc', nullsFirst: false });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const res = NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  });

  // Edge cache: 10s fresh, serve stale up to 30s while revalidating
  res.headers.set('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
  return res;
}
