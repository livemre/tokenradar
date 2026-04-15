import {
  fetchTrendingCandidates,
  fetchSnapshotsForToken,
  updateTrendingScore,
  resetStaleTrendingScores,
  cleanupOldSnapshots,
  type TokenSnapshot,
} from '../db/supabase.js';
import { logger } from '../utils/logger.js';

const TRENDING_WEIGHTS = {
  VOLUME_GROWTH: 30,
  HOLDER_GROWTH: 25,
  PRICE_MOMENTUM: 20,
  LIQUIDITY_GROWTH: 15,
  CONSISTENCY: 10,
} as const;

function percentChange(oldVal: number | null, newVal: number | null): number | null {
  if (oldVal === null || newVal === null || oldVal === 0) return null;
  return ((newVal - oldVal) / oldVal) * 100;
}

function getSnapshotNearTime(snapshots: TokenSnapshot[], targetTime: number, toleranceMs: number = 2 * 60 * 60 * 1000): TokenSnapshot | null {
  if (snapshots.length === 0) return null;

  let closest = snapshots[0];
  let closestDiff = Math.abs(new Date(closest.snapshot_at).getTime() - targetTime);

  for (const snap of snapshots) {
    const diff = Math.abs(new Date(snap.snapshot_at).getTime() - targetTime);
    if (diff < closestDiff) {
      closest = snap;
      closestDiff = diff;
    }
  }

  if (closestDiff > toleranceMs) return null;
  return closest;
}

function scoreGrowth(pct: number | null, maxExpected: number): number {
  if (pct === null || pct <= 0) return 0;
  return Math.min(100, (pct / maxExpected) * 100);
}

function computeTrendingScore(snapshots: TokenSnapshot[]): number {
  if (snapshots.length < 2) return 0;

  const now = Date.now();
  const latest = snapshots[snapshots.length - 1];
  const oneHourAgo = getSnapshotNearTime(snapshots, now - 1 * 60 * 60 * 1000);
  const sixHoursAgo = getSnapshotNearTime(snapshots, now - 6 * 60 * 60 * 1000);
  const twentyFourHoursAgo = getSnapshotNearTime(snapshots, now - 24 * 60 * 60 * 1000, 4 * 60 * 60 * 1000);
  const sevenDaysAgo = getSnapshotNearTime(snapshots, now - 7 * 24 * 60 * 60 * 1000, 24 * 60 * 60 * 1000);

  // Prefer 6h, fallback 1h, 24h, 7d, or just the oldest snapshot we have
  let compareSnapshot = sixHoursAgo || oneHourAgo || twentyFourHoursAgo || sevenDaysAgo;

  // If no match within tolerances, use the oldest snapshot if it's at least 15 min old
  if (!compareSnapshot) {
    const oldest = snapshots[0];
    const ageMs = now - new Date(oldest.snapshot_at).getTime();
    if (ageMs >= 15 * 60 * 1000) {
      compareSnapshot = oldest;
    }
  }
  if (!compareSnapshot || compareSnapshot === latest) return 0;

  const volumeChange = percentChange(compareSnapshot.volume_24h_usd, latest.volume_24h_usd);
  const holderChange = percentChange(compareSnapshot.holder_count, latest.holder_count);
  const priceChange = percentChange(compareSnapshot.price_usd, latest.price_usd);
  const liquidityChange = percentChange(compareSnapshot.liquidity_usd, latest.liquidity_usd);

  const volumeScore = scoreGrowth(volumeChange, 500);
  const holderScore = scoreGrowth(holderChange, 200);
  const priceScore = scoreGrowth(priceChange, 300);
  const liquidityScore = scoreGrowth(liquidityChange, 200);

  // Consistency bonus: sustained growth across multiple periods
  let consistencyScore = 0;
  if (oneHourAgo && sixHoursAgo) {
    const recentHolderGrowth = percentChange(oneHourAgo.holder_count, latest.holder_count);
    const olderHolderGrowth = percentChange(sixHoursAgo.holder_count, oneHourAgo.holder_count);
    if (recentHolderGrowth !== null && recentHolderGrowth > 0 &&
        olderHolderGrowth !== null && olderHolderGrowth > 0) {
      consistencyScore = 80;
    }
  }

  const totalScore =
    (volumeScore * TRENDING_WEIGHTS.VOLUME_GROWTH +
     holderScore * TRENDING_WEIGHTS.HOLDER_GROWTH +
     priceScore * TRENDING_WEIGHTS.PRICE_MOMENTUM +
     liquidityScore * TRENDING_WEIGHTS.LIQUIDITY_GROWTH +
     consistencyScore * TRENDING_WEIGHTS.CONSISTENCY) / 100;

  return Math.round(totalScore * 100) / 100;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function calculateTrendingScores(): Promise<void> {
  logger.info('Calculating trending scores...');

  await resetStaleTrendingScores();
  await sleep(500);

  const cleaned = await cleanupOldSnapshots(30);
  if (cleaned > 0) {
    logger.info(`Cleaned up ${cleaned} old snapshots`);
  }
  await sleep(500);

  const candidates = await fetchTrendingCandidates(100);
  logger.info(`Calculating trending for ${candidates.length} candidates`);

  let updated = 0;
  for (const { mint } of candidates) {
    const snapshots = await fetchSnapshotsForToken(mint, 24 * 30);
    const score = computeTrendingScore(snapshots);
    await updateTrendingScore(mint, score);
    if (score > 0) updated++;
    await sleep(150); // Throttle: 150ms between each token to avoid Supabase 429
  }

  logger.info(`Trending scores updated: ${updated} tokens with positive score`);
}
