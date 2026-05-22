export const WIZARD_STEPS = [
  'start',
  'mode',
  'randomRoll',
  'type',
  'advanced',
  'result',
] as const

export type WizardStep = (typeof WIZARD_STEPS)[number]
export type ResultMode = 'single' | 'hybrid'
export type ModeChoice = 'solo' | 'hybrid' | 'random'
export type SimpleTypeChoice = 'Any' | 'Emitter' | 'Transformation' | 'Mutant'

export const HYBRID_RANDOM_CHANCE = 0.38

export function rollRandomOutcome(): ResultMode {
  return Math.random() < HYBRID_RANDOM_CHANCE ? 'hybrid' : 'single'
}
export type RollMode = 'random' | 'manual' | null

export interface StepValidationInput {
  step: WizardStep
  mode: ResultMode | null
  filteredCount: number
  hasResult: boolean
}

export function getNextStep(step: WizardStep): WizardStep {
  const index = WIZARD_STEPS.indexOf(step)
  const nextIndex = Math.min(index + 1, WIZARD_STEPS.length - 1)
  return WIZARD_STEPS[nextIndex]
}

export function getPreviousStep(step: WizardStep): WizardStep {
  const index = WIZARD_STEPS.indexOf(step)
  const previousIndex = Math.max(index - 1, 0)
  return WIZARD_STEPS[previousIndex]
}

export function canProceedFromStep(input: StepValidationInput): boolean {
  if (input.step === 'start') {
    return true
  }

  if (input.step === 'mode') {
    return input.mode !== null
  }

  if (input.step === 'type' || input.step === 'advanced') {
    return input.filteredCount > 0
  }

  if (input.step === 'result') {
    return input.hasResult
  }

  return false
}

