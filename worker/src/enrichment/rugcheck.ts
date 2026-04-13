import { logger } from '../utils/logger.js';

const RUGCHECK_BASE = 'https://api.rugcheck.xyz/v1';

export interface RugCheckReport {
  score: number;
  rugged: boolean;
  tokenMeta?: {
    name?: string;
    symbol?: string;
    uri?: string;
    image?: string;
  };
  risks: Array<{
    name: string;
    description: string;
    level: string;
    score: number;
  }>;
  topHolders?: Array<{
    address: string;
    amount: number;
    pct: number;
    isInsider: boolean;
  }>;
  totalMarketLiquidity?: number;
  markets?: Array<{
    marketType: string;
    lp?: { lpLockedPct: number };
  }>;
}

export async function fetchRugCheckReport(mint: string): Promise<RugCheckReport | null> {
  try {
    const res = await fetch(`${RUGCHECK_BASE}/tokens/${mint}/report/summary`);
    if (!res.ok) {
      logger.warn(`RugCheck: API returned ${res.status} for ${mint}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    logger.error(`RugCheck: Failed for ${mint}`, err);
    return null;
  }
}
