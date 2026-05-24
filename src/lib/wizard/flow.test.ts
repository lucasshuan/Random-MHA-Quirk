import { describe, expect, it } from 'vitest'
import {
  canProceedFromStep,
  getNextStep,
  getPreviousStep,
  type StepValidationInput,
} from './flow'

function buildValidationInput(
  override: Partial<StepValidationInput>,
): StepValidationInput {
  return {
    step: 'mode',
    mode: null,
    filteredCount: 1,
    hasResult: false,
    ...override,
  }
}

describe('wizardFlow navigation', () => {
  it('advances and retreats through fixed step order', () => {
    expect(getNextStep('mode')).toBe('randomRoll')
    expect(getNextStep('type')).toBe('advanced')
    expect(getNextStep('result')).toBe('result')
    expect(getPreviousStep('result')).toBe('advanced')
    expect(getPreviousStep('randomRoll')).toBe('mode')
    expect(getPreviousStep('mode')).toBe('mode')
  })
})

describe('wizardFlow validation', () => {
  it('requires mode selection on mode step', () => {
    expect(canProceedFromStep(buildValidationInput({ step: 'mode', mode: null }))).toBe(
      false,
    )
    expect(
      canProceedFromStep(buildValidationInput({ step: 'mode', mode: 'single' })),
    ).toBe(true)
  })

  it('requires non-empty filtered set before rolling', () => {
    expect(
      canProceedFromStep(buildValidationInput({ step: 'type', filteredCount: 0 })),
    ).toBe(false)
    expect(
      canProceedFromStep(buildValidationInput({ step: 'advanced', filteredCount: 4 })),
    ).toBe(true)
  })

  it('requires a final result on result step', () => {
    expect(
      canProceedFromStep(
        buildValidationInput({
          step: 'result',
          mode: 'single',
          hasResult: false,
        }),
      ),
    ).toBe(false)

    expect(
      canProceedFromStep(
        buildValidationInput({
          step: 'result',
          mode: 'hybrid',
          hasResult: true,
        }),
      ),
    ).toBe(true)
  })
})

