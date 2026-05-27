import { Agent, run, type RunContext } from "@openai/agents";
import type { FusionTranslationLocale } from "../constants";
import {
  validateAllLocalesFusionTranslation,
  validateLocaleFusionTranslation,
  type ValidatedEnglishFusionPayload,
  type ValidatedLocaleFusionCopy,
} from "../validate";
import type { FusionTranslationAllRunContext, FusionTranslationRunContext } from "./context";
import {
  resolveFusionModelSettings,
  resolveFusionTranslationOpenAiModel,
} from "./config";
import {
  buildFusionTranslationDynamicSourceBlock,
  buildFusionTranslationDynamicPromptAllLocales,
  buildFusionTranslationStaticInstructionsAllLocales,
  buildFusionTranslationStaticInstructions,
} from "./instructions-locale";
import {
  FusionAllLocalesOutputSchema,
  fusionTranslationOutputSchema,
  FusionEsOutputSchema,
  FusionPtBrOutputSchema,
} from "./schemas";
import {
  buildTranslationFusionRunConfig,
  type FusionPipelineTraceContext,
} from "./tracing";

const STATIC_USER_TURN = "Return only the localized quirk JSON now.";

type TranslationOutputSchema =
  | typeof FusionPtBrOutputSchema
  | typeof FusionEsOutputSchema;

type TranslationAgent = Agent<
  FusionTranslationRunContext,
  TranslationOutputSchema
>;

type TranslationAllAgent = Agent<
  FusionTranslationAllRunContext,
  typeof FusionAllLocalesOutputSchema
>;

const translationAgents = new Map<FusionTranslationLocale, TranslationAgent>();
let translationAgentsModel: string | null = null;
let translationAllAgent: TranslationAllAgent | null = null;
let translationAllAgentModel: string | null = null;

function buildTranslationInstructions(
  runContext: RunContext<FusionTranslationRunContext>,
): string {
  const { locale } = runContext.context;
  if (!locale) {
    throw new Error(
      "Fusion translation agent context missing locale.",
    );
  }
  return buildFusionTranslationStaticInstructions(locale);
}

function getTranslationAgent(locale: FusionTranslationLocale): TranslationAgent {
  const model = resolveFusionTranslationOpenAiModel();
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

function buildTranslationAllInstructions(
  runContext: RunContext<FusionTranslationAllRunContext>,
): string {
  void runContext
  return buildFusionTranslationStaticInstructionsAllLocales();
}

function getTranslationAllAgent(): TranslationAllAgent {
  const model = resolveFusionTranslationOpenAiModel();
  if (!translationAllAgent || translationAllAgentModel !== model) {
    translationAllAgentModel = model;
    translationAllAgent = new Agent<FusionTranslationAllRunContext, typeof FusionAllLocalesOutputSchema>(
      {
        name: "Fusion locale adapter (all locales)",
        handoffDescription: "Adapts fusion quirks into pt-BR and es in one run.",
        instructions: buildTranslationAllInstructions,
        model,
        modelSettings: resolveFusionModelSettings("translation"),
        outputType: FusionAllLocalesOutputSchema,
      },
    );
  }
  return translationAllAgent;
}

export async function translateFusionWithAgent(
  source: ValidatedEnglishFusionPayload,
  locale: FusionTranslationLocale,
  trace?: FusionPipelineTraceContext,
): Promise<ValidatedLocaleFusionCopy> {
  const context: FusionTranslationRunContext = { locale, source };
  const userTurn = `${buildFusionTranslationDynamicSourceBlock(source)}

  ${STATIC_USER_TURN}`;

  const result = await run(getTranslationAgent(locale), userTurn, {
    context,
    maxTurns: 1,
    ...(trace ? buildTranslationFusionRunConfig(locale, trace) : {}),
  });

  const raw = result.finalOutput;
  if (!raw)
    throw new Error(`OpenAI agent (${locale}) retornou saída vazia.`);

  return validateLocaleFusionTranslation(raw, locale);
}

export async function translateFusionAllLocalesWithAgent(
  source: ValidatedEnglishFusionPayload,
  naming: FusionTranslationAllRunContext["naming"],
  trace?: FusionPipelineTraceContext,
): Promise<ValidatedLocaleFusionCopy[]> {
  const context: FusionTranslationAllRunContext = { source, naming };
  const userTurn = `${buildFusionTranslationDynamicPromptAllLocales(source, naming)}

${STATIC_USER_TURN}`;

  const result = await run(getTranslationAllAgent(), userTurn, {
    context,
    maxTurns: 1,
    ...(trace ? buildTranslationFusionRunConfig("all", trace) : {}),
  });

  const raw = result.finalOutput;
  if (!raw) throw new Error("OpenAI translation agent retornou saída vazia.");

  return validateAllLocalesFusionTranslation(raw);
}
