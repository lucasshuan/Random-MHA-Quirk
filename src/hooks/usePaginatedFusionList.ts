'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Locale } from '@/i18n/types'
import { fetchPaginatedFusionCatalog } from '@/lib/fusion/api'
import {
  findFusionParentName,
  seedFusionParentLabels,
} from '@/lib/quirks/catalog-client-cache'
import type { FusionCacheEntry } from '@/types/fusion'
import type { QuirkFilters } from '@/types/quirk'

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException
    ? err.name === 'AbortError'
    : err instanceof Error && err.name === 'AbortError'
}

export interface UsePaginatedFusionListResult {
  entries: FusionCacheEntry[]
  parentName: (id: FusionCacheEntry['parents'][number]) => string | undefined
  total: number
  page: number
  pageCount: number
  pageSize: number
  setPage: (page: number) => void
  isLoading: boolean
  error: string | null
}

export function usePaginatedFusionList(
  locale: Locale,
  filters: QuirkFilters,
  options?: { enabled?: boolean },
): UsePaginatedFusionListResult {
  const enabled = options?.enabled ?? true
  const [page, setPage] = useState(1)
  const [entries, setEntries] = useState<FusionCacheEntry[]>([])
  const [total, setTotal] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [pageSize, setPageSize] = useState(30)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])
  useEffect(() => {
    setPage(1)
  }, [filtersKey, enabled])

  useEffect(() => {
    if (!enabled) {
      return
    }

    let active = true
    const controller = new AbortController()
    setIsLoading(true)
    setError(null)

    void fetchPaginatedFusionCatalog(locale, filters, page)
      .then((response) => {
        if (!active) return
        seedFusionParentLabels(locale, response.parentLabels)
        setEntries(response.entries)
        setTotal(response.total)
        setPageCount(response.pageCount)
        setPageSize(response.pageSize)
        setPage(response.page)
        setIsLoading(false)
      })
      .catch((err) => {
        if (!active || isAbortError(err)) return
        setError(err instanceof Error ? err.message : String(err))
        setEntries([])
        setIsLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [enabled, filters, filtersKey, locale, page])

  const parentName = useCallback(
    (id: FusionCacheEntry['parents'][number]) => findFusionParentName(locale, id),
    [locale],
  )

  const setPageSafe = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage))
  }, [])

  return {
    entries,
    parentName,
    total,
    page,
    pageCount,
    pageSize,
    setPage: setPageSafe,
    isLoading,
    error,
  }
}
