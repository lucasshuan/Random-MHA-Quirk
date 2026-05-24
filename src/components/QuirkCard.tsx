import { useMemo, useState } from 'react'
import { LuExpand } from 'react-icons/lu'
import { QuirkDetailModal } from './QuirkDetailModal'
import { resolveQuirk } from '../hooks/useQuirksCatalog'
import { quirkTypeThemeClass } from '@/lib/quirks/type-theme'
import { useI18n } from '../i18n/useI18n'
import { useMetaLabel } from '../i18n/useMetaLabel'
import type { FusionQuirk } from '../types/fusion'
import type { QuirkCardModel } from '../types/quirk-card'
import { TierScale } from './TierScale'

export type { QuirkCardModel } from '../types/quirk-card'

interface QuirkCardProps {
  quirk: QuirkCardModel
  slotLabel?: '1' | '2'
  compact?: boolean
}

function isFusionQuirk(quirk: QuirkCardModel): quirk is FusionQuirk {
  return 'roll' in quirk
}

export function QuirkCard({ quirk, slotLabel, compact = false }: QuirkCardProps) {
  const { locale, t } = useI18n()
  const meta = useMetaLabel()
  const resolved = useMemo(
    () => (isFusionQuirk(quirk) ? quirk : resolveQuirk(quirk, locale)),
    [quirk, locale],
  )
  const [modalOpen, setModalOpen] = useState(false)

  const themeClass = quirkTypeThemeClass(quirk.type)
  const slotClass = slotLabel ? `quirk-card-slot-${slotLabel.toLowerCase()}` : ''
  const fusion = isFusionQuirk(quirk)

  const cardClass = [
    'quirk-card',
    'quirk-card-has-modal-trigger',
    themeClass,
    slotClass,
    fusion ? 'quirk-card-fusion' : '',
    compact ? 'quirk-card-compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
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
          <TierScale tier={quirk.tier} />
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
          className="quirk-modal-trigger"
          onClick={() => setModalOpen(true)}
          aria-label={t('result.showDetails')}
        >
          <LuExpand aria-hidden="true" />
        </button>
      </article>

      {modalOpen ? (
        <QuirkDetailModal quirk={quirk} onClose={() => setModalOpen(false)} />
      ) : null}
    </>
  )
}
