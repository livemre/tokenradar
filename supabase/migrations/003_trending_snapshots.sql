-- =====================================================
-- 003_trending_snapshots.sql
-- Token snapshots for trending score calculation
-- =====================================================

-- Snapshot table: stores periodic market data snapshots
CREATE TABLE public.token_snapshots (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mint           TEXT NOT NULL REFERENCES public.tokens(mint) ON DELETE CASCADE,
  price_usd      DOUBLE PRECISION,
  volume_24h_usd DOUBLE PRECISION,
  market_cap_usd DOUBLE PRECISION,
  holder_count   INTEGER,
  liquidity_usd  DOUBLE PRECISION,
  snapshot_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Primary query: get snapshots for a mint ordered by time
CREATE INDEX idx_snapshots_mint_time ON public.token_snapshots (mint, snapshot_at DESC);

-- Cleanup query: delete old snapshots
CREATE INDEX idx_snapshots_time ON public.token_snapshots (snapshot_at);

-- RLS
ALTER TABLE public.token_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on snapshots"
  ON public.token_snapshots FOR SELECT USING (true);

CREATE POLICY "Service role full access on snapshots"
  ON public.token_snapshots FOR ALL USING (auth.role() = 'service_role');

-- Add trending_score column to tokens table
ALTER TABLE public.tokens ADD COLUMN trending_score DOUBLE PRECISION DEFAULT 0;

-- Partial index for trending queries (only enriched tokens with positive score)
CREATE INDEX idx_tokens_trending ON public.tokens (trending_score DESC NULLS LAST)
  WHERE enriched = TRUE AND trending_score > 0;
