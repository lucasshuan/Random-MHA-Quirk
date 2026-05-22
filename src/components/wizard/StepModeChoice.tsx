import { useI18n } from '../../i18n/useI18n'
import type { ModeChoice } from '../../lib/wizardFlow'
import { BrandMark } from './BrandMark'
import { ChoiceOptionButton } from './ChoiceOptionButton'

interface StepModeChoiceProps {
  onChoose: (choice: ModeChoice) => void
}

export function StepModeChoice({ onChoose }: StepModeChoiceProps) {
  const { t } = useI18n()

  const modeOptions: Array<{
    choice: ModeChoice
    label: string
    tone: string
    description: string
  }> = [
    {
      choice: 'random',
      label: t('mode.tryLuck'),
      tone: 'luck',
      description: t('mode.tryLuckHint'),
    },
    {
      choice: 'solo',
      label: t('mode.oneQuirk'),
      tone: 'one-quirk',
      description: t('mode.oneQuirkHint'),
    },
    {
      choice: 'hybrid',
      label: t('mode.hybrid'),
      tone: 'hybrid',
      description: t('mode.hybridHint'),
    },
  ]

  const luckOption = modeOptions[0]
  const secondaryOptions = modeOptions.slice(1)

  return (
    <div className="simple-step">
      <BrandMark />
      <h1>{t('mode.title')}</h1>

      <div className="mode-choice-stack">
        <ChoiceOptionButton
          label={luckOption.label}
          description={luckOption.description}
          tone={luckOption.tone}
          className="primary-choice mode-choice-main"
          onClick={() => onChoose(luckOption.choice)}
        />

        <div className="mode-or" aria-hidden="true">
          <span className="mode-or-line" />
          <span className="mode-or-text">{t('mode.or')}</span>
          <span className="mode-or-line" />
        </div>

        <div className="choice-grid mode-choice-secondary">
          {secondaryOptions.map((option) => (
            <ChoiceOptionButton
              key={option.choice}
              label={option.label}
              description={option.description}
              tone={option.tone}
              onClick={() => onChoose(option.choice)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
