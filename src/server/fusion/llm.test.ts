import { describe, expect, it } from 'vitest'
import {
  openAiSupportsCustomTemperature,
  openAiSupportsReasoningEffort,
  resolveOpenAiReasoningEffort,
} from './llm'

describe('openAiSupportsCustomTemperature', () => {
  it('allows temperature for gpt-4o family', () => {
    expect(openAiSupportsCustomTemperature('gpt-4o-mini')).toBe(true)
    expect(openAiSupportsCustomTemperature('gpt-4o')).toBe(true)
  })

  it('allows temperature for gpt-5-chat variants', () => {
    expect(openAiSupportsCustomTemperature('gpt-5-chat-latest')).toBe(true)
  })

  it('rejects temperature for gpt-5 reasoning models', () => {
    expect(openAiSupportsCustomTemperature('gpt-5')).toBe(false)
    expect(openAiSupportsCustomTemperature('gpt-5-mini')).toBe(false)
    expect(openAiSupportsCustomTemperature('gpt-5-nano')).toBe(false)
  })

  it('rejects temperature for o-series reasoning models', () => {
    expect(openAiSupportsCustomTemperature('o1-mini')).toBe(false)
    expect(openAiSupportsCustomTemperature('o3-mini')).toBe(false)
    expect(openAiSupportsCustomTemperature('o4-mini')).toBe(false)
  })
})

describe('openAiSupportsReasoningEffort', () => {
  it('enables reasoning_effort for gpt-5 and o-series', () => {
    expect(openAiSupportsReasoningEffort('gpt-5-mini')).toBe(true)
    expect(openAiSupportsReasoningEffort('o4-mini')).toBe(true)
  })

  it('disables reasoning_effort for chat and gpt-4o models', () => {
    expect(openAiSupportsReasoningEffort('gpt-5-chat-latest')).toBe(false)
    expect(openAiSupportsReasoningEffort('gpt-4o-mini')).toBe(false)
  })
})

describe('resolveOpenAiReasoningEffort', () => {
  it('defaults to low for fusion and minimal for translation', () => {
    expect(resolveOpenAiReasoningEffort('fusion')).toBe('low')
    expect(resolveOpenAiReasoningEffort('translation')).toBe('minimal')
  })
})
