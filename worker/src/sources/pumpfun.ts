import WebSocket from 'ws';
import { upsertToken, getSupabase } from '../db/supabase.js';
import { logger } from '../utils/logger.js';
import {
  PUMPFUN_WS_URL,
  WS_RECONNECT_BASE_MS,
  WS_RECONNECT_MAX_MS,
  WS_HEARTBEAT_TIMEOUT_MS,
} from '../utils/constants.js';

interface PumpFunTokenEvent {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  bondingCurve?: string;
  associatedBondingCurve?: string;
  creator_wallet?: { address: string };
  traderPublicKey?: string;
  marketCapSol?: number;
  vSolInBondingCurve?: number;
}

interface MigrationEvent {
  mint?: string;
  token?: string;
  pool?: string;
  poolAddress?: string;
  [key: string]: unknown;
}

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
let isShuttingDown = false;
let migrationCount = 0;

function resetHeartbeat() {
  if (heartbeatTimer) clearTimeout(heartbeatTimer);
  heartbeatTimer = setTimeout(() => {
    logger.warn('PumpFun: No message received in 60s, reconnecting...');
    ws?.terminate();
  }, WS_HEARTBEAT_TIMEOUT_MS);
}

async function handleMigration(event: MigrationEvent) {
  const mint = event.mint || event.token;
  if (!mint) return;

  const poolAddress = event.pool || event.poolAddress;
  migrationCount++;

  try {
    const db = getSupabase();
    await db
      .from('tokens')
      .update({
        migrated: true,
        pool_address: poolAddress || null,
      })
      .eq('mint', mint);

    logger.info(`PumpFun GRADUATED: ${mint} → Raydium${poolAddress ? ` (pool: ${poolAddress.slice(0, 8)}...)` : ''} [#${migrationCount}]`);
  } catch (err) {
    logger.error(`Failed to update migration for ${mint}`, err);
  }
}

function connect() {
  if (isShuttingDown) return;

  logger.info(`PumpFun: Connecting to ${PUMPFUN_WS_URL}...`);
  ws = new WebSocket(PUMPFUN_WS_URL);

  ws.on('open', () => {
    logger.info('PumpFun: Connected, subscribing to new tokens + migrations...');
    reconnectAttempts = 0;

    // Subscribe to new token creation
    ws!.send(JSON.stringify({ method: 'subscribeNewToken' }));

    // Subscribe to migration events (bonding curve → Raydium)
    ws!.send(JSON.stringify({ method: 'subscribeMigration' }));

    resetHeartbeat();
  });

  ws.on('message', async (data: WebSocket.Data) => {
    resetHeartbeat();

    try {
      const parsed = JSON.parse(data.toString());

      // Skip subscription confirmations
      if (parsed.message) return;

      // Migration event — token graduated to Raydium
      if (parsed.txType === 'migration' || parsed.pool || parsed.poolAddress) {
        await handleMigration(parsed as MigrationEvent);
        return;
      }

      // New token event
      if (!parsed.mint) return;

      const event = parsed as PumpFunTokenEvent;

      await upsertToken({
        mint: event.mint,
        name: event.name || null,
        symbol: event.symbol || null,
        uri: event.uri || null,
        source: 'pumpfun',
        creator: event.traderPublicKey || event.creator_wallet?.address || null,
        bonding_curve: event.bondingCurve || null,
      });
    } catch (err) {
      logger.error('PumpFun: Failed to process message', err);
    }
  });

  ws.on('close', (code, reason) => {
    logger.warn(`PumpFun: Disconnected (code: ${code}, reason: ${reason.toString()})`);
    if (heartbeatTimer) clearTimeout(heartbeatTimer);
    scheduleReconnect();
  });

  ws.on('error', (err) => {
    logger.error('PumpFun: WebSocket error', err.message);
  });
}

function scheduleReconnect() {
  if (isShuttingDown) return;

  const delay = Math.min(
    WS_RECONNECT_BASE_MS * Math.pow(2, reconnectAttempts),
    WS_RECONNECT_MAX_MS
  );
  reconnectAttempts++;
  logger.info(`PumpFun: Reconnecting in ${delay}ms (attempt ${reconnectAttempts})...`);
  setTimeout(connect, delay);
}

export function startPumpFunListener(): void {
  connect();
}

export function stopPumpFunListener(): void {
  isShuttingDown = true;
  if (heartbeatTimer) clearTimeout(heartbeatTimer);
  if (ws) {
    ws.close();
    ws = null;
  }
}
