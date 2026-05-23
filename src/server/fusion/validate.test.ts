import { describe, expect, it } from 'vitest'
import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_DESCRIPTION_MIN_LENGTH,
} from './constants'
import { validateEnglishFusionPayload, validateLocaleFusionTranslation } from './validate'

const validDescription = 'A'.repeat(FUSION_DESCRIPTION_MIN_LENGTH)

describe('validateEnglishFusionPayload', () => {
  it('accepts descriptions within the fusion length bounds', () => {
    const result = validateEnglishFusionPayload({
      en: { name: 'Test Fusion', description: validDescription },
      type: 'Emitter',
      range: 'Short',
      facets: ['Emission'],
    })

    expect(result.en.description).toHaveLength(FUSION_DESCRIPTION_MIN_LENGTH)
  })

  it('rejects descriptions longer than the fusion max length', () => {
    expect(() =>
      validateEnglishFusionPayload({
        en: {
          name: 'Test Fusion',
          description: 'x'.repeat(FUSION_DESCRIPTION_MAX_LENGTH + 1),
        },
        type: 'Emitter',
        range: 'Short',
        facets: ['Emission'],
      }),
    ).toThrow('longo demais')
  })

  it('rejects descriptions shorter than the fusion min length', () => {
    expect(() =>
      validateEnglishFusionPayload({
        en: { name: 'Test Fusion', description: 'too short' },
        type: 'Emitter',
        range: 'Short',
        facets: ['Emission'],
      }),
    ).toThrow('curto demais')
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

  it('rejects overlong locale descriptions', () => {
    expect(() =>
      validateLocaleFusionTranslation(
        {
          'pt-BR': {
            name: 'Fusão',
            description: 'x'.repeat(FUSION_DESCRIPTION_MAX_LENGTH + 1),
          },
        },
        'pt-BR',
      ),
    ).toThrow('longo demais')
  })
})
