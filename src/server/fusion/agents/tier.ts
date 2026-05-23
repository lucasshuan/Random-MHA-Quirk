import { Agent, run } from '@openai/agents'
import type { FusionCatalogQuirk } from '../catalog'
import type { FusionStrategyKey } from '../prompts/strategy'
import type { QuirkDisplayTier } from '@/types/quirk'
import type { ValidatedEnglishFusionPayload } from '../validate'
import {
  FUSION_AGENT_MAX_ATTEMPTS,
  resolveFusionModelSettings,
  resolveFusionOpenAiModel,
} from './config'
import { buildFusionTierDecisionInstructions } from './instructions-tier'
import { FusionTierOutputSchema } from './schemas'
import type { FusionTierRunContext } from './context'
import {
  buildTierFusionRunConfig,
  type FusionPipelineTraceContext,
} from './tracing'

const USER_TURN =
  'Apply the seven evaluation questions and tier scale. Return only the tier JSON.'

let tierAgent: Agent<FusionTierRunContext, typeof FusionTierOutputSchema> | null =
  null
let tierAgentModel: string | null = null

function getTierAgent(): Agent<FusionTierRunContext, typeof FusionTierOutputSchema> {
  const model = resolveFusionOpenAiModel()
  if (!tierAgent || tierAgentModel !== model) {
    tierAgentModel = model
    tierAgent = new Agent({
      name: 'Fusion quirk tier evaluator',
      handoffDescription:
        'Assigns S/A/B/C tier to a hybrid quirk using the war-arc rubric.',
      instructions: (runContext) => {
        const ctx = runContext.context
        if (!ctx?.fusion || !ctx.parentA || !ctx.parentB || !ctx.strategyKey) {
          throw new Error('Fusion tier agent context missing fusion, parents, or strategy.')
        }
        return buildFusionTierDecisionInstructions(
          ctx.fusion,
          ctx.parentA,
          ctx.parentB,
          ctx.strategyKey,
        )
      },
      model,
      modelSettings: resolveFusionModelSettings('tier'),
      outputType: FusionTierOutputSchema,
    })
  }
  return tierAgent
}

export async function decideFusionTierWithAgent(
  fusion: ValidatedEnglishFusionPayload,
  parentA: FusionCatalogQuirk,
  parentB: FusionCatalogQuirk,
  strategyKey: FusionStrategyKey,
  trace?: FusionPipelineTraceContext,
): Promise<QuirkDisplayTier> {
  const context: FusionTierRunContext = { fusion, parentA, parentB, strategyKey }

  for (let attempt = 1; attempt <= FUSION_AGENT_MAX_ATTEMPTS; attempt++) {
    try {
      const result = await run(getTierAgent(), USER_TURN, {
        context,
        maxTurns: 1,
        ...(trace ? buildTierFusionRunConfig(trace) : {}),
      })

      const raw = result.finalOutput
      if (!raw) throw new Error('OpenAI tier agent retornou saída vazia.')

      return raw.tier
    } catch (err) {
      if (attempt === FUSION_AGENT_MAX_ATTEMPTS) throw err
    }
  }

  throw new Error('Falha na atribuição de tier via OpenAI agent.')
}
