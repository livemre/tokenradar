// Solana known mints
export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

export const KNOWN_QUOTE_MINTS = new Set([SOL_MINT, USDC_MINT, USDT_MINT]);

// Raydium AMM Program
export const RAYDIUM_AMM_PROGRAM = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';

// Safety thresholds
export const SAFETY_THRESHOLDS = {
  SAFE_MIN_SCORE: 70,
  WARNING_MIN_SCORE: 40,
  HIGH_HOLDER_PCT: 50,
  CRITICAL_HOLDER_PCT: 80,
  LOW_LIQUIDITY_USD: 1000,
  MINT_AUTHORITY_PENALTY: 20,
  FREEZE_AUTHORITY_PENALTY: 15,
  HIGH_HOLDER_PENALTY: 20,
  CRITICAL_HOLDER_PENALTY: 20,
  LOW_LIQUIDITY_PENALTY: 15,
} as const;

// Design tokens
export const COLORS = {
  safe: '#00ff88',
  warning: '#ffaa00',
  danger: '#ff3366',
  pumpfun: '#9945FF',
  raydium: '#2BFFB1',
  moonshot: '#FFD700',
  bg: '#0a0a0f',
  bgCard: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.08)',
} as const;

// Gradient design tokens
export const GRADIENTS = {
  safe: 'linear-gradient(135deg, #00ff88, #00d4aa)',
  warning: 'linear-gradient(135deg, #ffaa00, #ff8800)',
  danger: 'linear-gradient(135deg, #ff3366, #ff1744)',
  brand: 'linear-gradient(135deg, #00ff88, #00bfff)',
} as const;
