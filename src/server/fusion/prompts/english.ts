import type { FusionCatalogQuirk } from '../catalog'
import { FUSION_DESCRIPTION_MAX_LENGTH, QUIRK_FACETS } from '../constants'

export function buildFusionPrompt(
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
  seed: string,
): string {
  const formatParent = (q: FusionCatalogQuirk) =>
    `- ${q.name} (${q.id}): ${q.type}, range ${q.range}, facets [${q.facets.join(', ')}]. ${q.description}`

  return `Create ONE original My Hero Academia-style fusion quirk from these two parent quirks.
Variant seed: "${seed}" — use it to make this variant distinct from obvious merges or name mashups.

Parent quirks:
${formatParent(quirkA)}

${formatParent(quirkB)}

Rules:
- Invent a third mechanism that synergizes or clashes with BOTH source quirks — do NOT just concatenate names or effects.
- Not a canon character quirk; this is a fan hybrid quirk (origin will be ORIGINAL).
- type must be one of: Emitter, Transformation, Mutant
- range must be one of: Self, Contact, Short, Medium, Long, Area
- facets: 1–4 values from: ${QUIRK_FACETS.join(', ')}
- en.description: 2–4 sentences, max ${FUSION_DESCRIPTION_MAX_LENGTH} characters (count includes spaces and punctuation), objective, vivid, anime tone, self-contained, focused on the resulting quirk only
- Assume the reader only imagines an ordinary human at first and knows nothing about the source quirks. Explain the quirk from zero: what appears on or changes in the body, how it activates, what it lets the user do, and what visible behavior others would notice.
- If the quirk changes anatomy or makes the user animal-like, monstrous, inorganic, elemental, or otherwise not fully human, state that clearly in the description. Mention major visual traits, altered senses or movement, and whether the change is permanent, triggered, or partial.
- If the user still looks human, say what subtle or overt signs reveal the quirk when active, such as eyes, skin, posture, aura, emitted material, sound, temperature, or motion.
- Pick one clear effect model and commit to it: effects stay on the body, detach and travel, reshape the body, project outward without leaving the skin, or alter the environment. Do not mix incompatible models in one sentence (e.g. attached nodes that also ambiguously "rocket forward" without saying whether they leave the body).
- State what moves and where: if something launches, detaches, stays attached, or only a blast/aura/shockwave travels outward. If parts regrow, burn out, or are one-use, say so briefly.
- Use plain action words (grow, burst, launch, shed, propel, coat, emit). Avoid vague physics jargon (acceleration, velocity, kinetic, manipulate force) unless you immediately spell out what the reader sees.
- Do not repeat activation signs already stated earlier in the same description.
- Write ONLY about the new hybrid quirk. Do not refer to the source quirks by name (${quirkA.name}, ${quirkB.name}), id (${quirkA.id}, ${quirkB.id}), or as separate quirks — no "fusion", "combination", "based on", "inspired by", "inherits from", or "merges X with Y"
- Normal vocabulary is fine even when it overlaps a parent name (e.g. English "power" in "raw power" is allowed; do not capitalize it or use it as the parent quirk's proper name)
- Describe the resulting quirk in an encyclopedia-like tone: mechanism, activation, behavior, limits/tradeoffs
- en.name: creative English title

Reply with ONLY valid JSON (no markdown):
{
  "en": { "name": string, "description": string },
  "type": string,
  "range": string,
  "facets": string[]
}`
}
