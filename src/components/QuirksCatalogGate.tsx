'use client'

import type { ReactNode } from 'react'
import { useI18n } from '@/i18n/useI18n'
import { useQuirksCatalog } from '@/hooks/useQuirksCatalog'

interface QuirksCatalogGateProps {
  children: ReactNode
}

export function QuirksCatalogGate({ children }: QuirksCatalogGateProps) {
  const { locale, t } = useI18n()
  const { isLoading, error, reload } = useQuirksCatalog(locale)

  if (isLoading) {
    return (
      <div className="fusion-pending quirks-catalog-state" role="status" aria-live="polite">
        <p className="mini-copy">{t('quirks.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fusion-pending quirks-catalog-state quirks-catalog-error" role="alert">
        <p className="mini-copy">{t('quirks.loadError')}</p>
        <p className="fusion-error-detail">{error}</p>
        <button type="button" className="big-action" onClick={reload}>
          {t('quirks.retry')}
        </button>
      </div>
    )
  }

  return children
}
