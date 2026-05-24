'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Locale } from '@/i18n/types'
import { fetchPaginatedQuirks } from '@/lib/quirks/api'
import { seedQuirkLocalesEntries } from '@/lib/quirks/catalog-client-cache'
import {
  mapQuirkLocalesEntries,
  type QuirkLocalesEntry,
} from '@/types/quirk-list'
import type { Quirk, QuirkFilters } from '@/types/quirk'

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException
    ? err.name === 'AbortError'
    : err instanceof Error && err.name === 'AbortError'
}

export interface UsePaginatedQuirkListResult {
  quirks: Quirk[]
  total: number
  page: number
  pageCount: number
  pageSize: number
  setPage: (page: number) => void
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
    setIsLoading(true)
    setError(null)

    void fetchPaginatedQuirks(locale, filters, page, { signal: controller.signal })
      .then((response) => {
        if (!active) return
        seedQuirkLocalesEntries(response.entries)
        setEntries(response.entries)
        setQuirks(mapQuirkLocalesEntries(response.entries, locale))
        setTotal(response.total)
        setPageCount(response.pageCount)
        setPageSize(response.pageSize)
        setPage(response.page)
        setIsLoading(false)
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

  return {
    quirks,
    total,
    page,
    pageCount,
    pageSize,
    setPage: setPageSafe,
    isLoading,
    error,
  }
}
