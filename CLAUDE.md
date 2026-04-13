@AGENTS.md

# TokenRadar (tokenradar.site)

## Project Overview
Real-time memecoin radar + safety analysis dashboard for Solana.

## Architecture
- **Next.js App (Vercel):** Frontend dashboard + API routes
- **Worker (Railway):** Persistent WebSocket to Pump.fun, DexScreener polling, enrichment pipeline
- **Supabase:** PostgreSQL + Realtime

## Key Commands
- `npm run dev` — Start Next.js dev server
- `cd worker && npm run dev` — Start worker in dev mode

## Tech Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Framer Motion, Sonner, Lucide React
- Supabase (DB + Realtime)
- Worker: Node.js + ws + @solana/web3.js

## Code Conventions
- Use `@/` path alias for imports
- Types in `lib/types/`
- Shared utils in `lib/utils/`
- React hooks in `lib/hooks/`
- Supabase clients in `lib/supabase/`
- API routes in `app/api/`
