import { describe, expect, it } from 'vitest'
import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_DESCRIPTION_MIN_LENGTH,
} from './constants'
import {
  clampFusionDescription,
  validateEnglishFusionPayload,
  validateLocaleFusionTranslation,
} from './validate'

const validDescription = 'A'.repeat(FUSION_DESCRIPTION_MIN_LENGTH)

describe('clampFusionDescription', () => {
  it('keeps copy within the max length at a sentence boundary', () => {
    const long =
      'The user folds their limbs inward until joints vanish inside the torso. ' +
      'Stored mass vents as a brief shockwave when they spring back out. ' +
      'x'.repeat(400)

    const clamped = clampFusionDescription(long)

    expect(clamped.length).toBeLessThanOrEqual(FUSION_DESCRIPTION_MAX_LENGTH)
    expect(clamped.length).toBeGreaterThanOrEqual(FUSION_DESCRIPTION_MIN_LENGTH)
    expect(clamped.endsWith('.')).toBe(true)
  })
})

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

  it('clamps descriptions longer than the fusion max length', () => {
    const result = validateEnglishFusionPayload({
      en: {
        name: 'Test Fusion',
        description:
          'First sentence keeps the core loop clear. ' +
          'Second sentence adds one limit. ' +
          'x'.repeat(400),
      },
      type: 'Emitter',
      range: 'Short',
      facets: ['Emission'],
    })

    expect(result.en.description.length).toBeLessThanOrEqual(
      FUSION_DESCRIPTION_MAX_LENGTH,
    )
    expect(result.en.description.length).toBeGreaterThanOrEqual(
      FUSION_DESCRIPTION_MIN_LENGTH,
    )
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

  it('clamps overlong locale descriptions', () => {
    const result = validateLocaleFusionTranslation(
      {
        'pt-BR': {
          name: 'Fusão',
          description:
            'Primeira frase descreve o efeito principal. ' +
            'Segunda frase fecha o limite. ' +
            'x'.repeat(400),
        },
      },
      'pt-BR',
    )

    expect(result['pt-BR'].description.length).toBeLessThanOrEqual(
      FUSION_DESCRIPTION_MAX_LENGTH,
    )
  })
})
