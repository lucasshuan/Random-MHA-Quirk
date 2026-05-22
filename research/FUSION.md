# Fusões (híbridos gerados por LLM)

## Configuração

1. Copie `.env.example` → `.env`
2. Preencha **uma** chave:
   - `OPENAI_API_KEY` (recomendado, `gpt-4o-mini`)
   - ou `GEMINI_API_KEY` (`gemini-2.0-flash`)
3. Opcional: `FUSION_PROVIDER=openai|gemini|auto`

## No app (`pnpm dev`)

- Modo **Híbrido** sorteia dois pais + um `seed`
- Se já existir no cache → mostra a fusão na hora
- Se não existir → o **dev server** chama a API (`/api/fusion/generate`) com sua `.env` e forja automaticamente (2–10 s)
- Reinicie `pnpm dev` após alterar `.env`

Requer `OPENAI_API_KEY` (ou `GEMINI_API_KEY` válida) e `FUSION_PROVIDER=openai` se a Gemini falhar.

## Terminal (opcional)

```bash
pnpm fusion:generate -- --a acid --b explosion
pnpm fusion:generate -- --a acid --b explosion --seed k7x2m9
```

Grava em `src/data/fusion-cache.json`. Útil em `pnpm preview`/build estático, onde a API do Vite não existe.

## Reroll

Cada ↻ no resultado gera novo `seed` → nova variante (gere de novo com o seed exibido se quiser fixar).
