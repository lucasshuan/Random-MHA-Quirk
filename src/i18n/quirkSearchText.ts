import type { Quirk } from '../types/quirk'
import { translate } from './translate'
import type { Locale } from './types'

export function buildQuirkSearchText(quirk: Quirk, locale: Locale): string {
  const facets = quirk.facets.map((facet) => translate(locale, `meta.facet.${facet}`)).join(' ')
  const type = translate(locale, `meta.type.${quirk.type}`)
  const range = translate(locale, `meta.range.${quirk.range}`)
  const origin = translate(locale, `meta.origin.${quirk.origin}`)

  return `${quirk.name} ${quirk.description} ${facets} ${type} ${range} ${origin}`
}
