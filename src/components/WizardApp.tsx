import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n/useI18n'
import { buildQuirkSearchText } from '@/i18n/quirkSearchText'
import { MinimalFrame } from '@/components/wizard/MinimalFrame'
import { StepAdvancedFilters } from '@/components/wizard/StepAdvancedFilters'
import { BrandMark } from '@/components/wizard/BrandMark'
import { StepFinalResult } from '@/components/wizard/StepFinalResult'
import { StepManualPick } from '@/components/wizard/StepManualPick'
import { StepModeChoice } from '@/components/wizard/StepModeChoice'
import { StepRandomRoll } from '@/components/wizard/StepRandomRoll'
import { StepTierChoice } from '@/components/wizard/StepTierChoice'
import { StepTypeChoice } from '@/components/wizard/StepTypeChoice'
import { useFilteredQuirks, useQuirksCatalog } from '@/hooks/useQuirksCatalog'
import { requestFusionGeneration } from '@/lib/fusion/api'
import { randomFusionSeed } from '@/lib/fusion/keys'
import { rollHybrid } from '@/lib/hybrid/roll'
import { applyFilters, pickRandom } from '@/lib/quirks/engine'
import { ALL_QUIRK_TIERS } from '@/lib/quirks/tiers'
import {
  getPreviousStep,
  type ModeChoice,
  type ResultMode,
  type SimpleTypeChoice,
  type WizardStep,
} from '@/lib/wizard/flow'
import type { HybridRollResult } from '@/types/fusion'
import {
  DEFAULT_QUIRK_FILTERS,
  type Quirk,
  type QuirkFilters,
  type QuirkTier,
} from '@/types/quirk'

type RollResult = Quirk | HybridRollResult | null
type PickPhase = 'type' | 'tier' | 'manual'
type TierEntrySource = 'type' | 'advanced'

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

function slotFiltersForTierStep(
  base: QuirkFilters,
  type: SimpleTypeChoice,
  tiers: QuirkTier[],
  source: TierEntrySource,
): QuirkFilters {
  if (source === 'type') {
    return filtersForTypeAndTiers(type, tiers)
  }

  return {
    ...base,
    tiers,
  }
}

function isHybridRoll(result: RollResult): result is HybridRollResult {
  return result !== null && 'parents' in result
}

function hybridRollKey(result: HybridRollResult): string {
  return `${result.parents[0].id}+${result.parents[1].id}:${result.seed}`
}

export function WizardApp() {
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
  const [manualFilters, setManualFilters] = useState(defaultFilters)
  const [hybridTypeStep, setHybridTypeStep] = useState<0 | 1>(0)
  const [manualHybridParents, setManualHybridParents] = useState<[Quirk | null, Quirk | null]>([
    null,
    null,
  ])
  const [hybridTypes, setHybridTypes] = useState<[SimpleTypeChoice | null, SimpleTypeChoice | null]>(
    [null, null],
  )
  const [hybridSlotFilters, setHybridSlotFilters] = useState<[QuirkFilters, QuirkFilters]>([
    defaultFilters(),
    defaultFilters(),
  ])
  const [hybridReachedSecondType, setHybridReachedSecondType] = useState(false)
  const [tierEntrySource, setTierEntrySource] = useState<TierEntrySource>('type')
  const [fusionPhase, setFusionPhase] = useState<'idle' | 'generating' | 'error'>('idle')
  const [fusionError, setFusionError] = useState<string | null>(null)
  const generatingFusionKeyRef = useRef<string | null>(null)

  const { quirks: allQuirks } = useQuirksCatalog(locale)

  const searchableText = useCallback(
    (quirk: Quirk) => buildQuirkSearchText(quirk, locale),
    [locale],
  )

  const filteredQuirks = useFilteredQuirks(allQuirks, locale, filters)
  const manuallyFilteredQuirks = useFilteredQuirks(allQuirks, locale, manualFilters)
  const hybridPoolA = useFilteredQuirks(allQuirks, locale, hybridSlotFilters[0])
  const hybridPoolB = useFilteredQuirks(allQuirks, locale, hybridSlotFilters[1])

  function resetPickFlow() {
    setPickPhase('type')
    setPendingType(null)
    setSelectedTiers([...ALL_QUIRK_TIERS])
    setTierSlideDirection('forward')
    setManualFilters(defaultFilters())
    setHybridTypeStep(0)
    setManualHybridParents([null, null])
    setHybridTypes([null, null])
    setHybridSlotFilters([defaultFilters(), defaultFilters()])
    setHybridReachedSecondType(false)
    setTierEntrySource('type')
    setFusionPhase('idle')
    setFusionError(null)
    generatingFusionKeyRef.current = null
  }

  const tryGenerateFusion = useCallback(async (hybrid: HybridRollResult, force = false) => {
    if (hybrid.fusionEntry && !force) {
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
      const fusionEntry = await requestFusionGeneration(
        hybrid.parents[0].id,
        hybrid.parents[1].id,
        hybrid.seed,
        { force },
      )
      setResult((prev) => {
        if (!prev || !isHybridRoll(prev) || hybridRollKey(prev) !== key) {
          return prev
        }
        return { ...prev, fusionEntry }
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
  }, [])

  useEffect(() => {
    if (currentStep !== 'result' || mode !== 'hybrid') {
      return
    }
    if (!result || !isHybridRoll(result) || result.fusionEntry) {
      return
    }
    void tryGenerateFusion(result)
  }, [currentStep, mode, result, tryGenerateFusion])

  function setHybridRoll(hybrid: HybridRollResult | null) {
    setResult(hybrid)
    if (hybrid && !hybrid.fusionEntry) {
      setFusionPhase('generating')
      setFusionError(null)
    }
  }

  function handleRerollFusion() {
    if (!result || !isHybridRoll(result)) {
      return
    }

    const next: HybridRollResult = {
      parents: result.parents,
      seed: randomFusionSeed(),
      fusionEntry: null,
    }

    generatingFusionKeyRef.current = null
    setResult(next)
    setFusionPhase('generating')
    setFusionError(null)
    void tryGenerateFusion(next, true)
  }

  function rollFromCurrentSettings() {
    if (mode === 'hybrid' && hybridTypes[0] && hybridTypes[1]) {
      const poolA = hybridPoolA
      const poolB = hybridPoolB
      const firstParent = manualHybridParents[0] ?? pickRandom(poolA)
      const secondParent = manualHybridParents[1] ?? pickRandom(poolB)
      if (firstParent && secondParent) {
        setHybridRoll({
          parents: [firstParent, secondParent],
          seed: randomFusionSeed(),
          fusionEntry: null,
        })
      } else {
        setHybridRoll(rollHybrid(poolA, poolB, locale))
      }
      return
    }

    setResult(pickRandom(filteredQuirks))
  }

  function continueFromAdvanced() {
    setPendingType('Any')
    setSelectedTiers([...ALL_QUIRK_TIERS])
    setTierSlideDirection('forward')
    setTierEntrySource('advanced')
    setPickPhase('tier')
    setCurrentStep('type')
  }

  function goToTierStep(type: SimpleTypeChoice) {
    if (mode === 'hybrid') {
      if (hybridTypeStep === 0) {
        setManualHybridParents([null, manualHybridParents[1]])
      } else {
        setManualHybridParents([manualHybridParents[0], null])
      }
    }
    setPendingType(type)
    setSelectedTiers([...ALL_QUIRK_TIERS])
    setTierSlideDirection('forward')
    setTierEntrySource('type')
    setPickPhase('tier')
  }

  function finishTierStep(tiers: QuirkTier[]) {
    const type = pendingType ?? 'Any'
    const slotFilters = slotFiltersForTierStep(filters, type, tiers, tierEntrySource)

    if (mode === 'hybrid') {
      if (hybridTypeStep === 0) {
        setManualHybridParents([null, manualHybridParents[1]])
        setHybridTypes([type === 'Any' ? null : type, null])
        setHybridSlotFilters([slotFilters, hybridSlotFilters[1]])
        setHybridTypeStep(1)
        setHybridReachedSecondType(true)
        setPendingType(null)
        setPickPhase('type')
        return
      }

      const firstType = hybridTypes[0] ?? 'Any'
      const finalFilters: [QuirkFilters, QuirkFilters] = [hybridSlotFilters[0], slotFilters]
      setManualHybridParents([manualHybridParents[0], null])
      setHybridTypes([firstType, type === 'Any' ? null : type])
      setHybridSlotFilters(finalFilters)

      const poolB = applyFilters(allQuirks, finalFilters[1], { searchableText })
      const firstManual = manualHybridParents[0]
      if (firstManual) {
        const secondParent = pickRandom(poolB)
        setHybridRoll(
          secondParent
            ? {
                parents: [firstManual, secondParent],
                seed: randomFusionSeed(),
                fusionEntry: null,
              }
            : null,
        )
      } else {
        const poolA = applyFilters(allQuirks, finalFilters[0], { searchableText })
        setHybridRoll(rollHybrid(poolA, poolB, locale))
      }
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

  function handleManualPick(quirk: Quirk) {
    const slotFilters = filtersForTypeAndTiers(
      quirk.type,
      [quirk.tier],
    )

    if (mode === 'hybrid') {
      if (hybridTypeStep === 0) {
        setManualHybridParents([quirk, null])
        setHybridTypes([quirk.type, null])
        setHybridSlotFilters([slotFilters, hybridSlotFilters[1]])
        setPendingType(null)
        setHybridTypeStep(1)
        setHybridReachedSecondType(true)
        setPickPhase('type')
        return
      }

      const firstParent = manualHybridParents[0] ?? quirk
      const finalFilters: [QuirkFilters, QuirkFilters] = [hybridSlotFilters[0], slotFilters]
      setManualHybridParents([firstParent, quirk])
      setHybridTypes([firstParent.type, quirk.type])
      setHybridSlotFilters(finalFilters)
      setHybridRoll({
        parents: [firstParent, quirk],
        seed: randomFusionSeed(),
        fusionEntry: null,
      })
      setResultBackStep('type')
      setCurrentStep('result')
      return
    }

    setFilters(slotFilters)
    setResult(quirk)
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
      setPendingType(null)
      setTierEntrySource('type')
      setPickPhase('type')
      setCurrentStep('type')
      return
    }

    if (currentStep === 'type' && pickPhase === 'tier') {
      if (tierEntrySource === 'advanced') {
        setPendingType(null)
        setTierSlideDirection('back')
        setCurrentStep('advanced')
        return
      }
      setPickPhase('type')
      setTierSlideDirection('back')
      setPendingType(null)
      return
    }

    if (currentStep === 'type' && pickPhase === 'manual') {
      setPickPhase('type')
      return
    }

    if (currentStep === 'type' && pickPhase === 'type' && mode === 'hybrid' && hybridTypeStep === 1) {
      setHybridTypeStep(0)
      setManualHybridParents([manualHybridParents[0], null])
      setHybridTypes([hybridTypes[0], null])
      setPendingType(null)
      setPickPhase('type')
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
      if (pickPhase === 'manual') {
        return (
          <StepManualPick
            mode={mode}
            hybridStep={hybridTypeStep}
            filters={manualFilters}
            filteredQuirks={manuallyFilteredQuirks}
            onChangeFilters={setManualFilters}
            onSelectQuirk={handleManualPick}
          />
        )
      }

      return (
        <StepTypeChoice
          mode={mode}
          hybridStep={hybridTypeStep}
          hybridReachedSecondType={hybridReachedSecondType}
          onChoose={handleTypeChoice}
          onAdvancedOptions={() => setCurrentStep('advanced')}
          onChooseManual={() => setPickPhase('manual')}
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
          onContinue={continueFromAdvanced}
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
        onRetry={() => {
          rollFromCurrentSettings()
        }}
        onRetryFusion={handleRerollFusion}
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
