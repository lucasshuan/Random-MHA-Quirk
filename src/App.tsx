import { useMemo, useState } from 'react'
import './App.css'
import { FilterPanel } from './components/FilterPanel'
import { FusionPreview } from './components/FusionPreview'
import { QuirkCard } from './components/QuirkCard'
import { QuirkList } from './components/QuirkList'
import { quirks } from './data/quirks'
import { applyFilters, pickRandom, pickTwoDistinctRandom } from './lib/quirkEngine'
import { DEFAULT_QUIRK_FILTERS, type Quirk } from './types/quirk'

function App() {
  const [mode, setMode] = useState<'random' | 'manual'>('random')
  const [filters, setFilters] = useState(DEFAULT_QUIRK_FILTERS)
  const [singleRolled, setSingleRolled] = useState<Quirk | null>(null)
  const [randomFusionPair, setRandomFusionPair] = useState<[Quirk, Quirk] | null>(null)
  const [manualSelectedIds, setManualSelectedIds] = useState<string[]>([])

  const filteredQuirks = useMemo(() => applyFilters(quirks, filters), [filters])

  const activeFilterChips = useMemo(() => {
    return [
      ...filters.origins.map((value) => `origin:${value}`),
      ...filters.types.map((value) => `type:${value}`),
      ...filters.ranges.map((value) => `range:${value}`),
      ...filters.facets.map((value) => `facet:${value}`),
      ...(filters.query ? [`search:${filters.query}`] : []),
    ]
  }, [filters])

  const manualFusionPair = useMemo(() => {
    if (manualSelectedIds.length !== 2) {
      return null
    }

    const selectedQuirks = manualSelectedIds
      .map((id) => filteredQuirks.find((quirk) => quirk.id === id))
      .filter((value): value is Quirk => value !== undefined)

    return selectedQuirks.length === 2
      ? ([selectedQuirks[0], selectedQuirks[1]] as [Quirk, Quirk])
      : null
  }, [filteredQuirks, manualSelectedIds])

  const singleRollDisplay =
    singleRolled && filteredQuirks.some((quirk) => quirk.id === singleRolled.id)
      ? singleRolled
      : null
  const randomFusionDisplay =
    randomFusionPair &&
    filteredQuirks.some((quirk) => quirk.id === randomFusionPair[0].id) &&
    filteredQuirks.some((quirk) => quirk.id === randomFusionPair[1].id)
      ? randomFusionPair
      : null

  const fusionPair = mode === 'manual' ? manualFusionPair : randomFusionDisplay

  function handleToggleManualSelection(quirkId: string) {
    setManualSelectedIds((previous) => {
      if (previous.includes(quirkId)) {
        return previous.filter((id) => id !== quirkId)
      }

      if (previous.length < 2) {
        return [...previous, quirkId]
      }

      return [previous[1], quirkId]
    })
  }

  function handleRollSingle() {
    setSingleRolled(pickRandom(filteredQuirks))
  }

  function handleRollFusion() {
    setRandomFusionPair(pickTwoDistinctRandom(filteredQuirks))
  }

  function handleResetFilters() {
    setFilters(DEFAULT_QUIRK_FILTERS)
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Random MHA Quirk</p>
        <h1>Roll base quirks and preview fusion inputs</h1>
        <p className="hero-subtitle">
          Generate one random quirk or a two-quirk pair using optional filters and
          manual selection mode.
        </p>
      </header>

      <section className="panel controls">
        <div className="mode-toggle">
          <button
            type="button"
            className={mode === 'random' ? 'active' : ''}
            onClick={() => setMode('random')}
          >
            Random Mode
          </button>
          <button
            type="button"
            className={mode === 'manual' ? 'active' : ''}
            onClick={() => setMode('manual')}
          >
            Manual Mode
          </button>
        </div>

        <div className="action-row">
          <button type="button" onClick={handleRollSingle}>
            Roll Single Quirk
          </button>
          <button
            type="button"
            onClick={handleRollFusion}
            disabled={filteredQuirks.length < 2}
          >
            Roll Fusion Pair
          </button>
          <small>{filteredQuirks.length} quirks in current result set</small>
        </div>

        {activeFilterChips.length > 0 ? (
          <div className="chip-row">
            {activeFilterChips.map((chip) => (
              <span key={chip} className="chip chip-subtle">
                {chip}
              </span>
            ))}
          </div>
        ) : (
          <p className="muted">No active filters.</p>
        )}
      </section>

      <div className="layout-grid">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
        />

        <div className="content-column">
          <section className="panel">
            <h2>Single Roll Result</h2>
            {singleRollDisplay ? (
              <QuirkCard quirk={singleRollDisplay} />
            ) : (
              <p>Roll once to get a random quirk from the active result set.</p>
            )}
          </section>

          <FusionPreview pair={fusionPair} />

          {mode === 'manual' ? (
            <QuirkList
              quirks={filteredQuirks}
              selectedIds={manualSelectedIds}
              onToggleSelect={handleToggleManualSelection}
            />
          ) : (
            <section className="panel">
              <h2>Random Mode</h2>
              <p>
                Use the roll buttons to generate results. Switch to manual mode to
                pick exact quirks for fusion testing.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}

export default App
