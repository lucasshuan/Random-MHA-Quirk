import type { FusionAgentInput } from '@/types/fusion-agent'
import {
  buildFusionEnglishTierStaticBlock,
  buildFusionEnglishTierVariantBlock,
} from '../prompts/tier-decision'
import {
  FUSION_CANON_NAME_REFERENCES,
  FUSION_NAMING_RULES,
} from '../prompts/naming'
import { FUSION_WEB_SEARCH_DEFAULT_DOMAINS } from './tools'

const STATIC_INSTRUCTIONS = `You design My Hero Academia fan fusion quirks from a structured specification.

## Output contract

- Return only JSON matching the output schema. No markdown.
- Fill output JSON in order: copy type, range, and facets exactly, then write en.description, then en.name.
- Do not include tier in JSON. Tier is server-assigned; use the Tier calibration reference to keep the mechanism at the required strength.

## Core design contract

- Create exactly one NEW birth Quirk with one governing mechanism, not two powers stapled together.
- Preserve a recognizable operational essence from EACH parent in a third rule neither parent could claim alone.
- Before writing prose, settle one concrete rule: permanent trait or activation/condition -> changed body, target, material, or resource -> practical consequence.
- Before returning JSON, ask: "Could this description belong to either parent unchanged?" If yes, invent a new combined rule; do not restate a parent through light rewording, a rename, or a metaphor.

## Description rules

- Lead with the concrete mechanism in an objective, encyclopedic anime tone.
- Do not mention parent names, ids, "fusion", "combination", or source quirks.
- Once the mechanism is clear, do not add arbitrary targets, tracking restrictions, or tactical uses merely to make it sound detailed.
- Add at most one physical cost OR one situational scope only when needed; do not pad for detail.
- Obey the request-specific type, facet, range, and hard length constraints.

## Naming rules

${FUSION_NAMING_RULES.map((rule) => `- ${rule}`).join('\n')}
- Canon-style reference names (any register): ${FUSION_CANON_NAME_REFERENCES.join(', ')}

Research (when web_search is available):
- You may search before writing. Prefer myheroacademia.fandom.com for each parent's canon name, limits, and how the power is shown in-series.
- Use en.wikipedia.org only for short real-world science context (e.g. non-Newtonian fluid, catalysis, shear thickening) when it clarifies the hybrid mechanism.
- Allowed domains only: ${FUSION_WEB_SEARCH_DEFAULT_DOMAINS.join(', ')} (or domains configured for this run).
- Do not use user location. Keep searches minimal — confirm parents, not essay research.

Scientific synthesis (when it strengthens the hybrid):
- Prefer one coherent mechanism grounded in plausible chemistry, physics, biology, or materials science, or a clear supernatural rule in MHA tone.
- The result need not echo both parent names literally if a principled synthesis fits better — like canon fusions where parents combine into a third idea (e.g. sweat chemistry leading to explosions, or asymmetric expression of two lineages).
- Rolled type, range, facets, tier, and strategy still govern the entry; science explains how the single Quirk works, not an extra unrelated power.`

const STABLE_INSTRUCTIONS_PREFIX = `${STATIC_INSTRUCTIONS}

${buildFusionEnglishTierStaticBlock()}`

function formatParentBlock(parent: FusionAgentInput['parents'][number]): string {
  return `- ${parent.name} (${parent.id}): tier ${parent.tier}, ${parent.type}, range ${parent.range}, facets [${parent.facets.join(', ')}]. ${parent.description}`
}

function normalizeTitle(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

function formatTakenTitlesBlock(input: FusionAgentInput): string {
  const priorNames = new Set(input.priorVariants.map((variant) => normalizeTitle(variant.name)))
  const titles = input.takenTitles.filter((name) => !priorNames.has(normalizeTitle(name)))
  if (titles.length === 0) return ''

  const lines = titles.map((name) => `- "${name}"`)
  return `
### Not allowed names (do not use for en.name)
Additional forbidden titles not listed with prior variants below. Pick a different title; do not reuse or lightly rephrase any of them:
${lines.join('\n')}`
}

function formatPriorVariantsBlock(input: FusionAgentInput): string {
  if (input.priorVariants.length === 0) return '\n### Prior variants\nNone.'

  const lines = input.priorVariants.map(
    (variant) => `- "${variant.name}": ${variant.description}`,
  )
  return `
### Prior variants (titles are forbidden)
Do not reuse or lightly rephrase these titles; pick a different core idea:
${lines.join('\n')}`
}

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

  return `${STABLE_INSTRUCTIONS_PREFIX}

## Request-specific specification

### Fixed mechanics (copy type, range, facets into output JSON first)
- type: ${mechanics.type}
- range: ${mechanics.range}
- facets: [${mechanics.facets.join(', ')}]

### Type-specific description focus
- ${typeFocus}

### Fusion strategy
${roll.strategyInstruction}
${roll.antiMashupRule}${antiMashupExample}

### Name register: ${roll.nameRegister}
${roll.nameRegisterInstruction}
Examples: ${roll.nameExamples.join(', ')}

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
${formatPriorVariantsBlock(fusion)}
${formatTakenTitlesBlock(fusion)}

### Parent quirks (catalog summary)
${formatParentBlock(fusion.parents[0])}
${formatParentBlock(fusion.parents[1])}

## Tier target for this variant

${buildFusionEnglishTierVariantBlock(fusion)}`
}
