import { useMetaLabel } from '@/i18n/useMetaLabel'
import type { QuirkFacet } from '@/types/quirk'

interface FacetChipProps {
  facet: QuirkFacet
}

export function FacetChip({ facet }: FacetChipProps) {
  const meta = useMetaLabel()

  return (
    <span className="chip chip-muted chip-facet" data-tooltip={meta.facetTip(facet)}>
      {meta.facet(facet)}
    </span>
  )
}
