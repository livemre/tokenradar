import {
  fetchUnenrichedTokens,
  fetchTokensForReEnrichment,
  updateTokenEnrichment,
  markEnrichmentError,
} from '../db/supabase.js';
import { fetchRugCheckReport } from './rugcheck.js';
import { checkMintFreezeAuthority } from './authority.js';
import { getTopHolderConcentration } from './holders.js';
import { getTokenPrice } from './price.js';
import { fetchTokenMetadata } from './metadata.js';
import { getGeckoTokenData } from './gecko.js';
import { fetchDexScreenerInfo } from './dexscreener.js';
import { logger } from '../utils/logger.js';
import { ENRICHMENT_CONCURRENCY, ENRICHMENT_DELAY_MS } from '../utils/constants.js';

// Safety level computation (mirrored from lib/utils/safety.ts)
function computeSafetyLevel(input: {
  rugCheckScore: number | null;
  mintAuthority: boolean | null;
  freezeAuthority: boolean | null;
  topHolderPct: number | null;
  isRugged: boolean;
  liquidityUsd: number | null;
}): string {
  if (input.isRugged) return 'danger';

  let score = input.rugCheckScore ?? 50;

  if (input.mintAuthority === true) score -= 20;
  if (input.freezeAuthority === true) score -= 15;

  if (input.topHolderPct !== null && input.topHolderPct > 80) {
    score -= 40;
  } else if (input.topHolderPct !== null && input.topHolderPct > 50) {
    score -= 20;
  }

  if (input.liquidityUsd !== null && input.liquidityUsd < 1000) {
    score -= 15;
  }

  if (score >= 70) return 'safe';
  if (score >= 40) return 'warning';
  return 'danger';
}

async function enrichToken(mint: string, uri: string | null, isReEnrich: boolean = false): Promise<void> {
  try {
    // Phase 1: Run all sources in parallel
    const [rugReport, authority, holders, price, metadata, gecko, dexScreener] = await Promise.allSettled([
      fetchRugCheckReport(mint),
      checkMintFreezeAuthority(mint),
      getTopHolderConcentration(mint),
      getTokenPrice(mint),
      fetchTokenMetadata(uri),
      getGeckoTokenData(mint),
      fetchDexScreenerInfo(mint),
    ]);

    const rug = rugReport.status === 'fulfilled' ? rugReport.value : null;
    const auth = authority.status === 'fulfilled' ? authority.value : null;
    const hold = holders.status === 'fulfilled' ? holders.value : null;
    const prc = price.status === 'fulfilled' ? price.value : null;
    const meta = metadata.status === 'fulfilled' ? metadata.value : null;
    const gk = gecko.status === 'fulfilled' ? gecko.value : null;
    const dex = dexScreener.status === 'fulfilled' ? dexScreener.value : null;

    // Resolve market data: prefer Jupiter/RugCheck, fallback to GeckoTerminal
    const resolvedPrice = prc?.priceUsd ?? gk?.priceUsd ?? null;
    const resolvedLiquidity = rug?.totalMarketLiquidity ?? gk?.liquidityUsd ?? null;
    const resolvedMarketCap = gk?.marketCapUsd ?? null;
    const resolvedVolume24h = gk?.volume24hUsd ?? null;

    // Resolve metadata: prefer RugCheck, fallback to URI metadata, then GeckoTerminal, then DexScreener
    const resolvedName = rug?.tokenMeta?.name || meta?.name || gk?.name || dex?.name || null;
    const resolvedSymbol = rug?.tokenMeta?.symbol || meta?.symbol || gk?.symbol || dex?.symbol || null;
    const resolvedImage = rug?.tokenMeta?.image || meta?.image || dex?.imageUrl || null;

    const safetyLevel = computeSafetyLevel({
      rugCheckScore: rug?.score ?? null,
      mintAuthority: auth?.mintAuthorityEnabled ?? null,
      freezeAuthority: auth?.freezeAuthorityEnabled ?? null,
      topHolderPct: hold?.topHolderPct ?? null,
      isRugged: rug?.rugged ?? false,
      liquidityUsd: resolvedLiquidity,
    });

    const enrichmentData: Record<string, unknown> = {
      safety_score: rug?.score ?? null,
      safety_level: safetyLevel,
      mint_authority: auth?.mintAuthorityEnabled ?? null,
      freeze_authority: auth?.freezeAuthorityEnabled ?? null,
      top_holder_pct: hold?.topHolderPct ?? null,
      holder_count: hold?.holderCount ?? dex?.holderCount ?? null,
      price_usd: resolvedPrice,
      market_cap_usd: resolvedMarketCap,
      volume_24h_usd: resolvedVolume24h,
      liquidity_usd: resolvedLiquidity,
      is_rugged: rug?.rugged ?? false,
      risk_details: rug?.risks ?? null,
    };

    // Only overwrite image/name/symbol if enrichment found new values
    // This preserves existing values from initial source (e.g. DexScreener icons)
    if (resolvedImage) enrichmentData.image_url = resolvedImage;
    if (resolvedName) enrichmentData.name = resolvedName;
    if (resolvedSymbol) enrichmentData.symbol = resolvedSymbol;

    await updateTokenEnrichment(mint, enrichmentData);

    const tag = isReEnrich ? 'Re-enriched' : 'Enriched';
    logger.info(`${tag}: ${mint} → ${safetyLevel} (score: ${rug?.score ?? 'N/A'}, price: ${resolvedPrice ? '$' + resolvedPrice : 'N/A'}, mcap: ${resolvedMarketCap ? '$' + resolvedMarketCap : 'N/A'}, holders: ${hold?.holderCount ?? 0}, name: ${resolvedName ?? 'unknown'})`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Enrichment failed for ${mint}: ${msg}`);
    await markEnrichmentError(mint, msg);
  }
}

let isRunning = false;

export async function startEnrichmentPipeline(): Promise<void> {
  isRunning = true;
  logger.info('Enrichment pipeline started (5min delay + re-enrichment + GeckoTerminal fallback)');

  while (isRunning) {
    // Primary: enrich tokens that are at least 5 minutes old
    const tokens = await fetchUnenrichedTokens(ENRICHMENT_CONCURRENCY, 5);

    if (tokens.length > 0) {
      const promises = tokens.map((t) => enrichToken(t.mint, t.uri ?? null, false));
      await Promise.allSettled(promises);
      await sleep(ENRICHMENT_DELAY_MS);
      continue;
    }

    // When idle: re-enrich tokens with missing data (last 3 hours only)
    const staleTokens = await fetchTokensForReEnrichment(5, 15, 1);

    if (staleTokens.length > 0) {
      logger.info(`Re-enriching ${staleTokens.length} tokens with incomplete data`);
      const promises = staleTokens.map((t) => enrichToken(t.mint, t.uri ?? null, true));
      await Promise.allSettled(promises);
      await sleep(ENRICHMENT_DELAY_MS);
      continue;
    }

    // Nothing to do, wait
    await sleep(5000);
  }
}

export function stopEnrichmentPipeline(): void {
  isRunning = false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
