export const PUMPFUN_WS_URL = process.env.PUMPFUN_WS_URL || 'wss://pumpportal.fun/api/data';
export const DEXSCREENER_API_URL = process.env.DEXSCREENER_API_URL || 'https://api.dexscreener.com';
export const PUMPFUN_API_URL = process.env.PUMPFUN_API_URL || 'https://frontend-api-v3.pump.fun';
export const MOONSHOT_POLL_INTERVAL_MS = parseInt(process.env.MOONSHOT_POLL_INTERVAL_MS || '30000');
export const ENRICHMENT_CONCURRENCY = parseInt(process.env.ENRICHMENT_CONCURRENCY || '2');
export const ENRICHMENT_DELAY_MS = parseInt(process.env.ENRICHMENT_DELAY_MS || '5000');
export const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';
export const KNOWN_QUOTE_MINTS = new Set([SOL_MINT, USDC_MINT, USDT_MINT]);

// Reconnection
export const WS_RECONNECT_BASE_MS = 1000;
export const WS_RECONNECT_MAX_MS = 30000;
export const WS_HEARTBEAT_TIMEOUT_MS = 60000;
