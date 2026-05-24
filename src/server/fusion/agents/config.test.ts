import { afterEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_FUSION_OPENAI_MODEL,
  DEFAULT_FUSION_TRANSLATION_OPENAI_MODEL,
  resolveFusionOpenAiModel,
  resolveFusionOpenAiModelForPurpose,
  resolveFusionTranslationOpenAiModel,
} from './config'

const envKeys = [
  'OPENAI_MODEL',
  'OPENAI_FUSION_MODEL',
  'OPENAI_TRANSLATION_MODEL',
] as const

function clearModelEnv(): void {
  for (const key of envKeys) {
    delete process.env[key]
  }
}

describe('fusion OpenAI model resolution', () => {
  afterEach(() => {
    clearModelEnv()
  })

  it('defaults English to gpt-4o-mini and translation to gpt-4.1-nano', () => {
    clearModelEnv()
    expect(resolveFusionOpenAiModel()).toBe(DEFAULT_FUSION_OPENAI_MODEL)
    expect(resolveFusionTranslationOpenAiModel()).toBe(
      DEFAULT_FUSION_TRANSLATION_OPENAI_MODEL,
    )
  })

  it('prefers OPENAI_FUSION_MODEL over OPENAI_MODEL for English', () => {
    process.env.OPENAI_MODEL = 'gpt-4.1-mini'
    process.env.OPENAI_FUSION_MODEL = 'gpt-4o'
    expect(resolveFusionOpenAiModel()).toBe('gpt-4o')
  })

  it('routes purpose to the correct resolver', () => {
    process.env.OPENAI_MODEL = 'gpt-4o-mini'
    process.env.OPENAI_TRANSLATION_MODEL = 'gpt-4.1-nano'
    expect(resolveFusionOpenAiModelForPurpose('fusion')).toBe('gpt-4o-mini')
    expect(resolveFusionOpenAiModelForPurpose('translation')).toBe('gpt-4.1-nano')
  })
})
