import { useEffect, useId, useMemo, useState } from 'react'
import { QuirkCard } from '../QuirkCard'
import { useI18n } from '../../i18n/useI18n'
import { resolveFusionQuirk } from '../../lib/fusionCache'
import type { HybridRollResult } from '../../types/fusion'
import { RollOrb } from './RollOrb'

type HybridView = 'fusion' | 'parents'
type FusionPhase = 'idle' | 'generating' | 'error'

interface HybridResultTabsProps {
  result: HybridRollResult
  resultKey: string
  fusionPhase: FusionPhase
  fusionError: string | null
  canGenerateFusionLive: boolean
  onRetryFusion: () => void
}

export function HybridResultTabs({
  result,
  resultKey,
  fusionPhase,
  fusionError,
  canGenerateFusionLive,
  onRetryFusion,
}: HybridResultTabsProps) {
  const { locale, t } = useI18n()
  const [view, setView] = useState<HybridView>('fusion')

  const fusion = useMemo(
    () => resolveFusionQuirk(result.fusionEntry, locale),
    [result.fusionEntry, locale],
  )
  const tablistId = useId()
  const fusionPanelId = useId()
  const parentsPanelId = useId()

  useEffect(() => {
    setView('fusion')
  }, [resultKey])

  return (
    <div className="hybrid-result result-cards-reveal">
      <div
        className="result-view-tabs"
        role="tablist"
        aria-label={t('result.hybrid')}
        id={tablistId}
      >
        <button
          type="button"
          role="tab"
          id={`${tablistId}-fusion`}
          aria-selected={view === 'fusion'}
          aria-controls={fusionPanelId}
          className={`result-view-tab ${view === 'fusion' ? 'result-view-tab-active' : ''}`}
          onClick={() => setView('fusion')}
        >
          {t('fusion.tabFusion')}
        </button>
        <button
          type="button"
          role="tab"
          id={`${tablistId}-parents`}
          aria-selected={view === 'parents'}
          aria-controls={parentsPanelId}
          className={`result-view-tab ${view === 'parents' ? 'result-view-tab-active' : ''}`}
          onClick={() => setView('parents')}
        >
          {t('fusion.tabParents')}
        </button>
      </div>

      {view === 'fusion' ? (
        <div
          className="result-view-panel result-view-panel-fusion"
          role="tabpanel"
          id={fusionPanelId}
          aria-labelledby={`${tablistId}-fusion`}
        >
          {fusion ? (
            <div className="fusion-hero">
              <QuirkCard quirk={fusion} hideTier />
            </div>
          ) : fusionPhase === 'generating' ? (
            <div className="fusion-pending fusion-forging">
              <RollOrb phase="rolling" />
              <p className="mini-copy">{t('fusion.forging')}</p>
            </div>
          ) : fusionPhase === 'error' ? (
            <div className="fusion-pending fusion-error">
              <p className="mini-copy">{t('fusion.generateError')}</p>
              {fusionError ? <p className="fusion-error-detail">{fusionError}</p> : null}
              {canGenerateFusionLive ? (
                <button
                  type="button"
                  className="big-action fusion-retry-btn"
                  onClick={onRetryFusion}
                >
                  {t('fusion.retryGenerate')}
                </button>
              ) : null}
              <p className="fusion-generate-hint">{t('fusion.generateHint')}</p>
              <code className="fusion-generate-cmd">
                {t('fusion.generateCommand', {
                  a: result.parents[0].id,
                  b: result.parents[1].id,
                  seed: result.seed,
                })}
              </code>
            </div>
          ) : (
            <div className="fusion-pending">
              <p className="mini-copy">{t('fusion.notGenerated')}</p>
              <p className="fusion-generate-hint">{t('fusion.generateHint')}</p>
              <code className="fusion-generate-cmd">
                {t('fusion.generateCommand', {
                  a: result.parents[0].id,
                  b: result.parents[1].id,
                  seed: result.seed,
                })}
              </code>
            </div>
          )}
        </div>
      ) : (
        <div
          className="result-view-panel result-view-panel-parents"
          role="tabpanel"
          id={parentsPanelId}
          aria-labelledby={`${tablistId}-parents`}
        >
          <div className="rolled-quirks-box inner-scroll-panel">
            <div className="fusion-result fusion-parents-grid">
              <QuirkCard quirk={result.parents[0]} slotLabel="1" />
              <div className="fusion-plus fusion-plus-reveal" aria-hidden="true">
                +
              </div>
              <QuirkCard quirk={result.parents[1]} slotLabel="2" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
