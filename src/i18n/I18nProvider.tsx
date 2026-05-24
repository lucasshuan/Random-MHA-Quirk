'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext, type I18nContextValue } from './useI18n'
import { ensureQuirksCatalog } from '@/hooks/useQuirksCatalog'
import { runLocaleSwitchGuards } from '@/lib/i18n/localeSwitchGuards'
import { translate } from './translate'
import { LOCALE_DOCUMENT_TITLE, LOCALE_HTML_LANG } from './localeMeta'
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

  const prepareLocaleChange = useCallback(async (nextLocale: Locale) => {
    await ensureQuirksCatalog(nextLocale)
    await runLocaleSwitchGuards(nextLocale)
  }, [])

  useEffect(() => {
    document.documentElement.lang = LOCALE_HTML_LANG[locale]
    document.title = LOCALE_DOCUMENT_TITLE[locale]
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      prepareLocaleChange,
      t: (key, values) => translate(locale, key, values),
    }),
    [locale, prepareLocaleChange, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
