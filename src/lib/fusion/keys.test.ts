import { describe, expect, it } from 'vitest'
import { fusionCacheKey, fusionPairKey, sortedParentPair } from './keys'

describe('fusionKey', () => {
  it('ordena par de ids', () => {
    expect(sortedParentPair('z', 'a')).toEqual(['a', 'z'])
  })

  it('par canônico independe da ordem', () => {
    expect(fusionPairKey('explosion', 'acid')).toBe('acid+explosion')
    expect(fusionPairKey('acid', 'explosion')).toBe('acid+explosion')
  })

  it('inclui seed na chave de cache', () => {
    expect(fusionCacheKey('b', 'a', 'seed1')).toBe('a+b:seed1')
  })
})
