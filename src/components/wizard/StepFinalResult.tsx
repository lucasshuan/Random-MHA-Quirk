import { useEffect, useMemo, useState } from 'react'
import { LuShare2 } from 'react-icons/lu'
import { QuirkCard } from '../QuirkCard'
import { useI18n } from '../../i18n/useI18n'
import { copyTextToClipboard } from '@/lib/share/clipboard'
import type { ResultMode } from '@/lib/wizard/flow'
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
  skipReveal?: boolean
  shareUrl?: string | null
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

function revealKey(result: RollResult): string {
  if (!result) {
    return 'empty'
  }

  if (isHybridResult(result)) {
    return `hybrid-${result.parents[0].id}+${result.parents[1].id}`
  }

  return result.id
}

function hybridContentKey(result: HybridRollResult): string {
  return `${result.parents[0].id}+${result.parents[1].id}:${result.seed}`
}

interface ResultRevealProps {
  mode: ResultMode
  result: RollResult
  flickerNames: string[]
  fusionPhase: FusionPhase
  fusionError: string | null
  skipReveal?: boolean
  shareUrl?: string | null
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
  skipReveal = false,
  shareUrl = null,
  onRetry,
  onRetryFusion,
  onBack,
  onRestart,
}: ResultRevealProps) {
  const { t } = useI18n()
  const [revealed, setRevealed] = useState(skipReveal)
  const [flickerIndex, setFlickerIndex] = useState(0)
  const [shareTooltip, setShareTooltip] = useState<string | null>(null)

  const labels = useMemo(() => {
    if (flickerNames.length > 0) {
      return flickerNames
    }

    return ['—']
  }, [flickerNames])

  useEffect(() => {
    if (skipReveal) {
      setRevealed(true)
      return
    }

    setRevealed(false)

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
  }, [labels, skipReveal])

  async function handleShare() {
    if (!shareUrl) {
      return
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ url: shareUrl, title: t('share.shareTitle') })
        setShareTooltip(t('share.shared'))
      } else {
        await copyTextToClipboard(shareUrl)
        setShareTooltip(t('share.copied'))
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      setShareTooltip(t('share.copyError'))
    }
  }

  useEffect(() => {
    if (!shareTooltip) {
      return
    }

    const timer = window.setTimeout(() => {
      setShareTooltip(null)
    }, 2200)

    return () => {
      window.clearTimeout(timer)
    }
  }, [shareTooltip])

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
          resultKey={hybridContentKey(result)}
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
          aria-label={t('nav.back')}
          data-tooltip={t('nav.back')}
        >
          ←
        </button>
        {isHybridResult(result) ? (
          <button
            type="button"
            className="icon-btn fusion-reroll-btn"
            onClick={onRetryFusion}
            disabled={fusionPhase === 'generating'}
            aria-label={t('fusion.rerollVariant')}
            data-tooltip={t('fusion.rerollVariant')}
          >
            <span className="fusion-reroll-glyph" aria-hidden="true">
              ✦
            </span>
          </button>
        ) : null}
        <button
          type="button"
          className="icon-btn strong-icon"
          onClick={onRetry}
          disabled={isHybridResult(result) && fusionPhase === 'generating'}
          aria-label={isHybridResult(result) ? t('nav.retryHybrid') : t('nav.retry')}
          data-tooltip={isHybridResult(result) ? t('nav.retryHybrid') : t('nav.retry')}
        >
          ↻
        </button>
        {shareUrl ? (
          <button
            type="button"
            className="icon-btn result-share-btn"
            onClick={() => void handleShare()}
            aria-label={t('share.action')}
            data-tooltip={shareTooltip ?? t('share.action')}
          >
            <LuShare2 aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="button"
          className="icon-btn"
          onClick={onRestart}
          aria-label={t('nav.restart')}
          data-tooltip={t('nav.restart')}
        >
          ⌂
        </button>
      </div>
    </>
  )
}

export function StepFinalResult(props: StepFinalResultProps) {
  const key = revealKey(props.result)

  return (
    <div className="simple-step result-step result-step-rolling">
      <ResultReveal key={key} {...props} />
    </div>
  )
}
