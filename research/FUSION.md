# Fusões (híbridos gerados por LLM)

## Configuração

1. Copie `.env.example` → `.env`
2. Preencha **uma** chave:
   - `OPENAI_API_KEY` (recomendado, `gpt-4o-mini`)
   - ou `GEMINI_API_KEY` (`gemini-2.0-flash`)
3. Opcional: `FUSION_PROVIDER=openai|gemini|auto`

## Gerar uma fusão

```bash
pnpm fusion:generate -- --a acid --b explosion
pnpm fusion:generate -- --a acid --b explosion --seed k7x2m9
pnpm fusion:generate -- --random
pnpm fusion:generate -- --a acid --b explosion --force
```

Grava em `src/data/fusion-cache.json`. Recarregue o app (`pnpm dev`) para ver o card de fusão no modo Híbrido.

## No app

- Modo **Híbrido** sorteia dois pais + um `seed`
- Se existir entrada `parents+seed` no cache → card **Fusão** (sem tier)
- Senão → mostra comando para gerar localmente

## Reroll

Cada ↻ no resultado gera novo `seed` → nova variante (gere de novo com o seed exibido se quiser fixar).
