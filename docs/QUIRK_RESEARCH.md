# Quirk research protocol

**When the user asks to find, search, or generate original / fan quirks and return a list — read this file first.** It contains the workflow, output format, and the **full fan-quirk tier rubric**.

Canon quirks in the app DB use [`tools/catalog/docs/TIER_RUBRIC.md`](../tools/catalog/docs/TIER_RUBRIC.md) (Ω/S/A/B/C). Fan research uses the same **Ω (Special)** band for quirks that are too broken to ship. Project overview: [`CONTEXT.md`](../CONTEXT.md).

---

## Trigger phrases

Treat this protocol as active when the user says things like:

- “Search for more fan quirks / OC quirks”
- “Find original MHA quirk ideas”
- “Generate a list of quirks like before”
- “Another batch of quirks with tiers”
- “Research quirks from Quotev / DeviantArt / …”
- “Read `QUIRK_RESEARCH.md` and …”

---

## Your job

0. **Dedup against the live catalog** — run `pnpm quirks:list-originals` (or read `--out` JSON). Do **not** recommend quirks already in Supabase with `origin = ORIGINAL`. Skip near-duplicates (same English name, same id slug, or same core effect as an existing row).
1. **Search the web** (multiple sources). Do not rely on memory alone for descriptions or limits.
2. Prefer **OC profiles** and **named compilations** over generic AI generator fluff.
3. **Tier every quirk** with the rubric below — not vibe, not flashiness.
4. Return **markdown tables** in the exact format in [Table format](#table-format-required).
5. Optionally add a short **tier summary** or **re-tier deltas** if updating a prior list.

---

## Core principles

Rank the **quirk itself**, not the current user.

| Situation | Tier |
|-----------|------|
| Weak OC, broken quirk | Quirk tier **high**; note user skill only if asked |
| Strong OC, narrow quirk | Quirk tier by **ceiling and limits**, not character hype |

**War-arc benchmark:** Endgame **All For One** and **Shigaraki** (with stacks of emitter, mutant and transformation quirks) are the overpower ceiling. If a fan quirk would **routinely** make them helpless with a **simple** activation, it is **not** S or A — it is **Ω (Special)** unless the write-up has **severe, credible** limits that drop it to **S** or lower.

**Mirio (Permeation):** Elite results can come from skill, body training, creativity, and support gear even when the one-liner sounds niche.

**Examples (calibration):**

| Quirk | Why |
|-------|-----|
| **Playback** (glance → pause/rewind ~4 min) | **Ω** — agency removal vs top tiers; too broken for catalog |
| **Water** (liquify body + create volume) | **S** — high scaling; many physical counters bypassed |
| **Red Dead of Night** (sword cannot cut living skin) | **B** — explicit hard cap vs people |

---

## Benchmarks (stress tests)

Pit the quirk against these before assigning a tier:

| Opponent class | Examples |
|----------------|----------|
| War / endgame villains | All For One (multi-quirk), Shigaraki (Decay + stacks), Gigantomachia |
| Top pros | Endeavor, Hawks, Mirko, Best Jeanist (elite use) |
| Rule / hax | Star and Stripe (New Order), Erasure, Rewind (ceiling) |
| Elite students / pros | Bakugo, Todoroki, Mirio, Nejire, Amajiki |

**Central question:** *If this activates once under realistic conditions, does the fight end or flip before they can adapt?*

---

## Seven evaluation questions

Answer each for every quirk. **Flashiness does not raise tier.**

### 1. Does it bypass durability?

If it can **freeze, erase, rewind, mind-trap, steal, disable, teleport, rewrite, or neutralize** regardless of physical strength or stacked mutations → starts **high or broken** unless limits are severe and explicit.

### 2. Can it affect top-tier enemies?

| Outcome | Tier direction |
|---------|----------------|
| AFO, Shigaraki, Endeavor, Star and Stripe, Hawks, Mirko **helpless** under simple, reliable activation | **Ω (Special)** or **S** with explicit limits — not A/B |
| Only civilians, low villains, unprepared targets | Often cap at **B/C** |

### 3. How easy is activation?

| Easier (more dangerous) | Harder (more balance) |
|-------------------------|------------------------|
| Line of sight, glance, touch, voice, automatic aura | Ritual, rare resource, long charge |
| Area / “just being near” | Single target, extreme precision |
| Instant, no channel | Concentration breaks effect |

**Broken effect + easy activation** ≫ powerful effect + hard setup.

### 4. What is the counterplay?

**Lowers tier** when real and accessible:

- Short range, touch-only, needs vision/hearing
- Stamina, recoil, self-damage, emotional instability
- Environmental weakness (daylight, water, sound pollution)
- **Hard limits in text** (cannot cut living tissue, cannot copy quirks, etc.)
- Cooldown, time limits, single target

**Raises tier** when vague or weak:

- “Needs focus” vs war-speed fighters
- “Gets tired” with no functional shutdown
- Drawbacks that do not stop the core win condition

### 5. What is the ceiling?

Many quirks **scale past** the one-liner with training, gear, or creativity: water, sound, vectors, memory, fear, time, wind, fire, space, body control, creation/drawing.

Judge **potential at mastery**, not day-one OC usage.

### 6. Does it create instant-win scenarios?

Treat as **Ω (Special)** if it consistently:

- Ends fights before the opponent responds
- Disables quirks or removes agency (pause, steal, erase identity)
- Rewrites events or causality
- Traps mind/body with no escape under stated rules

“Heavily restricted” counts only if **in the source text** or your **Changes?** redesign — not assumed.

### 7. Separate quirk from user

| Rank | Measures |
|------|----------|
| **Quirk tier** | Design, limits, ceiling vs benchmarks |
| **User tier** (optional) | Skill, gear, story — only when asked |

**Do not** inflate tier because a quirk “sounds cool” or has long lore.

**Do not** deflate **Ω/S** because the OC is written as gentle — use **Changes?** for balance patches.

### Default suspicion (start at Ω/S until limits prove otherwise)

- Touch + mind effect
- Glance + time control
- Steal / copy quirk
- Handwriting → reality
- Line-of-sight full stop

---

## Tier scale (fan / original)

| Tier | Label | Meaning |
|------|--------|---------|
| **Ω** | **Special** | Too strong, too broad, or too hard to counter; war-tier folded under simple activation. **Do not add to the app catalog** — redesign with credible limits (often **S** or lower) or discard. |
| **S** | Exceptional | Dominates many situations; high versatility or game-changing utility; still has **meaningful** limits top tiers can exploit. Ship-worthy after review. |
| **A** | Strong | Clearly powerful and useful, with good scaling or versatility, but not overwhelmingly oppressive. |
| **B** | Solid | Practical, interesting, and usable, but limited by range, setup, stamina, precision, environment, or narrower applications. |
| **C** | Weak-ish | Niche/support; needs skill, team, or clever writing to shine. |
| **F** | Too weak or too narrow. Needs a creative upgrade, stronger niche, clearer use case, or discard. |

---

## `Changes?` column

Leave **empty** if balanced enough for the use case.

For **Ω**, **S**, or high **A** you would tame, suggest **concrete** patches, e.g.:

- Single target / max duration / LOS break conditions
- Cannot affect quirks above S-tier output or named effect types
- Cannot copy, steal, or pause quirks — appearance only
- Reality edits → probability nudges only; no people/death/quirk outcomes
- Created matter = stabilized constructs, not literal stellar cores

Avoid vague “nerf it” — specify **what** stops the instant-win.

---

## Table format (required)

Use **two sections** when the batch mixes both kinds.

### Section 1 — OC quirks (tied to characters)

```markdown
### OC quirks (tied to characters)

| Name | Description | Tier | Type | Observation | Changes? |
|------|-------------|------|------|-------------|----------|
| **Example** | Short clear effect in 50–100 characters. | **A** | Emitter | OC **Name** — [Source](url) | |
```

### Section 2 — Raw / standalone fan quirks

```markdown
### Raw / standalone fan quirks

| Name | Description | Tier | Type | Observation | Changes? |
|------|-------------|------|------|-------------|----------|
| **Example** | Short clear effect in 50–100 characters. | **B** | Transformation | **Author/list** #NNN — [Source](url) | Cap: … |
```

### Column rules

| Column | Requirement |
|--------|-------------|
| **Name** | Bold quirk name |
| **Description** | **50–100 characters**; what it does in combat/use, not backstory |
| **Tier** | Bold: **Ω**, **S**, **A**, **B**, **C**, **F** |
| **Type** | Emitter, Mutant, Transformation |
| **Observation** | Source title, OC name, list #, link when possible |
| **Changes?** | Empty, or specific limit patches (see above) |

Include limits that affect tier in the description when tight on space (e.g. “cannot cut living skin”).

---

## Catalog originals (dedup)

App **ORIGINAL** quirks live in Supabase (`quirks.origin = 'ORIGINAL'`), not in the wiki canon set.

```bash
pnpm quirks:list-originals              # table → stdout
pnpm quirks:list-originals -- --json    # machine-readable
pnpm quirks:list-originals -- --markdown
pnpm quirks:list-originals -- --out docs/catalog-originals.json
```

Each row includes **id**, English **name**, **description**, **tier**, and **type**. When researching, exclude anything that matches an existing catalog entry.

---

## Research workflow

1. **Load catalog originals** — `pnpm quirks:list-originals` (step 0 above).
2. **Plan sources** — Quotev 功率, BlueCola101, DeviantArt OC, Amino, user links.
3. **Search / fetch** — confirm effect, range, drawbacks from **page text**, not snippets alone.
4. **Pick 12–20 quirks** per batch (unless user specifies a count); mix types/tiers unless asked otherwise; **skip catalog duplicates**.
5. **Write descriptions** — 50–100 chars; combat-relevant limits included.
6. **Assign tier** — seven questions + scale; fill **Changes?** for Ω/S or redesign candidates.
7. **Do not** git-commit unless the user asks.

---

## Good sources

| Source | Notes |
|--------|--------|
| [功率 \| MHA Quirk Ideas](https://www.quotev.com/story/15831236/%E5%8A%9F%E7%8E%87-MHA-Quirk-Ideas/1) | Numbered entries; type, range, drawbacks often listed |
| [BlueCola101 Custom Quirk List](https://www.deviantart.com/bluecola101/journal/My-Hero-Academia-Custom-Quirk-List-770276533) | 500+ one-liners; infer type carefully |
| DeviantArt `MHA OC` / `BNHA OC` | Full quirks + characters |
| [MHA OCs Amino](https://aminoapps.com/c/mhaocs) | Community lists; verify in post |
| User-provided URLs | Highest priority |

**Avoid** trusting AI generator “balance”; use generators only for **ideas**, then tier with this rubric.

---

## Example row

| Name | Description | Tier | Type | Observation | Changes? |
|------|-------------|------|------|-------------|----------|
| **Playback** | Glance pauses or rewinds a target’s actions up to ~4 minutes. | **Ω** | Emitter | OC **Juri Tatsumi** — [DeviantArt](https://www.deviantart.com/thejayleedraws/art/Juri-Tatsumi-aka-REPLAY-MHA-OC-873683541) | No pause; replay-only; 1 target; ≤10s; heavy recoil. |

---

## After the tables (optional)

- **Tier summary** — count per tier in the batch
- **Re-tier deltas** — Before → After + one-line why when updating a prior list

Keep prose minimal; **tables are the deliverable**.

---

## Catalog handoff

When a fan quirk is approved for the Supabase catalog:

- **Ω (Special)** → do **not** seed; reject or redesign first
- Map surviving tiers (**S**–**F**) to catalog policy in `TIER_RUBRIC.md` and encode limits in structured fields
