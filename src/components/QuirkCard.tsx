import { useMemo, useState } from 'react'
import { FacetChip } from './FacetChip'
import { resolveQuirk } from '../hooks/useQuirksCatalog'
import { useI18n } from '../i18n/useI18n'
import { useMetaLabel } from '../i18n/useMetaLabel'
import type { FusionQuirk } from '../types/fusion'
import { QUIRK_TIERS, type Quirk, type QuirkType } from '../types/quirk'

export type QuirkCardModel = Quirk | FusionQuirk

function typeThemeClass(type: QuirkType): string {
  switch (type) {
    case 'Emitter':
      return 'quirk-card-type-emitter'
    case 'Transformation':
      return 'quirk-card-type-transformation'
    case 'Mutant':
      return 'quirk-card-type-mutant'
  }
}

interface QuirkCardProps {
  quirk: QuirkCardModel
  slotLabel?: '1' | '2'
  compact?: boolean
}

function isFusionQuirk(quirk: QuirkCardModel): quirk is FusionQuirk {
  return 'roll' in quirk
}

function fusionRollLabel(
  t: (key: string) => string,
  group: 'strategy' | 'nameRegister' | 'utilityNiche' | 'antiMashupRuleKey',
  value: string,
): string {
  const key = `fusion.roll.${group}.${value}`
  const translated = t(key)
  return translated === key ? value : translated
}

export function QuirkCard({ quirk, slotLabel, compact = false }: QuirkCardProps) {
  const { locale, t } = useI18n()
  const meta = useMetaLabel()
  const resolved = useMemo(
    () => (isFusionQuirk(quirk) ? quirk : resolveQuirk(quirk, locale)),
    [quirk, locale],
  )
  const [detailsOpen, setDetailsOpen] = useState(false)

  const themeClass = typeThemeClass(quirk.type)
  const slotClass = slotLabel ? `quirk-card-slot-${slotLabel.toLowerCase()}` : ''
  const fusion = isFusionQuirk(quirk)

  const cardClass = [
    'quirk-card',
    themeClass,
    slotClass,
    fusion ? 'quirk-card-fusion' : '',
    compact ? 'quirk-card-compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={cardClass}>
      <div className="quirk-card-glow" aria-hidden="true" />
      {slotLabel ? (
        <span className={`quirk-slot-badge quirk-slot-badge-${slotLabel.toLowerCase()}`}>
          {slotLabel}
        </span>
      ) : null}
      {fusion ? (
        <span className="quirk-fusion-badge">{t('fusion.badge')}</span>
      ) : null}
      <p className="quirk-meta">
        <span
          className="quirk-tier-scale"
          role="group"
          aria-label={meta.tier(quirk.tier)}
        >
          {QUIRK_TIERS.map((tier) => (
            <span
              key={tier}
              className={`quirk-tier-cell${tier === quirk.tier ? ' quirk-tier-cell-active' : ''}`}
              aria-current={tier === quirk.tier ? 'true' : undefined}
            >
              {tier}
            </span>
          ))}
        </span>
        <span className="quirk-meta-sep" aria-hidden="true" />
        <span className="quirk-meta-type">{meta.type(quirk.type)}</span>
        <span className="quirk-meta-sep" aria-hidden="true" />
        <span className="quirk-meta-range">
          <span className="quirk-meta-range-icon" aria-hidden="true" />
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
        {fusion ? (
          <>
            <p className="quirk-detail-roll">
              <span className="quirk-detail-label">{t('fusion.roll.strategyLabel')}</span>
              {fusionRollLabel(t, 'strategy', quirk.roll.strategyKey)}
            </p>
            <p className="quirk-detail-roll">
              <span className="quirk-detail-label">{t('fusion.roll.nameRegisterLabel')}</span>
              {fusionRollLabel(t, 'nameRegister', quirk.roll.nameRegister)}
            </p>
            <p className="quirk-detail-roll">
              <span className="quirk-detail-label">{t('fusion.roll.utilityLabel')}</span>
              {fusionRollLabel(t, 'utilityNiche', quirk.roll.utilityNiche)}
            </p>
            <p className="quirk-detail-roll">
              <span className="quirk-detail-label">{t('fusion.roll.antiMashupLabel')}</span>
              {fusionRollLabel(t, 'antiMashupRuleKey', quirk.roll.antiMashupRuleKey)}
            </p>
          </>
        ) : null}
        {quirk.facets.length > 0 ? (
          <div className="chip-row quirk-detail-facets">
            {quirk.facets.map((facet) => (
              <FacetChip key={facet} facet={facet} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
