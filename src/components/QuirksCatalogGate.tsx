'use client'

import type { ReactNode } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useI18n } from '@/i18n/useI18n'
import { isCatalogBootstrapped, useQuirksCatalog } from '@/hooks/useQuirksCatalog'

interface QuirksCatalogGateProps {
  children: ReactNode
}

export function QuirksCatalogGate({ children }: QuirksCatalogGateProps) {
  const { locale, t } = useI18n()
  const { isLoading, error, reload } = useQuirksCatalog(locale)
  const bootstrapped = isCatalogBootstrapped()
  const blockApp = !bootstrapped && isLoading
  const blockError = !bootstrapped && error

  if (blockApp) {
    return <LoadingScreen label={t('quirks.loading')} />
  }

  if (blockError) {
    return (
      <div
        className="catalog-loading-screen catalog-loading-screen-error quirks-catalog-error"
        role="alert"
      >
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
