# Development setup

Roll random My Hero Academia quirks (solo or hybrid fusion). Bilingual UI (EN / pt-BR).

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **Supabase** — fusion cache (`fusion_entries`)
- **OpenAI / Gemini** — on-demand hybrid fusion (server-only)

## Setup

1. `cp .env.example .env.local` and fill in Supabase + LLM keys
2. Apply DB migrations from this repo:
   - `pnpm exec supabase login` (once)
   - set `SUPABASE_DB_PASSWORD` in `.env`
   - `pnpm db:push`
3. Optional one-time seed: `node scripts/seed-fusion-cache.mjs`
4. `pnpm dev` → http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm fusion:generate -- --a id1 --b id2` | CLI: generate fusion → Supabase |
| `pnpm db:push` | Apply `supabase/migrations/` to linked project |

Fusion setup: [`fusion.md`](fusion.md)

Catalog maintenance (optional, not part of the app): [`../tools/catalog/README.md`](../tools/catalog/README.md)
