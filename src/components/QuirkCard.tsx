import { useMemo } from 'react'
import { resolveQuirk } from '../i18n/quirks'
import { useI18n } from '../i18n/useI18n'
import { useMetaLabel } from '../i18n/useMetaLabel'
import type { Quirk } from '../types/quirk'

interface QuirkCardProps {
  quirk: Quirk
  titlePrefix?: string
}

export function QuirkCard({ quirk, titlePrefix }: QuirkCardProps) {
  const { locale } = useI18n()
  const meta = useMetaLabel()
  const resolved = useMemo(() => resolveQuirk(quirk, locale), [quirk, locale])

  return (
    <article className="quirk-card">
      <p className="quirk-meta">
        {meta.origin(quirk.origin)} · {meta.type(quirk.type)} · {meta.range(quirk.range)}
      </p>
      <h3>
        {titlePrefix ? `${titlePrefix}: ` : ''}
        {resolved.name}
      </h3>
      <p>{resolved.description}</p>
      <div className="chip-row">
        {quirk.facets.map((facet) => (
          <span key={facet} className="chip">
            {meta.facet(facet)}
          </span>
        ))}
      </div>
    </article>
  )
}
