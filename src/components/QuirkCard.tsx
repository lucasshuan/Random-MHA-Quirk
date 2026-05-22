import { useMemo, useState } from 'react'
import { resolveQuirk } from '../i18n/quirks'
import { useI18n } from '../i18n/useI18n'
import { useMetaLabel } from '../i18n/useMetaLabel'
import type { Quirk } from '../types/quirk'

interface QuirkCardProps {
  quirk: Quirk
  slotLabel?: 'A' | 'B'
}

export function QuirkCard({ quirk, slotLabel }: QuirkCardProps) {
  const { locale, t } = useI18n()
  const meta = useMetaLabel()
  const resolved = useMemo(() => resolveQuirk(quirk, locale), [quirk, locale])
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <article className={`quirk-card ${slotLabel ? `quirk-card-slot-${slotLabel.toLowerCase()}` : ''}`}>
      {slotLabel ? (
        <span className={`quirk-slot-badge quirk-slot-badge-${slotLabel.toLowerCase()}`}>
          {slotLabel}
        </span>
      ) : null}
      <p className="quirk-meta">
        {meta.type(quirk.type)} ·{' '}
        <span className="quirk-meta-range">
          <span className="quirk-meta-label">{t('advanced.range')}:</span>{' '}
          {meta.range(quirk.range)}
        </span>
      </p>
      <h3>{resolved.name}</h3>
      <p className="quirk-description">{resolved.description}</p>

      <button
        type="button"
        className={`quirk-details-trigger ${detailsOpen ? 'quirk-details-trigger-open' : ''}`}
        onClick={() => setDetailsOpen((open) => !open)}
        aria-expanded={detailsOpen}
      >
        <span>{detailsOpen ? t('result.hideDetails') : t('result.showDetails')}</span>
        <span className="quirk-details-chevron" aria-hidden="true" />
      </button>

      <div className={`quirk-details ${detailsOpen ? 'quirk-details-open' : ''}`}>
        <p className="quirk-detail-origin">
          <span className="quirk-detail-label">{t('advanced.origin')}</span>
          {meta.origin(quirk.origin)}
        </p>
        {quirk.facets.length > 0 ? (
          <div className="chip-row quirk-detail-facets">
            {quirk.facets.map((facet) => (
              <span key={facet} className="chip chip-muted">
                {meta.facet(facet)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
