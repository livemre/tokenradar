import { DEXSCREENER_API_URL } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export interface DexScreenerTokenInfo {
  imageUrl: string | null;
  name: string | null;
  symbol: string | null;
  holderCount: number | null;
}

export async function fetchDexScreenerInfo(mint: string): Promise<DexScreenerTokenInfo | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${DEXSCREENER_API_URL}/tokens/v1/solana/${mint}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const pairs = await res.json();
    if (!Array.isArray(pairs) || pairs.length === 0) return null;

    // Find the pair where this mint is the base token
    const pair = pairs.find((p: Record<string, unknown>) => {
      const base = p.baseToken as Record<string, string> | undefined;
      return base?.address === mint;
    }) || pairs[0];

    const info = pair.info as Record<string, unknown> | undefined;
    const baseToken = pair.baseToken as Record<string, string> | undefined;

    return {
      imageUrl: (info?.imageUrl as string) || null,
      name: baseToken?.name || null,
      symbol: baseToken?.symbol || null,
      holderCount: typeof pair.holders === 'number' ? pair.holders : null,
    };
  } catch {
    logger.warn(`DexScreener info fetch failed for ${mint}`);
    return null;
  }
}
