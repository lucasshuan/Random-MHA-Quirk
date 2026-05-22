import { useEffect, useMemo, useState } from 'react'
import { QuirkCard } from '../QuirkCard'
import { useI18n } from '../../i18n/useI18n'
import type { ResultMode } from '../../lib/wizardFlow'
import type { HybridRollResult } from '../../types/fusion'
import type { Quirk } from '../../types/quirk'
import { HybridResultTabs } from './HybridResultTabs'
import { RollOrb } from './RollOrb'

type RollResult = Quirk | HybridRollResult | null

type FusionPhase = 'idle' | 'generating' | 'error'

interface StepFinalResultProps {
  mode: ResultMode
  result: RollResult
  flickerNames: string[]
  fusionPhase: FusionPhase
  fusionError: string | null
  onRetry: () => void
  onRetryFusion: () => void
  onBack: () => void
  onRestart: () => void
}

const FLICKER_MS = 95
const REVEAL_MS = 1150

function isHybridResult(result: RollResult): result is HybridRollResult {
  return result !== null && 'parents' in result
}

function resultKey(result: RollResult): string {
  if (!result) {
    return 'empty'
  }

  if (isHybridResult(result)) {
    return `hybrid-${result.parents[0].id}+${result.parents[1].id}-${result.seed}`
  }

  return result.id
}

interface ResultRevealProps {
  mode: ResultMode
  result: RollResult
  flickerNames: string[]
  fusionPhase: FusionPhase
  fusionError: string | null
  onRetry: () => void
  onRetryFusion: () => void
  onBack: () => void
  onRestart: () => void
}

function ResultReveal({
  mode,
  result,
  flickerNames,
  fusionPhase,
  fusionError,
  onRetry,
  onRetryFusion,
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

      {isHybridResult(result) ? (
        <HybridResultTabs
          result={result}
          resultKey={resultKey(result)}
          fusionPhase={fusionPhase}
          fusionError={fusionError}
          onRetryFusion={onRetryFusion}
        />
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
