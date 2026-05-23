import type { QuirkType } from '@/types/quirk'
import type { FusionCatalogQuirk } from '../catalog'
import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_DESCRIPTION_MIN_LENGTH,
} from '../constants'
import { formatBaseAntiMashupRule, formatStrategyAntiMashupExample } from './anti-mashup'
import { formatFacetContractBlock } from './facet-contract'
import { formatFusionNamingBlock } from './naming'
import { deriveFusionOutputFromSeed, type FusionOutputRoll } from './output'
import { formatRangeProseBlock } from './range-prose'
import { selectFusionStrategy } from './strategy'
import { selectFusionUtilityNudge } from './utility'

const TYPE_DISCIPLINE: Record<QuirkType, string[]> = {
  Emitter: [
    'Core model: the Quirk emits, projects, controls, or alters something outside the body.',
    'Body signs are activation tells or small organs only; do not write a full-body transformation or permanent mutant anatomy.',
    'If Anthropomorphic or Biological appears in facets, express it as an emitted shape/material, a minor visible tell, or an organ that produces the output - not a new animal body.',
  ],
  Transformation: [
    'Core model: the Quirk temporarily changes the user when activated. State what changes, what remains human, and what returns to normal afterward.',
    'Do not describe permanent mutant anatomy; any launched or detached effect must clearly come from the transformed state.',
    'Costs should tie to maintaining the changed form: strain, cramps, overheating, loss of precision, duration cap, or recovery time.',
  ],
  Mutant: [
    'Core model: the user is born with stable unusual anatomy. Do not say they temporarily transform or morph unless a small appendage extends, retracts, sheds, or regrows.',
    'Mention what permanent trait is visible even before active use, then describe what that anatomy does when the Quirk is used.',
    'Emitter-like outputs must come from the mutant organs or appendages, with a clear production limit, recharge, or body cost.',
  ],
}

export function formatTypeDisciplineBlock(type: QuirkType): string {
  return `Type discipline (${type} only):
${TYPE_DISCIPLINE[type].map((line) => `- ${line}`).join('\n')}`
}

function parentFacetHints(quirkA: FusionCatalogQuirk, quirkB: FusionCatalogQuirk): string[] {
  return [...new Set([...quirkA.facets, ...quirkB.facets])]
}

function deriveOutputRollForPair(
  seed: string,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): FusionOutputRoll {
  return deriveFusionOutputFromSeed(
    seed,
    quirkA.id,
    quirkB.id,
    parentFacetHints(quirkA, quirkB),
    {
      types: [quirkA.type, quirkB.type],
      ranges: [quirkA.range, quirkB.range],
    },
  )
}

export function buildFusionPrompt(
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
  seed: string,
  outputRoll: FusionOutputRoll = deriveOutputRollForPair(seed, quirkA, quirkB),
  priorVariantNames: string[] = [],
): string {
  const formatParent = (q: FusionCatalogQuirk) =>
    `- ${q.name} (${q.id}): ${q.type}, range ${q.range}, facets [${q.facets.join(', ')}]. ${q.description}`
  const strategy = selectFusionStrategy(seed, quirkA, quirkB)
  const namingBlock = formatFusionNamingBlock(
    seed,
    priorVariantNames,
    quirkA.id,
    quirkB.id,
  )
  const utilityNudge = selectFusionUtilityNudge(seed, quirkA.id, quirkB.id)
  const typeDiscipline = formatTypeDisciplineBlock(outputRoll.type)
  const facetContract = formatFacetContractBlock(outputRoll.facets, outputRoll.type)
  const rangeProse = formatRangeProseBlock(outputRoll.range)
  const antiMashupRule = formatBaseAntiMashupRule(strategy.key)
  const strategyAntiMashupExample = formatStrategyAntiMashupExample(
    strategy.key,
    quirkA,
    quirkB,
  )

  return `Create ONE original My Hero Academia-style fusion quirk from these two parent quirks.

${namingBlock}

${utilityNudge.line}

${strategy.contextBlock}
${strategy.instruction}
${strategyAntiMashupExample}

Required result mechanics (fixed for this variant — copy exactly into JSON; write en.description to fit this type, range, and facets):
- type: ${outputRoll.type}
- range: ${outputRoll.range}
- facets: [${outputRoll.facets.join(', ')}]

${typeDiscipline}

${facetContract}

${rangeProse}

Parent quirks:
${formatParent(quirkA)}

${formatParent(quirkB)}

Rules:
- ${antiMashupRule}
- Invent a third mechanism that synergizes or clashes with BOTH source quirks — do NOT just concatenate names or effects.
- Not a canon character quirk; this is a fan hybrid quirk (origin will be ORIGINAL).
- One-Quirk discipline: this entry is exactly one birth Quirk, not two powers, an add-on, a gadget, or a mode layered on a separate "real quirk". Multiple effects are allowed only when they are facets of the same mechanism.
- Do not change type, range, or facets from the required result mechanics above — only invent name and description.
- en.description: 2–4 sentences, ${FUSION_DESCRIPTION_MIN_LENGTH}–${FUSION_DESCRIPTION_MAX_LENGTH} characters (count includes spaces and punctuation), objective, vivid, anime tone, self-contained, focused on the resulting quirk only
- Follow the fusion strategy above for how the two parents combine; do not ignore it for a generic literal merge of both effects.
- Assume the reader only imagines an ordinary human at first and knows nothing about the source quirks. Explain the quirk from zero: what appears on or changes in the body, how it activates, what it lets the user do, and what visible behavior others would notice.
- If the quirk changes anatomy or makes the user animal-like, monstrous, inorganic, elemental, or otherwise not fully human, state that clearly in the description. Mention major visual traits, altered senses or movement, and whether the change is permanent, triggered, or partial.
- If the user still looks human, say what subtle or overt signs reveal the quirk when active, such as eyes, skin, posture, aura, emitted material, sound, temperature, or motion.
- Pick one clear effect model and commit to it: effects stay on the body, detach and travel, reshape the body, project outward without leaving the skin, or alter the environment. Do not mix incompatible models in one sentence (e.g. attached nodes that also ambiguously "rocket forward" without saying whether they leave the body).
- State what moves and where: if something launches, detaches, stays attached, or only a blast/aura/shockwave travels outward. If parts regrow, burn out, or are one-use, say so briefly.
- Use plain action words (grow, burst, launch, shed, propel, coat, emit). Avoid vague physics jargon (acceleration, velocity, kinetic, manipulate force) unless you immediately spell out what the reader sees.
- Do not repeat activation signs already stated earlier in the same description.
- Tradeoff quality bar: avoid generic "uses stamina" alone. Include at least one concrete constraint (startup delay, anchor requirement, cooldown window, recoil/self-risk, fixed radius, reduced precision while active, charge cap, environmental dependence, or one-branch-at-a-time focus lock).
- Cost tone: prefer anime-readable drawbacks such as cramps, numbness, vertigo, overheating, recoil, sensory blur, cooldown, charge caps, or precision loss. Avoid clinical gore/body-horror wording like necrotic tissue, raw muscle, or heavy bleeding unless a parent quirk truly demands it.
- Write ONLY about the new hybrid quirk. Do not refer to the source quirks by name (${quirkA.name}, ${quirkB.name}), id (${quirkA.id}, ${quirkB.id}), or as separate quirks — no "fusion", "combination", "based on", "inspired by", "inherits from", or "merges X with Y"
- Normal vocabulary is fine even when it overlaps a parent name (e.g. English "power" in "raw power" is allowed; do not capitalize it or use it as the parent quirk's proper name)
- Describe the resulting quirk in an encyclopedia-like tone: mechanism, activation, behavior, limits/tradeoffs — this tone applies to en.description ONLY, not en.name

Reply with ONLY valid JSON (no markdown):
{
  "en": { "name": string, "description": string },
  "type": string,
  "range": string,
  "facets": string[]
}`
}
