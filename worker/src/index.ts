import 'dotenv/config';
import { startPumpFunListener, stopPumpFunListener } from './sources/pumpfun.js';
import { startMoonshotPoller, stopMoonshotPoller } from './sources/moonshot.js';
import { startEnrichmentPipeline, stopEnrichmentPipeline } from './enrichment/pipeline.js';
import { cleanupDeadTokens, cleanupOldTokens } from './db/supabase.js';
import { calculateTrendingScores } from './enrichment/trending.js';
import { logger } from './utils/logger.js';

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // Every 30 minutes
const TRENDING_INTERVAL_MS = 30 * 60 * 1000; // Every 30 minutes

async function main() {
  logger.info('TokenRadar Worker starting...');

  // Start data sources
  startPumpFunListener();
  startMoonshotPoller();

  // Start enrichment pipeline
  startEnrichmentPipeline();

  // Periodic cleanup (every 30 min)
  const cleanupLoop = setInterval(async () => {
    try {
      const deadDeleted = await cleanupDeadTokens(2);
      if (deadDeleted > 0) {
        logger.info(`Cleanup: deleted ${deadDeleted} dead tokens (>2h old, no data)`);
      }
      const oldDeleted = await cleanupOldTokens(2);
      if (oldDeleted > 0) {
        logger.info(`Cleanup: deleted ${oldDeleted} old inactive tokens (>2 days)`);
      }
    } catch (err) {
      logger.error('Cleanup error:', err);
    }
  }, CLEANUP_INTERVAL_MS);

  // Run initial cleanup
  const initialDead = await cleanupDeadTokens(2);
  const initialOld = await cleanupOldTokens(2);
  if (initialDead + initialOld > 0) {
    logger.info(`Initial cleanup: ${initialDead} dead + ${initialOld} old inactive tokens deleted`);
  }

  // Periodic trending score calculation (every 15 min)
  const trendingLoop = setInterval(async () => {
    try {
      await calculateTrendingScores();
    } catch (err) {
      logger.error('Trending calculation error:', err);
    }
  }, TRENDING_INTERVAL_MS);

  // Initial trending calculation after 5 min (let snapshots populate first)
  setTimeout(async () => {
    try {
      await calculateTrendingScores();
    } catch (err) {
      logger.error('Initial trending calculation error:', err);
    }
  }, 5 * 60 * 1000);

  logger.info('TokenRadar Worker is running.');

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down...');
    clearInterval(cleanupLoop);
    clearInterval(trendingLoop);
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
