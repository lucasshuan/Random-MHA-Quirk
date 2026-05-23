import { useCallback } from 'react'
import type {
  QuirkFacet,
  QuirkOrigin,
  QuirkRange,
  QuirkTier,
  QuirkType,
} from '../types/quirk'
import { useI18n } from './useI18n'

export function useMetaLabel() {
  const { t } = useI18n()

  const origin = useCallback(
    (value: QuirkOrigin) => t(`meta.origin.${value}`),
    [t],
  )

  const tier = useCallback((value: QuirkTier) => t(`meta.tier.${value}`), [t])

  const type = useCallback((value: QuirkType) => t(`meta.type.${value}`), [t])

  const range = useCallback((value: QuirkRange) => t(`meta.range.${value}`), [t])

  const facet = useCallback((value: QuirkFacet) => t(`meta.facet.${value}`), [t])

  const facetTip = useCallback(
    (value: QuirkFacet) => t(`meta.facetTip.${value}`),
    [t],
  )

  return { origin, tier, type, range, facet, facetTip }
}
