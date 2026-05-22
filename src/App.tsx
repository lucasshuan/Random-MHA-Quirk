import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from './i18n/useI18n'
import { buildQuirkSearchText } from './i18n/quirkSearchText'
import './App.css'
import { MinimalFrame } from './components/wizard/MinimalFrame'
import { StepAdvancedFilters } from './components/wizard/StepAdvancedFilters'
import { BrandMark } from './components/wizard/BrandMark'
import { StepFinalResult } from './components/wizard/StepFinalResult'
import { StepModeChoice } from './components/wizard/StepModeChoice'
import { StepRandomRoll } from './components/wizard/StepRandomRoll'
import { StepTierChoice } from './components/wizard/StepTierChoice'
import { StepTypeChoice } from './components/wizard/StepTypeChoice'
import { getQuirks } from './i18n/quirks'
import { ALL_QUIRK_TIERS } from './lib/tierPresets'
import { canGenerateFusionLive, requestFusionGeneration } from './lib/generateFusion'
import { rollHybrid } from './lib/hybridRoll'
import { applyFilters, pickRandom } from './lib/quirkEngine'
import {
  getPreviousStep,
  type ModeChoice,
  type ResultMode,
  type SimpleTypeChoice,
  type WizardStep,
} from './lib/wizardFlow'
import type { HybridRollResult } from './types/fusion'
import {
  DEFAULT_QUIRK_FILTERS,
  type Quirk,
  type QuirkFilters,
  type QuirkTier,
} from './types/quirk'

type RollResult = Quirk | HybridRollResult | null
type PickPhase = 'type' | 'tier'

function defaultFilters(): QuirkFilters {
  return { ...DEFAULT_QUIRK_FILTERS }
}

function filtersForTypeAndTiers(
  type: SimpleTypeChoice,
  tiers: QuirkTier[],
): QuirkFilters {
  return {
    ...DEFAULT_QUIRK_FILTERS,
    types: type === 'Any' ? [] : [type],
    tiers,
  }
}

function isHybridRoll(result: RollResult): result is HybridRollResult {
  return result !== null && 'parents' in result
}

function hybridRollKey(result: HybridRollResult): string {
  return `${result.parents[0].id}+${result.parents[1].id}:${result.seed}`
}

function App() {
  const { locale, t } = useI18n()
  const [currentStep, setCurrentStep] = useState<WizardStep>('start')
  const [mode, setMode] = useState<ResultMode>('single')
  const [filters, setFilters] = useState(defaultFilters)
  const [result, setResult] = useState<RollResult>(null)
  const [resultBackStep, setResultBackStep] = useState<WizardStep>('type')
  const [pickPhase, setPickPhase] = useState<PickPhase>('type')
  const [pendingType, setPendingType] = useState<SimpleTypeChoice | null>(null)
  const [selectedTiers, setSelectedTiers] = useState<QuirkTier[]>([...ALL_QUIRK_TIERS])
  const [tierSlideDirection, setTierSlideDirection] = useState<'forward' | 'back'>('forward')
  const [hybridTypeStep, setHybridTypeStep] = useState<0 | 1>(0)
  const [hybridTypes, setHybridTypes] = useState<[SimpleTypeChoice | null, SimpleTypeChoice | null]>(
    [null, null],
  )
  const [hybridSlotFilters, setHybridSlotFilters] = useState<[QuirkFilters, QuirkFilters]>([
    defaultFilters(),
    defaultFilters(),
  ])
  const [hybridReachedSecondType, setHybridReachedSecondType] = useState(false)
  const [fusionPhase, setFusionPhase] = useState<'idle' | 'generating' | 'error'>('idle')
  const [fusionError, setFusionError] = useState<string | null>(null)
  const generatingFusionKeyRef = useRef<string | null>(null)

  const allQuirks = useMemo(() => getQuirks(locale), [locale])

  const searchableText = useCallback(
    (quirk: Quirk) => buildQuirkSearchText(quirk, locale),
    [locale],
  )

  const filteredQuirks = useMemo(
    () => applyFilters(allQuirks, filters, { searchableText }),
    [allQuirks, filters, searchableText],
  )

  function resetPickFlow() {
    setPickPhase('type')
    setPendingType(null)
    setSelectedTiers([...ALL_QUIRK_TIERS])
    setTierSlideDirection('forward')
    setHybridTypeStep(0)
    setHybridTypes([null, null])
    setHybridSlotFilters([defaultFilters(), defaultFilters()])
    setHybridReachedSecondType(false)
    setFusionPhase('idle')
    setFusionError(null)
    generatingFusionKeyRef.current = null
  }

  const tryGenerateFusion = useCallback(
    async (hybrid: HybridRollResult, force = false) => {
      if (!canGenerateFusionLive() || hybrid.fusion) {
        return
      }

      const key = hybridRollKey(hybrid)
      if (!force && generatingFusionKeyRef.current === key) {
        return
      }

      generatingFusionKeyRef.current = key
      setFusionPhase('generating')
      setFusionError(null)

      try {
        const fusion = await requestFusionGeneration(
          hybrid.parents[0].id,
          hybrid.parents[1].id,
          hybrid.seed,
          locale,
          { force },
        )
        setResult((prev) => {
          if (!prev || !isHybridRoll(prev) || hybridRollKey(prev) !== key) {
            return prev
          }
          return { ...prev, fusion }
        })
        setFusionPhase('idle')
      } catch (err) {
        setFusionError(err instanceof Error ? err.message : String(err))
        setFusionPhase('error')
      } finally {
        if (generatingFusionKeyRef.current === key) {
          generatingFusionKeyRef.current = null
        }
      }
    },
    [locale],
  )

  useEffect(() => {
    if (currentStep !== 'result' || mode !== 'hybrid') {
      return
    }
    if (!result || !isHybridRoll(result) || result.fusion) {
      return
    }
    void tryGenerateFusion(result)
  }, [currentStep, mode, result, tryGenerateFusion])

  function setHybridRoll(hybrid: HybridRollResult | null) {
    setResult(hybrid)
    if (hybrid && !hybrid.fusion && canGenerateFusionLive()) {
      setFusionPhase('generating')
      setFusionError(null)
    }
  }

  function rollFromCurrentSettings() {
    if (mode === 'hybrid' && hybridTypes[0] && hybridTypes[1]) {
      const poolA = applyFilters(allQuirks, hybridSlotFilters[0], { searchableText })
      const poolB = applyFilters(allQuirks, hybridSlotFilters[1], { searchableText })
      setHybridRoll(rollHybrid(poolA, poolB, locale))
      return
    }

    setResult(pickRandom(filteredQuirks))
  }

  function rollWithSettings() {
    rollFromCurrentSettings()
    setResultBackStep('advanced')
    setCurrentStep('result')
  }

  function goToTierStep(type: SimpleTypeChoice) {
    setPendingType(type)
    setSelectedTiers([...ALL_QUIRK_TIERS])
    setTierSlideDirection('forward')
    setPickPhase('tier')
  }

  function finishTierStep(tiers: QuirkTier[]) {
    const type = pendingType ?? 'Any'
    const slotFilters = filtersForTypeAndTiers(type, tiers)

    if (mode === 'hybrid') {
      if (hybridTypeStep === 0) {
        setHybridTypes([type, null])
        setHybridSlotFilters([slotFilters, hybridSlotFilters[1]])
        setHybridTypeStep(1)
        setHybridReachedSecondType(true)
        setPendingType(null)
        setPickPhase('type')
        return
      }

      const firstType = hybridTypes[0] ?? 'Any'
      const finalFilters: [QuirkFilters, QuirkFilters] = [hybridSlotFilters[0], slotFilters]
      setHybridTypes([firstType, type])
      setHybridSlotFilters(finalFilters)

      const poolA = applyFilters(allQuirks, finalFilters[0], { searchableText })
      const poolB = applyFilters(allQuirks, finalFilters[1], { searchableText })
      setHybridRoll(rollHybrid(poolA, poolB, locale))
      setResultBackStep('type')
      setCurrentStep('result')
      return
    }

    setFilters(slotFilters)
    const nextPool = applyFilters(allQuirks, slotFilters, { searchableText })
    setResult(pickRandom(nextPool))
    setResultBackStep('type')
    setCurrentStep('result')
  }

  function handleModeChoice(choice: ModeChoice) {
    setResult(null)
    resetPickFlow()
    setFilters(defaultFilters())

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
    resetPickFlow()
    setFilters(defaultFilters())
    setCurrentStep('type')
  }

  function handleTypeChoice(type: SimpleTypeChoice) {
    goToTierStep(type)
  }

  function handleTierAdvance() {
    finishTierStep(selectedTiers)
  }

  function handleRestart() {
    setCurrentStep('start')
    setMode('single')
    setFilters(defaultFilters())
    setResult(null)
    setResultBackStep('type')
    resetPickFlow()
  }

  function handleBack() {
    if (currentStep === 'advanced') {
      setPickPhase(pendingType ? 'tier' : 'type')
      setTierSlideDirection('back')
      setCurrentStep('type')
      return
    }

    if (currentStep === 'type' && pickPhase === 'tier') {
      setPickPhase('type')
      setTierSlideDirection('back')
      setPendingType(null)
      return
    }

    if (currentStep === 'type' && pickPhase === 'type' && mode === 'hybrid' && hybridTypeStep === 1) {
      setHybridTypeStep(0)
      setHybridTypes([hybridTypes[0], null])
      setPendingType(hybridTypes[0])
      setSelectedTiers(
        hybridSlotFilters[0].tiers.length > 0
          ? [...hybridSlotFilters[0].tiers]
          : [...ALL_QUIRK_TIERS],
      )
      setPickPhase('tier')
      setTierSlideDirection('back')
      return
    }

    if (currentStep === 'type') {
      resetPickFlow()
      setCurrentStep('mode')
      return
    }

    setCurrentStep((step) => (step === 'result' ? resultBackStep : getPreviousStep(step)))
  }

  function handleResetFilters() {
    setFilters(defaultFilters())
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
      if (pickPhase === 'tier') {
        return (
          <StepTierChoice
            mode={mode}
            hybridStep={hybridTypeStep}
            slideDirection={tierSlideDirection}
            selectedTiers={selectedTiers}
            onSelectedTiersChange={setSelectedTiers}
            onAdvance={handleTierAdvance}
          />
        )
      }

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
        fusionPhase={fusionPhase}
        fusionError={fusionError}
        canGenerateFusionLive={canGenerateFusionLive()}
        onRetry={() => {
          rollFromCurrentSettings()
        }}
        onRetryFusion={() => {
          if (result && isHybridRoll(result)) {
            void tryGenerateFusion(result, true)
          }
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
