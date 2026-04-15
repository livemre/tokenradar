import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('mint', mint)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  const res = NextResponse.json({ data });
  // Edge cache: 60s fresh, serve stale up to 120s while revalidating
  res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  return res;
}
