'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/i18n/useI18n'
import { getPageSeoCopy, type SeoPageKey } from '@/lib/seo/copy'
import { SITE_NAME } from '@/lib/seo/site'

function pageKeyFromPathname(pathname: string): SeoPageKey | null {
  if (pathname === '/') return 'home'
  if (pathname === '/start') return 'start'
  if (pathname === '/database') return 'database'
  if (pathname === '/history') return 'history'
  if (pathname.startsWith('/r/')) return null
  return null
}

/** Keeps document title in sync with locale on static routes (server metadata is English-first). */
export function SeoDocumentSync() {
  const pathname = usePathname()
  const { locale } = useI18n()

  useEffect(() => {
    const page = pageKeyFromPathname(pathname)
    if (!page) {
      return
    }

    const { title } = getPageSeoCopy(page, locale)
    document.title =
      page === 'home' ? `${SITE_NAME} — ${title}` : `${title} · ${SITE_NAME}`
  }, [pathname, locale])

  return null
}
