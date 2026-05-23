import { Agent, run } from '@openai/agents'
import type { FusionAgentInput } from '@/types/fusion-agent'
import {
  validateEnglishFusionPayload,
  type ValidatedEnglishFusionPayload,
} from '../validate'
import type { FusionEnglishRunContext } from './context'
import {
  FUSION_AGENT_MAX_ATTEMPTS,
  resolveFusionModelSettings,
  resolveFusionOpenAiModel,
} from './config'
import { buildFusionEnglishInstructions } from './instructions-en'
import { FusionEnglishOutputSchema } from './schemas'
import {
  createFusionWebSearchTool,
  resolveFusionAgentMaxTurns,
  resolveFusionWebSearchEnabled,
} from './tools'
import { buildEnglishFusionRunConfig } from './tracing'

const USER_TURN =
  'Follow the specification. If helpful, search allowed sites for parent quirk canon (especially myheroacademia.fandom.com) before inventing the hybrid. Then return only the fusion quirk JSON.'

let englishAgent:
  | Agent<FusionEnglishRunContext, typeof FusionEnglishOutputSchema>
  | null = null
let englishAgentModel: string | null = null

function getEnglishAgent(): Agent<
  FusionEnglishRunContext,
  typeof FusionEnglishOutputSchema
> {
  const model = resolveFusionOpenAiModel()
  if (!englishAgent || englishAgentModel !== model) {
    englishAgentModel = model
    englishAgent = new Agent({
      name: 'Hybrid MHA Quirk Generator',
      handoffDescription: 'Generates English MHA hybrid quirk name and description.',
      instructions: (runContext) => {
        const fusion = runContext.context?.fusion
        if (!fusion) {
          throw new Error('Fusion agent context missing fusion input.')
        }
        return buildFusionEnglishInstructions(fusion)
      },
      model,
      modelSettings: resolveFusionModelSettings('fusion'),
      outputType: FusionEnglishOutputSchema,
      ...(resolveFusionWebSearchEnabled()
        ? { tools: [createFusionWebSearchTool()] }
        : {}),
    })
  }
  return englishAgent
}

function enforceServerMechanics(
  payload: ValidatedEnglishFusionPayload,
  fusion: FusionAgentInput,
): ValidatedEnglishFusionPayload {
  return {
    ...payload,
    type: fusion.mechanics.type,
    range: fusion.mechanics.range,
    facets: fusion.mechanics.facets,
    origin: fusion.mechanics.origin,
  }
}

export async function generateEnglishFusionWithAgent(
  fusion: FusionAgentInput,
): Promise<ValidatedEnglishFusionPayload> {
  for (let attempt = 1; attempt <= FUSION_AGENT_MAX_ATTEMPTS; attempt++) {
    try {
      const result = await run(getEnglishAgent(), USER_TURN, {
        context: { fusion },
        maxTurns: resolveFusionAgentMaxTurns(),
        ...buildEnglishFusionRunConfig(fusion),
      })

      const raw = result.finalOutput
      if (!raw) throw new Error('OpenAI agent retornou saída vazia.')

      const validated = validateEnglishFusionPayload({
        ...raw,
        origin: fusion.mechanics.origin,
      })
      return enforceServerMechanics(validated, fusion)
    } catch (err) {
      if (attempt === FUSION_AGENT_MAX_ATTEMPTS) throw err
    }
  }

  throw new Error('Falha na geração via OpenAI agent.')
}
