# TokenRadar

Real-time Solana memecoin radar with safety analysis.

**[tokenradar.site](https://tokenradar.site)**

## Features

- Real-time token detection from PumpFun & Moonshot
- Safety scoring with rug-pull analysis (RugCheck integration)
- On-chain authority & top holder concentration checks
- Live price, market cap, volume & liquidity data
- Interactive candlestick charts (GeckoTerminal OHLCV)
- Jupiter swap integration
- Push notifications with customizable alerts
- Favorites system (Google OAuth / email sign-in)
- Multi-language support (EN, TR, ES, PT, DE, FR, KO, JA, ZH)

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Worker**: Node.js — PumpFun WebSocket, DexScreener polling, enrichment pipeline
- **APIs**: RugCheck, Helius RPC, Jupiter, GeckoTerminal, DexScreener

## Architecture

```
[PumpFun WS] ──┐
                ├── Worker ──► Supabase DB ──► Next.js App (Vercel)
[DexScreener] ──┘     │                            │
                       ▼                            ▼
                 Enrichment Pipeline          tokenradar.site
                 (RugCheck, Helius,
                  GeckoTerminal, Jupiter)
```

## License

MIT
