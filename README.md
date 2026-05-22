# Random MHA Quirk

Roll random My Hero Academia quirks (solo or hybrid fusion). Bilingual UI (EN / pt-BR).

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **Supabase** — fusion cache (`fusion_entries`)
- **OpenAI / Gemini** — on-demand hybrid fusion (server-only)

## Setup

1. `cp .env.example .env.local` and fill in Supabase + LLM keys
2. Run [`supabase/migrations/001_fusion_entries.sql`](supabase/migrations/001_fusion_entries.sql) in your Supabase project
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

Fusion setup: [`docs/fusion.md`](docs/fusion.md)

Catalog maintenance (optional, not part of the app): [`tools/catalog/README.md`](tools/catalog/README.md)
