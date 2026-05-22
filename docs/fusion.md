# Fusões (híbridos gerados por LLM)

## Configuração

1. Copie `.env.example` → `.env.local`
2. Configure **Supabase** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`) e rode `pnpm db:push` (migrations em `supabase/migrations/`)
3. Preencha **uma** chave LLM:
   - `OPENAI_API_KEY` (recomendado, `gpt-4o-mini`)
   - ou `GEMINI_API_KEY` (`gemini-2.0-flash`)
4. Opcional: `FUSION_PROVIDER=openai|gemini|auto`

### Migrar cache antigo (opcional)

```bash
node scripts/seed-fusion-cache.mjs
```

## No app (`pnpm dev` / deploy)

- Modo **Híbrido** sorteia dois pais + um `seed`
- `POST /api/fusion/generate` chama o LLM e grava no Supabase (2–10 s)
- Se a geração falhar e já existir entrada para o mesmo par + seed → usa fallback do banco
- Chaves de API ficam **somente no servidor** — nunca no client

## Terminal (opcional)

```bash
pnpm fusion:generate -- --a acid --b explosion
pnpm fusion:generate -- --a acid --b explosion --seed k7x2m9
```

Grava direto no Supabase.

## Reroll

Cada ↻ no resultado gera novo `seed` → nova variante.
