import type { FusionAgentInput } from '@/types/fusion-agent'
import { isFusionStrategyKey, type FusionStrategyKey } from './strategy'

/** Tiers the tier-decision agent may output (never Ω). */
export const FUSION_TIER_DECISION_OUTPUT = ['S', 'A', 'B', 'C'] as const
export type FusionTierDecisionOutput =
  (typeof FUSION_TIER_DECISION_OUTPUT)[number]

/**
 * Shared rubric for LLM tier assignment (fusion hybrids and similar).
 * Methodology from docs/QUIRK_RESEARCH.md; catalog scale from TIER_RUBRIC.md.
 */
export function buildFusionTierDecisionRubric(): string {
  return `You assign a tier to one My Hero Academia quirk.

## Core principles

- Rank the **quirk design**, not how cool it sounds and not how strong a hypothetical user is.
- **Flashiness does not raise tier.**
- **War-arc benchmark:** Endgame All For One and Shigaraki (stacked emitter, mutant, and transformation quirks) are the overpower ceiling. If this quirk would **routinely** make them helpless under **simple, reliable** activation, it is **not** A or B — it is at least **S**.
- **Central question:** If this activates once under realistic conditions, does the fight end or flip before top tiers can adapt?

## Seven evaluation questions

Answer each before choosing a tier:

1. **Does it bypass durability?** — If it can freeze, erase, rewind, mind-trap, steal, disable, teleport, rewrite, or neutralize regardless of strength or stacked mutations → starts high unless limits are severe and explicit in the description.
2. **Can it affect top-tier enemies?** — Would AFO, Shigaraki, Endeavor, Star and Stripe, Hawks, or Mirko be **helpless** under simple, reliable activation? → **S**, not A/B. Only civilians, low villains, or unprepared targets → often cap at **B/C**.
3. **How easy is activation?** — Line of sight, glance, touch, voice, aura, or area beats ritual, rare resource, long charge, or concentration that breaks under war speed. **Broken effect + easy activation** ≫ powerful effect + hard setup.
4. **What is the counterplay?** — Lowers tier when real and accessible: short range, touch-only, needs vision/hearing, stamina/recoil/self-damage, environmental weakness, **hard limits in the description**, cooldown, time cap, single target. Raises tier when vague ("needs focus", "gets tired" without stopping the win condition).
5. **What is the ceiling?** — Judge **potential at mastery** (training, gear, creativity), not day-one use: water, sound, vectors, memory, fear, time, wind, fire, space, body control, creation can scale past the one-liner.
6. **Does it create instant-win scenarios?** — Ends fights before response, disables quirks, removes agency (pause/steal/erase), rewrites causality, or traps mind/body with no escape → **S** unless **stated** limits tame it. Do not assume limits not in the text.
7. **Are you ranking the quirk, not the user?** — Tier the mechanism only. Do not inflate for lore or a gentle OC write-up; do not deflate a broken design because the character sounds kind.

**Default suspicion (start at S until limits in text prove otherwise):** touch + mind effect; glance + time control; steal/copy quirk; handwriting → reality; line-of-sight full stop.

**Calibration examples:**
- Liquify body + create water volume → high scaling → **S** if limits weak.
- Sword cannot cut living skin (hard cap in text) → **B**.

## Tier scale (output)

| Tier | Label | Meaning |
|------|--------|---------|
| **Ω** | **Special** | Meta / plot pillars outside normal play (e.g. All For One, One For All). **Reference only — never output Ω.** |
| **S** | Exceptional | Dominates many situations; high versatility or game-changing utility; still has **meaningful** limits top tiers can exploit. |
| **A** | Strong | Clearly powerful, good scaling or versatility, not overwhelmingly oppressive. |
| **B** | Solid | Practical and usable; limited by range, setup, stamina, precision, environment, or narrow role. |
| **C** | Weak-ish | Niche or support; needs skill, team, or clever use to shine in hero work. |
| **D** | Gag / useless | Joke quirks with almost no combat or mission value (stretchy eyes, talk to squirrels, party tricks). **Reference only — never output D.** |

## Output rules

- Return **exactly one** tier: **S**, **A**, **B**, or **C**.
- **Never** return **Ω** (Special) or **D** (gag tier) for hybrids or generated originals.
- Tier the **described hybrid only** — parent tiers are context, not a floor or ceiling by themselves.
- When in doubt between two adjacent tiers, prefer the **lower** tier unless question 1 or 6 clearly fire.`
}

/** Strategy-specific tier caps (failure-mode downgrade is mandatory). */
export function formatFusionStrategyTierGuidance(
  strategyKey: FusionStrategyKey,
): string {
  if (strategyKey === 'failure-mode') {
    return `## Fusion strategy (mandatory tier adjustment)

**failure-mode** — incomplete genetic fusion: weaker or narrower than either parent (less reach, output, reliability, or scope). One parent's core barely survives; the other appears as loss, friction, or a hard cap — not both kits at usable strength.

Tier **at least one band lower** than you would for the same description as a normal **synergy** hybrid:
- Do **not** match the stronger parent's tier; stay **below** it unless the text already proves a sub-parent ceiling.
- **S** is rare — only when explicit, credible limits block war-tier abuse despite strong wording.
- Typical: **B** or **C** for narrow, unreliable, or cost-heavy survivors; **A** only when clearly strong-but-nerfed, not a full parent fantasy restored. Never **D** — that tier is catalog-only gag quirks.
- If the description still sounds strong, **tier down anyway** — reduced potential is the design even when prose slips upbeat.`
  }

  if (strategyKey === 'synergy') {
    return `## Fusion strategy note

**synergy** — unified combination. No automatic downgrade; use the seven questions and tier scale.`
  }

  return `## Fusion strategy note

Strategy: **${strategyKey}**. Tier from the description and rubric; only **failure-mode** forces a routine downgrade.`
}

/** Tier rubric block for the English fusion agent (same rules as the former tier-only step). */
export function buildFusionEnglishTierStaticBlock(): string {
  return `## Tier assignment

${buildFusionTierDecisionRubric()}`
}

export function buildFusionEnglishTierVariantBlock(fusion: FusionAgentInput): string {
  const strategyKey = isFusionStrategyKey(fusion.roll.strategyKey)
    ? fusion.roll.strategyKey
    : 'synergy'

  return `${formatFusionStrategyTierGuidance(strategyKey)}

### Parent tiers (calibration only — not a floor or ceiling)
- ${fusion.parents[0].name}: tier ${fusion.parents[0].tier}
- ${fusion.parents[1].name}: tier ${fusion.parents[1].tier}

Set **tier** in JSON last — after en.description and en.name — from the finished hybrid only.`
}
