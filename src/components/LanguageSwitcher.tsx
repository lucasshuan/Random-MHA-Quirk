import BR from 'country-flag-icons/react/3x2/BR'
import US from 'country-flag-icons/react/3x2/US'
import { useI18n } from '../i18n/useI18n'
import type { Locale } from '../i18n/types'

const OPTIONS = [
  { locale: 'en' as const, Flag: US, labelKey: 'nav.languageEn' },
  { locale: 'pt-BR' as const, Flag: BR, labelKey: 'nav.languagePt' },
] satisfies Array<{
  locale: Locale
  Flag: typeof US
  labelKey: string
}>

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="lang-switcher" role="group" aria-label={t('nav.language')}>
      {OPTIONS.map((option) => {
        const isActive = locale === option.locale
        const Flag = option.Flag

        return (
          <button
            key={option.locale}
            type="button"
            className={`lang-btn ${isActive ? 'lang-btn-active' : ''}`}
            onClick={() => setLocale(option.locale)}
            aria-pressed={isActive}
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
