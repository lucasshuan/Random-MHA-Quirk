'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/LoadingScreen'
import { FilterPanel, MANUAL_PICK_ORIGIN_OPTIONS } from '@/components/FilterPanel'
import { QuirkDetailModal } from '@/components/QuirkDetailModal'
import { QuirkListFooter } from '@/components/QuirkListFooter'
import { SegmentTabs } from '@/components/SegmentTabs'
import { TierBadge } from '@/components/TierScale'
import { MinimalFrame } from '@/components/wizard/MinimalFrame'
import { usePaginatedFusionList } from '@/hooks/usePaginatedFusionList'
import { usePaginatedQuirkList } from '@/hooks/usePaginatedQuirkList'
import { useI18n } from '@/i18n/useI18n'
import { useMetaLabel } from '@/i18n/useMetaLabel'
import { resolveFusionQuirk } from '@/lib/fusion/cache'
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
  const [tab, setTab] = useState<DatabaseTab>('quirks')
  const [filters, setFilters] = useState<QuirkFilters>({ ...DEFAULT_QUIRK_FILTERS })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<QuirkFilters>({ ...DEFAULT_QUIRK_FILTERS })
  const [selectedQuirk, setSelectedQuirk] = useState<Quirk | null>(null)
  const [selectedHybrid, setSelectedHybrid] = useState<FusionCacheEntry | null>(null)

  const quirksList = usePaginatedQuirkList(locale, filters, {
    enabled: tab === 'quirks',
  })
  const hybridsList = usePaginatedFusionList(locale, filters, {
    enabled: tab === 'hybrids',
  })

  const selectedHybridFusion = useMemo(
    () => (selectedHybrid ? resolveFusionQuirk(selectedHybrid, locale) : null),
    [locale, selectedHybrid],
  )

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

  function goHome() {
    router.push('/')
  }

  function renderQuirksPanel() {
    const { quirks, total, page, pageCount, pageSize, setPage, isLoading, error } = quirksList

    return (
      <div className="manual-pick-layout history-pick-layout">
        <section className="panel inner-scroll-panel manual-quirk-panel history-list-panel">
          <div className="manual-quirk-panel-body">
            {isLoading ? (
              <LoadingScreen label={t('quirks.loading')} embedded />
            ) : error ? (
              <p className="mini-copy" role="alert">
                {error}
              </p>
            ) : quirks.length === 0 ? (
              <p className="mini-copy">{t('database.emptyQuirks')}</p>
            ) : (
              <div className="manual-quirk-grid">
                {quirks.map((quirk) => (
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
          </div>
          <QuirkListFooter
            total={total}
            page={page}
            pageSize={pageSize}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </section>
      </div>
    )
  }

  function renderHybridsPanel() {
    const {
      entries,
      parentName,
      total,
      page,
      pageCount,
      pageSize,
      setPage,
      isLoading,
      error,
    } = hybridsList

    return (
      <div className="manual-pick-layout history-pick-layout">
        <section className="panel inner-scroll-panel manual-quirk-panel history-list-panel">
          <div className="manual-quirk-panel-body">
            {isLoading ? (
              <LoadingScreen label={t('database.hybridLoading')} embedded />
            ) : error ? (
              <p className="mini-copy" role="alert">
                {error}
              </p>
            ) : entries.length === 0 ? (
              <p className="mini-copy">{t('database.emptyHybrids')}</p>
            ) : (
              <div className="manual-quirk-grid">
                {entries.map((entry) => {
                const fusion = resolveFusionQuirk(entry, locale)
                if (!fusion) {
                  return null
                }

                const parentAName = parentName(entry.parents[0]) ?? entry.parents[0]
                const parentBName = parentName(entry.parents[1]) ?? entry.parents[1]

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
          </div>
          <QuirkListFooter
            total={total}
            page={page}
            pageSize={pageSize}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </section>
      </div>
    )
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
            {(activeTab) => (activeTab === 'quirks' ? renderQuirksPanel() : renderHybridsPanel())}
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
        <QuirkDetailModal quirk={selectedQuirk} onClose={() => setSelectedQuirk(null)} />
      ) : null}

      {selectedHybridFusion ? (
        <QuirkDetailModal
          quirk={selectedHybridFusion}
          onClose={() => setSelectedHybrid(null)}
        />
      ) : null}
    </MinimalFrame>
  )
}
