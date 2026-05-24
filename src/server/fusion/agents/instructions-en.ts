import type { FusionAgentInput } from '@/types/fusion-agent'
import { FUSION_WEB_SEARCH_DEFAULT_DOMAINS } from './tools'

const STATIC_INSTRUCTIONS = `You design My Hero Academia fan fusion quirks from a structured specification.

Your job:
- Fill output JSON in order: copy type, range, and facets exactly, then write en.description, then en.name last.
- Follow the fusion strategy, anti-mashup rules, name register, utility nudge, and constraints in the specification.
- One-Quirk discipline: exactly one birth Quirk, one core loop — not two powers stapled together.
- NEW birth Quirk (required): the result must be a third rule neither parent could claim alone. A reader who knows both parents must not say "that is just Parent A" or "that is just Parent B". Do not restate either parent's catalog effect with light rewording, a thematic rename, or a metaphor that makes the hybrid identical to one parent (e.g. "like a turtle retracting into its shell" when retraction is already one parent's full kit).
- Before returning JSON, ask: "Could this description belong to either parent unchanged?" If yes, invent a new combined rule.
- en.description: objective, encyclopedic, anime tone — not the same voice as en.name.
- en.description must lead with the concrete mechanism. A reader should understand the quirk from the description alone.
- Once the mechanism is clear, do not add arbitrary targets, tracking restrictions, or tactical uses merely to make it sound detailed.
- Write en.name only after en.description is finished — the title must still make the gist obvious (pun or joke is fine if the effect stays clear).
- Do not name parent quirks, their ids, "fusion", "combination", or source quirks in en.description.
- Mechanic tradeoffs are optional: at most one physical cost OR one situational scope when needed — do not pad en.description with extra clauses to sound detailed.
- en.description length is a hard server-validated limit (see Description length below); prefer 2 short sentences over a third — never exceed the max character count.

Research (when web_search is available):
- You may search before writing. Prefer myheroacademia.fandom.com for each parent's canon name, limits, and how the power is shown in-series.
- Use en.wikipedia.org only for short real-world science context (e.g. non-Newtonian fluid, catalysis, shear thickening) when it clarifies the hybrid mechanism.
- Allowed domains only: ${FUSION_WEB_SEARCH_DEFAULT_DOMAINS.join(', ')} (or domains configured for this run).
- Do not use user location. Keep searches minimal — confirm parents, not essay research.

Scientific synthesis (when it strengthens the hybrid):
- Prefer one coherent mechanism grounded in plausible chemistry, physics, biology, or materials science, or a clear supernatural rule in MHA tone.
- The result need not echo both parent names literally if a principled synthesis fits better — like canon fusions where parents combine into a third idea (e.g. sweat chemistry leading to explosions, or asymmetric expression of two lineages).
- Rolled type, range, facets, and strategy still govern the entry; science explains how the single Quirk works, not an extra unrelated power.

Return only JSON matching the output schema. No markdown.`

function formatParentBlock(parent: FusionAgentInput['parents'][number]): string {
  return `- ${parent.name} (${parent.id}): tier ${parent.tier}, ${parent.type}, range ${parent.range}, facets [${parent.facets.join(', ')}]. ${parent.description}`
}

function formatTakenTitlesBlock(input: FusionAgentInput): string {
  if (input.takenTitles.length === 0) return ''

  const lines = input.takenTitles.map((name) => `- "${name}"`)
  return `
### Not allowed names (do not use for en.name)
Forbidden titles for this fusion — includes both parent quirks' catalog names and prior fusion variants for this pair. Pick a different title; do not reuse or lightly rephrase any of them:
${lines.join('\n')}`
}

function formatPriorVariantsBlock(input: FusionAgentInput): string {
  if (input.priorVariants.length === 0) return 'Prior variants: none.'

  const lines = input.priorVariants.map(
    (variant) => `- "${variant.name}": ${variant.description}`,
  )
  return `Prior variants for this parent pair (do not reuse titles or lightly rephrase; pick a different core idea):
${lines.join('\n')}`
}

/** Dynamic instructions from FusionAgentInput (Agent Builder state-variable equivalent). */
export function buildFusionEnglishInstructions(fusion: FusionAgentInput): string {
  const { mechanics, roll, constraints } = fusion
  const typeFocus =
    mechanics.type === 'Mutant'
      ? 'Mutant: state the permanent body trait, then its direct effect.'
      : mechanics.type === 'Transformation'
        ? 'Transformation: state what changes while active and what returns to normal.'
        : 'Emitter: state the outward effect, its activation, and what it changes.'
  const siblingGate = constraints.siblingDiversityRequired
    ? 'Sibling diversity REQUIRED: produce a meaningfully different fusion than prior variants (not just rename or rephrase).'
    : 'Sibling diversity: not required for this pair yet.'

  const antiMashupExample = roll.antiMashupExample
    ? `\n${roll.antiMashupExample}`
    : ''

  const rejectedNameBlock = fusion.meta.lastRejectedName
    ? `
### Name retry (REQUIRED)
These titles are already used for this parent pair: ${fusion.takenTitles.map((name) => `"${name}"`).join(', ')}.
Pick a completely different en.name — new words, new joke, new cadence. Do not reuse, rephrase, or lightly tweak any of them.`
    : ''

  return `${STATIC_INSTRUCTIONS}

## Specification (seed ${fusion.meta.seed}, pair ${fusion.meta.pairKey}, attempt ${fusion.meta.attempt})

### Fixed mechanics (copy type, range, facets into output JSON first)
- type: ${mechanics.type}
- range: ${mechanics.range}
- facets: [${mechanics.facets.join(', ')}]
- origin: ${mechanics.origin}

### Description focus (IMPORTANT)
- Lead with what the user **has** or **can do**, matching mechanics.type (${mechanics.type}).
- ${typeFocus}
- **NEW rule (required):** the mechanism must need BOTH parents — not one parent's signature loop with a fresh name, adjective, or animal analogy.
- Do not bury the core effect under lore or parent references.

### Fusion strategy
${roll.strategyInstruction}
${roll.antiMashupRule}${antiMashupExample}

### Name register: ${roll.nameRegister}
${roll.nameRegisterInstruction}
Examples: ${roll.nameExamples.join(', ')}
Canon references: ${constraints.canonNameReferences.join(', ')}
Naming rules:
${constraints.namingRules.map((rule) => `- ${rule}`).join('\n')}

### Utility
${roll.utilityNudge}

### Type discipline
${constraints.typeDiscipline.map((line) => `- ${line}`).join('\n')}

### Facet contract
${constraints.facetContract}

### Range
${constraints.rangeProse}

### Description length (HARD — ${constraints.descriptionMaxLength} characters max; overlong text is trimmed server-side)
${constraints.descriptionMinLength}–${constraints.descriptionMaxLength} characters (spaces and punctuation count). Target 160–240. Write at most TWO short sentences; stop before the limit — do not rely on the server to cut your copy.

### ${siblingGate}

### Parent quirks (catalog summary — search fandom if you need more canon detail)
${formatParentBlock(fusion.parents[0])}
${formatParentBlock(fusion.parents[1])}

### ${formatPriorVariantsBlock(fusion)}${formatTakenTitlesBlock(fusion)}${rejectedNameBlock}`
}
