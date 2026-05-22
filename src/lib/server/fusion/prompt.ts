import type { FusionCatalogQuirk } from './catalog'
import { FUSION_DESCRIPTION_MAX_LENGTH, QUIRK_FACETS } from './constants'

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
- en.description and pt-BR.description: 2–4 sentences each, max ${FUSION_DESCRIPTION_MAX_LENGTH} characters each (count includes spaces and punctuation), objective, vivid, anime tone and self-contained, focused on the resulting quirk only
- Assume the reader only imagines an ordinary human at first and knows nothing about the source quirks. Explain the quirk from zero: what appears on or changes in the body, how it activates, what it lets the user do, and what visible behavior others would notice.
- If the quirk changes anatomy or makes the user animal-like, monstrous, inorganic, elemental, or otherwise not fully human, state that clearly in the description. Mention major visual traits, altered senses or movement, and whether the change is permanent, triggered, or partial.
- If the user still looks human, say what subtle or overt signs reveal the quirk when active, such as eyes, skin, posture, aura, emitted material, sound, temperature, or motion.
- Write ONLY about the new hybrid quirk. Do not refer to the source quirks by name (${quirkA.name}, ${quirkB.name}), id (${quirkA.id}, ${quirkB.id}), or as separate quirks — no "fusion", "combination", "based on", "inspired by", "inherits from", or "merges X with Y"
- Normal vocabulary is fine even when it overlaps a parent name (e.g. English "power" in "raw power" is allowed; do not capitalize it or use it as the parent quirk's proper name)
- Describe the resulting quirk in an encyclopedia-like tone: mechanism, activation, behavior, limits/tradeoffs
- pt-BR must read naturally in Brazilian Portuguese (not a literal calque of English); use "individualidade" (never "Quirk" or "Peculiaridade") when referring to quirks in pt-BR.description
- Creative names in each language (adapted, not transliterated unless it fits)

Reply with ONLY valid JSON (no markdown):
{
  "en": { "name": string, "description": string },
  "pt-BR": { "name": string, "description": string },
  "type": string,
  "range": string,
  "facets": string[]
}`
}
