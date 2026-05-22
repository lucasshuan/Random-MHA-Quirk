import { QuirkCard } from '../QuirkCard'
import { useI18n } from '../../i18n/useI18n'
import type { ResultMode } from '../../lib/wizardFlow'
import type { Quirk } from '../../types/quirk'

interface StepFinalResultProps {
  mode: ResultMode
  result: Quirk | [Quirk, Quirk] | null
  onRetry: () => void
  onBack: () => void
  onRestart: () => void
}

export function StepFinalResult({
  mode,
  result,
  onRetry,
  onBack,
  onRestart,
}: StepFinalResultProps) {
  const { t } = useI18n()

  return (
    <div className="simple-step result-step">
      <p className="app-mark">
        {mode === 'hybrid' ? t('result.hybrid') : t('result.oneQuirk')}
      </p>
      <h1>{t('result.title')}</h1>

      {Array.isArray(result) ? (
        <div className="fusion-result">
          <QuirkCard quirk={result[0]} titlePrefix={t('result.prefixA')} />
          <div className="fusion-plus">+</div>
          <QuirkCard quirk={result[1]} titlePrefix={t('result.prefixB')} />
        </div>
      ) : result ? (
        <QuirkCard quirk={result} />
      ) : (
        <p className="mini-copy">{t('result.empty')}</p>
      )}

      <div className="result-toolbar">
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
    </div>
  )
}
