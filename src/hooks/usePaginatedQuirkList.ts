'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Locale } from '@/i18n/types'
import {
  getCachedPaginatedPage,
  loadPaginatedQuirkPage,
  prefetchPaginatedQuirkNeighbors,
  prefetchPaginatedQuirkPage,
} from '@/lib/quirks/paginated-cache'
import {
  mapQuirkLocalesEntries,
  type QuirkLocalesEntry,
} from '@/types/quirk-list'
import type { Quirk, QuirkFilters } from '@/types/quirk'
import type { PaginatedQuirksListResponse } from '@/lib/quirks/api'

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException
    ? err.name === 'AbortError'
    : err instanceof Error && err.name === 'AbortError'
}

function applyPaginatedResponse(
  response: PaginatedQuirksListResponse,
  locale: Locale,
  setters: {
    setEntries: (entries: QuirkLocalesEntry[]) => void
    setQuirks: (quirks: Quirk[]) => void
    setTotal: (total: number) => void
    setPageCount: (pageCount: number) => void
    setPageSize: (pageSize: number) => void
    setPage: (page: number) => void
  },
): void {
  setters.setEntries(response.entries)
  setters.setQuirks(mapQuirkLocalesEntries(response.entries, locale))
  setters.setTotal(response.total)
  setters.setPageCount(response.pageCount)
  setters.setPageSize(response.pageSize)
  setters.setPage(response.page)
}

export interface UsePaginatedQuirkListResult {
  quirks: Quirk[]
  total: number
  page: number
  pageCount: number
  pageSize: number
  setPage: (page: number) => void
  prefetchPage: (page: number) => void
  isLoading: boolean
  error: string | null
}

export function usePaginatedQuirkList(
  locale: Locale,
  filters: QuirkFilters,
  options?: { enabled?: boolean },
): UsePaginatedQuirkListResult {
  const enabled = options?.enabled ?? true
  const [page, setPage] = useState(1)
  const [entries, setEntries] = useState<QuirkLocalesEntry[]>([])
  const [quirks, setQuirks] = useState<Quirk[]>([])
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
    if (entries.length === 0) return
    setQuirks(mapQuirkLocalesEntries(entries, locale))
  }, [entries, locale])

  useEffect(() => {
    if (!enabled) {
      return
    }

    let active = true
    const controller = new AbortController()
    const setters = {
      setEntries,
      setQuirks,
      setTotal,
      setPageCount,
      setPageSize,
      setPage,
    }

    const cached = getCachedPaginatedPage(locale, filters, page)
    if (cached) {
      applyPaginatedResponse(cached, locale, setters)
      setIsLoading(false)
      setError(null)
      prefetchPaginatedQuirkNeighbors(locale, filters, cached.page, cached.pageCount)
      return () => {
        active = false
      }
    }

    setIsLoading(true)
    setError(null)

    void loadPaginatedQuirkPage(locale, filters, page, { signal: controller.signal })
      .then((response) => {
        if (!active) return
        applyPaginatedResponse(response, locale, setters)
        setIsLoading(false)
        prefetchPaginatedQuirkNeighbors(locale, filters, response.page, response.pageCount)
      })
      .catch((err) => {
        if (!active || isAbortError(err)) return
        setError(err instanceof Error ? err.message : String(err))
        setQuirks([])
        setIsLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [enabled, filters, filtersKey, locale, page])

  const setPageSafe = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage))
  }, [])

  const prefetchPage = useCallback(
    (targetPage: number) => {
      prefetchPaginatedQuirkPage(locale, filters, targetPage, pageCount)
    },
    [filters, locale, pageCount],
  )

  return {
    quirks,
    total,
    page,
    pageCount,
    pageSize,
    setPage: setPageSafe,
    prefetchPage,
    isLoading,
    error,
  }
}
