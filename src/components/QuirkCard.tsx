import type { Quirk } from '../types/quirk'

interface QuirkCardProps {
  quirk: Quirk
  titlePrefix?: string
}

export function QuirkCard({ quirk, titlePrefix }: QuirkCardProps) {
  return (
    <article className="quirk-card">
      <p className="quirk-meta">
        {quirk.origin} · {quirk.type} · {quirk.range}
      </p>
      <h3>
        {titlePrefix ? `${titlePrefix}: ` : ''}
        {quirk.name}
      </h3>
      <p>{quirk.description}</p>
      <div className="chip-row">
        {quirk.facets.map((facet) => (
          <span key={facet} className="chip">
            {facet}
          </span>
        ))}
      </div>
    </article>
  )
}

