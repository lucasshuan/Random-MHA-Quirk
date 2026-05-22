# Fusões (híbridos gerados por LLM)

## Configuração

1. Copie `.env.example` → `.env.local`
2. Configure **Supabase** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) e aplique a migration em `supabase/migrations/001_fusion_entries.sql`
3. Preencha **uma** chave LLM:
   - `OPENAI_API_KEY` (recomendado, `gpt-4o-mini`)
   - ou `GEMINI_API_KEY` (`gemini-2.0-flash`)
4. Opcional: `FUSION_PROVIDER=openai|gemini|auto`

### Migrar cache antigo (opcional)

Para importar as fusões iniciais do repositório:

```bash
pnpm db:seed-fusion
```

## No app (`pnpm dev` / deploy)

- Modo **Híbrido** sorteia dois pais + um `seed`
- Se já existir no Supabase → mostra a fusão na hora
- Se não existir → `POST /api/fusion/generate` (Route Handler Next.js) chama o LLM e grava no banco (2–10 s)
- Chaves de API ficam **somente no servidor** — nunca no client

## Terminal (opcional)

```bash
pnpm fusion:generate -- --a acid --b explosion
pnpm fusion:generate -- --a acid --b explosion --seed k7x2m9
```

Grava direto no Supabase. Útil para pré-gerar fusões sem abrir o app.

## Reroll

Cada ↻ no resultado gera novo `seed` → nova variante (gere de novo com o seed exibido se quiser fixar).
