import { describe, expect, it } from 'vitest'
import { validateEnglishFusionPayload, validateLocaleFusionTranslation } from './validate'

describe('validateEnglishFusionPayload', () => {
  it('accepts descriptions longer than the prompt soft cap', () => {
    const longDescription = 'x'.repeat(600)

    const result = validateEnglishFusionPayload({
      en: { name: 'Test Fusion', description: longDescription },
      type: 'Emitter',
      range: 'Short',
      facets: ['Emission'],
    })

    expect(result.en.description).toHaveLength(600)
  })

  it('rejects empty english copy fields', () => {
    expect(() =>
      validateEnglishFusionPayload({
        en: { name: '', description: '' },
        type: 'Emitter',
        range: 'Short',
        facets: ['Emission'],
      }),
    ).toThrow('en.name vazio')
  })
})

describe('validateLocaleFusionTranslation', () => {
  it('rejects missing locale block', () => {
    expect(() => validateLocaleFusionTranslation({}, 'pt-BR')).toThrow(
      'bloco pt-BR ausente',
    )
  })
})
