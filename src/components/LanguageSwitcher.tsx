import { LANGUAGE_SWITCHER_OPTIONS } from '../i18n/localeMeta'
import { useI18n } from '../i18n/useI18n'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="lang-switcher" role="group" aria-label={t('nav.language')}>
      {LANGUAGE_SWITCHER_OPTIONS.map((option) => {
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
