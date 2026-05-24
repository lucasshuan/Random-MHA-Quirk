'use client'

import { useEffect } from 'react'
import { ensureQuirksCatalog } from '@/hooks/useQuirksCatalog'
import { useI18n } from '@/i18n/useI18n'
import { prefetchPaginatedQuirkPage } from '@/lib/quirks/paginated-cache'
import { DEFAULT_QUIRK_FILTERS } from '@/types/quirk'

/** Warm catalog + first database page in the background for route changes. */
export function QuirksRoutePreloader() {
  const { locale } = useI18n()

  useEffect(() => {
    void ensureQuirksCatalog(locale).catch(() => {})
    prefetchPaginatedQuirkPage(locale, DEFAULT_QUIRK_FILTERS, 1)
  }, [locale])

  return null
}
