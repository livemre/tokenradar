import 'dotenv/config';
import { startPumpFunListener, stopPumpFunListener } from './sources/pumpfun.js';
import { startMoonshotPoller, stopMoonshotPoller } from './sources/moonshot.js';
import { startEnrichmentPipeline, stopEnrichmentPipeline } from './enrichment/pipeline.js';
import { cleanupDeadTokens } from './db/supabase.js';
import { logger } from './utils/logger.js';

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // Every 30 minutes

async function main() {
  logger.info('TokenRadar Worker starting...');

  // Start data sources
  startPumpFunListener();
  startMoonshotPoller();

  // Start enrichment pipeline
  startEnrichmentPipeline();

  // Periodic cleanup of dead tokens (every 30 min)
  const cleanupLoop = setInterval(async () => {
    try {
      const deleted = await cleanupDeadTokens(2);
      if (deleted > 0) {
        logger.info(`Cleanup: deleted ${deleted} dead tokens (>2h old, no data)`);
      }
    } catch (err) {
      logger.error('Cleanup error:', err);
    }
  }, CLEANUP_INTERVAL_MS);

  // Run initial cleanup
  const initialDeleted = await cleanupDeadTokens(2);
  if (initialDeleted > 0) {
    logger.info(`Initial cleanup: deleted ${initialDeleted} dead tokens`);
  }

  logger.info('TokenRadar Worker is running.');

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down...');
    clearInterval(cleanupLoop);
    stopPumpFunListener();
    stopMoonshotPoller();
    stopEnrichmentPipeline();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  logger.error('Fatal error:', err);
  process.exit(1);
});
