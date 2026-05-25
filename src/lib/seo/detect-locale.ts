import { isLocale, type Locale } from '@/i18n/types'

/** Server-side locale hint from Accept-Language (share/OG metadata). */
export function detectLocaleFromAcceptLanguage(
  header: string | null | undefined,
): Locale {
  if (!header?.trim()) {
    return 'en'
  }

  const tags = header
    .split(',')
    .map((part) => part.split(';')[0]?.trim().toLowerCase())
    .filter(Boolean)

  for (const tag of tags) {
    if (!tag) continue
    if (tag.startsWith('pt')) {
      return 'pt-BR'
    }
    if (tag.startsWith('es')) {
      return 'es'
    }
    if (tag.startsWith('en')) {
      return 'en'
    }
    if (isLocale(tag)) {
      return tag
    }
  }

  return 'en'
}
