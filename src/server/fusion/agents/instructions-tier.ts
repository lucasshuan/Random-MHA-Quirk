import type { FusionCatalogQuirk } from '../catalog'
import type { ValidatedEnglishFusionPayload } from '../validate'
import type { FusionStrategyKey } from '../prompts/strategy'
import {
  buildFusionTierDecisionRubric,
  formatFusionStrategyTierGuidance,
  formatFusionTierDecisionQuirk,
} from '../prompts/tier-decision'

export function buildFusionTierDecisionInstructions(
  fusion: ValidatedEnglishFusionPayload,
  parentA: FusionCatalogQuirk,
  parentB: FusionCatalogQuirk,
  strategyKey: FusionStrategyKey,
): string {
  return `${buildFusionTierDecisionRubric()}

${formatFusionStrategyTierGuidance(strategyKey)}

## Quirk to tier

${formatFusionTierDecisionQuirk(fusion)}

## Parent context (calibration only — do not copy their tier)

- ${parentA.name}: tier ${parentA.tier}, ${parentA.type}, range ${parentA.range}
- ${parentB.name}: tier ${parentB.tier}, ${parentB.type}, range ${parentB.range}

Return only JSON matching the output schema. No markdown.`
}
