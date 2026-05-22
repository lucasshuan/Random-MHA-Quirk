import { FusionPreview } from '../FusionPreview'
import { QuirkCard } from '../QuirkCard'
import type { RollMode } from '@/lib/wizard/flow'
import type { Quirk } from '../../types/quirk'

interface StepResultProps {
  mode: RollMode
  singleResult: Quirk | null
  fusionPair: [Quirk, Quirk] | null
  activeFilterChips: string[]
  onBackToFilters: () => void
}

export function StepResult({
  mode,
  singleResult,
  fusionPair,
  activeFilterChips,
  onBackToFilters,
}: StepResultProps) {
  return (
    <div className="wizard-content">
      <h2>Result summary</h2>
      <p>Mode: {mode === 'manual' ? 'Manual' : 'Random'}</p>

      <section className="nested-panel">
        <h3>Active filters</h3>
        {activeFilterChips.length > 0 ? (
          <div className="chip-row">
            {activeFilterChips.map((chip) => (
              <span key={chip} className="chip chip-subtle">
                {chip}
              </span>
            ))}
          </div>
        ) : (
          <p>No active filters.</p>
        )}
      </section>

      <section className="nested-panel">
        <h3>Single quirk</h3>
        {singleResult ? (
          <QuirkCard quirk={singleResult} />
        ) : (
          <p>No single quirk result in this run.</p>
        )}
      </section>

      <FusionPreview pair={fusionPair} />

      <div className="result-actions">
        <button type="button" className="btn btn-secondary" onClick={onBackToFilters}>
          Back to filters
        </button>
      </div>
    </div>
  )
}

