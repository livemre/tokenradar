import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, type Mint } from '@solana/spl-token';
import { SOLANA_RPC_URL } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export interface HolderInfo {
  topHolderPct: number;
  holderCount: number;
}

async function getMintFlexible(connection: Connection, mintPubkey: PublicKey): Promise<Mint> {
  try {
    return await getMint(connection, mintPubkey, 'confirmed', TOKEN_PROGRAM_ID);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('TokenInvalidAccountOwner')) {
      return await getMint(connection, mintPubkey, 'confirmed', TOKEN_2022_PROGRAM_ID);
    }
    throw err;
  }
}

/**
 * Get holder count via Helius DAS getTokenAccounts API.
 * This works for all tokens including very new ones.
 */
async function getHolderCountViaDAS(mint: string): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccounts',
        params: {
          mint,
          limit: 1000,
        },
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const accounts = data?.result?.token_accounts;
    if (!Array.isArray(accounts)) return null;

    return accounts.length;
  } catch {
    return null;
  }
}

export async function getTopHolderConcentration(mint: string): Promise<HolderInfo | null> {
  // Try standard RPC for top holder concentration
  let topHolderPct: number | null = null;

  try {
    const connection = new Connection(SOLANA_RPC_URL, { commitment: 'confirmed' });
    const mintPubkey = new PublicKey(mint);

    const [largestAccounts, mintInfo] = await Promise.all([
      connection.getTokenLargestAccounts(mintPubkey),
      getMintFlexible(connection, mintPubkey),
    ]);

    const topAccounts = largestAccounts.value.slice(0, 10);
    const totalSupply = Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals);

    if (totalSupply > 0) {
      const topHoldersTotal = topAccounts.reduce((sum, account) => {
        return sum + Number(account.amount) / Math.pow(10, mintInfo.decimals);
      }, 0);
      topHolderPct = (topHoldersTotal / totalSupply) * 100;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('TokenInvalidAccountOwner')) {
      logger.warn(`Top holder analysis failed for ${mint}: ${msg}`);
    }
  }

  // Get accurate holder count via Helius DAS API (works for all tokens)
  const holderCount = await getHolderCountViaDAS(mint);

  if (topHolderPct === null && holderCount === null) return null;

  return {
    topHolderPct: topHolderPct ?? 0,
    holderCount: holderCount ?? 0,
  };
}
