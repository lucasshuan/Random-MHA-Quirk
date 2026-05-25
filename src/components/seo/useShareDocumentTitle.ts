'use client'

import { useEffect } from 'react'
import { fusionCopyForLocale, type HybridRollResult } from '@/types/fusion'
import type { Locale } from '@/i18n/types'
import {
  hybridShareTitle,
  quirkShareTitle,
} from '@/lib/seo/copy'
import { SITE_NAME } from '@/lib/seo/site'
import type { Quirk } from '@/types/quirk'

type ShareResult = Quirk | HybridRollResult | null

function isHybridRoll(result: ShareResult): result is HybridRollResult {
  return result !== null && 'parents' in result && 'seed' in result
}

export function useShareDocumentTitle(
  result: ShareResult,
  locale: Locale,
): void {
  useEffect(() => {
    if (!result) {
      return
    }

    if (isHybridRoll(result)) {
      const fusion = result.fusionEntry
        ? fusionCopyForLocale(result.fusionEntry, locale)
        : null
      const title = fusion
        ? `${hybridShareTitle(
            fusion.name,
            result.parents[0].name,
            result.parents[1].name,
            locale,
          )} · ${SITE_NAME}`
        : `${result.parents[0].name} + ${result.parents[1].name} · ${SITE_NAME}`
      document.title = title
      return
    }

    document.title = `${quirkShareTitle(result.name, locale)} · ${SITE_NAME}`
  }, [result, locale])
}
