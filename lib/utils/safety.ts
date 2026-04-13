import type { SafetyLevel } from '@/lib/types/token';
import { SAFETY_THRESHOLDS } from './constants';

interface SafetyInput {
  rugCheckScore: number | null;
  mintAuthority: boolean | null;
  freezeAuthority: boolean | null;
  topHolderPct: number | null;
  isRugged: boolean;
  liquidityUsd: number | null;
}

export function computeSafetyLevel(input: SafetyInput): SafetyLevel {
  if (input.isRugged) return 'danger';

  let score = input.rugCheckScore ?? 50;

  if (input.mintAuthority === true) score -= SAFETY_THRESHOLDS.MINT_AUTHORITY_PENALTY;
  if (input.freezeAuthority === true) score -= SAFETY_THRESHOLDS.FREEZE_AUTHORITY_PENALTY;

  if (input.topHolderPct !== null && input.topHolderPct > SAFETY_THRESHOLDS.CRITICAL_HOLDER_PCT) {
    score -= SAFETY_THRESHOLDS.HIGH_HOLDER_PENALTY + SAFETY_THRESHOLDS.CRITICAL_HOLDER_PENALTY;
  } else if (input.topHolderPct !== null && input.topHolderPct > SAFETY_THRESHOLDS.HIGH_HOLDER_PCT) {
    score -= SAFETY_THRESHOLDS.HIGH_HOLDER_PENALTY;
  }

  if (input.liquidityUsd !== null && input.liquidityUsd < SAFETY_THRESHOLDS.LOW_LIQUIDITY_USD) {
    score -= SAFETY_THRESHOLDS.LOW_LIQUIDITY_PENALTY;
  }

  if (score >= SAFETY_THRESHOLDS.SAFE_MIN_SCORE) return 'safe';
  if (score >= SAFETY_THRESHOLDS.WARNING_MIN_SCORE) return 'warning';
  return 'danger';
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
