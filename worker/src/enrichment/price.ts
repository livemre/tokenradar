import { logger } from '../utils/logger.js';

const JUPITER_PRICE_API = 'https://api.jup.ag/price/v2';

export interface PriceInfo {
  priceUsd: number | null;
}

export async function getTokenPrice(mint: string): Promise<PriceInfo> {
  try {
    const res = await fetch(`${JUPITER_PRICE_API}?ids=${mint}`);
    if (!res.ok) return { priceUsd: null };

    const data = await res.json();
    const entry = data.data?.[mint];
    return { priceUsd: entry ? parseFloat(entry.price) : null };
  } catch (err) {
    logger.error(`Price fetch failed for ${mint}`, err);
    return { priceUsd: null };
  }
}
