import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

let supabase: SupabaseClient;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase env vars');
    supabase = createClient(url, key);
  }
  return supabase;
}

export interface UpsertTokenData {
  mint: string;
  name?: string | null;
  symbol?: string | null;
  uri?: string | null;
  image_url?: string | null;
  source: 'pumpfun' | 'raydium' | 'moonshot';
  creator?: string | null;
  bonding_curve?: string | null;
  pool_address?: string | null;
  base_mint?: string | null;
  quote_mint?: string | null;
}

export async function upsertToken(data: UpsertTokenData): Promise<void> {
  const db = getSupabase();
  const { error } = await db
    .from('tokens')
    .upsert(
      {
        ...data,
        enriched: false,
        detected_at: new Date().toISOString(),
      },
      { onConflict: 'mint', ignoreDuplicates: true }
    );

  if (error) {
    logger.error(`Failed to upsert token ${data.mint}: ${error.message}`);
  } else {
    logger.info(`Token upserted: ${data.symbol || data.mint} [${data.source}]`);
  }
}

export interface EnrichmentData {
  safety_score?: number | null;
  safety_level?: string;
  mint_authority?: boolean | null;
  freeze_authority?: boolean | null;
  top_holder_pct?: number | null;
  price_usd?: number | null;
  market_cap_usd?: number | null;
  liquidity_usd?: number | null;
  holder_count?: number | null;
  volume_24h_usd?: number | null;
  is_rugged?: boolean;
  risk_details?: unknown;
  image_url?: string | null;
  name?: string | null;
  symbol?: string | null;
}

export async function updateTokenEnrichment(
  mint: string,
  data: EnrichmentData
): Promise<void> {
  const db = getSupabase();
  const { error } = await db
    .from('tokens')
    .update({
      ...data,
      enriched: true,
      enriched_at: new Date().toISOString(),
      enrich_error: null,
    })
    .eq('mint', mint);

  if (error) {
    logger.error(`Failed to update enrichment for ${mint}: ${error.message}`);
  }
}

export async function markEnrichmentError(mint: string, errorMsg: string): Promise<void> {
  const db = getSupabase();
  await db
    .from('tokens')
    .update({ enrich_error: errorMsg })
    .eq('mint', mint);
}

export interface UnenrichedToken {
  mint: string;
  name: string | null;
  symbol: string | null;
  uri: string | null;
  source: string;
  detected_at: string;
}

/**
 * Fetch tokens that:
 * - Are not enriched yet
 * - Were detected at least `minAgeMinutes` ago (let them mature)
 */
export async function fetchUnenrichedTokens(limit: number, minAgeMinutes: number = 5): Promise<UnenrichedToken[]> {
  const db = getSupabase();
  const cutoff = new Date(Date.now() - minAgeMinutes * 60 * 1000).toISOString();

  const { data, error } = await db
    .from('tokens')
    .select('mint, name, symbol, uri, source, detected_at')
    .eq('enriched', false)
    .lte('detected_at', cutoff)
    .order('detected_at', { ascending: true })
    .limit(limit);

  if (error) {
    logger.error(`Failed to fetch unenriched tokens: ${error.message}`);
    return [];
  }
  return data || [];
}

/**
 * Delete dead tokens older than `maxAgeHours` with no holders, no price, no name.
 * Keeps DB lean.
 */
export async function cleanupDeadTokens(maxAgeHours: number = 2): Promise<number> {
  const db = getSupabase();
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

  const { data, error } = await db
    .from('tokens')
    .delete()
    .lte('detected_at', cutoff)
    .eq('enriched', true)
    .is('name', null)
    .is('price_usd', null)
    .or('holder_count.is.null,holder_count.eq.0')
    .select('id');

  if (error) {
    logger.error(`Cleanup failed: ${error.message}`);
    return 0;
  }
  return data?.length || 0;
}

/**
 * Delete old tokens (>maxAgeDays) that are inactive/dead.
 * Keeps trending tokens alive. Snapshots cascade-deleted automatically.
 */
export async function cleanupOldTokens(maxAgeDays: number = 2): Promise<number> {
  const db = getSupabase();
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000).toISOString();

  // Delete tokens older than maxAgeDays that:
  // - Have no meaningful activity (liquidity < $100 OR no price OR abandoned)
  // - Are NOT trending (trending_score = 0 or null)
  // - Are NOT in anyone's favorites
  const { data: favMints } = await db.from('favorites').select('token_mint');
  const favSet = new Set((favMints || []).map((f) => f.token_mint));

  // Fetch candidates for deletion
  const { data: candidates, error: fetchErr } = await db
    .from('tokens')
    .select('mint, price_usd, liquidity_usd, volume_24h_usd, holder_count, trending_score')
    .lte('detected_at', cutoff)
    .eq('enriched', true);

  if (fetchErr || !candidates) {
    logger.error(`Old token cleanup fetch failed: ${fetchErr?.message}`);
    return 0;
  }

  // Filter: delete if dead AND not trending AND not favorited
  const toDelete = candidates.filter((t) => {
    if ((t.trending_score ?? 0) > 0) return false; // keep trending
    if (favSet.has(t.mint)) return false; // keep favorited
    const isDead =
      (t.liquidity_usd !== null && t.liquidity_usd < 100) ||
      t.price_usd === null || t.price_usd === 0 ||
      (t.volume_24h_usd === 0 && (t.holder_count === null || t.holder_count <= 1));
    return isDead;
  });

  if (toDelete.length === 0) return 0;

  // Delete in batches of 100
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += 100) {
    const batch = toDelete.slice(i, i + 100).map((t) => t.mint);
    const { error } = await db.from('tokens').delete().in('mint', batch);
    if (error) {
      logger.error(`Old token batch delete failed: ${error.message}`);
    } else {
      deleted += batch.length;
    }
  }

  return deleted;
}

/**
 * Fetch tokens that were enriched but need re-enrichment:
 * - Enriched more than `reEnrichAfterMinutes` ago
 * - Detected within `maxAgeHours` (skip ancient dead tokens)
 * - Still have null price, holders, safety, or mcap
 */
/**
 * Fetch "safe" tokens that should be re-validated to catch dead/inactive tokens.
 * Re-checks every `reCheckAfterMinutes` for tokens within `maxAgeHours`.
 */
export async function fetchSafeTokensForReValidation(limit: number, reCheckAfterMinutes: number = 10, maxAgeHours: number = 2): Promise<UnenrichedToken[]> {
  const db = getSupabase();
  const cutoff = new Date(Date.now() - reCheckAfterMinutes * 60 * 1000).toISOString();
  const maxAgeCutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

  const { data, error } = await db
    .from('tokens')
    .select('mint, name, symbol, uri, source, detected_at')
    .eq('enriched', true)
    .eq('safety_level', 'safe')
    .lte('enriched_at', cutoff)
    .gte('detected_at', maxAgeCutoff)
    .order('enriched_at', { ascending: true })
    .limit(limit);

  if (error) {
    logger.error(`Failed to fetch safe tokens for re-validation: ${error.message}`);
    return [];
  }
  return data || [];
}

export async function fetchTokensForReEnrichment(limit: number, reEnrichAfterMinutes: number = 15, maxAgeHours: number = 3): Promise<UnenrichedToken[]> {
  const db = getSupabase();
  const cutoff = new Date(Date.now() - reEnrichAfterMinutes * 60 * 1000).toISOString();
  const maxAgeCutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

  const { data, error } = await db
    .from('tokens')
    .select('mint, name, symbol, uri, source, detected_at')
    .eq('enriched', true)
    .lte('enriched_at', cutoff)
    .gte('detected_at', maxAgeCutoff)
    .or('price_usd.is.null,holder_count.is.null,safety_score.is.null,market_cap_usd.is.null')
    .order('detected_at', { ascending: false })
    .limit(limit);

  if (error) {
    logger.error(`Failed to fetch tokens for re-enrichment: ${error.message}`);
    return [];
  }
  return data || [];
}

// ===== Trending / Snapshot functions =====

export interface SnapshotData {
  mint: string;
  price_usd: number | null;
  volume_24h_usd: number | null;
  market_cap_usd: number | null;
  holder_count: number | null;
  liquidity_usd: number | null;
}

export async function insertSnapshot(data: SnapshotData): Promise<void> {
  const db = getSupabase();
  const { error } = await db
    .from('token_snapshots')
    .insert({
      mint: data.mint,
      price_usd: data.price_usd,
      volume_24h_usd: data.volume_24h_usd,
      market_cap_usd: data.market_cap_usd,
      holder_count: data.holder_count,
      liquidity_usd: data.liquidity_usd,
      snapshot_at: new Date().toISOString(),
    });

  if (error) {
    logger.error(`Failed to insert snapshot for ${data.mint}: ${error.message}`);
  }
}

export async function cleanupOldSnapshots(maxAgeDays: number = 7): Promise<number> {
  const db = getSupabase();
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await db
    .from('token_snapshots')
    .delete()
    .lte('snapshot_at', cutoff)
    .select('id');

  if (error) {
    logger.error(`Snapshot cleanup failed: ${error.message}`);
    return 0;
  }
  return data?.length || 0;
}

export interface TokenSnapshot {
  price_usd: number | null;
  volume_24h_usd: number | null;
  market_cap_usd: number | null;
  holder_count: number | null;
  liquidity_usd: number | null;
  snapshot_at: string;
}

export async function fetchSnapshotsForToken(mint: string, hoursAgo: number = 48): Promise<TokenSnapshot[]> {
  const db = getSupabase();
  const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

  const { data, error } = await db
    .from('token_snapshots')
    .select('price_usd, volume_24h_usd, market_cap_usd, holder_count, liquidity_usd, snapshot_at')
    .eq('mint', mint)
    .gte('snapshot_at', cutoff)
    .order('snapshot_at', { ascending: true });

  if (error) {
    logger.error(`Failed to fetch snapshots for ${mint}: ${error.message}`);
    return [];
  }
  return data || [];
}

export async function fetchTrendingCandidates(limit: number = 200): Promise<{ mint: string }[]> {
  const db = getSupabase();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await db
    .from('tokens')
    .select('mint')
    .eq('enriched', true)
    .gte('detected_at', sevenDaysAgo)
    .not('price_usd', 'is', null)
    .gte('liquidity_usd', 100)
    .order('market_cap_usd', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    logger.error(`Failed to fetch trending candidates: ${error.message}`);
    return [];
  }
  return data || [];
}

export async function updateTrendingScore(mint: string, score: number): Promise<void> {
  const db = getSupabase();
  const { error } = await db
    .from('tokens')
    .update({ trending_score: score })
    .eq('mint', mint);

  if (error) {
    logger.error(`Failed to update trending score for ${mint}: ${error.message}`);
  }
}

export async function resetStaleTrendingScores(): Promise<void> {
  const db = getSupabase();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  await db
    .from('tokens')
    .update({ trending_score: 0 })
    .lt('detected_at', sevenDaysAgo)
    .gt('trending_score', 0);
}
