/**
 * Debug fusion agent call (prints error, exits).
 * Usage: pnpm exec tsx scripts/fusion/debug-agent.ts
 */
import { loadEnv } from '@/server/env/load'
import { getQuirkById } from '@/server/fusion/catalog'
import { buildFusionAgentInput } from '@/server/fusion/agent-input'
import { generateEnglishFusionWithAgent } from '@/server/fusion/agents/english'
import { flushFusionTraces } from '@/server/fusion/agents/tracing'
import {
  resolveFusionOpenAiModel,
  resolveFusionTranslationOpenAiModel,
} from '@/server/fusion/agents/config'
import { resolveFusionProvider } from '@/server/fusion/llm'
import { getProjectRoot } from '../_shared/root'

loadEnv(getProjectRoot())

const provider = resolveFusionProvider()
console.log('provider:', provider.name)
console.log('fusion model:', resolveFusionOpenAiModel())
console.log('translation model:', resolveFusionTranslationOpenAiModel())

const quirkA = await getQuirkById('permeation')
const quirkB = await getQuirkById('hardening')
if (!quirkA || !quirkB) throw new Error('Missing catalog quirks')

const input = buildFusionAgentInput(quirkA, quirkB, 'debug-agent')
const timeout = setTimeout(() => {
  console.error('TIMEOUT after 90s')
  process.exit(1)
}, 90_000)

try {
  const out = await generateEnglishFusionWithAgent(input)
  clearTimeout(timeout)
  console.log('OK:', out.en.name)
} catch (err) {
  clearTimeout(timeout)
  console.error('FAILED:', err)
  process.exit(1)
} finally {
  await flushFusionTraces()
}
