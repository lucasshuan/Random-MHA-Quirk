import { describe, expect, it } from 'vitest'
import { QUIRK_IDS } from '../../data/quirk-ids'
import { quirksBase } from '../../data/quirks.base'
import { LOCALES } from '../types'
import { enQuirkCopy, getQuirks, ptBRQuirkCopy, quirkCopyByLocale } from './index'

describe('quirk translations', () => {
  it('keeps base catalog ids aligned with QUIRK_IDS', () => {
    expect(quirksBase.map((quirk) => quirk.id)).toEqual([...QUIRK_IDS])
  })

  it('provides copy for every quirk in every locale', () => {
    for (const locale of LOCALES) {
      const copy = quirkCopyByLocale[locale]
      expect(Object.keys(copy).sort()).toEqual([...QUIRK_IDS].sort())
    }
  })

  it('builds full quirks with localized copy', () => {
    const english = getQuirks('en')
    const portuguese = getQuirks('pt-BR')

    expect(english).toHaveLength(QUIRK_IDS.length)
    expect(portuguese).toHaveLength(QUIRK_IDS.length)
    expect(english[0].name).toBe(enQuirkCopy[english[0].id].name)
    expect(portuguese[0].name).toBe(ptBRQuirkCopy[portuguese[0].id].name)
  })
})
