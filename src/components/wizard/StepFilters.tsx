import { FilterPanel } from '../FilterPanel'
import type { QuirkFilters } from '../../types/quirk'

interface StepFiltersProps {
  filters: QuirkFilters
  onChange: (filters: QuirkFilters) => void
  onReset: () => void
  filteredCount: number
}

export function StepFilters({
  filters,
  onChange,
  onReset,
  filteredCount,
}: StepFiltersProps) {
  return (
    <div className="wizard-content">
      <h2>Optional filters</h2>
      <p>
        Filters are optional, but they help shape the random pool. You can continue
        without selecting anything.
      </p>
      <p className={filteredCount === 0 ? 'status status-error' : 'status'}>
        Current matches: {filteredCount}
      </p>
      {filteredCount === 0 ? (
        <p className="status-help">No quirks match right now. Reset or relax filters.</p>
      ) : null}
      <FilterPanel filters={filters} onChange={onChange} onReset={onReset} />
    </div>
  )
}

