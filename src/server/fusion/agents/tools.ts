import { webSearchTool } from '@openai/agents'
import { openAiSupportsWebSearchDomainFilters } from '../openai-model'
import { resolveFusionOpenAiModel } from './config'

/** Domains for parent quirk research and brief science lookups (no https prefix). */
export const FUSION_WEB_SEARCH_DEFAULT_DOMAINS = [
  'myheroacademia.fandom.com',
  'en.wikipedia.org',
] as const

export function resolveFusionWebSearchEnabled(): boolean {
  const raw = process.env.FUSION_AGENT_WEB_SEARCH?.trim().toLowerCase()
  if (raw === '0' || raw === 'false' || raw === 'off') return false
  return true
}

export function resolveFusionWebSearchDomains(): string[] {
  const custom = process.env.FUSION_AGENT_WEB_SEARCH_DOMAINS?.trim()
  if (!custom) return [...FUSION_WEB_SEARCH_DEFAULT_DOMAINS]

  const domains = custom
    .split(',')
    .map((entry) => entry.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''))
    .filter(Boolean)

  return domains.length > 0 ? domains : [...FUSION_WEB_SEARCH_DEFAULT_DOMAINS]
}

export function createFusionWebSearchTool() {
  const model = resolveFusionOpenAiModel()
  const options: { searchContextSize: 'low'; filters?: { allowedDomains: string[] } } =
    { searchContextSize: 'low' }

  if (openAiSupportsWebSearchDomainFilters(model)) {
    options.filters = { allowedDomains: resolveFusionWebSearchDomains() }
  }

  return webSearchTool(options)
}

/** Extra turns when web search may run before structured JSON output. */
export function resolveFusionAgentMaxTurns(): number {
  const explicit = Number(process.env.FUSION_AGENT_MAX_TURNS)
  if (Number.isFinite(explicit) && explicit > 0) return Math.floor(explicit)
  return resolveFusionWebSearchEnabled() ? 5 : 1
}
