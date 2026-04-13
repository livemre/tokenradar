import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { KNOWN_QUOTE_MINTS, RAYDIUM_AMM_PROGRAM } from '@/lib/utils/constants';

// Raydium CPMM (newer pools)
const RAYDIUM_CPMM_PROGRAM = 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C';

// Known program IDs to exclude from token mint detection
const SYSTEM_PROGRAMS = new Set([
  '11111111111111111111111111111111',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  'SysvarRent111111111111111111111111111111111',
  'SysvarC1ock11111111111111111111111111111111',
  RAYDIUM_AMM_PROGRAM,
  RAYDIUM_CPMM_PROGRAM,
  'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX', // Serum/OpenBook
  'ComputeBudget111111111111111111111111111111',
]);

interface HeliusTransaction {
  type?: string;
  description?: string;
  signature?: string;
  timestamp?: number;
  accountData?: Array<{ account: string; nativeBalanceChange?: number }>;
  tokenTransfers?: Array<{ mint: string; fromUserAccount?: string; toUserAccount?: string; tokenAmount?: number }>;
  instructions?: Array<{ programId: string; accounts?: string[]; innerInstructions?: Array<{ programId: string; accounts?: string[] }> }>;
}

/**
 * Extract new token mints from a Raydium pool creation transaction.
 * Filters out known quote mints (SOL, USDC, USDT) and system programs.
 */
function extractNewTokenMints(tx: HeliusTransaction): { mint: string; poolAddress: string | null }[] {
  const results: { mint: string; poolAddress: string | null }[] = [];

  // Strategy 1: From tokenTransfers — most reliable
  const transferMints = new Set<string>();
  for (const t of tx.tokenTransfers || []) {
    if (t.mint && !KNOWN_QUOTE_MINTS.has(t.mint) && !SYSTEM_PROGRAMS.has(t.mint)) {
      transferMints.add(t.mint);
    }
  }

  // Strategy 2: From account data — fallback
  const accountMints = new Set<string>();
  for (const a of tx.accountData || []) {
    if (a.account && !KNOWN_QUOTE_MINTS.has(a.account) && !SYSTEM_PROGRAMS.has(a.account)) {
      // Only consider accounts that look like token mints (base58, 32-44 chars)
      if (a.account.length >= 32 && a.account.length <= 44) {
        accountMints.add(a.account);
      }
    }
  }

  // Strategy 3: From Raydium instruction accounts — look for pool address
  let poolAddress: string | null = null;
  for (const ix of tx.instructions || []) {
    if (ix.programId === RAYDIUM_AMM_PROGRAM || ix.programId === RAYDIUM_CPMM_PROGRAM) {
      // First account in Raydium initialize is typically the pool/AMM account
      if (ix.accounts && ix.accounts.length > 0) {
        poolAddress = ix.accounts[0];
      }
    }
  }

  // Prefer transfer mints, fallback to account mints
  const mints = transferMints.size > 0 ? transferMints : accountMints;
  for (const mint of mints) {
    results.push({ mint, poolAddress });
  }

  return results;
}

export async function POST(request: NextRequest) {
  // Verify webhook auth
  const authHeader = request.headers.get('authorization');
  if (authHeader !== process.env.HELIUS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const transactions: HeliusTransaction[] = await request.json();
    const supabase = createServerSupabase();

    let detected = 0;

    for (const tx of transactions) {
      // Skip old transactions (>1 hour) — prevents backfill of historical swaps
      if (tx.timestamp) {
        const ageSeconds = Math.floor(Date.now() / 1000) - tx.timestamp;
        if (ageSeconds > 3600) continue;
      }

      const newTokens = extractNewTokenMints(tx);
      if (newTokens.length === 0) continue;

      // Batch check: skip mints already in our database
      const mints = newTokens.map((t) => t.mint);
      const { data: existing } = await supabase
        .from('tokens')
        .select('mint')
        .in('mint', mints);

      const existingMints = new Set((existing || []).map((r) => r.mint));

      for (const { mint, poolAddress } of newTokens) {
        if (existingMints.has(mint)) continue;

        const { error } = await supabase
          .from('tokens')
          .upsert(
            {
              mint,
              source: 'raydium',
              pool_address: poolAddress,
              enriched: false,
              detected_at: new Date().toISOString(),
            },
            { onConflict: 'mint', ignoreDuplicates: true }
          );

        if (error) {
          console.error(`Helius webhook: failed to upsert ${mint}:`, error.message);
        } else {
          detected++;
          console.log(`Helius webhook: new Raydium token → ${mint}${poolAddress ? ` (pool: ${poolAddress.slice(0, 8)}...)` : ''}`);
        }
      }
    }

    return NextResponse.json({ received: true, detected });
  } catch (err) {
    console.error('Helius webhook error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
