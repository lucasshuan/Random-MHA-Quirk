export const LOCALES = ['en', 'pt-BR', 'es'] as const
export type Locale = (typeof LOCALES)[number]

export type Interpolation = Record<string, string | number>

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, values?: Interpolation) => string
}

export const LOCALE_STORAGE_KEY = 'random-mha-quirk-locale'

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale)
}

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return 'en'
  }

  const language = navigator.language.toLowerCase()
  if (language.startsWith('pt')) {
    return 'pt-BR'
  }
  if (language.startsWith('es')) {
    return 'es'
  }

  return 'en'
}
