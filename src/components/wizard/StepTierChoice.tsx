import { useI18n } from '../../i18n/useI18n'
import { useMetaLabel } from '../../i18n/useMetaLabel'
import type { ResultMode } from '@/lib/wizard/flow'
import { toggleTier } from '@/lib/quirks/tiers'
import { QUIRK_TIERS, type QuirkTier } from '../../types/quirk'

interface StepTierChoiceProps {
  mode: ResultMode
  hybridStep: 0 | 1
  slideDirection: 'forward' | 'back'
  selectedTiers: QuirkTier[]
  onSelectedTiersChange: (tiers: QuirkTier[]) => void
  onAdvance: () => void
}

const TIER_TONES: Record<QuirkTier, string> = {
  S: 'tier-s',
  A: 'tier-a',
  B: 'tier-b',
  C: 'tier-c',
}

export function StepTierChoice({
  mode,
  hybridStep,
  slideDirection,
  selectedTiers,
  onSelectedTiersChange,
  onAdvance,
}: StepTierChoiceProps) {
  const { t } = useI18n()
  const meta = useMetaLabel()
  const isHybrid = mode === 'hybrid'
  const canAdvance = selectedTiers.length > 0

  const title = isHybrid
    ? hybridStep === 0
      ? t('tier.first')
      : t('tier.second')
    : t('tier.pick')

  const panelKey = isHybrid ? `hybrid-tier-${hybridStep}` : 'solo-tier'

  return (
    <div className="simple-step type-step tier-step">
      <div
        key={panelKey}
        className={`type-step-panel type-step-panel-${slideDirection}`}
      >
        {isHybrid ? (
          <p className="type-step-badge">
            {t('type.hybridBadge', { current: hybridStep + 1 })}
          </p>
        ) : (
          <p className="app-mark">{t('tier.mark')}</p>
        )}
        <h1>{title}</h1>

        <div
          className="tier-toggle-grid"
          role="group"
          aria-label={t('tier.individualLabel')}
        >
          {QUIRK_TIERS.map((tier, index) => {
            const isSelected = selectedTiers.includes(tier)
            return (
              <button
                key={tier}
                type="button"
                className={`tier-toggle tier-toggle-${TIER_TONES[tier]} ${isSelected ? 'tier-toggle-active' : ''} type-step-choice type-step-choice-${index + 1}`}
                aria-pressed={isSelected}
                onClick={() => onSelectedTiersChange(toggleTier(selectedTiers, tier))}
              >
                <span className="tier-toggle-letter">{tier}</span>
                <span className="tier-toggle-label">{meta.tier(tier)}</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="big-action tier-step-advance"
          onClick={onAdvance}
          disabled={!canAdvance}
        >
          {t('tier.advance')}
        </button>
      </div>
    </div>
  )
}
