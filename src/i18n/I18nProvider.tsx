'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext, type I18nContextValue } from './useI18n'
import { translate } from './translate'
import {
  detectLocale,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
} from './types'

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && isLocale(stored)) {
      return stored
    }
  } catch {
    // ignore storage errors
  }

  return detectLocale()
}

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    setLocaleState(readStoredLocale())
  }, [])

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en'
    document.title =
      locale === 'pt-BR' ? 'Individualidade Aleatória MHA' : 'Random MHA Quirk'
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, values) => translate(locale, key, values),
    }),
    [locale, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
