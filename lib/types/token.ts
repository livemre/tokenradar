export type TokenSource = 'pumpfun' | 'raydium' | 'moonshot';
export type SafetyLevel = 'safe' | 'warning' | 'danger' | 'unknown';

export interface Token {
  id: string;
  mint: string;
  name: string | null;
  symbol: string | null;
  uri: string | null;
  image_url: string | null;
  source: TokenSource;
  creator: string | null;

  // Market data
  price_usd: number | null;
  market_cap_usd: number | null;
  liquidity_usd: number | null;
  holder_count: number | null;
  volume_24h_usd: number | null;

  // Safety
  safety_level: SafetyLevel;
  safety_score: number | null;
  mint_authority: boolean | null;
  freeze_authority: boolean | null;
  top_holder_pct: number | null;
  is_rugged: boolean;
  risk_details: RiskDetail[] | null;

  // Status
  enriched: boolean;
  enriched_at: string | null;
  enrich_error: string | null;

  // Pump.fun specific
  bonding_curve: string | null;
  migrated: boolean;

  // Raydium specific
  pool_address: string | null;
  base_mint: string | null;
  quote_mint: string | null;

  // Timestamps
  detected_at: string;
  created_at: string;
  updated_at: string;
}

export interface RiskDetail {
  name: string;
  description: string;
  level: 'info' | 'warn' | 'danger';
  score: number;
}

export interface TrendingMetrics {
  volume_change_pct: number | null;
  holder_change_pct: number | null;
  price_change_pct: number | null;
  liquidity_change_pct: number | null;
}

export interface TrendingToken extends Token {
  trending_score: number;
  trending_metrics: TrendingMetrics;
}

export type TrendingPeriod = '1h' | '6h' | '24h';

export interface TokenFilters {
  source?: TokenSource;
  safety?: SafetyLevel;
  minMcap?: number;
  maxMcap?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
