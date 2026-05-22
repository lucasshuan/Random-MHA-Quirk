import type { Quirk } from '../types/quirk'

interface QuirkListProps {
  quirks: Quirk[]
  selectedIds: string[]
  onToggleSelect: (quirkId: string) => void
}

export function QuirkList({ quirks, selectedIds, onToggleSelect }: QuirkListProps) {
  if (quirks.length === 0) {
    return (
      <section className="panel">
        <h2>Manual Selection</h2>
        <p>No quirks match the current filters.</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <h2>Manual Selection</h2>
      <p>Pick up to two quirks for fusion preview.</p>
      <div className="list-grid">
        {quirks.map((quirk) => {
          const isSelected = selectedIds.includes(quirk.id)
          return (
            <button
              key={quirk.id}
              type="button"
              className={`list-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggleSelect(quirk.id)}
            >
              <span>{quirk.name}</span>
              <small>
                {quirk.type} · {quirk.range}
              </small>
            </button>
          )
        })}
      </div>
    </section>
  )
}

