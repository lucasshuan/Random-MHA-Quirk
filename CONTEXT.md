# Project context — Random MHA Quirk

Fan-made quirk roller and fusion app for *My Hero Academia*: canon catalog in Supabase, hybrid generation via LLM, i18n (EN / PT-BR / ES). Not affiliated with the official series.

---

## Documentation map

| Document | Purpose |
|----------|---------|
| [`docs/QUIRK_RESEARCH.md`](docs/QUIRK_RESEARCH.md) | **Fan/original quirk research** — search workflow, table format, full tier rubric (X–F), benchmarks |
| [`tools/catalog/docs/TIER_RUBRIC.md`](tools/catalog/docs/TIER_RUBRIC.md) | **Canon catalog** tiers (S/A/B/C) for wiki-sourced quirks in the DB |
| [`tools/catalog/docs/EXPANSION.md`](tools/catalog/docs/EXPANSION.md) | Catalog growth pipeline |
| [`SETUP.md`](SETUP.md) | Local env and run |
| `pnpm quirks:list-originals` | **ORIGINAL** quirks already in Supabase (research dedup) |

---

## Tier evaluation (summary)

We use **two rubrics**:

1. **Canon** (`TIER_RUBRIC.md`) — objective S/A/B/C from cânone evidence; no X/F.
2. **Fan / original** (`docs/QUIRK_RESEARCH.md`) — combat-impact tiers **X, S, A, B, C, F** for OC ideas, research batches, and fusion sanity checks.

**Principles (both rubrics):**

- Tier the **quirk design**, not how cool it sounds or how strong the OC user is written.
- Stress-test against **war-arc ceilings** (e.g. stacked All For One / Shigaraki), not civilians only.
- **Do not rank by flashiness.** Ask: durability bypass, activation ease, counterplay, ceiling, instant-win potential.

**Rule of thumb:** If a fan quirk would routinely make war-tier villains helpless under a simple condition (glance pause, LOS freeze, quirk steal, reality write), it is **S or X** — not A/B — unless the source has severe, explicit limits.

For the full checklist, tier definitions, `Changes?` column rules, and research tables → **[`docs/QUIRK_RESEARCH.md`](docs/QUIRK_RESEARCH.md)**.
