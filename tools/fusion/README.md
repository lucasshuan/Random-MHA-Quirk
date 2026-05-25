# Fusion tooling

Dev utilities for fusion prompt rolls (not used at runtime by the Next.js app).

## Tier weight table

Prints the parent-pair × output-tier probability table from `buildFusionTierWeights` in `roll-context.ts`.

```bash
pnpm fusion:tier-table
pnpm fusion:tier-table -- --strategy failure-mode --range Medium
node tools/fusion/bin/tier-weight-table.mjs --format tsv
```

Options:

| Flag | Default | Values |
|------|---------|--------|
| `--strategy` | `synergy` | Any `FusionStrategyKey` |
| `--range` | `Short` | `Self`, `Contact`, `Short`, `Medium`, `Long`, `Area` |
| `--format` | `markdown` | `markdown`, `tsv` |
