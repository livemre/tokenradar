import { logger } from '../utils/logger.js';

const GECKO_BASE = 'https://api.geckoterminal.com/api/v2';

export interface GeckoTokenData {
  name: string | null;
  symbol: string | null;
  priceUsd: number | null;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  liquidityUsd: number | null;
}

/**
 * Fetch token market data from GeckoTerminal.
 * Works for all Solana tokens including Pump.fun bonding curve tokens.
 * Free API, no key needed.
 */
export async function getGeckoTokenData(mint: string): Promise<GeckoTokenData | null> {
  try {
    // Small random delay to spread requests and avoid 429 rate limits
    await new Promise((r) => setTimeout(r, Math.random() * 2000));

    const res = await fetch(
      `${GECKO_BASE}/networks/solana/tokens/${mint}`,
      { headers: { Accept: 'application/json' } }
    );

    // Retry once on rate limit
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 3000 + Math.random() * 2000));
      const retry = await fetch(
        `${GECKO_BASE}/networks/solana/tokens/${mint}`,
        { headers: { Accept: 'application/json' } }
      );
      if (!retry.ok) {
        logger.warn(`GeckoTerminal: Rate limited (429→${retry.status}) for ${mint}`);
        return null;
      }
      const retryJson = await retry.json();
      const retryAttrs = retryJson?.data?.attributes;
      if (!retryAttrs) return null;
      return {
        name: retryAttrs.name || null,
        symbol: retryAttrs.symbol || null,
        priceUsd: retryAttrs.price_usd ? parseFloat(retryAttrs.price_usd) : null,
        marketCapUsd: retryAttrs.fdv_usd ? parseFloat(retryAttrs.fdv_usd) : null,
        volume24hUsd: retryAttrs.volume_usd?.h24 ? parseFloat(retryAttrs.volume_usd.h24) : null,
        liquidityUsd: retryAttrs.total_reserve_in_usd ? parseFloat(retryAttrs.total_reserve_in_usd) : null,
      };
    }

    if (!res.ok) {
      logger.warn(`GeckoTerminal: API returned ${res.status} for ${mint}`);
      return null;
    }

    const json = await res.json();
    const attrs = json?.data?.attributes;
    if (!attrs) return null;

    return {
      name: attrs.name || null,
      symbol: attrs.symbol || null,
      priceUsd: attrs.price_usd ? parseFloat(attrs.price_usd) : null,
      marketCapUsd: attrs.fdv_usd ? parseFloat(attrs.fdv_usd) : null,
      volume24hUsd: attrs.volume_usd?.h24 ? parseFloat(attrs.volume_usd.h24) : null,
      liquidityUsd: attrs.total_reserve_in_usd ? parseFloat(attrs.total_reserve_in_usd) : null,
    };
  } catch (err) {
    logger.error(`GeckoTerminal: Failed for ${mint}`, err);
    return null;
  }
}
