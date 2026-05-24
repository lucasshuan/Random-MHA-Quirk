import type { Locale } from '@/i18n/types'
import { ensureQuirksCatalog } from '@/hooks/useQuirksCatalog'
import { prefetchPaginatedQuirkPage } from '@/lib/quirks/paginated-cache'
import { DEFAULT_QUIRK_FILTERS } from '@/types/quirk'

export function preloadQuirksForWizard(locale: Locale): void {
  void ensureQuirksCatalog(locale).catch(() => {})
}

export function preloadQuirksForDatabase(locale: Locale): void {
  void ensureQuirksCatalog(locale).catch(() => {})
  prefetchPaginatedQuirkPage(locale, DEFAULT_QUIRK_FILTERS, 1)
}
