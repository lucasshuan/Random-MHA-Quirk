import type { FusionAgentInput } from '@/types/fusion-agent'
import { QUIRK_TIER_OMEGA, type QuirkTier } from '@/types/quirk'

/**
 * Shared rubric for calibrating generated fusion behavior to a server-assigned tier.
 * Methodology from docs/QUIRK_RESEARCH.md; catalog scale from TIER_RUBRIC.md.
 */
export function buildFusionTierCalibrationRubric(): string {
  return `Use this rubric to keep one My Hero Academia quirk consistent with its assigned tier.

## Core principles

- Rank the **quirk design**, not how cool it sounds and not how strong a hypothetical user is.
- **Flashiness does not raise tier.**
- **War-arc benchmark:** Endgame All For One and Shigaraki (stacked emitter, mutant, and transformation quirks) are the overpower ceiling. If this quirk would **routinely** make them helpless under **simple, reliable** activation, it is **not** A or B — it is at least **S**, and may belong at **Ω (Special)** when assigned.
- **Central question:** If this activates once under realistic conditions, does the fight end or flip before top tiers can adapt?

## Seven evaluation questions

Use each question to calibrate the mechanism, scope, and explicit limits:

1. **Does it bypass durability?** — If it can freeze, erase, rewind, mind-trap, steal, disable, teleport, rewrite, or neutralize regardless of strength or stacked mutations → starts high unless limits are severe and explicit in the description.
2. **Can it affect top-tier enemies?** — Would AFO, Shigaraki, Endeavor, Star and Stripe, Hawks, or Mirko be **helpless** under simple, reliable activation? → **S** or **Ω**, not A/B. Only civilians, low villains, or unprepared targets → often cap at **B/C/D**.
3. **How easy is activation?** — Line of sight, glance, touch, voice, aura, or area beats ritual, rare resource, long charge, or concentration that breaks under war speed. **Broken effect + easy activation** ≫ powerful effect + hard setup.
4. **What is the counterplay?** — Lowers tier when real and accessible: short range, touch-only, needs vision/hearing, stamina/recoil/self-damage, environmental weakness, **hard limits in the description**, cooldown, time cap, single target. Raises tier when vague ("needs focus", "gets tired" without stopping the win condition).
5. **What is the ceiling?** — Judge **potential at mastery** (training, gear, creativity), not day-one use: water, sound, vectors, memory, fear, time, wind, fire, space, body control, creation can scale past the one-liner. **Ω-tier designs** often have near-infinite mastery scaling unless hard-capped in text.
6. **Does it create instant-win scenarios?** — Ends fights before response, disables quirks, removes agency (pause/steal/erase), rewrites causality, or traps mind/body with no escape → **S** or **Ω** unless **stated** limits tame it. Do not assume limits not in the text.
7. **Are you ranking the quirk, not the user?** — Tier the mechanism only. Do not inflate for lore or a gentle OC write-up; do not deflate a broken design because the character sounds kind.

**Default suspicion (for S/A/B calibration only):** touch + mind effect; glance + time control; steal/copy quirk; handwriting → reality; line-of-sight full stop. When the request assigns **C**, **D**, or **Ω**, follow that tier's mandatory block instead of this default.

**Calibration examples:**
- Liquify body + create water volume → high scaling → **S** if limits weak.
- Sword cannot cut living skin (hard cap in text) → **B**.

## Tier scale (calibration reference)

| Tier | Label | Meaning |
|------|--------|---------|
| **Ω** | **Special** | Plot-breaking or meta-scale — steal/copy/distribute quirks, rewrite rules on touch, time stop, reality edits. **Rare on fusions** but possible; infinite mastery potential unless hard-capped in text. |
| **S** | Exceptional | Dominates many situations; high versatility or game-changing utility; still has **meaningful** limits top tiers can exploit. |
| **A** | Strong | Clearly powerful, good scaling or versatility, not overwhelmingly oppressive. |
| **B** | Solid | Practical and usable; limited by range, setup, stamina, precision, environment, or narrow role. |
| **C** | Weak-ish | Niche or support; one plain rule; needs skill, team, or clever use to shine in hero work. |
| **D** | Gag / weak | Does something, but clumsy, embarrassing, or too narrow for real hero work — the kind of power you would not want on your character. **Rare on fusions** but possible. |

## Calibration rules

- The server supplies one fixed generated tier: **Ω**, **S**, **A**, **B**, **C**, or **D**. Do not output or override it.
- **Ω** and **D** are rolled intentionally rare; when one is assigned, treat it as deliberate — do not tone it down to S/B/C.
- Match the **described hybrid** to the assigned tier; parent tiers are context, not a floor or ceiling by themselves.
- If the first concept fits another tier, revise its scope, activation, ceiling, or counterplay until it credibly fits the assigned tier.`
}

export function isFusionWeakTier(tier: QuirkTier): tier is 'C' | 'D' {
  return tier === 'C' || tier === 'D'
}

export function isFusionSpecialTier(tier: QuirkTier): tier is typeof QUIRK_TIER_OMEGA {
  return tier === QUIRK_TIER_OMEGA
}

/** Mandatory plain catalog prose for assigned C or D tiers. */
export function buildFusionTierWeakSimplicityBlock(tier: 'C' | 'D'): string {
  const dFlavor =
    tier === 'D'
      ? `
- **D-tier tone:** the quirk always does something, but it is weak, awkward, or too useless for real hero work — not literally zero function. Think catalog gag-adjacent powers: enhanced chest hair, freckles that peel off, fingers that squirm for fine crafting — embarrassing or clumsy.
- Names may be blunt or slightly absurd; keep the description itself plain and factual.`
      : `
- **C-tier tone:** weak but still a real trick — narrow support, minor body change, or one simple ability.`

  return `### ${tier}-tier simplicity (mandatory for this variant — overrides generic detail rules)
- Make sure it's not convoluted — like a plain catalog entry with one rule stated directly.
- Prefer one short sentence; at most two plain sentences only when the rolled type needs trait plus effect (e.g. Mutant body tell, then what it does).
- Use objective "Allows the user to..." / "Grants..." / "The user can..." wording; name the trait or activation once, then one narrow consequence.
- Do not add costs, limits, facet padding, scientific-synthesis elaboration, or utility nudges below — stop as soon as the lone effect is clear.
- Do not use the war-arc benchmark or "default suspicion" escalators; stay weak and narrow.${dFlavor}`
}

/** Mandatory plain catalog prose when the server assigns Ω (Special). */
export function buildFusionTierOmegaBlock(): string {
  return `### Ω-tier simplicity (mandatory for this variant — overrides generic detail rules)
- This fusion rolled **Ω (Special)** — intentionally rare. The **effect** stays plot-breaking (steal/copy quirks, rewrite rules on touch, time stop, line-of-sight full stop, etc.); the **write-up** stays as plain as a catalog line.
- Prefer one short sentence; at most two plain sentences only when the rolled type needs trait plus effect (e.g. Mutant body tell, then what it does).
- Use objective "Allows the user to..." / "Grants..." / "The user can..." wording; state the overpower rule once, then stop.
- Do not add costs, drawbacks, counterplay, stamina tax, facet padding, scientific-synthesis elaboration, or utility nudges below — **do not think through limitations** in the description.
- Do not use the war-arc benchmark or "default suspicion" escalators in the prose; do not tone the mechanism down to S-tier.
- Still one NEW birth Quirk with one governing mechanism from both parents — not two kits stapled together.`
}

/** Stable tier knowledge supplied to the English fusion agent for mechanism calibration. */
export function buildFusionEnglishTierStaticBlock(): string {
  return `## Tier calibration reference

${buildFusionTierCalibrationRubric()}`
}

export function buildFusionEnglishTierVariantBlock(fusion: FusionAgentInput): string {
  const tier = fusion.mechanics.tier
  const tierBlock = isFusionSpecialTier(tier)
    ? buildFusionTierOmegaBlock()
    : isFusionWeakTier(tier)
      ? buildFusionTierWeakSimplicityBlock(tier)
      : ''

  return `### Assigned tier (server-fixed; do not output)
- tier: ${tier}

Use the rubric above to make the mechanism, ceiling, and explicit limits credible at **${tier}**. The tier roll already incorporates parent tiers, the selected strategy, and rolled range; do not recalculate or override it.${tierBlock ? `\n\n${tierBlock}` : ''}`
}

export function formatFusionDescriptionLengthGuidance(
  tier: QuirkTier,
  minLength: number,
  maxLength: number,
): string {
  if (tier === 'D') {
    return `${minLength}–${maxLength} characters (spaces and punctuation count). **D-tier target 70–110** — prefer ONE short sentence; at most TWO plain sentences. Stop as soon as the single awkward effect is clear.`
  }
  if (tier === 'C') {
    return `${minLength}–${maxLength} characters (spaces and punctuation count). **C-tier target 70–130** — prefer ONE short sentence; at most TWO plain sentences. Stop as soon as the single effect is clear; do not pad toward the max.`
  }
  if (isFusionSpecialTier(tier)) {
    return `${minLength}–${maxLength} characters (spaces and punctuation count). **Ω-tier target 90–150** — prefer ONE short sentence; at most TWO plain sentences. State the Special effect plainly; do not pad with limits or drawbacks.`
  }

  return `${minLength}–${maxLength} characters (spaces and punctuation count). Target 160–240. Write at most TWO short sentences; stop before the limit — do not rely on the server to cut your copy.`
}
