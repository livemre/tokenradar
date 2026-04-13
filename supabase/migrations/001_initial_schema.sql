-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Token source enum
CREATE TYPE token_source AS ENUM ('pumpfun', 'raydium', 'moonshot');

-- Safety level enum
CREATE TYPE safety_level AS ENUM ('safe', 'warning', 'danger', 'unknown');

-- Main tokens table
CREATE TABLE tokens (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mint            TEXT NOT NULL UNIQUE,
  name            TEXT,
  symbol          TEXT,
  uri             TEXT,
  image_url       TEXT,
  source          token_source NOT NULL,
  creator         TEXT,

  -- Market data
  price_usd       DOUBLE PRECISION,
  market_cap_usd  DOUBLE PRECISION,
  liquidity_usd   DOUBLE PRECISION,
  holder_count    INTEGER,
  volume_24h_usd  DOUBLE PRECISION,

  -- Safety analysis
  safety_level    safety_level DEFAULT 'unknown',
  safety_score    INTEGER,
  mint_authority  BOOLEAN,
  freeze_authority BOOLEAN,
  top_holder_pct  DOUBLE PRECISION,
  is_rugged       BOOLEAN DEFAULT FALSE,
  risk_details    JSONB,

  -- Enrichment status
  enriched        BOOLEAN DEFAULT FALSE,
  enriched_at     TIMESTAMPTZ,
  enrich_error    TEXT,

  -- Pump.fun specific
  bonding_curve   TEXT,
  migrated        BOOLEAN DEFAULT FALSE,

  -- Raydium specific
  pool_address    TEXT,
  base_mint       TEXT,
  quote_mint      TEXT,

  -- Timestamps
  detected_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tokens_source ON tokens (source);
CREATE INDEX idx_tokens_safety_level ON tokens (safety_level);
CREATE INDEX idx_tokens_detected_at ON tokens (detected_at DESC);
CREATE INDEX idx_tokens_market_cap ON tokens (market_cap_usd DESC NULLS LAST);
CREATE INDEX idx_tokens_enriched ON tokens (enriched) WHERE enriched = FALSE;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tokens_updated_at
  BEFORE UPDATE ON tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tokens;

-- Row Level Security
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON tokens
  FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON tokens
  FOR ALL USING (auth.role() = 'service_role');
