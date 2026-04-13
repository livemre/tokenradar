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

export async function getTopHolderConcentration(mint: string): Promise<HolderInfo | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));

      const connection = new Connection(SOLANA_RPC_URL, { commitment: 'confirmed' });
      const mintPubkey = new PublicKey(mint);

      const [largestAccounts, mintInfo] = await Promise.all([
        connection.getTokenLargestAccounts(mintPubkey),
        getMintFlexible(connection, mintPubkey),
      ]);

      const topAccounts = largestAccounts.value.slice(0, 10);
      const totalSupply = Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals);

      if (totalSupply === 0) return { topHolderPct: 0, holderCount: 0 };

      const topHoldersTotal = topAccounts.reduce((sum, account) => {
        return sum + Number(account.amount) / Math.pow(10, mintInfo.decimals);
      }, 0);

      return {
        topHolderPct: (topHoldersTotal / totalSupply) * 100,
        holderCount: largestAccounts.value.length,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('TokenInvalidAccountOwner')) return null;

      if (attempt === 0) continue; // retry once
      logger.warn(`Holder analysis failed for ${mint} (${SOLANA_RPC_URL.includes('helius') ? 'helius' : 'public'}): ${msg || err}`);
      return null;
    }
  }
  return null;
}
