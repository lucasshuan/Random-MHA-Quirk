import { useEffect, useMemo, useState } from 'react'
import { QuirkCard } from '../QuirkCard'
import { useI18n } from '../../i18n/useI18n'
import type { ResultMode } from '../../lib/wizardFlow'
import type { Quirk } from '../../types/quirk'
import { RollOrb } from './RollOrb'

interface StepFinalResultProps {
  mode: ResultMode
  result: Quirk | [Quirk, Quirk] | null
  flickerNames: string[]
  onRetry: () => void
  onBack: () => void
  onRestart: () => void
}

const FLICKER_MS = 95
const REVEAL_MS = 1150

function resultKey(result: Quirk | [Quirk, Quirk] | null): string {
  if (!result) {
    return 'empty'
  }

  if (Array.isArray(result)) {
    return `${result[0].id}+${result[1].id}`
  }

  return result.id
}

interface ResultRevealProps {
  mode: ResultMode
  result: Quirk | [Quirk, Quirk] | null
  flickerNames: string[]
  onRetry: () => void
  onBack: () => void
  onRestart: () => void
}

function ResultReveal({
  mode,
  result,
  flickerNames,
  onRetry,
  onBack,
  onRestart,
}: ResultRevealProps) {
  const { t } = useI18n()
  const [revealed, setRevealed] = useState(false)
  const [flickerIndex, setFlickerIndex] = useState(0)

  const labels = useMemo(() => {
    if (flickerNames.length > 0) {
      return flickerNames
    }

    return ['—']
  }, [flickerNames])

  useEffect(() => {
    const flickerTimer = window.setInterval(() => {
      setFlickerIndex((value) => (value + 1) % labels.length)
    }, FLICKER_MS)

    const revealTimer = window.setTimeout(() => {
      window.clearInterval(flickerTimer)
      setRevealed(true)
    }, REVEAL_MS)

    return () => {
      window.clearInterval(flickerTimer)
      window.clearTimeout(revealTimer)
    }
  }, [labels])

  if (!revealed) {
    return (
      <>
        <p className="app-mark">
          {mode === 'hybrid' ? t('result.hybrid') : t('result.oneQuirk')}
        </p>
        <h1 className="result-roll-title">{t('result.rolling')}</h1>
        <div className="result-roll-stage" aria-hidden="true">
          <RollOrb phase="rolling" />
          <p className="roll-label roll-label-flicker">{labels[flickerIndex]}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <p className="app-mark">
        {mode === 'hybrid' ? t('result.hybrid') : t('result.oneQuirk')}
      </p>
      <h1>{t('result.title')}</h1>

      {Array.isArray(result) ? (
        <div className="fusion-result result-cards-reveal">
          <QuirkCard quirk={result[0]} slotLabel="A" />
          <div className="fusion-plus fusion-plus-reveal">+</div>
          <QuirkCard quirk={result[1]} slotLabel="B" />
        </div>
      ) : result ? (
        <div className="result-cards-reveal">
          <QuirkCard quirk={result} />
        </div>
      ) : (
        <p className="mini-copy result-cards-reveal">{t('result.empty')}</p>
      )}

      <div className="result-toolbar result-toolbar-reveal">
        <button
          type="button"
          className="icon-btn"
          onClick={onBack}
          title={t('nav.back')}
          aria-label={t('nav.back')}
        >
          ←
        </button>
        <button
          type="button"
          className="icon-btn strong-icon"
          onClick={onRetry}
          title={t('nav.retry')}
          aria-label={t('nav.retry')}
        >
          ↻
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onRestart}
          title={t('nav.restart')}
          aria-label={t('nav.restart')}
        >
          ⌂
        </button>
      </div>
    </>
  )
}

export function StepFinalResult(props: StepFinalResultProps) {
  const key = resultKey(props.result)

  return (
    <div className="simple-step result-step result-step-rolling">
      <ResultReveal key={key} {...props} />
    </div>
  )
}
