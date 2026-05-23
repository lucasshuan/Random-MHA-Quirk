import { describe, expect, it } from 'vitest'
import { formatTypeDisciplineBlock } from './type-discipline'

describe('formatTypeDisciplineBlock', () => {
  it('prints only the discipline for the rolled type', () => {
    const block = formatTypeDisciplineBlock('Emitter')

    expect(block).toContain('Type discipline (Emitter only)')
    expect(block).toContain('sends an effect outward from the body')
    expect(block).not.toContain('temporarily changes the user')
    expect(block).not.toContain('stable unusual anatomy')
  })
})
