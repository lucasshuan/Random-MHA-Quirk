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
import {
  resolveFusionStrategyForKey,
  type FusionStrategyKey,
} from './prompts/strategy'
import { mergeForbiddenFusionTitles } from './prior-variants'

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
    },
    parents: [toAgentParent(quirkA), toAgentParent(quirkB)],
    mechanics: {
      type: outputRoll.type,
      range: outputRoll.range,
      facets: outputRoll.facets,
      origin: 'ORIGINAL',
      tier: rollContext.tier,
    },
    roll: {
      strategyKey: roll.strategyKey,
      strategyInstruction: strategy.instruction,
      antiMashupRule,
      antiMashupExample,
      nameRegister: nameRegister.key,
      nameRegisterInstruction: nameRegister.instruction,
      nameExamples: nameRegister.examples,
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
    },
    priorVariants: priorVariants.map((variant) => ({
      name: variant.name.trim(),
      description: variant.description.trim(),
      roll: variant.roll,
    })),
    takenTitles: mergeForbiddenFusionTitles(
      quirkA.name,
      quirkB.name,
      takenTitles,
    ),
  }
}
