import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { rollRandomOutcome, type ResultMode } from '@/lib/wizard/flow'
import { RollOrb } from './RollOrb'

interface StepRandomRollProps {
  onComplete: (outcome: ResultMode) => void
}

export function StepRandomRoll({ onComplete }: StepRandomRollProps) {
  const { t } = useI18n()
  const onCompleteRef = useRef(onComplete)
  const [flickerIndex, setFlickerIndex] = useState(0)
  const [phase, setPhase] = useState<'rolling' | 'reveal'>('rolling')
  const [outcome, setOutcome] = useState<ResultMode | null>(null)

  const flickerLabels = useMemo(
    () => [t('randomRoll.oneQuirk'), t('randomRoll.hybrid')] as const,
    [t],
  )

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    const resolved = rollRandomOutcome()

    const flickerTimer = window.setInterval(() => {
      setFlickerIndex((value) => (value + 1) % flickerLabels.length)
    }, 120)

    const revealTimer = window.setTimeout(() => {
      window.clearInterval(flickerTimer)
      setOutcome(resolved)
      setPhase('reveal')
    }, 1400)

    const doneTimer = window.setTimeout(() => {
      onCompleteRef.current(resolved)
    }, 2200)

    return () => {
      window.clearInterval(flickerTimer)
      window.clearTimeout(revealTimer)
      window.clearTimeout(doneTimer)
    }
  }, [flickerLabels])

  return (
    <div className="simple-step random-roll-step">
      <p className="app-mark">{t('randomRoll.mark')}</p>
      <h1>{phase === 'rolling' ? t('randomRoll.rolling') : t('randomRoll.result')}</h1>

      <RollOrb phase={phase} />

      <p
        className={`roll-label roll-label-slot ${phase === 'reveal' ? 'roll-label-reveal' : ''}`}
      >
        {phase === 'rolling'
          ? flickerLabels[flickerIndex]
          : outcome === 'hybrid'
            ? t('randomRoll.hybrid')
            : t('randomRoll.oneQuirk')}
      </p>
    </div>
  )
}
