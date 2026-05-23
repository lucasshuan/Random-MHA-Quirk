import type { FusionPriorVariant } from '@/types/fusion'
import type { QuirkType } from '@/types/quirk'
import type { FusionCatalogQuirk } from '../catalog'
import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_DESCRIPTION_MIN_LENGTH,
} from '../constants'
import {
  formatBaseAntiMashupRule,
  formatStrategyAntiMashupExample,
  isFusionAntiMashupRuleKey,
} from './anti-mashup'
import { formatFacetContractBlock } from './facet-contract'
import { formatFusionNamingBlock } from './naming'
import type { FusionOutputRoll } from './output'
import { formatRangeProseBlock } from './range-prose'
import {
  deriveFusionRollContext,
  type FusionRollContext,
} from './roll-context'
import { resolveFusionStrategyForKey, type FusionStrategyKey } from './strategy'
import {
  formatFusionUtilityNudge,
  isFusionUtilityNiche,
  selectFusionUtilityNudge,
} from './utility'

const TYPE_DISCIPLINE: Record<QuirkType, string[]> = {
  Emitter: [
    'Core model: the Quirk sends an effect outward from the body.',
    'Keep body changes minimal: activation tell or small output organ only.',
  ],
  Transformation: [
    'Core model: the Quirk temporarily changes the user while active.',
    'State what changes in the body and what returns to normal after use.',
  ],
  Mutant: [
    'Core model: the user has stable unusual anatomy from birth.',
    'Describe the permanent trait first, then what it does in action.',
  ],
}

export function formatTypeDisciplineBlock(type: QuirkType): string {
  return `Type discipline (${type} only):
${TYPE_DISCIPLINE[type].map((line) => `- ${line}`).join('\n')}`
}

export function buildFusionPrompt(
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
  seed: string,
  priorVariants: FusionPriorVariant[] = [],
  rollContext: FusionRollContext = deriveFusionRollContext(seed, quirkA, quirkB),
): string {
  const { outputRoll, roll } = rollContext
  const formatParent = (q: FusionCatalogQuirk) =>
    `- ${q.name} (${q.id}): tier ${q.tier}, ${q.type}, range ${q.range}, facets [${q.facets.join(', ')}]. ${q.description}`
  const strategy = resolveFusionStrategyForKey(roll.strategyKey, quirkA, quirkB)
  const utilityLine = isFusionUtilityNiche(roll.utilityNiche)
    ? formatFusionUtilityNudge(roll.utilityNiche)
    : selectFusionUtilityNudge(seed, quirkA.id, quirkB.id).line
  const namingBlock = formatFusionNamingBlock(
    seed,
    priorVariants,
    quirkA.id,
    quirkB.id,
  )
  const typeDiscipline = formatTypeDisciplineBlock(outputRoll.type)
  const facetContract = formatFacetContractBlock(
    outputRoll.facets,
    outputRoll.type,
    [quirkA, quirkB],
  )
  const rangeProse = formatRangeProseBlock(outputRoll.range)
  const strategyAntiMashupExample = formatStrategyAntiMashupExample(
    roll.strategyKey as FusionStrategyKey,
    quirkA,
    quirkB,
  )
  const siblingDiversityRule =
    priorVariants.length > 0
      ? 'Sibling diversity gate: prior variants for this parent pair already exist. Choose a different central carrier, action, manifestation, or everyday role. Changing only the title, range, strength, activation wording, or drawback is NOT a meaningfully different fusion.'
      : ''

  return `
Create ONE original My Hero Academia-style fusion quirk from two parent quirks.

${namingBlock}

${strategy.instruction}
${strategyAntiMashupExample}
${utilityLine}
${siblingDiversityRule}

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
- ${isFusionAntiMashupRuleKey(roll.antiMashupRuleKey) ? formatBaseAntiMashupRule(roll.antiMashupRuleKey) : formatBaseAntiMashupRule('modifier-cost')}
- Invent a third mechanism that synergizes or clashes with BOTH source quirks — do NOT just concatenate names or effects.
- Not a canon character quirk; this is a fan hybrid quirk (origin will be ORIGINAL).
- One-Quirk discipline: this entry is exactly one birth Quirk, not two powers, an add-on, a gadget, or a mode layered on a separate "real quirk".
- Do not change type, range, or facets from the required result mechanics above — only invent name and description.
- en.description: 2–3 short sentences, ${FUSION_DESCRIPTION_MIN_LENGTH}–${FUSION_DESCRIPTION_MAX_LENGTH} characters (count includes spaces and punctuation), objective, vivid, anime tone, self-contained, focused on the resulting quirk only
- Prefer compact writing: usually 160–260 characters; avoid semicolon-heavy or clause-heavy sentences.
- Follow the fusion strategy above for how the two parents combine; do not ignore it for a generic literal merge of both effects.
- Structure the description in this order:
  1) first sentence = main effect in plain words (what it does),
  2) second sentence = manifestation/activation or one essential secondary detail,
  3) optional last sentence = at most one limit — physical cost OR clear situational scope; omit when the quirk is already weak, narrow, contact-only, failure-mode, or self-limiting by range/type; omit when a limit would feel piled-on.
- Keep one clear core mechanism. If a second effect exists, it must be a direct consequence of the same mechanism.
- Fixed facets label how that single mechanism presents; never add healing, calming, remote senses, animal anatomy, or stat boosts solely to satisfy a facet tag.
- Focus on what the quirk does, not combat roleplay or ally tactics. Narrow scope is fine when it is part of the mechanism (e.g. disrupts active Emitter effects in open space, clears lingering quirk residue but not innate Mutant anatomy) — state as objective fact, not matchup advice.
- Avoid unnecessary technical or aesthetic detail (exact pressure/temperature/color specs, niche physics jargon, or conditional chains) unless needed to understand behavior.
- Use direct verbs and caveman clarity: easy to imagine after one read.
- Limits are optional, not mandatory: some canon quirks have none in the entry. When one helps, use at most ONE — either a simple physical cost (dizziness, overheating, recoil, short cooldown, touch requirement) OR one clear situational scope baked into the effect (what it can erase vs leave alone, which quirk expressions it disrupts vs skips, range/surface/target type). Situational limits are valid when obvious from the core idea; do not invent extra physical costs on top. Avoid stacking more than two separate limits in one description.
- Write ONLY about the new hybrid quirk. Do not refer to the source quirks by name (${quirkA.name}, ${quirkB.name}), id (${quirkA.id}, ${quirkB.id}), or as separate quirks — no "fusion", "combination", "based on", "inspired by", "inherits from", or "merges X with Y"
- Normal vocabulary is fine even when it overlaps a parent name (e.g. English "power" in "raw power" is allowed; do not capitalize it or use it as the parent quirk's proper name)
- Describe the resulting quirk in an encyclopedia-like tone: mechanism, activation, behavior, and tradeoffs only when they matter — this tone applies to en.description ONLY, not en.name

Reply with ONLY valid JSON (no markdown):
{
  "en": { "name": string, "description": string },
  "type": string,
  "range": string,
  "facets": string[]
}
`;
}

export { deriveFusionRollContext, type FusionOutputRoll, type FusionRollContext }
