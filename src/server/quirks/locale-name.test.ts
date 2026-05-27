import { describe, expect, it } from 'vitest'
import { buildQuirkLocaleAdaptationDynamicNamingBlock } from '@/server/quirks/locale-adaptation'
import { formatLocaleNameRegisterBlock } from '@/server/quirks/locale-name'

describe('formatLocaleNameRegisterBlock', () => {
  it('includes shared keep-english rule and Drift angle for blunt register', () => {
    const block = formatLocaleNameRegisterBlock('blunt', ['pt-BR', 'es'])

    expect(block).toContain('keeping the English title is acceptable')
    expect(block).toContain('Drift → Deriva')
    expect(block).toContain('not Nuvem/Nube')
  })

  it('allows colloquial rules for meme-adjacent register', () => {
    const block = formatLocaleNameRegisterBlock('meme-adjacent', ['pt-BR'])

    expect(block).toContain('termos chulos')
    expect(block).toContain('Pop Off')
  })

  it('returns empty string for unknown register', () => {
    expect(formatLocaleNameRegisterBlock('unknown', ['pt-BR'])).toBe('')
  })
})

describe('buildQuirkLocaleAdaptationDynamicNamingBlock', () => {
  it('uses locale-name rules and examples only (no REGISTER_DEFS from naming.ts)', () => {
    const block = buildQuirkLocaleAdaptationDynamicNamingBlock(
      { nameRegister: 'blunt' },
      ['pt-BR', 'es'],
    )

    expect(block).toContain('Name register: blunt')
    expect(block).toContain('Localized title adaptation')
    expect(block).toContain('Drift → Deriva')
    expect(block).not.toContain('Instruction:')
    expect(block).not.toContain('English generation examples')
  })
})
