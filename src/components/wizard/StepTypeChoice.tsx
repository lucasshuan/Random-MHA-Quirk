import { useI18n } from '../../i18n/useI18n'
import type { ResultMode, SimpleTypeChoice } from '../../lib/wizardFlow'
import { ChoiceOptionButton } from './ChoiceOptionButton'

interface StepTypeChoiceProps {
  mode: ResultMode
  hybridStep: 0 | 1
  onChoose: (type: SimpleTypeChoice) => void
  onAdvanced: () => void
}

const TYPE_KEYS: Array<{
  type: SimpleTypeChoice
  tone: string
  labelKey: string
  hintKey: string
}> = [
  { type: 'Any', tone: 'any', labelKey: 'type.any', hintKey: 'type.anyHint' },
  { type: 'Emitter', tone: 'emitter', labelKey: 'type.emitter', hintKey: 'type.emitterHint' },
  {
    type: 'Transformation',
    tone: 'transformation',
    labelKey: 'type.transformation',
    hintKey: 'type.transformationHint',
  },
  { type: 'Mutant', tone: 'mutant', labelKey: 'type.mutant', hintKey: 'type.mutantHint' },
]

export function StepTypeChoice({
  mode,
  hybridStep,
  onChoose,
  onAdvanced,
}: StepTypeChoiceProps) {
  const { t } = useI18n()
  const isHybrid = mode === 'hybrid'
  const title = isHybrid
    ? hybridStep === 0
      ? t('type.first')
      : t('type.second')
    : t('type.pick')

  return (
    <div className="simple-step">
      {isHybrid ? (
        <p className="type-step-badge">
          {t('type.hybridBadge', { current: hybridStep + 1 })}
        </p>
      ) : (
        <p className="app-mark">{t('type.filter')}</p>
      )}
      <h1>{title}</h1>
      <div className="choice-grid compact-choice-grid">
        {TYPE_KEYS.map((option) => (
          <ChoiceOptionButton
            key={option.type}
            label={t(option.labelKey)}
            description={t(option.hintKey)}
            tone={option.tone}
            onClick={() => onChoose(option.type)}
          />
        ))}
      </div>
      {!isHybrid || hybridStep === 0 ? (
        <button type="button" className="text-btn" onClick={onAdvanced}>
          {t('type.advanced')}
        </button>
      ) : null}
    </div>
  )
}
