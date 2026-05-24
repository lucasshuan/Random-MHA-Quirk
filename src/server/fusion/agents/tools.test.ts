import { describe, expect, it, vi } from 'vitest'
import {
  FUSION_WEB_SEARCH_DEFAULT_DOMAINS,
  resolveFusionAgentMaxTurns,
  resolveFusionWebSearchDomains,
  resolveFusionWebSearchEnabled,
} from './tools'

describe('fusion web search tools', () => {
  it('defaults to disabled', () => {
    expect(resolveFusionWebSearchEnabled()).toBe(false)
    expect(resolveFusionAgentMaxTurns()).toBe(1)
  })

  it('resolves default fandom + wikipedia domains', () => {
    expect(resolveFusionWebSearchDomains()).toEqual([
      ...FUSION_WEB_SEARCH_DEFAULT_DOMAINS,
    ])
  })

  it('enables web search when FUSION_AGENT_WEB_SEARCH=1', () => {
    vi.stubEnv('FUSION_AGENT_WEB_SEARCH', '1')
    expect(resolveFusionWebSearchEnabled()).toBe(true)
    expect(resolveFusionAgentMaxTurns()).toBe(5)
    vi.unstubAllEnvs()
  })
})
