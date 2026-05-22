import { describe, expect, it } from 'vitest'
import { validateEnglishFusionPayload } from './validate'

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
})
