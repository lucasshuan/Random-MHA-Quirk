import { useEffect, useMemo, useState } from 'react'
import { FilterPanel } from '../FilterPanel'
import { useI18n } from '../../i18n/useI18n'
import { useMetaLabel } from '../../i18n/useMetaLabel'
import { translateMatches } from '../../i18n/translate'
import type { ResultMode } from '../../lib/wizardFlow'
import type { Quirk, QuirkFilters, QuirkType } from '../../types/quirk'

interface StepManualPickProps {
  mode: ResultMode
  hybridStep: 0 | 1
  filters: QuirkFilters
  filteredQuirks: Quirk[]
  onChangeFilters: (filters: QuirkFilters) => void
  onResetFilters: () => void
  onSelectQuirk: (quirk: Quirk) => void
}

function toneClass(type: QuirkType): string {
  switch (type) {
    case 'Emitter':
      return 'quirk-card-type-emitter'
    case 'Transformation':
      return 'quirk-card-type-transformation'
    case 'Mutant':
      return 'quirk-card-type-mutant'
  }
}

function shortDescription(value: string, max = 110): string {
  if (value.length <= max) {
    return value
  }
  return `${value.slice(0, max - 1).trimEnd()}…`
}

export function StepManualPick({
  mode,
  hybridStep,
  filters,
  filteredQuirks,
  onChangeFilters,
  onResetFilters,
  onSelectQuirk,
}: StepManualPickProps) {
  const { locale, t } = useI18n()
  const meta = useMetaLabel()
  const [selectedQuirk, setSelectedQuirk] = useState<Quirk | null>(null)

  const title = useMemo(() => {
    if (mode !== 'hybrid') {
      return t('manualPick.titleSolo')
    }
    return hybridStep === 0 ? t('manualPick.titleHybridFirst') : t('manualPick.titleHybridSecond')
  }, [hybridStep, mode, t])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedQuirk(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div className="simple-step manual-pick-step">
      <p className="app-mark">{t('manualPick.mark')}</p>
      <h1>{title}</h1>
      <p className="mini-copy">{translateMatches(locale, filteredQuirks.length)}</p>
      <div className="manual-pick-layout">
        <FilterPanel
          filters={filters}
          onChange={onChangeFilters}
          onReset={onResetFilters}
        />
        <section className="panel inner-scroll-panel manual-quirk-panel">
          <div className="panel-heading">
            <h2>{t('manualPick.pickLabel')}</h2>
          </div>
          {filteredQuirks.length === 0 ? (
            <p className="mini-copy">{t('manualPick.empty')}</p>
          ) : (
            <div className="manual-quirk-grid">
              {filteredQuirks.map((quirk) => (
                <button
                  key={quirk.id}
                  type="button"
                  className={`manual-quirk-card ${toneClass(quirk.type)}`}
                  onClick={() => setSelectedQuirk(quirk)}
                >
                  <p className="manual-quirk-meta">
                    <span className="manual-quirk-tier">{meta.tier(quirk.tier)}</span>
                    <span className="manual-quirk-meta-sep" aria-hidden="true">
                      •
                    </span>
                    <span>{meta.type(quirk.type)}</span>
                  </p>
                  <h3>{quirk.name}</h3>
                  <p>{shortDescription(quirk.description)}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedQuirk ? (
        <div className="quirk-pick-modal-backdrop" onClick={() => setSelectedQuirk(null)}>
          <div
            className={`quirk-pick-modal ${toneClass(selectedQuirk.type)}`}
            role="dialog"
            aria-modal="true"
            aria-label={selectedQuirk.name}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="quirk-pick-modal-meta">
              {meta.tier(selectedQuirk.tier)} • {meta.type(selectedQuirk.type)} •{' '}
              {meta.range(selectedQuirk.range)}
            </p>
            <h2>{selectedQuirk.name}</h2>
            <p className="quirk-pick-modal-description">{selectedQuirk.description}</p>
            <p className="quirk-pick-origin">
              <span>{t('advanced.origin')}:</span> {meta.origin(selectedQuirk.origin)}
            </p>
            {selectedQuirk.facets.length > 0 ? (
              <div className="chip-row quirk-pick-facets">
                {selectedQuirk.facets.map((facet) => (
                  <span key={facet} className="chip chip-muted">
                    {meta.facet(facet)}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="quirk-pick-modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSelectedQuirk(null)}
              >
                {t('manualPick.cancel')}
              </button>
              <button
                type="button"
                className="big-action"
                onClick={() => onSelectQuirk(selectedQuirk)}
              >
                {t('manualPick.confirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
