import type { ReactNode } from 'react'
import { WIZARD_STEPS, type WizardStep } from '@/lib/wizard/flow'

interface WizardFrameProps {
  step: WizardStep
  title: string
  description?: string
  children: ReactNode
  onBack: () => void
  onNext: () => void
  onRestart: () => void
  nextDisabled?: boolean
  nextLabel?: string
}

export function WizardFrame({
  step,
  title,
  description,
  children,
  onBack,
  onNext,
  onRestart,
  nextDisabled = false,
  nextLabel = 'Next',
}: WizardFrameProps) {
  const currentIndex = WIZARD_STEPS.indexOf(step)

  return (
    <main className="wizard-shell">
      <header className="wizard-hero">
        <p className="wizard-badge">My Hero Academia Lab</p>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </header>

      <section className="wizard-progress" aria-label="Wizard progress">
        {WIZARD_STEPS.map((item, index) => (
          <div key={item} className="progress-step-wrap">
            <div
              className={`progress-step ${
                index <= currentIndex ? 'progress-step-active' : ''
              }`}
            >
              {index + 1}
            </div>
            <span>{item}</span>
          </div>
        ))}
      </section>

      <section key={step} className="wizard-card wizard-anim">
        {children}
      </section>

      <footer className="wizard-footer">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onBack}
          disabled={step === 'mode'}
        >
          Back
        </button>
        <div className="footer-right">
          <button type="button" className="btn btn-ghost" onClick={onRestart}>
            Restart
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNext}
            disabled={nextDisabled || step === 'result'}
          >
            {step === 'result' ? 'Done' : nextLabel}
          </button>
        </div>
      </footer>
    </main>
  )
}

