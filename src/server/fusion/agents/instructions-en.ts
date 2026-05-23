import type { FusionAgentInput } from '@/types/fusion-agent'

const STATIC_INSTRUCTIONS = `You design My Hero Academia fan fusion quirks from a structured specification.

Your job:
- Invent en.name and en.description only.
- Echo mechanics.type, mechanics.range, and mechanics.facets exactly in the output JSON.
- Follow the fusion strategy, anti-mashup rules, name register, utility nudge, and constraints in the specification.
- One-Quirk discipline: exactly one birth Quirk, not two powers stapled together.
- en.description: objective, encyclopedic, anime tone — not the same voice as en.name.
- Do not name parent quirks, their ids, "fusion", "combination", or source quirks in en.description.
- Limits are optional: at most one physical cost OR one situational scope when needed.

Return only JSON matching the output schema. No markdown.`

function formatParentBlock(parent: FusionAgentInput['parents'][number]): string {
  return `- ${parent.name} (${parent.id}): tier ${parent.tier}, ${parent.type}, range ${parent.range}, facets [${parent.facets.join(', ')}]. ${parent.description}`
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
  const siblingGate = constraints.siblingDiversityRequired
    ? 'Sibling diversity REQUIRED: produce a meaningfully different fusion than prior variants (not just rename or rephrase).'
    : 'Sibling diversity: not required for this pair yet.'

  const antiMashupExample = roll.antiMashupExample
    ? `\n${roll.antiMashupExample}`
    : ''

  return `${STATIC_INSTRUCTIONS}

## Specification (seed ${fusion.meta.seed}, pair ${fusion.meta.pairKey}, attempt ${fusion.meta.attempt})

### Fixed mechanics (copy exactly into output JSON)
- type: ${mechanics.type}
- range: ${mechanics.range}
- facets: [${mechanics.facets.join(', ')}]
- origin: ${mechanics.origin}

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

### Description length
${constraints.descriptionMinLength}–${constraints.descriptionMaxLength} characters (spaces and punctuation count). Prefer 160–260.

### ${siblingGate}

### Parent quirks
${formatParentBlock(fusion.parents[0])}
${formatParentBlock(fusion.parents[1])}

### ${formatPriorVariantsBlock(fusion)}`
}
