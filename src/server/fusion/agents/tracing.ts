import {
  getGlobalTraceProvider,
  setTracingExportApiKey,
  withTrace,
  type RunConfig,
} from '@openai/agents'
import type { FusionAgentInput } from '@/types/fusion-agent'
import type { FusionTranslationLocale } from '../constants'
import { resolveFusionWebSearchEnabled } from './tools'

export const FUSION_WORKFLOW_NAME = 'MHA Quirk Fusion'

/** Correlates English + locale agent runs for one generate request. */
export interface FusionPipelineTraceContext {
  pairKey: string
  seed: string
  parentA: string
  parentB: string
}

let tracingInitialized = false

function parseEnvBool(raw: string | undefined, defaultValue: boolean): boolean {
  if (raw === undefined || raw === '') return defaultValue
  const value = raw.trim().toLowerCase()
  if (value === '1' || value === 'true' || value === 'on' || value === 'yes') return true
  if (value === '0' || value === 'false' || value === 'off' || value === 'no') return false
  return defaultValue
}

export function resolveFusionTracingDisabled(): boolean {
  return (
    parseEnvBool(process.env.OPENAI_AGENTS_DISABLE_TRACING, false) ||
    parseEnvBool(process.env.FUSION_AGENT_TRACING_DISABLED, false)
  )
}

/** When false, spans are kept but LLM/tool inputs and outputs are redacted in the dashboard. */
export function resolveFusionTraceIncludeSensitiveData(): boolean {
  const explicit = process.env.FUSION_AGENT_TRACE_SENSITIVE_DATA?.trim()
  if (explicit !== undefined && explicit !== '') {
    return parseEnvBool(explicit, true)
  }
  return process.env.NODE_ENV !== 'production'
}

export function fusionTraceGroupId(pairKey: string, seed: string): string {
  return `fusion:${pairKey}:${seed}`
}

export function buildFusionTraceMetadata(
  fields: Record<string, string | number | boolean | undefined>,
): Record<string, string> {
  const metadata: Record<string, string> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue
    metadata[key] = String(value)
  }
  return metadata
}

export function ensureFusionAgentTracing(): void {
  if (tracingInitialized) return
  tracingInitialized = true

  const exportKey = process.env.FUSION_TRACE_EXPORT_API_KEY?.trim()
  if (exportKey) {
    setTracingExportApiKey(exportKey)
  }
}

export async function flushFusionTraces(): Promise<void> {
  if (resolveFusionTracingDisabled()) return
  ensureFusionAgentTracing()
  await getGlobalTraceProvider().forceFlush()
}

function baseRunConfig(
  workflowName: string,
  ctx: FusionPipelineTraceContext,
  extraMetadata?: Record<string, string | number | boolean | undefined>,
): RunConfig {
  return {
    workflowName,
    groupId: fusionTraceGroupId(ctx.pairKey, ctx.seed),
    traceMetadata: buildFusionTraceMetadata({
      pairKey: ctx.pairKey,
      seed: ctx.seed,
      parentA: ctx.parentA,
      parentB: ctx.parentB,
      ...extraMetadata,
    }),
    tracingDisabled: resolveFusionTracingDisabled(),
    traceIncludeSensitiveData: resolveFusionTraceIncludeSensitiveData(),
  }
}

export function buildEnglishFusionRunConfig(fusion: FusionAgentInput): RunConfig {
  return baseRunConfig(
    'Fusion English generation',
    {
      pairKey: fusion.meta.pairKey,
      seed: fusion.meta.seed,
      parentA: fusion.parents[0].id,
      parentB: fusion.parents[1].id,
    },
    {
      nameAttempt: fusion.meta.attempt,
      strategyKey: fusion.roll.strategyKey,
      nameRegister: fusion.roll.nameRegister,
      type: fusion.mechanics.type,
      range: fusion.mechanics.range,
      facets: fusion.mechanics.facets.join(','),
      tier: fusion.mechanics.tier,
      priorVariantCount: fusion.priorVariants.length,
      webSearch: resolveFusionWebSearchEnabled(),
    },
  )
}

export function buildTranslationFusionRunConfig(
  locale: FusionTranslationLocale,
  ctx: FusionPipelineTraceContext,
): RunConfig {
  return baseRunConfig(`Fusion locale adaptation (${locale})`, ctx, { locale })
}

/** One end-to-end trace for English generation + locale adaptations. */
export async function runWithFusionTrace<T>(
  ctx: FusionPipelineTraceContext,
  fn: () => Promise<T>,
): Promise<T> {
  ensureFusionAgentTracing()
  if (resolveFusionTracingDisabled()) {
    return fn()
  }

  try {
    return await withTrace(FUSION_WORKFLOW_NAME, fn, {
      groupId: fusionTraceGroupId(ctx.pairKey, ctx.seed),
      metadata: buildFusionTraceMetadata({
        pairKey: ctx.pairKey,
        seed: ctx.seed,
        parentA: ctx.parentA,
        parentB: ctx.parentB,
      }),
    })
  } finally {
    await flushFusionTraces()
  }
}
