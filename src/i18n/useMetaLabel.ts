import { useCallback } from 'react'
import type {
  QuirkFacet,
  QuirkOrigin,
  QuirkRange,
  QuirkType,
} from '../types/quirk'
import { useI18n } from './useI18n'

export function useMetaLabel() {
  const { t } = useI18n()

  const origin = useCallback(
    (value: QuirkOrigin) => t(`meta.origin.${value}`),
    [t],
  )

  const type = useCallback((value: QuirkType) => t(`meta.type.${value}`), [t])

  const range = useCallback((value: QuirkRange) => t(`meta.range.${value}`), [t])

  const facet = useCallback((value: QuirkFacet) => t(`meta.facet.${value}`), [t])

  return { origin, type, range, facet }
}
