import { describe, expect, it } from 'vitest'
import {
  formatQuirkTypeReferenceBlock,
  formatTypeDisciplineBlock,
} from './type-discipline'

describe('formatQuirkTypeReferenceBlock', () => {
  it('explains all output classifications in the fixed reference', () => {
    const block = formatQuirkTypeReferenceBlock()

    expect(block).toContain('Emitter:')
    expect(block).toContain('projected, transmitted, generated, or controlled')
    expect(block).toContain('Transformation:')
    expect(block).toContain('temporary active change')
    expect(block).toContain('Mutant:')
    expect(block).toContain('stable unusual anatomy')
  })
})

describe('formatTypeDisciplineBlock', () => {
  it('prints only the discipline for the rolled type', () => {
    const block = formatTypeDisciplineBlock('Emitter')

    expect(block).toContain('Type discipline (Emitter only)')
    expect(block).toContain('sends an effect outward from the body')
    expect(block).toContain('passive or reactive')
    expect(block).toContain('Any lie the user hears appears as colored smoke.')
    expect(block).toContain('releases heat from their palms')
    expect(block).not.toContain('temporarily changes the user')
    expect(block).not.toContain('stable unusual anatomy')
  })

  it('uses concrete clarity models for body-based types', () => {
    expect(formatTypeDisciplineBlock('Transformation')).toContain(
      'converts their skin into adhesive mud',
    )
    expect(formatTypeDisciplineBlock('Transformation')).toContain(
      'turns their arms into flexible rubber',
    )
    expect(formatTypeDisciplineBlock('Mutant')).toContain(
      'born with glass wings that reflect light-based attacks',
    )
    expect(formatTypeDisciplineBlock('Mutant')).toContain(
      'born with antennae that detect nearby vibrations',
    )
  })
})
