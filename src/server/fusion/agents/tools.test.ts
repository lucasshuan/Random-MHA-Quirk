import { describe, expect, it } from 'vitest'
import {
  FUSION_WEB_SEARCH_DEFAULT_DOMAINS,
  resolveFusionAgentMaxTurns,
  resolveFusionWebSearchDomains,
  resolveFusionWebSearchEnabled,
} from './tools'

describe('fusion web search tools', () => {
  it('defaults to enabled with fandom + wikipedia domains', () => {
    expect(resolveFusionWebSearchEnabled()).toBe(true)
    expect(resolveFusionWebSearchDomains()).toEqual([
      ...FUSION_WEB_SEARCH_DEFAULT_DOMAINS,
    ])
  })

  it('uses more max turns when web search is on', () => {
    expect(resolveFusionAgentMaxTurns()).toBeGreaterThan(1)
  })
})
