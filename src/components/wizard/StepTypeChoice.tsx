import { useI18n } from '../../i18n/useI18n'
import type { ResultMode, SimpleTypeChoice } from '@/lib/wizard/flow'
import { ChoiceOptionButton } from './ChoiceOptionButton'

interface StepTypeChoiceProps {
  mode: ResultMode
  hybridStep: 0 | 1
  hybridReachedSecondType: boolean
  onChoose: (type: SimpleTypeChoice) => void
  onAdvancedOptions: () => void
  onChooseManual: () => void
}

const TYPE_KEYS: Array<{
  type: SimpleTypeChoice
  tone: string
  labelKey: string
  hintKey: string
  iconSrc: string
}> = [
  {
    type: 'Any',
    tone: 'any',
    labelKey: 'type.any',
    hintKey: 'type.anyHint',
    iconSrc: '/quirk-types/random.webp',
  },
  {
    type: 'Emitter',
    tone: 'emitter',
    labelKey: 'type.emitter',
    hintKey: 'type.emitterHint',
    iconSrc: '/quirk-types/emitter.webp',
  },
  {
    type: 'Transformation',
    tone: 'transformation',
    labelKey: 'type.transformation',
    hintKey: 'type.transformationHint',
    iconSrc: '/quirk-types/transformation.webp',
  },
  {
    type: 'Mutant',
    tone: 'mutant',
    labelKey: 'type.mutant',
    hintKey: 'type.mutantHint',
    iconSrc: '/quirk-types/mutant.webp',
  },
]

export function StepTypeChoice({
  mode,
  hybridStep,
  hybridReachedSecondType,
  onChoose,
  onAdvancedOptions,
  onChooseManual,
}: StepTypeChoiceProps) {
  const { t } = useI18n()
  const isHybrid = mode === 'hybrid'

  const slideDirection = !isHybrid
    ? 'forward'
    : hybridStep === 1
      ? 'forward'
      : hybridReachedSecondType
        ? 'back'
        : 'forward'

  const title = isHybrid
    ? hybridStep === 0
      ? t('type.first')
      : t('type.second')
    : t('type.pick')

  const panelKey = isHybrid ? `hybrid-step-${hybridStep}` : 'solo-type'

  return (
    <div className="simple-step type-step">
      <div
        key={panelKey}
        className={`type-step-panel type-step-panel-${slideDirection}`}
      >
        {isHybrid ? (
          <p className="type-step-badge">
            {t('type.hybridBadge', { current: hybridStep + 1 })}
          </p>
        ) : (
          <p className="app-mark">{t('type.filter')}</p>
        )}
        <h1>{title}</h1>
        <div className="choice-grid compact-choice-grid">
          {TYPE_KEYS.map((option, index) => (
            <ChoiceOptionButton
              key={option.type}
              label={t(option.labelKey)}
              description={t(option.hintKey)}
              tone={option.tone}
              iconSrc={option.iconSrc}
              className={`type-step-choice type-step-choice-${index + 1}`}
              onClick={() => onChoose(option.type)}
            />
          ))}
        </div>
        <div className="type-step-routes">
          <button
            type="button"
            className="type-step-route"
            onClick={onAdvancedOptions}
          >
            {t('type.advancedOptions')}
          </button>
          <button
            type="button"
            className="type-step-route"
            onClick={onChooseManual}
          >
            {t('type.chooseManual')}
          </button>
        </div>
      </div>
    </div>
  )
}
