import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServerSupabase();

  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const [totalRes, safeRes, recentRes, todayRes, trendingRes] = await Promise.all([
    supabase.from('tokens').select('id', { count: 'exact', head: true }).eq('enriched', true),
    supabase.from('tokens').select('id', { count: 'exact', head: true }).eq('enriched', true).eq('safety_level', 'safe'),
    supabase.from('tokens').select('id', { count: 'exact', head: true }).eq('enriched', true).gte('detected_at', fiveMinAgo),
    supabase.from('tokens').select('id', { count: 'exact', head: true }).eq('enriched', true).gte('detected_at', oneDayAgo),
    supabase.from('tokens').select('id', { count: 'exact', head: true }).eq('enriched', true).gt('trending_score', 0),
  ]);

  const total = totalRes.count || 0;
  const safe = safeRes.count || 0;
  const recent5min = recentRes.count || 0;
  const today = todayRes.count || 0;
  const trending = trendingRes.count || 0;

  const res = NextResponse.json({
    total,
    safe,
    safePercent: total > 0 ? Math.round((safe / total) * 100) : 0,
    recent5min,
    ratePerMin: Math.round(recent5min / 5),
    today,
    trending,
  });

  res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  return res;
}
