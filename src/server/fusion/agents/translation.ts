import { Agent, run, type RunContext } from "@openai/agents";
import type { FusionTranslationLocale } from "../constants";
import {
  validateLocaleFusionTranslation,
  type ValidatedEnglishFusionPayload,
  type ValidatedLocaleFusionCopy,
} from "../validate";
import type { FusionTranslationRunContext } from "./context";
import {
  FUSION_AGENT_MAX_ATTEMPTS,
  resolveFusionModelSettings,
  resolveFusionOpenAiModel,
} from "./config";
import { buildFusionTranslationInstructions } from "./instructions-locale";
import {
  fusionTranslationOutputSchema,
  FusionEsOutputSchema,
  FusionPtBrOutputSchema,
} from "./schemas";
import {
  buildTranslationFusionRunConfig,
  type FusionPipelineTraceContext,
} from "./tracing";

const USER_TURN = "Return the localized quirk JSON now.";

type TranslationOutputSchema =
  | typeof FusionPtBrOutputSchema
  | typeof FusionEsOutputSchema;

type TranslationAgent = Agent<
  FusionTranslationRunContext,
  TranslationOutputSchema
>;

const translationAgents = new Map<FusionTranslationLocale, TranslationAgent>();
let translationAgentsModel: string | null = null;

function buildTranslationInstructions(
  runContext: RunContext<FusionTranslationRunContext>,
): string {
  const { locale, source } = runContext.context;
  if (!locale || !source) {
    throw new Error(
      "Fusion translation agent context missing locale or source.",
    );
  }
  return buildFusionTranslationInstructions({ locale, source });
}

function getTranslationAgent(locale: FusionTranslationLocale): TranslationAgent {
  const model = resolveFusionOpenAiModel();
  if (translationAgentsModel !== model) {
    translationAgents.clear();
    translationAgentsModel = model;
  }

  const cached = translationAgents.get(locale);
  if (cached) return cached;

  const agent = new Agent<FusionTranslationRunContext, TranslationOutputSchema>({
    name: `Fusion locale adapter (${locale})`,
    handoffDescription: `Adapts fusion quirks into ${locale}.`,
    instructions: buildTranslationInstructions,
    model,
    modelSettings: resolveFusionModelSettings("translation"),
    outputType: fusionTranslationOutputSchema(locale),
  });

  translationAgents.set(locale, agent);
  return agent;
}

export async function translateFusionWithAgent(
  source: ValidatedEnglishFusionPayload,
  locale: FusionTranslationLocale,
  trace?: FusionPipelineTraceContext,
): Promise<ValidatedLocaleFusionCopy> {
  const context: FusionTranslationRunContext = { locale, source };

  let retryHint: string | null = null;

  for (let attempt = 1; attempt <= FUSION_AGENT_MAX_ATTEMPTS; attempt++) {
    const userTurn = retryHint ? `${retryHint}\n\n${USER_TURN}` : USER_TURN;

    try {
      const result = await run(getTranslationAgent(locale), userTurn, {
        context,
        maxTurns: 1,
        ...(trace ? buildTranslationFusionRunConfig(locale, trace) : {}),
      });

      const raw = result.finalOutput;
      if (!raw)
        throw new Error(`OpenAI agent (${locale}) retornou saída vazia.`);

      return validateLocaleFusionTranslation(raw, locale);
    } catch (err) {
      if (attempt === FUSION_AGENT_MAX_ATTEMPTS) throw err;
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes("description longo demais") ||
        message.includes("description curto demais")
      ) {
        retryHint = message;
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Falha na adaptação via OpenAI agent (${locale}).`);
}
