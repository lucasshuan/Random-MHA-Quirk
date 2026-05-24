import { describe, expect, it } from 'vitest'
import {
  getCachedPaginatedPage,
  paginatedQuirkCacheKey,
  prefetchPaginatedQuirkPage,
} from '@/lib/quirks/paginated-cache'
import { DEFAULT_QUIRK_FILTERS } from '@/types/quirk'

describe('paginatedQuirkCacheKey', () => {
  it('keys by locale, filters, and page', () => {
    expect(paginatedQuirkCacheKey('en', DEFAULT_QUIRK_FILTERS, 2)).toBe(
      `en:${JSON.stringify(DEFAULT_QUIRK_FILTERS)}:2`,
    )
  })
})

describe('prefetchPaginatedQuirkPage', () => {
  it('ignores invalid pages', () => {
    expect(() => prefetchPaginatedQuirkPage('en', DEFAULT_QUIRK_FILTERS, 0, 3)).not.toThrow()
    expect(() => prefetchPaginatedQuirkPage('en', DEFAULT_QUIRK_FILTERS, 9, 3)).not.toThrow()
    expect(getCachedPaginatedPage('en', DEFAULT_QUIRK_FILTERS, 0)).toBeUndefined()
  })
})
