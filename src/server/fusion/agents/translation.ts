import { Agent, run, type RunContext } from "@openai/agents";
import type { FusionTranslationLocale } from "../constants";
import {
  validateLocaleFusionTranslation,
  type ValidatedEnglishFusionPayload,
  type ValidatedLocaleFusionCopy,
} from "../validate";
import type { FusionTranslationRunContext } from "./context";
import {
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

  const result = await run(getTranslationAgent(locale), USER_TURN, {
    context,
    maxTurns: 1,
    ...(trace ? buildTranslationFusionRunConfig(locale, trace) : {}),
  });

  const raw = result.finalOutput;
  if (!raw)
    throw new Error(`OpenAI agent (${locale}) retornou saída vazia.`);

  return validateLocaleFusionTranslation(raw, locale);
}
