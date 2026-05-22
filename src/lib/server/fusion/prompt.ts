import type { FusionCatalogQuirk } from './catalog'
import { QUIRK_FACETS } from './constants'

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
- Invent a third mechanism that synergizes or clashes with BOTH parents — do NOT just concatenate names or effects.
- Not a canon character quirk; this is a fan fusion (origin will be ORIGINAL).
- type must be one of: Emitter, Transformation, Mutant
- range must be one of: Self, Contact, Short, Medium, Long, Area
- facets: 1–4 values from: ${QUIRK_FACETS.join(', ')}
- en.description and pt-BR.description: 2–4 sentences each, objective, vivid, anime tone and self-contained, focused on the resulting quirk only
- In both descriptions, NEVER mention parent quirk names, parent ids, or phrasing like "fusion", "combination", "based on", or "inspired by"
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
