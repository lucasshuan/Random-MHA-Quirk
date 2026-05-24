'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FacetChip } from '@/components/FacetChip'
import { LoadingScreen } from '@/components/LoadingScreen'
import { FilterPanel, MANUAL_PICK_ORIGIN_OPTIONS } from '@/components/FilterPanel'
import { SegmentTabs } from '@/components/SegmentTabs'
import { TierBadge, TierScale } from '@/components/TierScale'
import { MinimalFrame } from '@/components/wizard/MinimalFrame'
import { useFilteredQuirks, useQuirksCatalog } from '@/hooks/useQuirksCatalog'
import { useI18n } from '@/i18n/useI18n'
import { useMetaLabel } from '@/i18n/useMetaLabel'
import { translateMatches } from '@/i18n/translate'
import { fetchFusionCatalog } from '@/lib/fusion/api'
import { filterFusionEntries } from '@/lib/fusion/database-filters'
import { resolveFusionQuirk } from '@/lib/fusion/cache'
import { findQuirkInCatalog } from '@/lib/quirks/catalog-client-cache'
import type { FusionCacheEntry } from '@/types/fusion'
import {
  countAdvancedFilterSelections,
  DEFAULT_QUIRK_FILTERS,
  DEFAULT_TIER_PICKER_SELECTION,
  type Quirk,
  type QuirkFilters,
  type QuirkTier,
  type QuirkType,
} from '@/types/quirk'

type DatabaseTab = 'quirks' | 'hybrids'

const HYBRID_DATABASE_TIERS = DEFAULT_TIER_PICKER_SELECTION

function stripHybridDisallowedTiers(tiers: QuirkTier[]): QuirkTier[] {
  return tiers.filter((tier) =>
    (HYBRID_DATABASE_TIERS as readonly QuirkTier[]).includes(tier),
  )
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

function shortDescription(value: string, max = 96): string {
  if (value.length <= max) {
    return value
  }
  return `${value.slice(0, max - 1).trimEnd()}…`
}

export function DatabasePageApp() {
  const router = useRouter()
  const { locale, t } = useI18n()
  const meta = useMetaLabel()
  const { quirks: allQuirks } = useQuirksCatalog(locale)
  const [tab, setTab] = useState<DatabaseTab>('quirks')
  const [filters, setFilters] = useState<QuirkFilters>({ ...DEFAULT_QUIRK_FILTERS })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<QuirkFilters>({ ...DEFAULT_QUIRK_FILTERS })
  const [selectedQuirk, setSelectedQuirk] = useState<Quirk | null>(null)
  const [selectedHybrid, setSelectedHybrid] = useState<FusionCacheEntry | null>(null)
  const [fusionEntries, setFusionEntries] = useState<FusionCacheEntry[]>([])
  const [isFusionCatalogLoading, setIsFusionCatalogLoading] = useState(true)
  const [fusionCatalogError, setFusionCatalogError] = useState<string | null>(null)

  const filteredQuirks = useFilteredQuirks(allQuirks, locale, filters)
  const filteredHybrids = useMemo(
    () => filterFusionEntries(fusionEntries, filters, locale),
    [fusionEntries, filters, locale],
  )

  const selectedHybridFusion = useMemo(
    () => (selectedHybrid ? resolveFusionQuirk(selectedHybrid, locale) : null),
    [locale, selectedHybrid],
  )

  const activeCount = tab === 'quirks' ? filteredQuirks.length : filteredHybrids.length
  const activeFilterCount = useMemo(
    () => countAdvancedFilterSelections(filters, { includeTiers: true }),
    [filters],
  )

  const tabs = useMemo(
    () =>
      [
        { id: 'quirks' as const, label: t('database.tabQuirks') },
        { id: 'hybrids' as const, label: t('database.tabHybrids') },
      ] as const,
    [t],
  )

  const loadFusionCatalog = useCallback(async () => {
    setIsFusionCatalogLoading(true)
    setFusionCatalogError(null)

    try {
      const entries = await fetchFusionCatalog(locale)
      setFusionEntries(entries)
    } catch {
      setFusionCatalogError(t('database.hybridLoadError'))
      setFusionEntries([])
    } finally {
      setIsFusionCatalogLoading(false)
    }
  }, [locale, t])

  const openFiltersModal = useCallback(() => {
    setDraftFilters({
      ...filters,
      tiers: tab === 'hybrids' ? stripHybridDisallowedTiers(filters.tiers) : filters.tiers,
    })
    setFiltersOpen(true)
  }, [filters, tab])

  const dismissFiltersModal = useCallback(() => {
    setFiltersOpen(false)
  }, [])

  const applyDraftFilters = useCallback(() => {
    const tiers =
      tab === 'hybrids'
        ? stripHybridDisallowedTiers(draftFilters.tiers)
        : draftFilters.tiers
    setFilters((current) => ({
      ...current,
      origins: draftFilters.origins,
      tiers,
      types: draftFilters.types,
      ranges: draftFilters.ranges,
      facets: draftFilters.facets,
    }))
    setFiltersOpen(false)
  }, [draftFilters, tab])

  function handleTabChange(nextTab: DatabaseTab) {
    setTab(nextTab)
    if (nextTab === 'hybrids') {
      setFilters((current) => ({
        ...current,
        tiers: stripHybridDisallowedTiers(current.tiers),
      }))
    }
  }

  const resetDraftFilters = useCallback(() => {
    setDraftFilters((current) => ({
      ...current,
      origins: [],
      tiers: [],
      types: [],
      ranges: [],
      facets: [],
    }))
  }, [])

  useEffect(() => {
    void loadFusionCatalog()
  }, [loadFusionCatalog])

  function goHome() {
    router.push('/')
  }

  return (
    <MinimalFrame
      canGoBack
      showRestart={false}
      onBack={goHome}
      onRestart={goHome}
    >
      <div className="simple-step history-step database-step">
        <p className="app-mark">{t('database.mark')}</p>
        <h1>{t('database.title')}</h1>

        <div className="database-tabs-wrap">
          <SegmentTabs
            tabs={tabs}
            value={tab}
            onChange={handleTabChange}
            ariaLabel={t('database.tabs')}
            className="segment-tabs database-tabs"
            panelClassName="segment-tab-panel database-tab-panel"
            between={
              <section
                className="manual-pick-controls history-controls database-controls"
                aria-label={t('advanced.filters')}
              >
                <label className="search-input manual-search-input">
                  <input
                    type="search"
                    placeholder={t('database.searchPlaceholder')}
                    value={filters.query}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, query: event.target.value }))
                    }
                  />
                </label>
                <button
                  type="button"
                  className={`manual-filter-button${activeFilterCount > 0 ? ' manual-filter-button-has-count' : ''}`}
                  onClick={openFiltersModal}
                >
                  <span>{t('manualPick.advancedFilters')}</span>
                  {activeFilterCount > 0 ? (
                    <span className="manual-filter-count" aria-hidden="true">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>
              </section>
            }
          >
            {(activeTab) =>
              activeTab === 'quirks' ? (
                <div className="manual-pick-layout history-pick-layout">
                  <section className="panel inner-scroll-panel manual-quirk-panel history-list-panel">
                    <div className="manual-quirk-panel-heading">
                      <span>{translateMatches(locale, activeCount)}</span>
                    </div>
                    {filteredQuirks.length === 0 ? (
                      <p className="mini-copy">{t('database.emptyQuirks')}</p>
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
                              <TierBadge tier={quirk.tier} />
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
              ) : (
                <div className="manual-pick-layout history-pick-layout">
                  <section className="panel inner-scroll-panel manual-quirk-panel history-list-panel">
                    <div className="manual-quirk-panel-heading">
                      <span>{translateMatches(locale, activeCount)}</span>
                    </div>
                    {isFusionCatalogLoading ? (
                      <LoadingScreen label={t('database.hybridLoading')} embedded />
                    ) : fusionCatalogError ? (
                      <p className="mini-copy" role="alert">
                        {fusionCatalogError}
                      </p>
                    ) : filteredHybrids.length === 0 ? (
                      <p className="mini-copy">{t('database.emptyHybrids')}</p>
                    ) : (
                      <div className="manual-quirk-grid">
                        {filteredHybrids.map((entry) => {
                          const fusion = resolveFusionQuirk(entry, locale)
                          if (!fusion) {
                            return null
                          }

                          const parentA = findQuirkInCatalog(locale, entry.parents[0])
                          const parentB = findQuirkInCatalog(locale, entry.parents[1])
                          const parentAName = parentA?.name ?? entry.parents[0]
                          const parentBName = parentB?.name ?? entry.parents[1]

                          return (
                            <button
                              key={entry.key}
                              type="button"
                              className={`manual-quirk-card history-entry-card-hybrid ${toneClass(fusion.type)}`}
                              data-tier={fusion.tier}
                              onClick={() => setSelectedHybrid(entry)}
                            >
                              <span className="quirk-card-glow" aria-hidden="true" />
                              <span className="quirk-fusion-badge">Hybrid</span>
                              <p className="quirk-meta manual-quirk-meta">
                                <TierBadge tier={fusion.tier} />
                                <span className="quirk-meta-sep" aria-hidden="true" />
                                <span className="quirk-meta-type">{meta.type(fusion.type)}</span>
                              </p>
                              <h3 className="manual-quirk-name">{fusion.name}</h3>
                              <p className="manual-quirk-description">
                                {shortDescription(fusion.description, 72)}
                              </p>
                              <p className="hybrid-parent-tags" aria-label={t('database.hybridParents')}>
                                <span className="chip chip-muted hybrid-parent-tag">
                                  {shortDescription(parentAName, 24)}
                                </span>
                                <span className="hybrid-parent-sep" aria-hidden="true">
                                  +
                                </span>
                                <span className="chip chip-muted hybrid-parent-tag">
                                  {shortDescription(parentBName, 24)}
                                </span>
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )
            }
          </SegmentTabs>
        </div>
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
              originOptions={MANUAL_PICK_ORIGIN_OPTIONS}
              showTiers
              tierOptions={tab === 'hybrids' ? HYBRID_DATABASE_TIERS : undefined}
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
                  <TierScale tier={selectedQuirk.tier} />
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
            <div className="quirk-pick-modal-actions modal-actions-readonly">
              <button
                type="button"
                className="manual-secondary-action"
                onClick={() => setSelectedQuirk(null)}
              >
                {t('nav.back')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedHybrid && selectedHybridFusion ? (
        <div className="quirk-pick-modal-backdrop" onClick={() => setSelectedHybrid(null)}>
          <div
            className={`quirk-pick-modal ${toneClass(selectedHybridFusion.type)}`}
            role="dialog"
            aria-modal="true"
            aria-label={selectedHybridFusion.name}
            onClick={(event) => event.stopPropagation()}
          >
            <article className={`quirk-pick-card ${toneClass(selectedHybridFusion.type)}`}>
              <div className="quirk-card-glow" aria-hidden="true" />
              <div className="quirk-pick-card-scroll">
                <p className="quirk-meta">
                  <TierScale tier={selectedHybridFusion.tier} />
                  <span className="quirk-meta-sep" aria-hidden="true" />
                  <span className="quirk-meta-type">{meta.type(selectedHybridFusion.type)}</span>
                  <span className="quirk-meta-sep" aria-hidden="true" />
                  <span className="quirk-meta-range">
                    <span className="quirk-meta-range-icon" aria-hidden="true" />
                    {meta.range(selectedHybridFusion.range)}
                  </span>
                </p>
                <h2 className="quirk-pick-card-name">{selectedHybridFusion.name}</h2>
                <p className="quirk-pick-modal-description">{selectedHybridFusion.description}</p>
                <p className="quirk-pick-origin">
                  <span>{t('database.hybridParents')}:</span>{' '}
                  {findQuirkInCatalog(locale, selectedHybrid.parents[0])?.name ?? selectedHybrid.parents[0]}
                  {' + '}
                  {findQuirkInCatalog(locale, selectedHybrid.parents[1])?.name ?? selectedHybrid.parents[1]}
                </p>
              </div>
              {selectedHybridFusion.facets.length > 0 ? (
                <div className="chip-row quirk-pick-facets">
                  {selectedHybridFusion.facets.map((facet) => (
                    <FacetChip key={facet} facet={facet} />
                  ))}
                </div>
              ) : null}
            </article>
            <div className="quirk-pick-modal-actions modal-actions-readonly">
              <button
                type="button"
                className="manual-secondary-action"
                onClick={() => setSelectedHybrid(null)}
              >
                {t('nav.back')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </MinimalFrame>
  )
}
