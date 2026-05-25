import BR from 'country-flag-icons/react/3x2/BR'
import ES from 'country-flag-icons/react/3x2/ES'
import US from 'country-flag-icons/react/3x2/US'
import type { Locale } from './types'

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: 'en',
  'pt-BR': 'pt-BR',
  es: 'es',
}

export const LANGUAGE_SWITCHER_OPTIONS = [
  { locale: 'en' as const, Flag: US, labelKey: 'nav.languageEn' },
  { locale: 'pt-BR' as const, Flag: BR, labelKey: 'nav.languagePt' },
  { locale: 'es' as const, Flag: ES, labelKey: 'nav.languageEs' },
] as const
