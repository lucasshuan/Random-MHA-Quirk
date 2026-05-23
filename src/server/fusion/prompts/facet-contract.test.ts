import { describe, expect, it } from 'vitest'
import { formatFacetContractBlock } from './facet-contract'

describe('formatFacetContractBlock', () => {
  it('gives stockpile release and transfer models without naming parent quirks', () => {
    const block = formatFacetContractBlock(['Stockpile'], 'Emitter')

    expect(block).toContain('Each step stores kinetic force')
    expect(block).toContain('Through touch')
    expect(block).toContain('steals remaining lifespan')
    expect(block).toContain('later transfers it')
    expect(block).not.toContain('One For All')
    expect(block).not.toContain('Time Manipulation')
  })

  it('prints models for selected facets only and frames them as clarity guidance', () => {
    const block = formatFacetContractBlock(['Control'], 'Emitter')

    expect(block).toContain('controls nearby liquid water')
    expect(block).toContain('moves loose sand within sight')
    expect(block).not.toContain('stores kinetic force')
    expect(block).not.toContain('clap emits a burst')
    expect(block).toContain('illustrate sentence clarity only')
    expect(block).toContain('do not copy their effect unless supported')
  })

  it('keeps sensory models as complete sensing mechanisms without extra restrictions', () => {
    const block = formatFacetContractBlock(['Sensory'], 'Emitter')

    expect(block).toContain('feels floor vibrations through bare feet')
    expect(block).toContain('sees temperature differences')
    expect(block).not.toContain('moving objects')
    expect(block).toContain('do not append arbitrary targets')
  })
})
