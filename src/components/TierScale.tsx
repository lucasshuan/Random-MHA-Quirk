import { useI18n } from '../i18n/useI18n'
import { useMetaLabel } from '../i18n/useMetaLabel'
import {
  QUIRK_DISPLAY_TIERS,
  isOmegaTier,
  tierBadgeGlyph,
  type QuirkTier,
} from '../types/quirk'

interface TierScaleProps {
  tier: QuirkTier
}

/** Large cards: S–C table, or full-width pink “Special” for Ω. */
export function TierScale({ tier }: TierScaleProps) {
  const { t } = useI18n()
  const meta = useMetaLabel()

  if (isOmegaTier(tier)) {
    return (
      <span
        className="quirk-tier-scale quirk-tier-scale-omega"
        role="group"
        aria-label={meta.tier(tier)}
      >
        <span className="quirk-tier-special">{t('tier.specialLabel')}</span>
      </span>
    )
  }

  return (
    <span className="quirk-tier-scale" role="group" aria-label={meta.tier(tier)}>
      {QUIRK_DISPLAY_TIERS.map((cell) => (
        <span
          key={cell}
          className={`quirk-tier-cell${cell === tier ? ' quirk-tier-cell-active' : ''}`}
          aria-current={cell === tier ? 'true' : undefined}
        >
          {cell}
        </span>
      ))}
    </span>
  )
}

interface TierBadgeProps {
  tier: QuirkTier
  className?: string
}

/** Compact cards: pink Ω badge. */
export function TierBadge({ tier, className = 'manual-quirk-tier-badge' }: TierBadgeProps) {
  const meta = useMetaLabel()
  const omega = isOmegaTier(tier)

  return (
    <span
      className={`${className}${omega ? ' manual-quirk-tier-badge-omega' : ''}`}
      aria-label={meta.tier(tier)}
    >
      {tierBadgeGlyph(tier)}
    </span>
  )
}
