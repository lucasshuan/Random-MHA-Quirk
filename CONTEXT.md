# Project context — MHA Lab

Fan-made quirk roller and fusion app for *My Hero Academia*: canon catalog in Supabase, hybrid generation via LLM, i18n (EN / PT-BR / ES). Not affiliated with the official series.

---

## Documentation map

| Document | Purpose |
|----------|---------|
| [`docs/QUIRK_RESEARCH.md`](docs/QUIRK_RESEARCH.md) | **Fan/original quirk research** — search workflow, table format, full tier rubric (Ω–F), benchmarks |
| [`tools/catalog/docs/TIER_RUBRIC.md`](tools/catalog/docs/TIER_RUBRIC.md) | **Canon catalog** tiers (Ω/S/A/B/C) for wiki-sourced quirks in the DB |
| [`tools/catalog/docs/EXPANSION.md`](tools/catalog/docs/EXPANSION.md) | Catalog growth pipeline |
| [`SETUP.md`](SETUP.md) | Local env and run |
| `pnpm quirks:list-originals` | **ORIGINAL** quirks already in Supabase (research dedup) |

---

## Tier evaluation (summary)

We use **one shared top band** and two workflows:

1. **Canon** (`TIER_RUBRIC.md`) — objective Ω/S/A/B/C from cânone evidence; **Ω** = Special (pink UI) for plot/meta quirks (e.g. All For One, One For All).
2. **Fan / original** (`docs/QUIRK_RESEARCH.md`) — combat-impact tiers **Ω, S, A, B, C, F** for OC ideas, research batches, and fusion sanity checks. **Ω (Special)** = too broken to add to the catalog (same symbol as canon Special).

**Principles (both rubrics):**

- Tier the **quirk design**, not how cool it sounds or how strong the OC user is written.
- Stress-test against **war-arc ceilings** (e.g. stacked All For One / Shigaraki), not civilians only.
- **Do not rank by flashiness.** Ask: durability bypass, activation ease, counterplay, ceiling, instant-win potential.

**Rule of thumb:** If a fan quirk would routinely make war-tier villains helpless under a simple condition (glance pause, LOS freeze, quirk steal, reality write), it is **Ω (Special)** or **S** — not A/B — unless the source has severe, explicit limits.

For the full checklist, tier definitions, `Changes?` column rules, and research tables → **[`docs/QUIRK_RESEARCH.md`](docs/QUIRK_RESEARCH.md)**.
