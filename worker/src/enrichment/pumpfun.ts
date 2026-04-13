import { logger } from '../utils/logger.js';
import { PUMPFUN_API_URL } from '../utils/constants.js';

export interface PumpFunTokenData {
  priceUsd: number | null;
  marketCapUsd: number | null;
  liquidityUsd: number | null;
  name: string | null;
  symbol: string | null;
  imageUrl: string | null;
  complete: boolean;
}

/**
 * Fetch token data from PumpFun's REST API (bonding curve tokens).
 * Only useful for tokens with source='pumpfun'.
 */
export async function getPumpFunTokenData(mint: string): Promise<PumpFunTokenData | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${PUMPFUN_API_URL}/coins/${mint}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      if (res.status !== 404) {
        logger.warn(`PumpFun API: returned ${res.status} for ${mint}`);
      }
      return null;
    }

    const data = await res.json();
    if (!data || !data.mint) return null;

    // Market cap in USD (directly provided)
    const marketCapUsd = data.usd_market_cap ? Number(data.usd_market_cap) : null;

    // Derive price from market cap and total supply
    // PumpFun tokens: 1B supply with 6 decimals (total_supply = 1_000_000_000_000_000)
    const totalSupply = data.total_supply ? Number(data.total_supply) : 1_000_000_000_000_000;
    const decimals = data.base_decimals ?? 6;
    const adjustedSupply = totalSupply / Math.pow(10, decimals);

    let priceUsd: number | null = null;
    if (marketCapUsd && adjustedSupply > 0) {
      priceUsd = marketCapUsd / adjustedSupply;
    }

    // Liquidity: virtual_sol_reserves converted to USD
    let liquidityUsd: number | null = null;
    if (data.virtual_sol_reserves && data.market_cap) {
      const vSolReserves = Number(data.virtual_sol_reserves) / 1e9; // lamports → SOL
      const marketCapSol = Number(data.market_cap);
      if (marketCapSol > 0 && marketCapUsd) {
        const solPrice = marketCapUsd / marketCapSol;
        liquidityUsd = vSolReserves * solPrice * 2; // AMM convention: 2x one side
      }
    }

    return {
      priceUsd,
      marketCapUsd,
      liquidityUsd,
      name: data.name || null,
      symbol: data.symbol || null,
      imageUrl: data.image_uri || null,
      complete: data.complete === true,
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      logger.warn(`PumpFun API: timeout for ${mint}`);
    } else {
      logger.error(`PumpFun API: failed for ${mint}`, err);
    }
    return null;
  }
}
