'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildQuirkSearchText } from '@/i18n/quirkSearchText'
import { LOCALES, type Locale } from '@/i18n/types'
import { fetchQuirks } from '@/lib/quirks/api'
import { applyFilters } from '@/lib/quirks/engine'
import type { Quirk, QuirkFilters } from '@/types/quirk'

const catalogCache = new Map<Locale, Quirk[]>()
const inflight = new Map<Locale, Promise<Quirk[]>>()

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException
    ? err.name === 'AbortError'
    : err instanceof Error && err.name === 'AbortError'
}

/** True after any locale catalog has loaded (language switches stay in-app). */
export function isCatalogBootstrapped(): boolean {
  return catalogCache.size > 0
}

function prefetchOtherLocales(activeLocale: Locale): void {
  for (const locale of LOCALES) {
    if (locale === activeLocale) continue
    if (catalogCache.has(locale) || inflight.has(locale)) continue
    void loadCatalog(locale).catch(() => {})
  }
}

/** Re-apply localized copy when locale changes (catalog must be loaded). */
export function resolveQuirk(quirk: Quirk, locale: Locale): Quirk {
  const cached = catalogCache.get(locale)
  if (!cached) return quirk
  return cached.find((entry) => entry.id === quirk.id) ?? quirk
}

async function loadCatalog(locale: Locale): Promise<Quirk[]> {
  const cached = catalogCache.get(locale)
  if (cached) return cached

  const pending = inflight.get(locale)
  if (pending) return pending

  const promise = fetchQuirks(locale)
    .then((response) => {
      catalogCache.set(locale, response.quirks)
      inflight.delete(locale)
      prefetchOtherLocales(locale)
      return response.quirks
    })
    .catch((err) => {
      inflight.delete(locale)
      throw err
    })

  inflight.set(locale, promise)
  return promise
}

export interface UseQuirksCatalogResult {
  quirks: Quirk[]
  isLoading: boolean
  error: string | null
  reload: () => void
}

export function useQuirksCatalog(locale: Locale): UseQuirksCatalogResult {
  const [quirks, setQuirks] = useState<Quirk[]>(() => catalogCache.get(locale) ?? [])
  const [isLoading, setIsLoading] = useState(() => !catalogCache.has(locale))
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const localeRef = useRef(locale)

  const reload = useCallback(() => {
    catalogCache.delete(localeRef.current)
    inflight.delete(localeRef.current)
    setReloadToken((value) => value + 1)
  }, [])

  useEffect(() => {
    localeRef.current = locale
    const cached = catalogCache.get(locale)
    if (cached) {
      setQuirks(cached)
      setIsLoading(false)
      setError(null)
      return
    }

    let active = true
    setIsLoading(true)
    setError(null)

    void loadCatalog(locale)
      .then((next) => {
        if (!active) return
        setQuirks(next)
        setIsLoading(false)
      })
      .catch((err) => {
        if (!active || isAbortError(err)) return
        setError(err instanceof Error ? err.message : String(err))
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [locale, reloadToken])

  return { quirks, isLoading, error, reload }
}

export function useFilteredQuirks(
  catalog: Quirk[],
  locale: Locale,
  filters: QuirkFilters,
): Quirk[] {
  const searchableText = useCallback(
    (quirk: Quirk) => buildQuirkSearchText(quirk, locale),
    [locale],
  )

  return useMemo(
    () => applyFilters(catalog, filters, { searchableText }),
    [catalog, filters, searchableText],
  )
}

/** Debounced server-side filter fetch (for heavy search); falls back to client filter when idle. */
export function useRemoteFilteredQuirks(
  locale: Locale,
  filters: QuirkFilters,
  options?: { debounceMs?: number; enabled?: boolean },
): {
  quirks: Quirk[]
  isLoading: boolean
  error: string | null
} {
  const debounceMs = options?.debounceMs ?? 300
  const enabled = options?.enabled ?? true
  const { quirks: catalog, isLoading: catalogLoading } = useQuirksCatalog(locale)

  const clientFiltered = useFilteredQuirks(catalog, locale, filters)
  const [remoteQuirks, setRemoteQuirks] = useState<Quirk[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasQuery = filters.query.trim().length > 0

  useEffect(() => {
    if (!enabled || !hasQuery) {
      setRemoteQuirks(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let active = true
    setIsLoading(true)

    const timer = window.setTimeout(() => {
      void fetchQuirks(locale, filters)
        .then((response) => {
          if (!active) return
          setRemoteQuirks(response.quirks)
          setError(null)
          setIsLoading(false)
        })
        .catch((err) => {
          if (!active || isAbortError(err)) return
          setError(err instanceof Error ? err.message : String(err))
          setIsLoading(false)
        })
    }, debounceMs)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [locale, filters, debounceMs, enabled, hasQuery])

  if (!hasQuery) {
    return {
      quirks: clientFiltered,
      isLoading: catalogLoading,
      error: null,
    }
  }

  return {
    quirks: remoteQuirks ?? clientFiltered,
    isLoading: catalogLoading || isLoading,
    error,
  }
}
