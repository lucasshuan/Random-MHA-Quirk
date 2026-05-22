import { FusionPreview } from '../FusionPreview'
import { QuirkCard } from '../QuirkCard'
import { QuirkList } from '../QuirkList'
import type { RollMode } from '@/lib/wizard/flow'
import type { Quirk } from '../../types/quirk'

interface StepActionProps {
  mode: RollMode
  filteredQuirks: Quirk[]
  singleResult: Quirk | null
  fusionPair: [Quirk, Quirk] | null
  selectedIds: string[]
  onToggleManual: (id: string) => void
  onRollSingle: () => void
  onRollFusion: () => void
}

export function StepAction({
  mode,
  filteredQuirks,
  singleResult,
  fusionPair,
  selectedIds,
  onToggleManual,
  onRollSingle,
  onRollFusion,
}: StepActionProps) {
  if (mode === 'random') {
    return (
      <div className="wizard-content">
        <h2>Roll your results</h2>
        <p>Generate one quirk and one fusion input pair before continuing.</p>

        <div className="action-buttons">
          <button type="button" className="btn btn-primary" onClick={onRollSingle}>
            Roll single quirk
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onRollFusion}
            disabled={filteredQuirks.length < 2}
          >
            Roll fusion pair
          </button>
        </div>

        <section className="nested-panel">
          <h3>Single result</h3>
          {singleResult ? (
            <QuirkCard quirk={singleResult} />
          ) : (
            <p>Roll a single quirk to continue.</p>
          )}
        </section>

        <FusionPreview pair={fusionPair} />
      </div>
    )
  }

  return (
    <div className="wizard-content">
      <h2>Select quirks manually</h2>
      <p>Pick one or two quirks from the filtered list.</p>
      <p className="status">Selected: {selectedIds.length}</p>
      <QuirkList
        quirks={filteredQuirks}
        selectedIds={selectedIds}
        onToggleSelect={onToggleManual}
      />
    </div>
  )
}

