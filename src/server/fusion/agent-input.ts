import type { FusionAgentInput, FusionAgentParent } from '@/types/fusion-agent'
import type { FusionPriorVariant } from '@/types/fusion'
import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_DESCRIPTION_MIN_LENGTH,
} from './constants'
import type { FusionCatalogQuirk } from './catalog'
import {
  formatBaseAntiMashupRule,
  formatStrategyAntiMashupExample,
  isFusionAntiMashupRuleKey,
} from './prompts/anti-mashup'
import { formatFacetContractBlock } from './prompts/facet-contract'
import { formatTypeDisciplineBlock } from './prompts/type-discipline'
import { selectFusionNameRegister } from './prompts/naming'
import { formatRangeProseBlock } from './prompts/range-prose'
import type { FusionRollContext } from './prompts/roll-context'
import { deriveFusionRollContext } from './prompts/roll-context'
import { fusionRollKey } from './prompts/roll-key'
import {
  formatFusionUtilityNudge,
  isFusionUtilityNiche,
  selectFusionUtilityNudge,
} from './prompts/utility'
import {
  resolveFusionStrategyForKey,
  type FusionStrategyKey,
} from './prompts/strategy'

const CANON_NAME_REFERENCES = [
  'Pop Off',
  'Comic',
  'Meatball',
  'Beams From His Eyes',
  'Gigantic Spinning Flying Turtle',
  'Sugar Rush',
  'Brainwashing',
  'Zero Gravity',
]

const NAMING_RULES = [
  'Write en.name only after en.description — the title must give a clear idea of what the quirk does even if it is a pun, joke, or absurd-long register.',
  'en.name uses a different voice than en.description — joke or cadence in the title, encyclopedic body text.',
  'en.name must NOT read like a fantasy RPG skill, technical field label, or "[Parent theme adjective] + [Parent theme noun]" mashup.',
  'Punctuation in en.name: commas and a single question mark are allowed when they sell the joke. At most one ? or one comma clause unless register is absurd-long. No exclamation marks, ellipses, or quotes in the title.',
  'Funny names must still land as a joke, phrase twist, mental image, or spoken cadence — not random interjection + mechanic noun (e.g. avoid "Oops, Cushion" unless the full phrase is the joke).',
  'Before finalizing en.name, ask: "Does this sound like a real anime Quirk title or a phrase someone could say?" If no, replace once in the SAME name register.',
]

function toAgentParent(quirk: FusionCatalogQuirk): FusionAgentParent {
  return {
    id: quirk.id,
    name: quirk.name,
    tier: quirk.tier,
    type: quirk.type,
    range: quirk.range,
    facets: quirk.facets,
    description: quirk.description,
  }
}

function pairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}+${idB}` : `${idB}+${idA}`
}

/** Builds the structured agent payload (deterministic rolls + parent facts). */
export function buildFusionAgentInput(
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
  seed: string,
  priorVariants: FusionPriorVariant[] = [],
  rollContext: FusionRollContext = deriveFusionRollContext(
    seed,
    quirkA,
    quirkB,
    priorVariants,
  ),
  attempt = 0,
  lastRejectedName?: string,
  takenTitles: string[] = [],
): FusionAgentInput {
  const { outputRoll, roll } = rollContext
  const strategy = resolveFusionStrategyForKey(roll.strategyKey, quirkA, quirkB)
  const nameRegister = selectFusionNameRegister(
    seed,
    quirkA.id,
    quirkB.id,
    attempt,
  )
  const utilityLine = isFusionUtilityNiche(roll.utilityNiche)
    ? formatFusionUtilityNudge(roll.utilityNiche)
    : selectFusionUtilityNudge(seed, quirkA.id, quirkB.id).line
  const antiMashupRule = isFusionAntiMashupRuleKey(roll.antiMashupRuleKey)
    ? formatBaseAntiMashupRule(roll.antiMashupRuleKey)
    : formatBaseAntiMashupRule('modifier-cost')
  const antiMashupExample = formatStrategyAntiMashupExample(
    roll.strategyKey as FusionStrategyKey,
    quirkA,
    quirkB,
  )

  const typeDisciplineBlock = formatTypeDisciplineBlock(outputRoll.type)
  const typeDiscipline = typeDisciplineBlock
    .split('\n')
    .slice(1)
    .map((line) => line.replace(/^- /, ''))

  return {
    meta: {
      seed,
      pairKey: pairKey(quirkA.id, quirkB.id),
      attempt,
      ...(lastRejectedName ? { lastRejectedName } : {}),
    },
    parents: [toAgentParent(quirkA), toAgentParent(quirkB)],
    mechanics: {
      type: outputRoll.type,
      range: outputRoll.range,
      facets: outputRoll.facets,
      origin: 'ORIGINAL',
    },
    roll: {
      strategyKey: roll.strategyKey,
      strategyInstruction: strategy.instruction,
      antiMashupRule,
      antiMashupExample,
      nameRegister: nameRegister.key,
      nameRegisterInstruction: nameRegister.instruction,
      nameExamples: nameRegister.examples,
      utilityNudge: utilityLine,
    },
    constraints: {
      descriptionMinLength: FUSION_DESCRIPTION_MIN_LENGTH,
      descriptionMaxLength: FUSION_DESCRIPTION_MAX_LENGTH,
      typeDiscipline,
      facetContract: formatFacetContractBlock(
        outputRoll.facets,
        outputRoll.type,
        [quirkA, quirkB],
      ),
      rangeProse: formatRangeProseBlock(outputRoll.range),
      siblingDiversityRequired: priorVariants.length > 0,
      namingRules: NAMING_RULES,
      canonNameReferences: CANON_NAME_REFERENCES,
    },
    priorVariants: priorVariants.map((variant) => ({
      name: variant.name.trim(),
      description: variant.description.trim(),
      roll: variant.roll,
    })),
    takenTitles: takenTitles.map((name) => name.trim()).filter(Boolean),
  }
}

export function fusionAgentInputRollKey(input: FusionAgentInput): string {
  return fusionRollKey(input.meta.seed, input.parents[0].id, input.parents[1].id)
}
