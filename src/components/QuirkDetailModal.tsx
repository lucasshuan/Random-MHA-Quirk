'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { FacetChip } from './FacetChip'
import type { QuirkCardModel } from '@/types/quirk-card'
import { findQuirkInCatalog } from '@/lib/quirks/catalog-client-cache'
import { quirkTypeThemeClass } from '@/lib/quirks/type-theme'
import { resolveQuirk } from '@/hooks/useQuirksCatalog'
import { useI18n } from '@/i18n/useI18n'
import { useMetaLabel } from '@/i18n/useMetaLabel'
import type { FusionQuirk } from '@/types/fusion'
import { TierBadge, TierScale } from './TierScale'
import type { Quirk } from '@/types/quirk'

function isFusionQuirk(quirk: QuirkCardModel): quirk is FusionQuirk {
  return 'roll' in quirk
}

interface HybridParentsSectionProps {
  fusion: FusionQuirk
  onParentOpen: (parent: Quirk) => void
}

function HybridParentsSection({ fusion, onParentOpen }: HybridParentsSectionProps) {
  const { locale, t } = useI18n()
  const meta = useMetaLabel()

  const parentA = findQuirkInCatalog(locale, fusion.parents[0])
  const parentB = findQuirkInCatalog(locale, fusion.parents[1])
  const parentAName = parentA?.name ?? fusion.parents[0]
  const parentBName = parentB?.name ?? fusion.parents[1]

  return (
    <div className="quirk-pick-hybrid-parents-wrap">
      <p className="quirk-pick-hybrid-parents-label">{t('database.hybridParents')}</p>
      <div className="quirk-pick-hybrid-parents" role="group" aria-label={t('database.hybridParents')}>
        {parentA ? (
          <button
            type="button"
            className={`quirk-pick-hybrid-parent-card ${quirkTypeThemeClass(parentA.type)}`}
            onClick={(event) => {
              event.stopPropagation()
              onParentOpen(parentA)
            }}
            aria-label={`${parentAName} — ${t('result.showDetails')}`}
          >
            <span className="quirk-pick-hybrid-parent-head">
              <TierBadge
                tier={parentA.tier}
                className="manual-quirk-tier-badge quirk-pick-hybrid-parent-tier"
              />
              <strong className="quirk-pick-hybrid-parent-name">{parentAName}</strong>
              <span className="quirk-pick-hybrid-parent-dot" aria-hidden="true" />
              <span className="quirk-pick-hybrid-parent-type">{meta.type(parentA.type)}</span>
            </span>
            <span className="quirk-pick-hybrid-parent-description">{parentA.description}</span>
          </button>
        ) : (
          <span className="quirk-pick-hybrid-parent-card quirk-pick-hybrid-parent-card-static">
            <span className="quirk-pick-hybrid-parent-name">{parentAName}</span>
          </span>
        )}
        <span className="quirk-pick-hybrid-parent-sep" aria-hidden="true">
          +
        </span>
        {parentB ? (
          <button
            type="button"
            className={`quirk-pick-hybrid-parent-card ${quirkTypeThemeClass(parentB.type)}`}
            onClick={(event) => {
              event.stopPropagation()
              onParentOpen(parentB)
            }}
            aria-label={`${parentBName} — ${t('result.showDetails')}`}
          >
            <span className="quirk-pick-hybrid-parent-head">
              <TierBadge
                tier={parentB.tier}
                className="manual-quirk-tier-badge quirk-pick-hybrid-parent-tier"
              />
              <strong className="quirk-pick-hybrid-parent-name">{parentBName}</strong>
              <span className="quirk-pick-hybrid-parent-dot" aria-hidden="true" />
              <span className="quirk-pick-hybrid-parent-type">{meta.type(parentB.type)}</span>
            </span>
            <span className="quirk-pick-hybrid-parent-description">{parentB.description}</span>
          </button>
        ) : (
          <span className="quirk-pick-hybrid-parent-card quirk-pick-hybrid-parent-card-static">
            <span className="quirk-pick-hybrid-parent-name">{parentBName}</span>
          </span>
        )}
      </div>
    </div>
  )
}

export interface QuirkDetailModalProps {
  quirk: QuirkCardModel
  onClose: () => void
  stackLevel?: number
  actions?: ReactNode
}

export function QuirkDetailModal({
  quirk,
  onClose,
  stackLevel = 0,
  actions,
}: QuirkDetailModalProps) {
  const { locale, t } = useI18n()
  const meta = useMetaLabel()
  const [nestedParent, setNestedParent] = useState<Quirk | null>(null)

  const resolved = useMemo(
    () => (isFusionQuirk(quirk) ? quirk : resolveQuirk(quirk, locale)),
    [quirk, locale],
  )

  const themeClass = quirkTypeThemeClass(quirk.type)
  const fusion = isFusionQuirk(quirk)
  const backdropZIndex = 70 + stackLevel * 10

  return (
    <>
      <div
        className={`quirk-pick-modal-backdrop${stackLevel > 0 ? ' quirk-pick-modal-backdrop-stacked' : ''}`}
        style={{ zIndex: backdropZIndex }}
        onClick={onClose}
      >
        <div
          className={`quirk-pick-modal ${themeClass}`}
          role="dialog"
          aria-modal="true"
          aria-label={resolved.name}
          onClick={(event) => event.stopPropagation()}
        >
          <article className={`quirk-pick-card ${themeClass} ${fusion ? 'quirk-pick-card-hybrid' : ''}`}>
            <div className="quirk-card-glow" aria-hidden="true" />
            {fusion ? <span className="quirk-fusion-badge">{t('fusion.badge')}</span> : null}
            <div className="quirk-pick-card-scroll">
              <p className="quirk-meta">
                <TierScale tier={quirk.tier} />
                <span className="quirk-meta-sep" aria-hidden="true" />
                <span className="quirk-meta-type">{meta.type(quirk.type)}</span>
                <span className="quirk-meta-sep" aria-hidden="true" />
                <span className="quirk-meta-range">
                  <span className="quirk-meta-range-icon" aria-hidden="true" />
                  {meta.range(quirk.range)}
                </span>
              </p>
              <h2 className="quirk-pick-card-name">{resolved.name}</h2>
              <p className="quirk-pick-modal-description">{resolved.description}</p>
              <p className="quirk-pick-origin">
                <span>{t('advanced.origin')}:</span> {meta.origin(quirk.origin)}
              </p>
            </div>
            {quirk.facets.length > 0 ? (
              <div className="chip-row quirk-pick-facets">
                {quirk.facets.map((facet) => (
                  <FacetChip key={facet} facet={facet} />
                ))}
              </div>
            ) : null}
            {fusion ? (
              <HybridParentsSection fusion={quirk} onParentOpen={setNestedParent} />
            ) : null}
          </article>
          <div
            className={`quirk-pick-modal-actions ${actions ? '' : 'modal-actions-readonly'}`}
          >
            {actions ?? (
              <button type="button" className="manual-secondary-action" onClick={onClose}>
                {t('nav.back')}
              </button>
            )}
          </div>
        </div>
      </div>

      {nestedParent ? (
        <QuirkDetailModal
          quirk={nestedParent}
          onClose={() => setNestedParent(null)}
          stackLevel={stackLevel + 1}
        />
      ) : null}
    </>
  )
}
