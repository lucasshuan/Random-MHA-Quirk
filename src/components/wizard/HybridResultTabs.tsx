import { useEffect, useMemo, useState } from 'react'
import { SegmentTabs } from '../SegmentTabs'
import { QuirkCard } from '../QuirkCard'
import { useI18n } from '../../i18n/useI18n'
import { translateList } from '../../i18n/translate'
import { useRotatingMessage } from '@/hooks/useRotatingMessage'
import { resolveFusionQuirk } from '@/lib/fusion/cache'
import type { HybridRollResult } from '../../types/fusion'
import { RollOrb } from './RollOrb'

const FORGING_MESSAGE_MS = 5000

type HybridView = 'fusion' | 'parents'
type FusionPhase = 'idle' | 'generating' | 'error'

interface HybridResultTabsProps {
  result: HybridRollResult
  resultKey: string
  fusionPhase: FusionPhase
  fusionError: string | null
  onRetryFusion: () => void
}

export function HybridResultTabs({
  result,
  resultKey,
  fusionPhase,
  fusionError,
  onRetryFusion,
}: HybridResultTabsProps) {
  const { locale, t } = useI18n()
  const [view, setView] = useState<HybridView>('fusion')

  const fusion = useMemo(
    () => resolveFusionQuirk(result.fusionEntry, locale),
    [result.fusionEntry, locale],
  )

  const tabs = useMemo(
    () =>
      [
        { id: 'fusion' as const, label: t('fusion.tabFusion') },
        { id: 'parents' as const, label: t('fusion.tabParents') },
      ] as const,
    [t],
  )

  const forgingMessages = useMemo(
    () => translateList(locale, 'fusion.forgingMessages'),
    [locale],
  )
  const forgingLabel = useRotatingMessage(forgingMessages, FORGING_MESSAGE_MS)

  useEffect(() => {
    setView('fusion')
  }, [resultKey])

  return (
    <div className="hybrid-result result-cards-reveal">
      <SegmentTabs
        tabs={tabs}
        value={view}
        onChange={setView}
        ariaLabel={t('result.hybrid')}
        panelClassName={`segment-tab-panel result-view-panel ${
          view === 'fusion' ? 'result-view-panel-fusion' : 'result-view-panel-parents'
        }`}
      >
        {(activeView) =>
          activeView === 'fusion' ? (
            <>
              {fusion ? (
                <div className="fusion-hero" key={resultKey}>
                  <QuirkCard quirk={fusion} />
                </div>
              ) : fusionPhase === 'generating' ? (
                <div className="fusion-forging">
                  <RollOrb phase="rolling" />
                  <p
                    key={forgingLabel}
                    className="mini-copy fusion-forging-copy"
                    aria-live="polite"
                  >
                    {forgingLabel}
                  </p>
                </div>
              ) : fusionPhase === 'error' ? (
                <div className="fusion-pending fusion-error">
                  <p className="mini-copy">
                    {fusionError ?? t('fusion.generateError')}
                  </p>
                  <button
                    type="button"
                    className="big-action fusion-retry-btn"
                    onClick={onRetryFusion}
                  >
                    {t('fusion.retryGenerate')}
                  </button>
                </div>
              ) : (
                <div className="fusion-pending">
                  <p className="mini-copy">{t('fusion.notGenerated')}</p>
                  <button
                    type="button"
                    className="big-action fusion-retry-btn"
                    onClick={onRetryFusion}
                  >
                    {t('fusion.retryGenerate')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="fusion-result fusion-parents-grid">
              <QuirkCard quirk={result.parents[0]} slotLabel="1" />
              <div className="fusion-plus fusion-plus-reveal" aria-hidden="true">
                +
              </div>
              <QuirkCard quirk={result.parents[1]} slotLabel="2" />
            </div>
          )
        }
      </SegmentTabs>
    </div>
  )
}
