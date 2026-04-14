import type { SafetyLevel } from '@/lib/types/token';
import { SAFETY_WEIGHTS, SAFETY_THRESHOLDS } from './constants';

export interface SafetyInput {
  rugCheckNormalised: number | null; // 0-100, higher = riskier (from RugCheck)
  mintAuthority: boolean | null;
  freezeAuthority: boolean | null;
  topHolderPct: number | null;
  holderCount: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  isRugged: boolean;
}

export interface SafetyResult {
  score: number;   // 0-100, higher = safer
  level: SafetyLevel;
}

/** Score a single factor 0-100 (100 = safest) */
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

function scoreVolume(usd: number): number {
  if (usd >= 10_000) return 100;
  if (usd >= 1_000) return 80;
  if (usd >= 100) return 50;
  if (usd >= 10) return 20;
  return 0;
}

/**
 * Compute safety score and level using weighted factor system.
 * Each factor scores 0-100, weighted by importance.
 * Missing factors are excluded from the average.
 */
export function computeSafety(input: SafetyInput): SafetyResult {
  // Override: confirmed rug = immediate danger
  if (input.isRugged) return { score: 0, level: 'danger' };

  // Override: scam pattern (mint + freeze + high concentration)
  if (
    input.mintAuthority === true &&
    input.freezeAuthority === true &&
    input.topHolderPct !== null && input.topHolderPct > 80
  ) {
    return { score: 5, level: 'danger' };
  }

  // Weighted factor calculation
  let totalScore = 0;
  let totalWeight = 0;

  // Factor 1: RugCheck (inverted: 100 - normalised)
  if (input.rugCheckNormalised !== null) {
    totalScore += (100 - input.rugCheckNormalised) * SAFETY_WEIGHTS.RUGCHECK;
    totalWeight += SAFETY_WEIGHTS.RUGCHECK;
  }

  // Factor 2: Mint Authority
  if (input.mintAuthority !== null) {
    totalScore += (input.mintAuthority ? 0 : 100) * SAFETY_WEIGHTS.MINT_AUTHORITY;
    totalWeight += SAFETY_WEIGHTS.MINT_AUTHORITY;
  }

  // Factor 3: Freeze Authority
  if (input.freezeAuthority !== null) {
    totalScore += (input.freezeAuthority ? 0 : 100) * SAFETY_WEIGHTS.FREEZE_AUTHORITY;
    totalWeight += SAFETY_WEIGHTS.FREEZE_AUTHORITY;
  }

  // Factor 4: Holder Concentration
  if (input.topHolderPct !== null) {
    totalScore += scoreHolderConcentration(input.topHolderPct) * SAFETY_WEIGHTS.HOLDER_CONCENTRATION;
    totalWeight += SAFETY_WEIGHTS.HOLDER_CONCENTRATION;
  }

  // Factor 5: Holder Count
  if (input.holderCount !== null) {
    totalScore += scoreHolderCount(input.holderCount) * SAFETY_WEIGHTS.HOLDER_COUNT;
    totalWeight += SAFETY_WEIGHTS.HOLDER_COUNT;
  }

  // Factor 6: Liquidity
  if (input.liquidityUsd !== null) {
    totalScore += scoreLiquidity(input.liquidityUsd) * SAFETY_WEIGHTS.LIQUIDITY;
    totalWeight += SAFETY_WEIGHTS.LIQUIDITY;
  }

  // Factor 7: Volume
  if (input.volume24hUsd !== null) {
    totalScore += scoreVolume(input.volume24hUsd) * SAFETY_WEIGHTS.VOLUME;
    totalWeight += SAFETY_WEIGHTS.VOLUME;
  }

  // No data at all → unknown
  if (totalWeight === 0) return { score: 0, level: 'unknown' };

  const score = Math.round(totalScore / totalWeight);

  let level: SafetyLevel;
  if (score >= SAFETY_THRESHOLDS.SAFE_MIN_SCORE) level = 'safe';
  else if (score >= SAFETY_THRESHOLDS.WARNING_MIN_SCORE) level = 'warning';
  else level = 'danger';

  return { score, level };
}

// Keep old function name as alias for backward compatibility
export function computeSafetyLevel(input: SafetyInput): SafetyLevel {
  return computeSafety(input).level;
}

export function getSafetyColor(level: SafetyLevel): string {
  switch (level) {
    case 'safe': return '#00ff88';
    case 'warning': return '#ffaa00';
    case 'danger': return '#ff3366';
    default: return '#666666';
  }
}

export function getSafetyLabel(level: SafetyLevel): string {
  switch (level) {
    case 'safe': return 'Safe';
    case 'warning': return 'Warning';
    case 'danger': return 'Danger';
    default: return 'Unknown';
  }
}

/** Token is "dead" when enriched but has no meaningful liquidity/price/activity */
export function isTokenDead(token: {
  enriched: boolean;
  liquidity_usd: number | null;
  price_usd: number | null;
  volume_24h_usd: number | null;
  holder_count: number | null;
}): boolean {
  if (!token.enriched) return false;
  if (token.liquidity_usd !== null && token.liquidity_usd < 100) return true;
  if (token.price_usd === null || token.price_usd === 0) return true;
  if (token.volume_24h_usd === 0 && token.holder_count !== null && token.holder_count <= 1) return true;
  return false;
}

/** Data is stale when last enrichment was more than `thresholdMinutes` ago */
export function isDataStale(enrichedAt: string | null, thresholdMinutes = 30): boolean {
  if (!enrichedAt) return false;
  return Date.now() - new Date(enrichedAt).getTime() > thresholdMinutes * 60 * 1000;
}
