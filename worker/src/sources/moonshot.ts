import { upsertToken } from '../db/supabase.js';
import { logger } from '../utils/logger.js';
import { DEXSCREENER_API_URL, MOONSHOT_POLL_INTERVAL_MS } from '../utils/constants.js';

interface DexScreenerTokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  description?: string;
  links?: Array<{ type: string; label: string; url: string }>;
}

const seenMints = new Set<string>();
const MAX_SEEN_SIZE = 10000;
let pollTimer: ReturnType<typeof setInterval> | null = null;

function evictOldEntries() {
  if (seenMints.size > MAX_SEEN_SIZE) {
    const iterator = seenMints.values();
    const toRemove = seenMints.size - MAX_SEEN_SIZE;
    for (let i = 0; i < toRemove; i++) {
      const val = iterator.next().value;
      if (val) seenMints.delete(val);
    }
  }
}

async function poll() {
  try {
    const res = await fetch(`${DEXSCREENER_API_URL}/token-profiles/latest/v1`);
    if (!res.ok) {
      logger.warn(`Moonshot: DexScreener API returned ${res.status}`);
      return;
    }

    const profiles: DexScreenerTokenProfile[] = await res.json();

    const solanaTokens = profiles.filter(
      (p) => p.chainId === 'solana' && !seenMints.has(p.tokenAddress)
    );

    for (const token of solanaTokens) {
      seenMints.add(token.tokenAddress);

      await upsertToken({
        mint: token.tokenAddress,
        name: null,
        symbol: null,
        uri: null,
        image_url: token.icon || null,
        source: 'moonshot',
      });
    }

    if (solanaTokens.length > 0) {
      logger.info(`Moonshot: Detected ${solanaTokens.length} new Solana tokens`);
    }

    evictOldEntries();
  } catch (err) {
    logger.error('Moonshot: Poll failed', err);
  }
}

export function startMoonshotPoller(): void {
  logger.info(`Moonshot: Starting poller (interval: ${MOONSHOT_POLL_INTERVAL_MS}ms)`);
  poll(); // Initial poll
  pollTimer = setInterval(poll, MOONSHOT_POLL_INTERVAL_MS);
}

export function stopMoonshotPoller(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
