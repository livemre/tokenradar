import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { KNOWN_QUOTE_MINTS } from '@/lib/utils/constants';

export async function POST(request: NextRequest) {
  // Verify webhook auth
  const authHeader = request.headers.get('authorization');
  if (authHeader !== process.env.HELIUS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const transactions = await request.json();
    const supabase = createServerSupabase();

    for (const tx of transactions) {
      // Look for token mints in the transaction
      const accountKeys: string[] = tx.accountData?.map((a: { account: string }) => a.account) || [];
      const tokenMints = accountKeys.filter((key: string) => !KNOWN_QUOTE_MINTS.has(key));

      // Extract pool info from enhanced transaction
      const tokenTransfers = tx.tokenTransfers || [];
      const newMint = tokenMints.find((mint: string) =>
        tokenTransfers.some((t: { mint: string }) => t.mint === mint)
      ) || tokenMints[0];

      if (!newMint) continue;

      const { error } = await supabase
        .from('tokens')
        .upsert(
          {
            mint: newMint,
            source: 'raydium',
            enriched: false,
            detected_at: new Date().toISOString(),
          },
          { onConflict: 'mint' }
        );

      if (error) {
        console.error(`Failed to insert Raydium token ${newMint}:`, error.message);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Helius webhook error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
