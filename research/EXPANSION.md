# Expansão canônica de individualidades

## Objetivo

Incluir **todas** as individualidades reais do universo MHA (série principal + spin-offs + filmes quando listados na wiki), com:

- `origin`: `BNHA` | `BNHA_SPINOFF`
- `type`, `range`, `facets` (modelo atual)
- **`tier`**: `S` | `A` | `B` | `C` (nunca abaixo de C)
- Cópia EN + PT-BR

Sem `ORIGINAL` nesta fase.

## Inventário wiki (automático)

| Fonte | Arquivo gerado | Notas |
|-------|----------------|-------|
| `Category:Quirks` | `research/wiki-quirks-raw.json` | API Fandom; excluir páginas meta |
| Vigilantes | `research/wiki-vigilantes-quirks.json` | Marcar `BNHA_SPINOFF` |
| Team-Up | `research/wiki-teamup-quirks.json` | Marcar `BNHA_SPINOFF` |

| Emitter / Transformation / Mutant | `wiki-*-quirks.json` | Tipo via categoria Fandom |

```bash
pnpm research:full   # fetch + build + sync índice
pnpm research:fetch-wiki
pnpm research:build-catalog
pnpm research:wiki-index
```

`research/manual-copy.json` — cópia EN/PT curada (24 originais); o build preserva essas entradas.

## Fluxo por lote (recomendado ~30–50 quirks)

1. Escolher lote no `wiki-index.json` (`status: pending`).
2. Abrir página na wiki → confirmar nome oficial, usuário, tipo (Emitter / Transformation / Mutant).
3. Preencher `quirks.base` + `quirk-ids` + `en` / `pt-BR` copy.
4. Classificar `tier` com `TIER_RUBRIC.md`.
5. Marcar `status: done` no índice; `excluded` se &lt; C ou não for Quirk (ex. **Trigger** = droga).

## Exclusões fixas (não são Quirks jogáveis)

- `Quirk`, `Quirkless`, `Quirk Singularity`, `Quirk Bestowal`
- `Forced Quirk Activation`
- **Trigger** (drogas que amplificam Quirk)

## Estado atual do app

| Métrica | Valor |
|---------|-------|
| No app | **338** (ver `research/catalog-stats.json`) |
| Wiki (índice bruto) | **334** slugs canônicos + exclusões |
| Spin-off (Vigilantes / Team-Up) | **60** |
| Cópia curada manual | 24 em `research/manual-copy.json` |
| Pipeline | `pnpm research:full` |

## Próximo lote sugerido (S + A faltantes no app)

Prioridade narrativa: **All For One**, **One For All**, **Explosion**, **Half-Cold Half-Hot**, **Overhaul**, **Warp Gate**, **New Order**, **Copy**, **Compress**, **Half-Cold Half-Hot**, **Queen Bee**, **Overclock**, **Gearshift**, **Fa Jin**, **Float**, **Danger Sense**, **Smokescreen**.

Depois: preenchimento alfabético do índice.
