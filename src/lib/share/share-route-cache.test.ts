import { describe, expect, it } from 'vitest'
import type { Quirk } from '@/types/quirk'
import {
  getShareRouteCachedResult,
  isShareRouteResult,
  setShareRouteCachedResult,
  trySyncResolveShareRoute,
} from './share-route-cache'

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

describe('share-route-cache', () => {
  it('matches cached route results', () => {
    setShareRouteCachedResult('solo:explosion', 'en', quirk)

    expect(getShareRouteCachedResult('solo:explosion', 'en')).toEqual(quirk)
    expect(
      isShareRouteResult(quirk, { mode: 'single', quirkId: 'explosion' }),
    ).toBe(true)
    expect(
      isShareRouteResult(quirk, { mode: 'single', quirkId: 'other' }),
    ).toBe(false)
  })

  it('returns null when quirk is not in catalog caches', () => {
    expect(
      trySyncResolveShareRoute({
        mode: 'single',
        locale: 'en',
        quirkId: 'missing-quirk',
      }),
    ).toBeNull()
  })
})
