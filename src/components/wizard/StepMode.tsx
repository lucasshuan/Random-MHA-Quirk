import type { RollMode } from '../../lib/wizardFlow'

interface StepModeProps {
  mode: RollMode
  onSelectMode: (next: Exclude<RollMode, null>) => void
}

export function StepMode({ mode, onSelectMode }: StepModeProps) {
  return (
    <div className="wizard-content">
      <h2>Choose your flow mode</h2>
      <p>Select how you want to generate the fusion inputs.</p>

      <div className="mode-cards">
        <button
          type="button"
          className={`mode-card ${mode === 'random' ? 'mode-card-active' : ''}`}
          onClick={() => onSelectMode('random')}
        >
          <strong>Random</strong>
          <span>Roll one quirk and a random pair from filters.</span>
        </button>
        <button
          type="button"
          className={`mode-card ${mode === 'manual' ? 'mode-card-active' : ''}`}
          onClick={() => onSelectMode('manual')}
        >
          <strong>Manual</strong>
          <span>Pick one or two quirks directly after filtering.</span>
        </button>
      </div>
    </div>
  )
}

