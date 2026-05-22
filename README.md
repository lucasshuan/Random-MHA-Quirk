# Random MHA Quirk

Roll random My Hero Academia quirks (solo or hybrid fusion). Bilingual UI (EN / pt-BR).

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **Supabase** — fusion cache (`fusion_entries`)
- **OpenAI / Gemini** — on-demand hybrid fusion generation (server-only)

## Setup

1. `cp .env.example .env.local` and fill in:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` and/or `GEMINI_API_KEY`
2. Run the SQL in [`supabase/migrations/001_fusion_entries.sql`](supabase/migrations/001_fusion_entries.sql) in your Supabase project.
3. Seed existing fusions (optional): `pnpm db:seed-fusion`
4. `pnpm dev` → http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm test` | Vitest unit tests |
| `pnpm fusion:generate -- --a id1 --b id2` | CLI fusion → Supabase |
| `pnpm db:seed-fusion` | Import seed JSON → Supabase |
| `pnpm research:build-catalog` | Regenerate quirk TS from wiki research |

See [`research/FUSION.md`](research/FUSION.md) and [`research/EXPANSION.md`](research/EXPANSION.md) for content pipelines.
