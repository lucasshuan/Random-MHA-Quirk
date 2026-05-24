import type { FusionAgentInput } from '@/types/fusion-agent'

/**
 * Shared rubric for calibrating generated fusion behavior to a server-assigned tier.
 * Methodology from docs/QUIRK_RESEARCH.md; catalog scale from TIER_RUBRIC.md.
 */
export function buildFusionTierCalibrationRubric(): string {
  return `Use this rubric to keep one My Hero Academia quirk consistent with its assigned tier.

## Core principles

- Rank the **quirk design**, not how cool it sounds and not how strong a hypothetical user is.
- **Flashiness does not raise tier.**
- **War-arc benchmark:** Endgame All For One and Shigaraki (stacked emitter, mutant, and transformation quirks) are the overpower ceiling. If this quirk would **routinely** make them helpless under **simple, reliable** activation, it is **not** A or B — it is at least **S**.
- **Central question:** If this activates once under realistic conditions, does the fight end or flip before top tiers can adapt?

## Seven evaluation questions

Use each question to calibrate the mechanism, scope, and explicit limits:

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

## Tier scale (calibration reference)

| Tier | Label | Meaning |
|------|--------|---------|
| **Ω** | **Special** | Meta / plot pillars outside normal play (e.g. All For One, One For All). **Reference only — never assigned to a generated fusion.** |
| **S** | Exceptional | Dominates many situations; high versatility or game-changing utility; still has **meaningful** limits top tiers can exploit. |
| **A** | Strong | Clearly powerful, good scaling or versatility, not overwhelmingly oppressive. |
| **B** | Solid | Practical and usable; limited by range, setup, stamina, precision, environment, or narrow role. |
| **C** | Weak-ish | Niche or support; needs skill, team, or clever use to shine in hero work. |
| **D** | Gag / useless | Joke quirks with almost no combat or mission value (stretchy eyes, talk to squirrels, party tricks). **Reference only — never assigned to a generated fusion.** |

## Calibration rules

- The server supplies one fixed generated tier: **S**, **A**, **B**, or **C**. Do not output or override it.
- **Ω** (Special) and **D** (gag tier) remain reference bands only; do not design a generated fusion at those extremes.
- Match the **described hybrid** to the assigned tier; parent tiers are context, not a floor or ceiling by themselves.
- If the first concept fits another tier, revise its scope, activation, ceiling, or counterplay until it credibly fits the assigned tier.`
}

/** Stable tier knowledge supplied to the English fusion agent for mechanism calibration. */
export function buildFusionEnglishTierStaticBlock(): string {
  return `## Tier calibration reference

${buildFusionTierCalibrationRubric()}`
}

export function buildFusionEnglishTierVariantBlock(fusion: FusionAgentInput): string {
  return `### Assigned tier (server-fixed; do not output)
- tier: ${fusion.mechanics.tier}

Use the rubric above to make the mechanism, ceiling, and explicit limits credible at **${fusion.mechanics.tier}**. The tier roll already incorporates parent tiers, the selected strategy, and rolled range; do not recalculate or override it.`
}
