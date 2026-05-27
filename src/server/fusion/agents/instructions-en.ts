import type { FusionAgentInput } from '@/types/fusion-agent'
import {
  buildFusionEnglishTierStaticBlock,
  buildFusionEnglishTierVariantBlock,
  formatFusionDescriptionLengthGuidance,
} from '../prompts/tier-decision'
import { FUSION_NAMING_RULES } from '../prompts/naming'
import { formatQuirkTypeReferenceBlock } from '../prompts/type-discipline'
import {
  resolveFusionWebSearchDomains,
  resolveFusionWebSearchEnabled,
} from './tools'

const STATIC_INSTRUCTIONS = `You design My Hero Academia fan fusion quirks from a structured specification.

## Output contract

- Return only JSON matching the output schema. No markdown.
- Fill output JSON in order: copy type, range, and facets exactly, then write en.description, then en.name.
- Do not include tier in JSON. Tier is server-assigned; use the Tier calibration reference to keep the mechanism at the required strength.

## Core design contract

- Create exactly one NEW birth Quirk with one governing mechanism, not two powers stapled together.
- Preserve the core recognizable essence from EACH parent in a third rule neither parent could claim alone; minor details may be ignored when they weaken the concept.
- Before writing prose, settle the central concept first, then reduce it to one concrete rule: permanent trait or activation/condition -> changed body, target, material, or resource -> practical consequence.
- Before returning JSON, ask: "Could this description belong to either parent unchanged?" If yes, invent a new combined rule; do not restate a parent through light rewording, a rename, or a metaphor.

## Concept-first design

- Start from the strongest concept, not from a checklist of details.
- Prefer concept-first or name-first generation: find the clean inherited idea first, then describe only the details needed to support it.
- Treat parent details as evidence for the concept, not as mandatory parts to mention.
- Do not preserve every parent detail. Preserve the core recognizable essence from each parent.
- If a familiar third concept explains the inheritance better than a literal mashup, use it.
- Avoid overfitting to minor traits, edge cases, colors, tactics, or incidental wording from the parent descriptions.

## Description rules

- Lead with the concrete mechanism in an objective, encyclopedic anime tone.
- Do not mention parent names, ids, "fusion", "combination", or source quirks.
- Once the mechanism is clear, do not add arbitrary targets, tracking restrictions, or tactical uses merely to make it sound detailed.
- Add at most one physical cost OR one situational scope only when needed; do not pad for detail.
- Obey the request-specific type, facet, range, and hard length constraints.
- When the request includes a **C/D/Ω-tier simplicity** block, that block overrides generic detail, length, and conceptual-synthesis elaboration rules in this prompt.

## Quirk type reference

Use these classifications before applying the selected output type rules:

${formatQuirkTypeReferenceBlock()}

## Naming rules

${FUSION_NAMING_RULES.map((rule) => `- ${rule}`).join('\n')}

Scientific / conceptual synthesis (when it strengthens the hybrid):
- Prefer one coherent mechanism grounded in plausible chemistry, physics, biology, or materials science, or a clear supernatural rule in MHA tone.
- When both parents naturally imply it, the single Quirk may resolve into a familiar third organism, machine, material, mythic creature, or phenomenon instead of a literal mashup (e.g. Cow + Horns -> Bull; Bat + Soundwave -> Echolocation; Engine + Electricity -> Powertrain).
- The third concept must be mechanically earned by the description from both parent operations; do not force parent keywords into en.name when a cleaner derivative fits.
- This concept applies to everything. For example, preferably:
  - Two sport-based quirks may turn into another sport (e.g. Football + Basketball -> Volleyball). 
  - Or two animal-based quirks may turn into another animal (e.g. Lion + Eagle -> Griffin).
  - Or one animal-based quirk with a trait may turn into an animal subtype (e.g. Rabbit + Speed -> Jackrabbit) 
  - Or two element-based quirks may resolve into a reaction, phase, or byproduct (e.g. Fire + Water -> Steam).
  - Or one element-based quirk with a condition turns into known material science (e.g. Softening + Barrier -> Non-Newtonian fluid)`

function buildFusionEnglishWebSearchBlock(): string {
  if (!resolveFusionWebSearchEnabled()) return ''

  const domains = resolveFusionWebSearchDomains().join(', ')
  return `

Research:
- You may search before writing. Prefer myheroacademia.fandom.com for each parent's canon name, limits, and how the power is shown in-series.
- Use en.wikipedia.org only for short real-world science context (e.g. non-Newtonian fluid, catalysis, shear thickening) when it clarifies the hybrid mechanism.
- Allowed domains only: ${domains}.
- Do not use user location. Keep searches minimal — confirm parents, not essay research.`
}

function buildFusionEnglishStableInstructionsPrefix(): string {
  return `${STATIC_INSTRUCTIONS}${buildFusionEnglishWebSearchBlock()}

${buildFusionEnglishTierStaticBlock()}`
}

const CONCEPTUAL_SYNTHESIS_NAME_EXAMPLES: Record<string, readonly string[]> = {
  pun: [
    'Cow + Horns -> bull -> "Bull Rush"',
    'Frog + Tape -> tree frog -> "Stick Landing"',
    'Beetle + Explosion -> bombardier beetle -> "Shell Shock"',
    'Engine + Jet/Fan -> turbofan -> "Fan Service"',
    'Steam + Muscle -> hydraulic press -> "Pressing Issue"',
    'Dog + Fire -> hellhound/hot dog -> "Hot Dog"',
    'Octopus + Camouflage -> mimic octopus -> "Inkognito"',
    'Ant + Telepathy -> colony mind -> "Ant-tenna"',
    'Battery + Muscle -> actuator -> "Flex Capacitor"',
  ],
  blunt: [
    'Cow + Horns -> bull -> "Bull"',
    'Rabbit + Speed -> jackrabbit -> "Jackrabbit"',
    'Lion + Eagle -> griffin -> "Griffin"',
    'Engine + Electricity -> hybrid drive -> "Hybrid Drive"',
    'Magnetism + Projectile -> railgun -> "Railgun"',
    'Bat + Soundwave -> echolocation -> "Echolocation"',
    'Horse + Wings -> pegasus -> "Pegasus"',
    'Bird + Fire -> phoenix -> "Phoenix"',
    'Sand + Lightning -> fulgurite -> "Fulgurite"',
    'Rubber + Heat -> vulcanization -> "Vulcanization"',
  ],
  dramatic: [
    'Lion + Eagle -> griffin -> "Skyclaw"',
    'Bird + Fire -> phoenix -> "Phoenix"',
    'Wolf + Shadow -> Fenrir -> "Black Fenrir"',
    'Magnetism + Projectile -> railgun -> "Gauss Driver"',
    'Engine + Jet/Fan -> turbofan -> "Afterburner"',
    'Horse + Wings -> pegasus -> "Heaven Hoof"',
    'Goat + Fire -> Baphomet -> "Baphomet"',
    'Centipede + Armor -> armored arthropod -> "Arthroplate"',
    'Sand + Lightning -> fulgurite -> "Thunderstone"',
    'Octopus + Camouflage -> mimic octopus -> "False Form"',
  ],
  'absurd-long': [
    'Cow + Horns -> bull -> "Bull With His Own Battering Ram"',
    'Ant + Telepathy -> colony mind -> "Everybody Is A Big Happy Family"',
    'Horse + Wings -> pegasus -> "Horse That Forgot Gravity"',
    'Engine + Jet/Fan -> turbofan -> "Turbofans Where His Calves Should Be"',
    'Steam + Strength -> hydraulic press -> "Arms That Work Like Hydraulic Presses"',
    'Serpent + Rooster -> cockatrice -> "Snake Chicken of Doom"',
    'Goat + Fish -> capricorn -> "Goat Mermaid Situation"',
    'Engine + Electricity -> hybrid drive -> "Whole-Body Hybrid Engine System"',
    'Mushroom + Mind Control -> cordyceps -> "Mushrooms That Borrow Other People\'s Bodies"',
  ],
  'meme-adjacent': [
    'Cow + Horns -> bull -> "Got Beef"',
    'Rabbit + Speed -> jackrabbit -> "Zoomies"',
    'Ant + Telepathy -> colony mind -> "Group Chat"',
    'Engine + Electricity -> hybrid drive -> "Vroom Vroom"',
    'Magnetism + Gatling -> railgun -> "Yeet Cannon"',
    'Dog + Fire -> hellhound/hot dog -> "Hot Dog"',
    'Frog + Adhesive -> tree frog -> "Wall Guy"',
    'Octopus + Camouflage -> mimic octopus -> "Not An Octopus"',
    'Bird + Fire -> phoenix -> "Try Again"',
    'Shark + Electricity -> electroreception -> "Shark Wi-Fi"',
  ],
}

function formatParentBlock(parent: FusionAgentInput['parents'][number]): string {
  return `- ${parent.name} (${parent.id}): tier ${parent.tier}, ${parent.type}, range ${parent.range}, facets [${parent.facets.join(', ')}]. ${parent.description}`
}

function formatConceptualSynthesisNameHint(nameRegister: string): string {
  const examples =
    CONCEPTUAL_SYNTHESIS_NAME_EXAMPLES[nameRegister] ??
    ['use a familiar derived title in the selected register']
  return `Conceptual-resolution option: if the earned mechanism resolves into a recognizable third concept, title that concept in the selected register rather than forcing parent keywords. Illustrative patterns for this register: ${examples.join('; ')}. These are models, not preferred outputs: use one only when it fits and is not forbidden; otherwise invent a different fitting derivative. Use this only when the derivative is clearer than a literal fusion; otherwise keep the direct mechanism.`
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

export function buildFusionEnglishStaticInstructions(): string {
  return buildFusionEnglishStableInstructionsPrefix()
}

export function buildFusionEnglishDynamicPrompt(fusion: FusionAgentInput): string {
  const { mechanics, roll, constraints } = fusion
  const siblingGate = constraints.siblingDiversityRequired
    ? 'Sibling diversity REQUIRED: produce a meaningfully different fusion than prior variants (not just rename or rephrase).'
    : 'Sibling diversity: not required for this pair yet.'

  const antiMashupExample = roll.antiMashupExample
    ? `\n${roll.antiMashupExample}`
    : ''

  return `## Request-specific specification

### Fixed mechanics (copy type, range, facets into output JSON first)
- type: ${mechanics.type}
- range: ${mechanics.range}
- facets: [${mechanics.facets.join(', ')}]

### Selected output type: ${mechanics.type} (must follow)
Apply only the detailed rules for the selected type below:
${constraints.typeDiscipline.map((line) => `- ${line}`).join('\n')}

## Tier target for this variant

${buildFusionEnglishTierVariantBlock(fusion)}

### Fusion strategy
${roll.strategyInstruction}
${roll.antiMashupRule}${antiMashupExample}

### Name register: ${roll.nameRegister}
${roll.nameRegisterInstruction}
Examples: ${roll.nameExamples.join(', ')}
${formatConceptualSynthesisNameHint(roll.nameRegister)}

### Facet contract
${constraints.facetContract}

### Range
${constraints.rangeProse}

### Description length (HARD — ${constraints.descriptionMaxLength} characters max; overlong text is trimmed server-side)
${formatFusionDescriptionLengthGuidance(mechanics.tier, constraints.descriptionMinLength, constraints.descriptionMaxLength)}

### ${siblingGate}
${formatPriorVariantsBlock(fusion)}
${formatTakenTitlesBlock(fusion)}

### Parent quirks (catalog summary)
${formatParentBlock(fusion.parents[0])}
${formatParentBlock(fusion.parents[1])}`
}

/** Back-compat helper: concatenates static + dynamic. */
export function buildFusionEnglishInstructions(fusion: FusionAgentInput): string {
  return `${buildFusionEnglishStaticInstructions()}\n\n${buildFusionEnglishDynamicPrompt(
    fusion,
  )}`
}
