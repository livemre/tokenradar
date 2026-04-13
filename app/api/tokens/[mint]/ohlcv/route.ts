import { NextRequest, NextResponse } from 'next/server';

const GECKO_BASE = 'https://api.geckoterminal.com/api/v2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const searchParams = request.nextUrl.searchParams;
  const timeframe = searchParams.get('timeframe') || '15m';

  try {
    // Step 1: Find the top pool for this token
    const poolsRes = await fetch(
      `${GECKO_BASE}/networks/solana/tokens/${mint}/pools?page=1`,
      { headers: { Accept: 'application/json' }, next: { revalidate: 60 } }
    );

    if (!poolsRes.ok) {
      return NextResponse.json({ data: [] });
    }

    const poolsData = await poolsRes.json();
    const pool = poolsData?.data?.[0];
    if (!pool) {
      return NextResponse.json({ data: [] });
    }

    const poolAddress = pool.attributes?.address || pool.id?.split('_')[1];
    if (!poolAddress) {
      return NextResponse.json({ data: [] });
    }

    // Step 2: Map timeframe to GeckoTerminal params
    const tfMap: Record<string, { path: string; aggregate: string }> = {
      '1m': { path: 'minute', aggregate: '1' },
      '5m': { path: 'minute', aggregate: '5' },
      '15m': { path: 'minute', aggregate: '15' },
      '1h': { path: 'hour', aggregate: '1' },
      '4h': { path: 'hour', aggregate: '4' },
      '1d': { path: 'day', aggregate: '1' },
    };

    const tf = tfMap[timeframe] || tfMap['15m'];

    // Step 3: Fetch OHLCV data
    const ohlcvRes = await fetch(
      `${GECKO_BASE}/networks/solana/pools/${poolAddress}/ohlcv/${tf.path}?aggregate=${tf.aggregate}&limit=300&currency=usd`,
      { headers: { Accept: 'application/json' }, next: { revalidate: 30 } }
    );

    if (!ohlcvRes.ok) {
      return NextResponse.json({ data: [] });
    }

    const ohlcvData = await ohlcvRes.json();
    const candles = ohlcvData?.data?.attributes?.ohlcv_list || [];

    // GeckoTerminal format: [timestamp, open, high, low, close, volume]
    // Convert to lightweight-charts format
    const formatted = candles
      .map((c: number[]) => ({
        time: c[0] as number,
        open: c[1],
        high: c[2],
        low: c[3],
        close: c[4],
        volume: c[5],
      }))
      .sort((a: { time: number }, b: { time: number }) => a.time - b.time);

    const res = NextResponse.json({ data: formatted });
    // Edge cache: 30s fresh, serve stale up to 60s while revalidating
    res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res;
  } catch {
    return NextResponse.json({ data: [] });
  }
}
