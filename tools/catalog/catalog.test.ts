import { describe, expect, it } from 'vitest'
import { QUIRK_IDS } from './output/quirk-ids'
import { quirksBase } from './output/quirks.base'
import { enQuirkCopy } from './output/copy/en'
import { esQuirkCopy } from './output/copy/es.locale'
import { ptBRQuirkCopy } from './output/copy/pt-BR'

const COPY_MAPS = {
  en: enQuirkCopy,
  'pt-BR': ptBRQuirkCopy,
  es: esQuirkCopy,
} as const

describe('catalog authoring output', () => {
  it('keeps base catalog ids aligned with QUIRK_IDS', () => {
    expect(quirksBase.map((quirk) => quirk.id)).toEqual([...QUIRK_IDS])
  })

  it('provides copy for every quirk in every locale file', () => {
    for (const copy of Object.values(COPY_MAPS)) {
      expect(Object.keys(copy).sort()).toEqual([...QUIRK_IDS].sort())
    }
  })
})
