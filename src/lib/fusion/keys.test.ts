import { describe, expect, it, vi } from 'vitest'
import {
  fusionCacheKey,
  fusionPairKey,
  randomFusionSeed,
  sortedParentPair,
} from './keys'

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

  it('gera seed criptografica de 128 bits compativel com a rota', () => {
    const getRandomValues = vi
      .spyOn(globalThis.crypto, 'getRandomValues')
      .mockImplementationOnce((array) => {
        const bytes = array as Uint8Array
        for (let index = 0; index < bytes.length; index += 1) {
          bytes[index] = index
        }
        return array
      })

    expect(randomFusionSeed()).toBe('000102030405060708090a0b0c0d0e0f')
    expect(getRandomValues).toHaveBeenCalledOnce()
    getRandomValues.mockRestore()
  })
})
