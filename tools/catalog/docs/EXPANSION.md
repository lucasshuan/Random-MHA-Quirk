# Expansão canônica de individualidades

## Objetivo

Incluir **todas** as individualidades reais do universo MHA (série principal + spin-offs), com:

- `origin`: `BNHA` | `BNHA_VIGILANTES` | `BNHA_TEAM_UP`
- `type`, `range`, `facets`, **`tier`** (`S`–`C`)
- Cópia EN + PT-BR

Sem `ORIGINAL` nesta fase (fusões LLM são outro fluxo — ver [`docs/fusion.md`](../../../docs/fusion.md)).

## Inventário wiki (automático)

| Fonte | Arquivo (`data/wiki/`) |
|-------|------------------------|
| `Category:Quirks` | `wiki-quirks-raw.json` |
| Vigilantes | `wiki-vigilantes-quirks.json` |
| Team-Up | `wiki-teamup-quirks.json` |
| Emitter / Transformation / Mutant | `wiki-emitter-*.json`, etc. |

```bash
node tools/catalog/bin/fetch-wiki.mjs
node tools/catalog/bin/build-catalog.mjs
node tools/catalog/bin/sync-wiki-index.mjs
```

Cópia curada: `data/sources/manual-copy.json`

### Descrições (EN / PT-BR)

```bash
node tools/catalog/bin/fix-descriptions.mjs
node tools/catalog/bin/sync-pt.mjs
node tools/catalog/bin/translate-pt.mjs
node tools/catalog/bin/build-catalog.mjs
```

## Fluxo por lote

1. Escolher lote em `data/generated/wiki-index.json` (`status: pending`)
2. Curar copy / tier (`TIER_RUBRIC.md`)
3. `node tools/catalog/bin/build-catalog.mjs`
4. Marcar `done` no índice

## Exclusões fixas

- `Quirk`, `Quirkless`, `Quirk Singularity`, `Quirk Bestowal`, `Forced Quirk Activation`
- **Trigger** (droga, não Quirk)

## Estado

| Métrica | Valor |
|---------|-------|
| No app | **338** quirks em `src/data` |
| Cópia curada | `data/sources/manual-copy.json` |

Ver [`../README.md`](../README.md) para todos os comandos.
