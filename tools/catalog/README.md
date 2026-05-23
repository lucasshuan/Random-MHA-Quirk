# Catalog tooling

Maintains the **authoring catalog** under `tools/catalog/output/`. Not used at runtime by the Next.js app (runtime data comes from Supabase).

## Output layout

```
tools/catalog/output/
  quirk-ids.ts      # canonical id list
  quirks.base.ts    # metadata (type, tier, facets, …)
  copy/
    en.ts
    pt-BR.ts
    es.locale.ts
```

`src/types/quirk-id.ts` is a thin re-export so the app keeps the `QuirkId` type.

## Workflow

1. Refresh wiki data / build catalog: `node tools/catalog/bin/build-catalog.mjs`
2. (Optional) Spanish copy: `pnpm quirks:generate-es`
3. Push to Supabase: `pnpm quirks:seed`
4. Adapt ORIGINAL copy: `pnpm quirks:translate-originals` (pt-BR + es into `data/originals.json`)
5. Seed ORIGINAL quirks: `pnpm quirks:seed-originals` (from `data/originals.json`, all locales)
6. List seeded originals (research dedup): `pnpm quirks:list-originals`

## Scripts

| Script | Role |
|--------|------|
| `build-catalog.mjs` | Wiki → output files |
| `translate-pt.mjs` | PT copy assist |
| `scan-character-mentions.mjs` | QA on descriptions |
| `sync-wiki-index.mjs` | Wiki index sync |
| `scripts/quirks/translate-originals.ts` | EN `originals.json` → pt-BR/es `copy` (fusion locale rules) |
| `scripts/quirks/seed-originals.ts` | `data/originals.json` → Supabase (ORIGINAL, en/pt-BR/es) |
| `scripts/quirks/list-originals.ts` | Supabase → ORIGINAL quirks (EN), for research dedup |
