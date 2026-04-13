import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

const LIST_COLUMNS =
  'id,mint,name,symbol,image_url,source,safety_level,safety_score,price_usd,market_cap_usd,liquidity_usd,holder_count,volume_24h_usd,detected_at,enriched,mint_authority,freeze_authority,is_rugged';

export async function GET(request: NextRequest) {
  const mints = request.nextUrl.searchParams.get('mints');
  if (!mints) {
    return NextResponse.json({ data: [] });
  }

  const mintList = mints.split(',').filter(Boolean).slice(0, 100);
  if (mintList.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from('tokens')
    .select(LIST_COLUMNS)
    .in('mint', mintList);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}
