import { useCallback, useMemo, useState } from 'react'
import { useI18n } from './i18n/useI18n'
import { buildQuirkSearchText } from './i18n/quirkSearchText'
import './App.css'
import { MinimalFrame } from './components/wizard/MinimalFrame'
import { StepAdvancedFilters } from './components/wizard/StepAdvancedFilters'
import { BrandMark } from './components/wizard/BrandMark'
import { StepFinalResult } from './components/wizard/StepFinalResult'
import { StepModeChoice } from './components/wizard/StepModeChoice'
import { StepRandomRoll } from './components/wizard/StepRandomRoll'
import { StepTypeChoice } from './components/wizard/StepTypeChoice'
import { getQuirks } from './i18n/quirks'
import {
  applyFilters,
  pickHybridPair,
  pickRandom,
  pickTwoDistinctRandom,
} from './lib/quirkEngine'
import {
  getPreviousStep,
  type ModeChoice,
  type ResultMode,
  type SimpleTypeChoice,
  type WizardStep,
} from './lib/wizardFlow'
import { DEFAULT_QUIRK_FILTERS, type Quirk, type QuirkFilters } from './types/quirk'

type RollResult = Quirk | [Quirk, Quirk] | null

function filtersForType(type: SimpleTypeChoice): QuirkFilters {
  return {
    ...DEFAULT_QUIRK_FILTERS,
    types: type === 'Any' ? [] : [type],
  }
}

function App() {
  const { locale, t } = useI18n()
  const [currentStep, setCurrentStep] = useState<WizardStep>('start')
  const [mode, setMode] = useState<ResultMode>('single')
  const [filters, setFilters] = useState(DEFAULT_QUIRK_FILTERS)
  const [result, setResult] = useState<RollResult>(null)
  const [resultBackStep, setResultBackStep] = useState<WizardStep>('type')
  const [hybridTypeStep, setHybridTypeStep] = useState<0 | 1>(0)
  const [hybridTypes, setHybridTypes] = useState<[SimpleTypeChoice | null, SimpleTypeChoice | null]>(
    [null, null],
  )
  const [hybridReachedSecondType, setHybridReachedSecondType] = useState(false)

  const allQuirks = useMemo(() => getQuirks(locale), [locale])

  const searchableText = useCallback(
    (quirk: Quirk) => buildQuirkSearchText(quirk, locale),
    [locale],
  )

  const filteredQuirks = useMemo(
    () => applyFilters(allQuirks, filters, { searchableText }),
    [allQuirks, filters, searchableText],
  )

  function mergeTypeWithFilters(type: SimpleTypeChoice, userFilters: QuirkFilters): QuirkFilters {
    const typeFilters = filtersForType(type)
    return {
      ...userFilters,
      types: typeFilters.types.length > 0 ? typeFilters.types : userFilters.types,
    }
  }

  function rollFromCurrentSettings() {
    if (mode === 'hybrid' && hybridTypes[0] && hybridTypes[1]) {
      const poolA = applyFilters(allQuirks, mergeTypeWithFilters(hybridTypes[0], filters), {
        searchableText,
      })
      const poolB = applyFilters(allQuirks, mergeTypeWithFilters(hybridTypes[1], filters), {
        searchableText,
      })
      setResult(pickHybridPair(poolA, poolB))
      return
    }

    setResult(mode === 'hybrid' ? pickTwoDistinctRandom(filteredQuirks) : pickRandom(filteredQuirks))
  }

  function rollWithSettings() {
    rollFromCurrentSettings()
    setResultBackStep('advanced')
    setCurrentStep('result')
  }

  function handleModeChoice(choice: ModeChoice) {
    setResult(null)
    setHybridTypeStep(0)
    setHybridTypes([null, null])
    setHybridReachedSecondType(false)
    setFilters(DEFAULT_QUIRK_FILTERS)

    if (choice === 'random') {
      setCurrentStep('randomRoll')
      return
    }

    const nextMode: ResultMode = choice === 'hybrid' ? 'hybrid' : 'single'
    setMode(nextMode)
    setCurrentStep('type')
  }

  function handleRandomRollComplete(outcome: ResultMode) {
    setMode(outcome)
    setHybridTypeStep(0)
    setHybridTypes([null, null])
    setHybridReachedSecondType(false)
    setCurrentStep('type')
  }

  function handleTypeChoice(type: SimpleTypeChoice) {
    if (mode === 'hybrid') {
      if (hybridTypeStep === 0) {
        setHybridTypes([type, null])
        setHybridTypeStep(1)
        setHybridReachedSecondType(true)
        return
      }

      const firstType = hybridTypes[0] ?? 'Any'
      const poolA = applyFilters(allQuirks, mergeTypeWithFilters(firstType, filters), {
        searchableText,
      })
      const poolB = applyFilters(allQuirks, mergeTypeWithFilters(type, filters), {
        searchableText,
      })
      setHybridTypes([firstType, type])
      setResult(pickHybridPair(poolA, poolB))
      setResultBackStep('type')
      setCurrentStep('result')
      return
    }

    const nextFilters = filtersForType(type)
    const nextPool = applyFilters(allQuirks, nextFilters)
    setFilters(nextFilters)
    setResult(pickRandom(nextPool))
    setResultBackStep('type')
    setCurrentStep('result')
  }

  function handleRestart() {
    setCurrentStep('start')
    setMode('single')
    setFilters(DEFAULT_QUIRK_FILTERS)
    setResult(null)
    setResultBackStep('type')
    setHybridTypeStep(0)
    setHybridTypes([null, null])
    setHybridReachedSecondType(false)
  }

  function handleBack() {
    if (currentStep === 'advanced') {
      setCurrentStep('type')
      return
    }

    if (currentStep === 'type' && mode === 'hybrid' && hybridTypeStep === 1) {
      setHybridTypeStep(0)
      setHybridTypes([hybridTypes[0], null])
      return
    }

    if (currentStep === 'type') {
      setHybridTypeStep(0)
      setHybridTypes([null, null])
      setHybridReachedSecondType(false)
      setCurrentStep('mode')
      return
    }

    setCurrentStep((step) => (step === 'result' ? resultBackStep : getPreviousStep(step)))
  }

  function handleResetFilters() {
    setFilters(DEFAULT_QUIRK_FILTERS)
  }

  function renderStep() {
    if (currentStep === 'start') {
      return (
        <div className="simple-step start-step">
          <BrandMark />
          <h1>{t('start.title')}</h1>
          <button type="button" className="big-action" onClick={() => setCurrentStep('mode')}>
            {t('start.action')}
          </button>
        </div>
      )
    }

    if (currentStep === 'mode') {
      return <StepModeChoice onChoose={handleModeChoice} />
    }

    if (currentStep === 'randomRoll') {
      return <StepRandomRoll onComplete={handleRandomRollComplete} />
    }

    if (currentStep === 'type') {
      return (
        <StepTypeChoice
          mode={mode}
          hybridStep={hybridTypeStep}
          hybridReachedSecondType={hybridReachedSecondType}
          onChoose={handleTypeChoice}
          onAdvanced={() => setCurrentStep('advanced')}
        />
      )
    }

    if (currentStep === 'advanced') {
      return (
        <StepAdvancedFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          filteredCount={filteredQuirks.length}
          onRoll={rollWithSettings}
        />
      )
    }

    return (
      <StepFinalResult
        mode={mode}
        result={result}
        flickerNames={allQuirks.map((quirk) => quirk.name)}
        onRetry={() => {
          rollFromCurrentSettings()
        }}
        onBack={handleBack}
        onRestart={handleRestart}
      />
    )
  }

  return (
    <MinimalFrame
      canGoBack={currentStep !== 'start' && currentStep !== 'randomRoll'}
      showRestart={currentStep !== 'start' && currentStep !== 'randomRoll'}
      onBack={handleBack}
      onRestart={handleRestart}
    >
      {renderStep()}
    </MinimalFrame>
  )
}

export default App
