import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HybridRollResult } from '@/types/fusion'
import type { Quirk } from '@/types/quirk'
import {
  clearShareResultHandoff,
  consumeShareResultHandoff,
  saveShareResultHandoff,
} from './share-result-handoff'

const sessionStore = new Map<string, string>()

const quirk: Quirk = {
  id: 'explosion',
  name: 'Explosion',
  description: 'Boom',
  type: 'Emitter',
  tier: 'S',
  range: 'Long',
  origin: 'Original',
  facets: [],
}

const hybrid: HybridRollResult = {
  parents: [quirk, { ...quirk, id: 'acid', name: 'Acid' }],
  seed: 'seed1',
  fusionEntry: null,
}

describe('share-result-handoff', () => {
  beforeEach(() => {
    sessionStore.clear()
    const storage = {
      getItem: (key: string) => sessionStore.get(key) ?? null,
      setItem: (key: string, value: string) => {
        sessionStore.set(key, value)
      },
      removeItem: (key: string) => {
        sessionStore.delete(key)
      },
    }
    vi.stubGlobal('window', { sessionStorage: storage })
    vi.stubGlobal('sessionStorage', storage)
  })

  afterEach(() => {
    clearShareResultHandoff()
    vi.unstubAllGlobals()
  })

  it('consumes matching path once', () => {
    const path = '/r/quirk/explosion'
    saveShareResultHandoff(path, quirk)

    expect(consumeShareResultHandoff(path)).toEqual({
      result: quirk,
      animateEntrance: true,
    })
    expect(consumeShareResultHandoff(path)).toBeNull()
  })

  it('rejects mismatched path', () => {
    saveShareResultHandoff('/r/quirk/explosion', quirk)

    expect(consumeShareResultHandoff('/r/quirk/other')).toBeNull()
  })

  it('stores hybrid rolls', () => {
    const path = '/r/hybrid/explosion/acid/seed1'
    saveShareResultHandoff(path, hybrid)

    expect(consumeShareResultHandoff(path)).toEqual({
      result: hybrid,
      animateEntrance: true,
    })
  })

  it('can skip entrance animation', () => {
    const path = '/r/quirk/explosion'
    saveShareResultHandoff(path, quirk, { animateEntrance: false })

    expect(consumeShareResultHandoff(path)).toEqual({
      result: quirk,
      animateEntrance: false,
    })
  })
})
