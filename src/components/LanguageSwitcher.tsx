import { useState } from 'react'
import { LANGUAGE_SWITCHER_OPTIONS } from '../i18n/localeMeta'
import type { Locale } from '../i18n/types'
import { useI18n } from '../i18n/useI18n'
import { ensureQuirksCatalog, hasQuirksCatalog } from '../hooks/useQuirksCatalog'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null)

  async function handleLocaleClick(nextLocale: Locale) {
    if (nextLocale === locale || pendingLocale) return

    if (hasQuirksCatalog(nextLocale)) {
      setLocale(nextLocale)
      return
    }

    setPendingLocale(nextLocale)
    try {
      await ensureQuirksCatalog(nextLocale)
      setLocale(nextLocale)
    } catch {
      // Keep current locale; user can retry
    } finally {
      setPendingLocale(null)
    }
  }

  return (
    <div className="lang-switcher" role="group" aria-label={t('nav.language')}>
      {LANGUAGE_SWITCHER_OPTIONS.map((option) => {
        const isActive = locale === option.locale
        const isPending = pendingLocale === option.locale
        const Flag = option.Flag

        return (
          <button
            key={option.locale}
            type="button"
            className={`lang-btn ${isActive ? 'lang-btn-active' : ''} ${isPending ? 'lang-btn-pending' : ''}`}
            onClick={() => void handleLocaleClick(option.locale)}
            disabled={Boolean(pendingLocale)}
            aria-pressed={isActive}
            aria-busy={isPending}
            aria-label={t(option.labelKey)}
            data-tooltip={t(option.labelKey)}
          >
            <Flag className="lang-flag" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
