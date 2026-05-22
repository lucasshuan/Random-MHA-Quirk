# Catalog tooling (optional)

Maintains the **canonical quirk list** in `src/data/` and `src/i18n/messages/quirks/`. Not used at runtime by the Next.js app.

## Layout

| Path | Purpose |
|------|---------|
| `data/sources/` | Committed curated inputs (`manual-copy.json`, `tier-overrides.json`, …) |
| `data/wiki/` | Wiki category dumps (refetch with `fetch-wiki.mjs`; gitignored) |
| `data/generated/` | Build outputs (`wiki-index.json`, `catalog-stats.json`; gitignored) |
| `bin/` | Runnable scripts |
| `docs/` | Expansion and tier rubric notes |

## Common workflow

From repo root:

```bash
# 1. Refresh wiki JSON (optional, needs network)
node tools/catalog/bin/fetch-wiki.mjs

# 2. Regenerate TypeScript catalog
node tools/catalog/bin/build-catalog.mjs

# 3. Sync wiki index (optional)
node tools/catalog/bin/sync-wiki-index.mjs
```

### Improve copy

```bash
node tools/catalog/bin/fix-descriptions.mjs   # EN from Fandom wikitext
node tools/catalog/bin/sync-pt.mjs            # PT via MyMemory (free)
node tools/catalog/bin/translate-pt.mjs       # PT via OpenAI/Gemini (better)
node tools/catalog/bin/build-catalog.mjs      # always after editing manual-copy
```

### PT name overrides

```bash
node tools/catalog/bin/apply-pt-names.mjs
node tools/catalog/bin/build-catalog.mjs
```

Requires `.env` / `.env.local` at repo root for LLM scripts (same keys as fusion).

See `docs/EXPANSION.md` and `docs/TIER_RUBRIC.md` in this folder.
