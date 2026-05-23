import { Agent, run } from '@openai/agents'
import type { FusionTranslationLocale } from '../constants'
import {
  validateLocaleFusionTranslation,
  type ValidatedEnglishFusionPayload,
  type ValidatedLocaleFusionCopy,
} from '../validate'
import type { FusionTranslationRunContext } from './context'
import {
  FUSION_AGENT_MAX_ATTEMPTS,
  resolveFusionModelSettings,
  resolveFusionOpenAiModel,
} from './config'
import { buildFusionTranslationInstructions } from './instructions-locale'
import {
  fusionTranslationOutputSchema,
  FusionEsOutputSchema,
  FusionPtBrOutputSchema,
} from './schemas'
import {
  buildTranslationFusionRunConfig,
  type FusionPipelineTraceContext,
} from './tracing'

const USER_TURN = 'Return the localized quirk JSON now.'

const translationAgents = new Map<
  FusionTranslationLocale,
  Agent<FusionTranslationRunContext, typeof FusionPtBrOutputSchema | typeof FusionEsOutputSchema>
>()
let translationAgentsModel: string | null = null

function getTranslationAgent(
  locale: FusionTranslationLocale,
): Agent<
  FusionTranslationRunContext,
  typeof FusionPtBrOutputSchema | typeof FusionEsOutputSchema
> {
  const model = resolveFusionOpenAiModel()
  if (translationAgentsModel !== model) {
    translationAgents.clear()
    translationAgentsModel = model
  }

  const cached = translationAgents.get(locale)
  if (cached) return cached

  const agent = new Agent({
    name: `Fusion locale adapter (${locale})`,
    handoffDescription: `Adapts fusion quirks into ${locale}.`,
    instructions: (runContext) => {
      const ctx = runContext.context
      if (!ctx?.locale || !ctx.source) {
        throw new Error('Fusion translation agent context missing locale or source.')
      }
      return buildFusionTranslationInstructions(ctx)
    },
    model,
    modelSettings: resolveFusionModelSettings('translation'),
    outputType: fusionTranslationOutputSchema(locale),
  })

  translationAgents.set(locale, agent)
  return agent
}

export async function translateFusionWithAgent(
  source: ValidatedEnglishFusionPayload,
  locale: FusionTranslationLocale,
  trace?: FusionPipelineTraceContext,
): Promise<ValidatedLocaleFusionCopy> {
  const context: FusionTranslationRunContext = { locale, source }

  for (let attempt = 1; attempt <= FUSION_AGENT_MAX_ATTEMPTS; attempt++) {
    try {
      const result = await run(getTranslationAgent(locale), USER_TURN, {
        context,
        maxTurns: 1,
        ...(trace ? buildTranslationFusionRunConfig(locale, trace) : {}),
      })

      const raw = result.finalOutput
      if (!raw) throw new Error(`OpenAI agent (${locale}) retornou saída vazia.`)

      return validateLocaleFusionTranslation(raw, locale)
    } catch (err) {
      if (attempt === FUSION_AGENT_MAX_ATTEMPTS) throw err
    }
  }

  throw new Error(`Falha na adaptação via OpenAI agent (${locale}).`)
}
