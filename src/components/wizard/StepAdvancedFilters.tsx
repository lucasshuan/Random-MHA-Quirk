import { FilterPanel } from '../FilterPanel'
import { useI18n } from '../../i18n/useI18n'
import { translateMatches } from '../../i18n/translate'
import type { QuirkFilters } from '../../types/quirk'

interface StepAdvancedFiltersProps {
  filters: QuirkFilters
  filteredCount: number
  onChange: (filters: QuirkFilters) => void
  onReset: () => void
  onRoll: () => void
}

export function StepAdvancedFilters({
  filters,
  filteredCount,
  onChange,
  onReset,
  onRoll,
}: StepAdvancedFiltersProps) {
  const { locale, t } = useI18n()

  return (
    <div className="simple-step advanced-step">
      <p className="app-mark">{t('advanced.mark')}</p>
      <h1>{t('advanced.title')}</h1>
      <p className="mini-copy">{translateMatches(locale, filteredCount)}</p>
      <FilterPanel filters={filters} onChange={onChange} onReset={onReset} />
      <button
        type="button"
        className="big-action"
        onClick={onRoll}
        disabled={filteredCount === 0}
      >
        {t('advanced.roll')}
      </button>
    </div>
  )
}
