import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, type Mint } from '@solana/spl-token';
import { SOLANA_RPC_URL } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export interface AuthorityInfo {
  mintAuthorityEnabled: boolean;
  freezeAuthorityEnabled: boolean;
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

export async function checkMintFreezeAuthority(mint: string): Promise<AuthorityInfo | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));

      const connection = new Connection(SOLANA_RPC_URL, { commitment: 'confirmed' });
      const mintPubkey = new PublicKey(mint);
      const mintInfo = await getMintFlexible(connection, mintPubkey);

      return {
        mintAuthorityEnabled: mintInfo.mintAuthority !== null,
        freezeAuthorityEnabled: mintInfo.freezeAuthority !== null,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('TokenInvalidAccountOwner')) return null;

      if (attempt === 0) continue; // retry once
      logger.warn(`Authority check failed for ${mint} (${SOLANA_RPC_URL.includes('helius') ? 'helius' : 'public'}): ${msg || err}`);
      return null;
    }
  }
  return null;
}
