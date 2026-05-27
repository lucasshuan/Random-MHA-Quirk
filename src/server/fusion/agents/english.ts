import { Agent, run } from '@openai/agents'
import type { FusionAgentInput } from '@/types/fusion-agent'
import {
  validateEnglishFusionPayload,
  type ValidatedEnglishFusionPayload,
} from '../validate'
import type { FusionEnglishRunContext } from './context'
import {
  resolveFusionModelSettings,
  resolveFusionOpenAiModel,
} from './config'
import {
  buildFusionEnglishDynamicPrompt,
  buildFusionEnglishStaticInstructions,
} from './instructions-en'
import { FusionEnglishOutputSchema } from './schemas'
import {
  createFusionWebSearchTool,
  resolveFusionAgentMaxTurns,
  resolveFusionWebSearchEnabled,
} from './tools'
import { buildEnglishFusionRunConfig } from './tracing'

function buildEnglishUserTurn(): string {
  if (resolveFusionWebSearchEnabled()) {
    return 'Follow the specification. If helpful, search allowed sites for parent quirk canon (especially myheroacademia.fandom.com) before inventing the hybrid. Then return only the fusion quirk JSON.'
  }
  return 'Follow the specification. Then return only the fusion quirk JSON.'
}

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
      handoffDescription:
        'Generates an English MHA hybrid quirk name and description for fixed rolled constraints.',
      // Keep system instructions stable across runs for caching.
      instructions: (_runContext) => {
        void _runContext
        return buildFusionEnglishStaticInstructions()
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
  const userTurn = `${buildFusionEnglishDynamicPrompt(fusion)}\n\n${buildEnglishUserTurn()}`

  const result = await run(getEnglishAgent(), userTurn, {
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
}
