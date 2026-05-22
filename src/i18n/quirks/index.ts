import { quirksBase } from '../../data/quirks.base'
import type { Quirk, QuirkCopy } from '../../types/quirk'
import type { QuirkId } from '../../data/quirk-ids'
import type { Locale } from '../types'
import { enQuirkCopy } from './en'
import { ptBRQuirkCopy } from './pt-BR'

const quirkCopyByLocale: Record<Locale, Record<QuirkId, QuirkCopy>> = {
  en: enQuirkCopy,
  'pt-BR': ptBRQuirkCopy,
}

export function getQuirks(locale: Locale): Quirk[] {
  const copy = quirkCopyByLocale[locale]

  return quirksBase.map((base) => ({
    ...base,
    ...copy[base.id],
  }))
}

export function resolveQuirk(quirk: Quirk, locale: Locale): Quirk {
  return {
    ...quirk,
    ...quirkCopyByLocale[locale][quirk.id],
  }
}

export { enQuirkCopy, ptBRQuirkCopy, quirkCopyByLocale }
