import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n/useI18n'
import type { Locale } from '@/i18n/types'
import { buildQuirkSearchText } from '@/i18n/quirkSearchText'
import { MinimalFrame } from '@/components/wizard/MinimalFrame'
import { StepAdvancedFilters } from '@/components/wizard/StepAdvancedFilters'
import { StepFinalResult } from '@/components/wizard/StepFinalResult'
import { StepManualPick } from '@/components/wizard/StepManualPick'
import { StepModeChoice } from '@/components/wizard/StepModeChoice'
import { StepRandomRoll } from '@/components/wizard/StepRandomRoll'
import { StepTierChoice } from '@/components/wizard/StepTierChoice'
import { StepTypeChoice } from '@/components/wizard/StepTypeChoice'
import { useLocaleSwitchGuard } from '@/hooks/useLocaleSwitchGuard'
import { ensureQuirksCatalog, useFilteredQuirks, useQuirksCatalog } from '@/hooks/useQuirksCatalog'
import { resolveApiErrorMessage } from '@/lib/api/resolve-error'
import { requestFusionGeneration } from '@/lib/fusion/api'
import { randomFusionSeed } from '@/lib/fusion/keys'
import {
  patchHybridHistoryFusion,
  pushHybridHistoryEntry,
  pushSingleHistoryEntry,
} from '@/lib/history/store'
import { shareHybridPath, shareQuirkPath } from '@/lib/share/paths'
import { rerollHybridFromSettings } from '@/lib/hybrid/reroll-from-settings'
import { rollHybrid } from '@/lib/hybrid/roll'
import { applyFilters, pickRandom } from '@/lib/quirks/engine'
import {
  saveHybridRollSession,
  type HybridRollSessionSettings,
} from '@/lib/wizard/hybrid-roll-session'
import {
  clearWizardNavigationSession,
  consumeWizardNavigationRestore,
  saveWizardNavigationForShare,
  type WizardNavigationSnapshot,
} from '@/lib/wizard/wizard-navigation-session'
import { DEFAULT_SELECTED_TIERS } from '@/lib/quirks/tiers'
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
import type { QuirkId } from '@/types/quirk-id'

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

function buildSharePath(result: RollResult): string | null {
  if (!result) {
    return null
  }

  if (isHybridRoll(result)) {
    return shareHybridPath(
      result.parents[0].id,
      result.parents[1].id,
      result.seed,
    )
  }

  return shareQuirkPath(result.id)
}

interface WizardAppProps {
  initialStep?: WizardStep
  onExitStart?: () => void
}

export function WizardApp({
  initialStep = 'mode',
  onExitStart,
}: WizardAppProps = {}) {
  const router = useRouter()
  const { locale, t } = useI18n()
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep)
  const [mode, setMode] = useState<ResultMode>('single')
  const [filters, setFilters] = useState(defaultFilters)
  const [result, setResult] = useState<RollResult>(null)
  const [resultBackStep, setResultBackStep] = useState<WizardStep>('type')
  const [pickPhase, setPickPhase] = useState<PickPhase>('type')
  const [pendingType, setPendingType] = useState<SimpleTypeChoice | null>(null)
  const [selectedTiers, setSelectedTiers] = useState<QuirkTier[]>([
    ...DEFAULT_SELECTED_TIERS,
  ])
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
  const restoredNavigationRef = useRef(false)
  const pendingNavigationRestoreRef = useRef<WizardNavigationSnapshot | null>(null)

  const { quirks: allQuirks } = useQuirksCatalog(locale)

  function manualParentsFromIds(
    ids: [QuirkId | null, QuirkId | null],
  ): [Quirk | null, Quirk | null] {
    return [
      ids[0] ? allQuirks.find((quirk) => quirk.id === ids[0]) ?? null : null,
      ids[1] ? allQuirks.find((quirk) => quirk.id === ids[1]) ?? null : null,
    ]
  }

  function buildNavigationSnapshot(): WizardNavigationSnapshot {
    return {
      returnStep: resultBackStep,
      mode,
      filters,
      resultBackStep,
      pickPhase,
      pendingType,
      selectedTiers,
      tierSlideDirection,
      manualFilters,
      hybridTypeStep,
      manualParentIds: [
        manualHybridParents[0]?.id ?? null,
        manualHybridParents[1]?.id ?? null,
      ],
      hybridTypes,
      hybridSlotFilters,
      hybridReachedSecondType,
      tierEntrySource,
    }
  }

  function applyNavigationSnapshot(snapshot: WizardNavigationSnapshot) {
    setMode(snapshot.mode)
    setFilters(snapshot.filters)
    setResult(null)
    setResultBackStep(snapshot.resultBackStep)
    setPickPhase(snapshot.pickPhase)
    setPendingType(snapshot.pendingType)
    setSelectedTiers([...snapshot.selectedTiers])
    setTierSlideDirection(snapshot.tierSlideDirection)
    setManualFilters(snapshot.manualFilters)
    setHybridTypeStep(snapshot.hybridTypeStep)
    setManualHybridParents(manualParentsFromIds(snapshot.manualParentIds))
    setHybridTypes(snapshot.hybridTypes)
    setHybridSlotFilters(snapshot.hybridSlotFilters)
    setHybridReachedSecondType(snapshot.hybridReachedSecondType)
    setTierEntrySource(snapshot.tierEntrySource)
    setFusionPhase('idle')
    setFusionError(null)
    generatingFusionKeyRef.current = null
    setCurrentStep(snapshot.returnStep)
  }

  useEffect(() => {
    if (!restoredNavigationRef.current) {
      restoredNavigationRef.current = true
      pendingNavigationRestoreRef.current = consumeWizardNavigationRestore()
    }

    const snapshot = pendingNavigationRestoreRef.current
    if (!snapshot || allQuirks.length === 0) {
      return
    }

    applyNavigationSnapshot(snapshot)
    pendingNavigationRestoreRef.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allQuirks])

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
    setSelectedTiers([...DEFAULT_SELECTED_TIERS])
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
      patchHybridHistoryFusion(
        hybrid.parents[0].id,
        hybrid.parents[1].id,
        hybrid.seed,
        fusionEntry,
        locale,
      )
      setFusionPhase('idle')
    } catch (err) {
      setFusionError(resolveApiErrorMessage(t, err))
      setFusionPhase('error')
    } finally {
      if (generatingFusionKeyRef.current === key) {
        generatingFusionKeyRef.current = null
      }
    }
  }, [locale, t])

  useEffect(() => {
    if (currentStep !== 'result' || mode !== 'hybrid') {
      return
    }
    if (!result || !isHybridRoll(result) || result.fusionEntry) {
      return
    }
    void tryGenerateFusion(result)
  }, [currentStep, mode, result, tryGenerateFusion])

  useLocaleSwitchGuard(
    useCallback(
      async (targetLocale) => {
        if (currentStep !== 'result' || !result) {
          return
        }
        await ensureQuirksCatalog(targetLocale)
      },
      [currentStep, result],
    ),
  )

  useEffect(() => {
    if (currentStep !== 'result' || !result) {
      return
    }

    const path = buildSharePath(result)
    if (!path) {
      return
    }

    const timer = window.setTimeout(() => {
      if (onExitStart) {
        saveWizardNavigationForShare(path, buildNavigationSnapshot())
      }
      router.replace(path)
    }, 1150)

    return () => {
      window.clearTimeout(timer)
    }
  }, [currentStep, locale, mode, onExitStart, result, router])

  function currentHybridRollSettings(): HybridRollSessionSettings {
    return {
      slotFilters: hybridSlotFilters,
      manualParentIds: [
        manualHybridParents[0]?.id ?? null,
        manualHybridParents[1]?.id ?? null,
      ],
    }
  }

  function setHybridRoll(hybrid: HybridRollResult | null) {
    setResult(hybrid)
    if (hybrid) {
      const settings = currentHybridRollSettings()
      saveHybridRollSession(
        hybrid.parents[0].id,
        hybrid.parents[1].id,
        hybrid.seed,
        settings,
      )

      if (!hybrid.fusionEntry) {
        setFusionPhase('generating')
        setFusionError(null)
        pushHybridHistoryEntry(
          hybrid.parents[0],
          hybrid.parents[1],
          hybrid.seed,
          locale,
        )
      }
    }
  }

  function setSingleRoll(quirk: Quirk | null) {
    setResult(quirk)
    if (quirk) {
      pushSingleHistoryEntry(quirk, locale)
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
    setHybridRoll(next)
    void tryGenerateFusion(next, true)
  }

  function rollFromCurrentSettings() {
    const rerollHybrid =
      mode === 'hybrid' || (result !== null && isHybridRoll(result))

    if (rerollHybrid) {
      const next = rerollHybridFromSettings(
        allQuirks,
        currentHybridRollSettings(),
        locale,
        { searchableText },
      )
      setHybridRoll(next)
      return
    }

    setSingleRoll(pickRandom(filteredQuirks))
  }

  function continueFromAdvanced() {
    setPendingType('Any')
    setSelectedTiers([...DEFAULT_SELECTED_TIERS])
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
    setSelectedTiers([...DEFAULT_SELECTED_TIERS])
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
    setSingleRoll(pickRandom(nextPool))
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
    setSingleRoll(quirk)
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
    if (onExitStart) {
      clearWizardNavigationSession()
      onExitStart()
      return
    }

    setCurrentStep(initialStep)
    setMode('single')
    setFilters(defaultFilters())
    setResult(null)
    setResultBackStep('type')
    resetPickFlow()
  }

  function handleBack() {
    if (currentStep === 'mode' && onExitStart) {
      onExitStart()
      return
    }

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
        canRetryHybrid={mode === 'hybrid' || (result !== null && isHybridRoll(result))}
        onRetry={() => {
          rollFromCurrentSettings()
        }}
        onRetryFusion={handleRerollFusion}
        onBack={handleBack}
        onRestart={handleRestart}
      />
    )
  }

  const exitToHome = Boolean(onExitStart)

  return (
    <MinimalFrame
      canGoBack={
        exitToHome
          ? currentStep !== 'randomRoll'
          : currentStep !== 'mode' && currentStep !== 'randomRoll'
      }
      showRestart={
        exitToHome
          ? currentStep !== 'randomRoll'
          : currentStep !== 'mode' && currentStep !== 'randomRoll'
      }
      onBack={handleBack}
      onRestart={handleRestart}
    >
      {renderStep()}
    </MinimalFrame>
  )
}
