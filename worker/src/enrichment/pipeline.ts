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
import { getPumpFunTokenData } from './pumpfun.js';
import { logger } from '../utils/logger.js';
import { ENRICHMENT_CONCURRENCY, ENRICHMENT_DELAY_MS } from '../utils/constants.js';

// Safety scoring: weighted factor system (mirrored from lib/utils/safety.ts)
const SAFETY_WEIGHTS = { RUGCHECK: 25, MINT_AUTHORITY: 20, FREEZE_AUTHORITY: 15, HOLDER_CONCENTRATION: 15, HOLDER_COUNT: 10, LIQUIDITY: 15 };

function scoreHolderConcentration(pct: number): number {
  if (pct < 30) return 100;
  if (pct < 50) return 70;
  if (pct < 70) return 40;
  if (pct < 90) return 15;
  return 0;
}

function scoreHolderCount(count: number): number {
  if (count >= 100) return 100;
  if (count >= 50) return 80;
  if (count >= 20) return 60;
  if (count >= 5) return 30;
  return 10;
}

function scoreLiquidity(usd: number): number {
  if (usd >= 50_000) return 100;
  if (usd >= 10_000) return 80;
  if (usd >= 5_000) return 60;
  if (usd >= 1_000) return 40;
  return 15;
}

function computeSafety(input: {
  rugCheckNormalised: number | null;
  mintAuthority: boolean | null;
  freezeAuthority: boolean | null;
  topHolderPct: number | null;
  holderCount: number | null;
  liquidityUsd: number | null;
  isRugged: boolean;
}): { score: number; level: string } {
  if (input.isRugged) return { score: 0, level: 'danger' };

  if (input.mintAuthority === true && input.freezeAuthority === true &&
      input.topHolderPct !== null && input.topHolderPct > 80) {
    return { score: 5, level: 'danger' };
  }

  let totalScore = 0;
  let totalWeight = 0;

  if (input.rugCheckNormalised !== null) {
    totalScore += (100 - input.rugCheckNormalised) * SAFETY_WEIGHTS.RUGCHECK;
    totalWeight += SAFETY_WEIGHTS.RUGCHECK;
  }
  if (input.mintAuthority !== null) {
    totalScore += (input.mintAuthority ? 0 : 100) * SAFETY_WEIGHTS.MINT_AUTHORITY;
    totalWeight += SAFETY_WEIGHTS.MINT_AUTHORITY;
  }
  if (input.freezeAuthority !== null) {
    totalScore += (input.freezeAuthority ? 0 : 100) * SAFETY_WEIGHTS.FREEZE_AUTHORITY;
    totalWeight += SAFETY_WEIGHTS.FREEZE_AUTHORITY;
  }
  if (input.topHolderPct !== null) {
    totalScore += scoreHolderConcentration(input.topHolderPct) * SAFETY_WEIGHTS.HOLDER_CONCENTRATION;
    totalWeight += SAFETY_WEIGHTS.HOLDER_CONCENTRATION;
  }
  if (input.holderCount !== null) {
    totalScore += scoreHolderCount(input.holderCount) * SAFETY_WEIGHTS.HOLDER_COUNT;
    totalWeight += SAFETY_WEIGHTS.HOLDER_COUNT;
  }
  if (input.liquidityUsd !== null) {
    totalScore += scoreLiquidity(input.liquidityUsd) * SAFETY_WEIGHTS.LIQUIDITY;
    totalWeight += SAFETY_WEIGHTS.LIQUIDITY;
  }

  if (totalWeight === 0) return { score: 0, level: 'unknown' };

  const score = Math.round(totalScore / totalWeight);
  let level: string;
  if (score >= 70) level = 'safe';
  else if (score >= 40) level = 'warning';
  else level = 'danger';

  return { score, level };
}

async function enrichToken(mint: string, uri: string | null, source: string, isReEnrich: boolean = false): Promise<void> {
  try {
    // Phase 1: Run all sources in parallel
    const [rugReport, authority, holders, price, metadata, gecko, dexScreener, pumpFunData] = await Promise.allSettled([
      fetchRugCheckReport(mint),
      checkMintFreezeAuthority(mint),
      getTopHolderConcentration(mint),
      getTokenPrice(mint),
      fetchTokenMetadata(uri),
      getGeckoTokenData(mint),
      fetchDexScreenerInfo(mint),
      source === 'pumpfun' ? getPumpFunTokenData(mint) : Promise.resolve(null),
    ]);

    const rug = rugReport.status === 'fulfilled' ? rugReport.value : null;
    const auth = authority.status === 'fulfilled' ? authority.value : null;
    const hold = holders.status === 'fulfilled' ? holders.value : null;
    const prc = price.status === 'fulfilled' ? price.value : null;
    const meta = metadata.status === 'fulfilled' ? metadata.value : null;
    const gk = gecko.status === 'fulfilled' ? gecko.value : null;
    const dex = dexScreener.status === 'fulfilled' ? dexScreener.value : null;
    const pf = pumpFunData.status === 'fulfilled' ? pumpFunData.value : null;

    // Resolve market data: prefer Jupiter, then PumpFun (bonding curve), then DexScreener, then GeckoTerminal
    const resolvedPrice = prc?.priceUsd ?? pf?.priceUsd ?? dex?.priceUsd ?? gk?.priceUsd ?? null;
    const resolvedLiquidity = rug?.totalMarketLiquidity ?? pf?.liquidityUsd ?? dex?.liquidityUsd ?? gk?.liquidityUsd ?? null;
    const resolvedMarketCap = pf?.marketCapUsd ?? dex?.marketCapUsd ?? gk?.marketCapUsd ?? null;
    const resolvedVolume24h = dex?.volume24hUsd ?? gk?.volume24hUsd ?? null;

    // Resolve metadata: prefer RugCheck, fallback to URI metadata, PumpFun, GeckoTerminal, DexScreener
    const resolvedName = rug?.tokenMeta?.name || meta?.name || pf?.name || gk?.name || dex?.name || null;
    const resolvedSymbol = rug?.tokenMeta?.symbol || meta?.symbol || pf?.symbol || gk?.symbol || dex?.symbol || null;
    const resolvedImage = rug?.tokenMeta?.image || meta?.image || pf?.imageUrl || dex?.imageUrl || null;

    const safety = computeSafety({
      rugCheckNormalised: rug?.score_normalised ?? null,
      mintAuthority: auth?.mintAuthorityEnabled ?? null,
      freezeAuthority: auth?.freezeAuthorityEnabled ?? null,
      topHolderPct: hold?.topHolderPct ?? null,
      holderCount: hold?.holderCount ?? null,
      liquidityUsd: resolvedLiquidity,
      isRugged: rug?.rugged ?? false,
    });

    const enrichmentData: Record<string, unknown> = {
      safety_score: safety.score,
      safety_level: safety.level,
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
    logger.info(`${tag}: ${mint} → ${safety.level} (safety: ${safety.score}/100, price: ${resolvedPrice ? '$' + resolvedPrice : 'N/A'}, mcap: ${resolvedMarketCap ? '$' + resolvedMarketCap : 'N/A'}, holders: ${hold?.holderCount ?? 0}, name: ${resolvedName ?? 'unknown'})`);
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
      const promises = tokens.map((t) => enrichToken(t.mint, t.uri ?? null, t.source, false));
      await Promise.allSettled(promises);
      await sleep(ENRICHMENT_DELAY_MS);
      continue;
    }

    // When idle: re-enrich tokens with missing data (last 3 hours only)
    const staleTokens = await fetchTokensForReEnrichment(5, 15, 3);

    if (staleTokens.length > 0) {
      logger.info(`Re-enriching ${staleTokens.length} tokens with incomplete data`);
      const promises = staleTokens.map((t) => enrichToken(t.mint, t.uri ?? null, t.source, true));
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
