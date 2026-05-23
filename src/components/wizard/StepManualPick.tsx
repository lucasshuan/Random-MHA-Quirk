import { useCallback, useEffect, useMemo, useState } from 'react'
import { FilterPanel } from '../FilterPanel'
import { useI18n } from '../../i18n/useI18n'
import { FacetChip } from '../FacetChip'
import { useMetaLabel } from '../../i18n/useMetaLabel'
import { translateMatches } from '../../i18n/translate'
import type { ResultMode } from '@/lib/wizard/flow'
import {
  countAdvancedFilterSelections,
  QUIRK_TIERS,
  type Quirk,
  type QuirkFilters,
  type QuirkType,
} from '../../types/quirk'

interface StepManualPickProps {
  mode: ResultMode
  hybridStep: 0 | 1
  filters: QuirkFilters
  filteredQuirks: Quirk[]
  onChangeFilters: (filters: QuirkFilters) => void
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
  onSelectQuirk,
}: StepManualPickProps) {
  const { locale, t } = useI18n()
  const meta = useMetaLabel()
  const [selectedQuirk, setSelectedQuirk] = useState<Quirk | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<QuirkFilters>(filters)

  const openFiltersModal = useCallback(() => {
    setDraftFilters({ ...filters })
    setFiltersOpen(true)
  }, [filters])

  const dismissFiltersModal = useCallback(() => {
    setFiltersOpen(false)
  }, [])

  const applyDraftFilters = useCallback(() => {
    onChangeFilters({
      ...filters,
      origins: draftFilters.origins,
      types: draftFilters.types,
      ranges: draftFilters.ranges,
      facets: draftFilters.facets,
    })
    setFiltersOpen(false)
  }, [draftFilters, filters, onChangeFilters])

  const resetDraftFilters = useCallback(() => {
    setDraftFilters((current) => ({
      ...current,
      origins: [],
      types: [],
      ranges: [],
      facets: [],
    }))
  }, [])

  const title = useMemo(() => {
    if (mode !== 'hybrid') {
      return t('manualPick.titleSolo')
    }
    return hybridStep === 0 ? t('manualPick.titleHybridFirst') : t('manualPick.titleHybridSecond')
  }, [hybridStep, mode, t])

  const activeFilterCount = useMemo(
    () => countAdvancedFilterSelections(filters),
    [filters],
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }
      if (filtersOpen) {
        dismissFiltersModal()
        return
      }
      setSelectedQuirk(null)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [dismissFiltersModal, filtersOpen])

  return (
    <div className="simple-step manual-pick-step">
      <p className="app-mark">{t('manualPick.mark')}</p>
      <h1>{title}</h1>
      <section className="manual-pick-controls" aria-label={t('advanced.filters')}>
        <label className="search-input manual-search-input">
          <input
            type="search"
            placeholder={t('manualPick.searchPlaceholder')}
            value={filters.query}
            onChange={(event) =>
              onChangeFilters({ ...filters, query: event.target.value })
            }
          />
        </label>
        <button
          type="button"
          className={`manual-filter-button${activeFilterCount > 0 ? ' manual-filter-button-has-count' : ''}`}
          onClick={openFiltersModal}
          aria-label={
            activeFilterCount > 0
              ? `${t('manualPick.advancedFilters')} (${activeFilterCount})`
              : t('manualPick.advancedFilters')
          }
        >
          <span>{t('manualPick.advancedFilters')}</span>
          {activeFilterCount > 0 ? (
            <span className="manual-filter-count" aria-hidden="true">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </section>

      <div className="manual-pick-layout">
        <section className="panel inner-scroll-panel manual-quirk-panel">
          <div className="manual-quirk-panel-heading">
            <span>{translateMatches(locale, filteredQuirks.length)}</span>
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
                  data-tier={quirk.tier}
                  onClick={() => setSelectedQuirk(quirk)}
                >
                  <span className="quirk-card-glow" aria-hidden="true" />
                  <p className="quirk-meta manual-quirk-meta">
                    <span className="manual-quirk-tier-badge" aria-label={meta.tier(quirk.tier)}>
                      {quirk.tier}
                    </span>
                    <span className="quirk-meta-sep" aria-hidden="true" />
                    <span className="quirk-meta-type">{meta.type(quirk.type)}</span>
                  </p>
                  <h3 className="manual-quirk-name">{quirk.name}</h3>
                  <p className="manual-quirk-description">
                    {shortDescription(quirk.description, 72)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {filtersOpen ? (
        <div className="quirk-pick-modal-backdrop" onClick={dismissFiltersModal}>
          <div
            className="manual-filter-modal"
            role="dialog"
            aria-modal="true"
            aria-label={t('advanced.filters')}
            onClick={(event) => event.stopPropagation()}
          >
            <FilterPanel
              filters={draftFilters}
              onChange={setDraftFilters}
              onReset={resetDraftFilters}
              showSearch={false}
            />
            <div className="manual-filter-modal-actions">
              <button
                type="button"
                className="manual-secondary-action"
                onClick={dismissFiltersModal}
              >
                {t('manualPick.cancel')}
              </button>
              <button
                type="button"
                className="big-action manual-confirm-action"
                onClick={applyDraftFilters}
              >
                {t('manualPick.filtersDone')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedQuirk ? (
        <div className="quirk-pick-modal-backdrop" onClick={() => setSelectedQuirk(null)}>
          <div
            className={`quirk-pick-modal ${toneClass(selectedQuirk.type)}`}
            role="dialog"
            aria-modal="true"
            aria-label={selectedQuirk.name}
            onClick={(event) => event.stopPropagation()}
          >
            <article className={`quirk-pick-card ${toneClass(selectedQuirk.type)}`}>
              <div className="quirk-card-glow" aria-hidden="true" />
              <div className="quirk-pick-card-scroll">
              <p className="quirk-meta">
                <span
                  className="quirk-tier-scale"
                  role="group"
                  aria-label={meta.tier(selectedQuirk.tier)}
                >
                  {QUIRK_TIERS.map((tier) => (
                    <span
                      key={tier}
                      className={`quirk-tier-cell${tier === selectedQuirk.tier ? ' quirk-tier-cell-active' : ''}`}
                      aria-current={tier === selectedQuirk.tier ? 'true' : undefined}
                    >
                      {tier}
                    </span>
                  ))}
                </span>
                <span className="quirk-meta-sep" aria-hidden="true" />
                <span className="quirk-meta-type">{meta.type(selectedQuirk.type)}</span>
                <span className="quirk-meta-sep" aria-hidden="true" />
                <span className="quirk-meta-range">
                  <span className="quirk-meta-range-icon" aria-hidden="true" />
                  {meta.range(selectedQuirk.range)}
                </span>
              </p>
              <h2 className="quirk-pick-card-name">{selectedQuirk.name}</h2>
              <p className="quirk-pick-modal-description">{selectedQuirk.description}</p>
              <p className="quirk-pick-origin">
                <span>{t('advanced.origin')}:</span> {meta.origin(selectedQuirk.origin)}
              </p>
              </div>
              {selectedQuirk.facets.length > 0 ? (
                <div className="chip-row quirk-pick-facets">
                  {selectedQuirk.facets.map((facet) => (
                    <FacetChip key={facet} facet={facet} />
                  ))}
                </div>
              ) : null}
            </article>
            <div className="quirk-pick-modal-actions">
              <button
                type="button"
                className="manual-secondary-action"
                onClick={() => setSelectedQuirk(null)}
              >
                {t('manualPick.cancel')}
              </button>
              <button
                type="button"
                className="big-action manual-confirm-action"
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
