import { en, type Messages } from './messages/ui/en'
import { es } from './messages/ui/es'
import { ptBR } from './messages/ui/pt-BR'
import type { Interpolation, Locale } from './types'

const catalogs: Record<Locale, Messages> = {
  en,
  'pt-BR': ptBR,
  es,
}

export type { Interpolation } from './types'

function getNestedValue(source: Messages, path: string): string | undefined {
  const segments = path.split('.')
  let current: unknown = source

  for (const segment of segments) {
    if (current == null || typeof current !== 'object') {
      return undefined
    }

    current = (current as Record<string, unknown>)[segment]
  }

  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, values?: Interpolation): string {
  if (!values) {
    return template
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = values[key]
    return value == null ? '' : String(value)
  })
}

export function translate(
  locale: Locale,
  key: string,
  values?: Interpolation,
): string {
  const template = getNestedValue(catalogs[locale], key) ?? getNestedValue(catalogs.en, key)

  if (!template) {
    return key
  }

  return interpolate(template, values)
}

export function translateMatches(locale: Locale, count: number): string {
  const key = count === 1 ? 'advanced.matches_one' : 'advanced.matches_other'
  return translate(locale, key, { count })
}
