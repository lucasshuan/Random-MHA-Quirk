'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingScreen } from '@/components/LoadingScreen'
import { QuirksCatalogGate } from '@/components/QuirksCatalogGate'
import { MinimalFrame } from '@/components/wizard/MinimalFrame'
import { StepFinalResult } from '@/components/wizard/StepFinalResult'
import { useLocaleSwitchGuard } from '@/hooks/useLocaleSwitchGuard'
import { buildQuirkSearchText } from '@/i18n/quirkSearchText'
import { ensureQuirksCatalog, useQuirksCatalog } from '@/hooks/useQuirksCatalog'
import { useI18n } from '@/i18n/useI18n'
import type { Locale } from '@/i18n/types'
import { rerollHybridFromSettings } from '@/lib/hybrid/reroll-from-settings'
import { resolveApiErrorMessage } from '@/lib/api/resolve-error'
import { fetchFusionFromCache, requestFusionGeneration } from '@/lib/fusion/api'
import { randomFusionSeed } from '@/lib/fusion/keys'
import {
  patchHybridHistoryFusion,
  pushHybridHistoryEntry,
} from '@/lib/history/store'
import { fetchQuirkById } from '@/lib/quirks/api'
import {
  absoluteShareUrl,
  isFusionSeed,
  isShareQuirkId,
  SHARE_LANG_PARAM,
  shareHybridPath,
  shareLocaleFromSearchParams,
  shareQuirkPath,
} from '@/lib/share/paths'
import { consumeShareResultHandoff, saveShareResultHandoff } from '@/lib/share/share-result-handoff'
import {
  getShareRouteCachedResult,
  isShareRouteResult,
  setShareRouteCachedResult,
  trySyncResolveShareRoute,
  type ShareRouteResult,
} from '@/lib/share/share-route-cache'
import {
  matchHybridRollSession,
  saveHybridRollSession,
} from '@/lib/wizard/hybrid-roll-session'
import {
  clearWizardNavigationSession,
  matchWizardNavigationForShare,
  queueWizardNavigationRestore,
  saveWizardNavigationForShare,
} from '@/lib/wizard/wizard-navigation-session'
import type { ResultMode } from '@/lib/wizard/flow'
import type { HybridRollResult } from '@/types/fusion'
import type { Quirk } from '@/types/quirk'
import type { QuirkId } from '@/types/quirk-id'

type RollResult = Quirk | HybridRollResult | null

interface ShareRouteParams {
  mode: ResultMode
  quirkId?: string
  parentA?: string
  parentB?: string
  seed?: string
}

function readReadyShareRouteResult(
  routeKey: string,
  locale: Locale,
  params: ShareRouteParams,
): ShareRouteResult | null {
  const cached = getShareRouteCachedResult(routeKey, locale)
  if (cached && isShareRouteResult(cached, params)) {
    return cached
  }

  const sync = trySyncResolveShareRoute({ locale, ...params })
  if (sync) {
    setShareRouteCachedResult(routeKey, locale, sync)
    return sync
  }

  return null
}

function isHybridRoll(result: RollResult): result is HybridRollResult {
  return result !== null && 'parents' in result
}

function hybridRollKey(result: HybridRollResult): string {
  return `${result.parents[0].id}+${result.parents[1].id}:${result.seed}`
}

interface SharedResultAppProps {
  mode: ResultMode
  quirkId?: string
  parentA?: string
  parentB?: string
  seed?: string
}

export function SharedResultApp({
  mode,
  quirkId,
  parentA,
  parentB,
  seed,
}: SharedResultAppProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale, setLocale, t } = useI18n()
  const { quirks: allQuirks } = useQuirksCatalog(locale)
  const [fusionPhase, setFusionPhase] = useState<'idle' | 'generating' | 'error'>('idle')
  const [fusionError, setFusionError] = useState<string | null>(null)
  const generatingFusionKeyRef = useRef<string | null>(null)
  const strippedLegacyLangRef = useRef(false)

  const routeKey =
    mode === 'single' ? `solo:${quirkId ?? ''}` : `hybrid:${parentA}:${parentB}:${seed}`
  const hydratedRouteRef = useRef<string | null>(null)
  const routeParams = useMemo<ShareRouteParams>(
    () => ({ mode, quirkId, parentA, parentB, seed }),
    [mode, parentA, parentB, quirkId, seed],
  )

  const [result, setResult] = useState<RollResult>(() =>
    readReadyShareRouteResult(routeKey, locale, routeParams),
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(
    () => readReadyShareRouteResult(routeKey, locale, routeParams) === null,
  )
  const [shellMotion, setShellMotion] = useState<'static' | 'entrance'>('static')

  const routeSharePath = useMemo(() => {
    if (mode === 'single' && quirkId && isShareQuirkId(quirkId)) {
      return shareQuirkPath(quirkId)
    }

    if (
      mode === 'hybrid' &&
      parentA &&
      parentB &&
      seed &&
      isShareQuirkId(parentA) &&
      isShareQuirkId(parentB) &&
      isFusionSeed(seed) &&
      parentA !== parentB
    ) {
      return shareHybridPath(parentA, parentB, seed)
    }

    return null
  }, [mode, parentA, parentB, quirkId, seed])

  const cacheResultForLocale = useCallback(
    (targetLocale: Locale, nextResult: RollResult) => {
      if (!nextResult) {
        return
      }
      setShareRouteCachedResult(routeKey, targetLocale, nextResult)
    },
    [routeKey],
  )

  const sharePath = useMemo(() => {
    if (mode === 'single' && result && !isHybridRoll(result)) {
      return shareQuirkPath(result.id)
    }
    if (mode === 'hybrid' && result && isHybridRoll(result)) {
      return shareHybridPath(
        result.parents[0].id,
        result.parents[1].id,
        result.seed,
      )
    }
    return null
  }, [mode, result])

  const shareUrl = sharePath ? absoluteShareUrl(sharePath) : null

  const wizardNavigation = useMemo(() => {
    if (!sharePath) {
      return null
    }
    return matchWizardNavigationForShare(sharePath)
  }, [sharePath])

  const canRetryHybrid = useMemo(() => {
    if (
      mode !== 'hybrid' ||
      !parentA ||
      !parentB ||
      !seed ||
      !isShareQuirkId(parentA) ||
      !isShareQuirkId(parentB)
    ) {
      return false
    }

    return matchHybridRollSession(parentA, parentB, seed) !== null
  }, [mode, parentA, parentB, seed])

  useEffect(() => {
    if (strippedLegacyLangRef.current) {
      return
    }
    strippedLegacyLangRef.current = true

    const legacyLang = shareLocaleFromSearchParams(searchParams)
    if (legacyLang) {
      void (async () => {
        try {
          await ensureQuirksCatalog(legacyLang)
          setLocale(legacyLang)
        } catch {
          setLocale(legacyLang)
        }
      })()
    }

    if (searchParams.has(SHARE_LANG_PARAM)) {
      router.replace(window.location.pathname, { scroll: false })
    }
  }, [router, searchParams, setLocale])

  const tryGenerateFusion = useCallback(
    async (hybrid: HybridRollResult) => {
      if (hybrid.fusionEntry) {
        return
      }

      const key = hybridRollKey(hybrid)
      if (generatingFusionKeyRef.current === key) {
        return
      }

      generatingFusionKeyRef.current = key
      setFusionPhase('generating')
      setFusionError(null)

      try {
        let fusionEntry = await fetchFusionFromCache(
          hybrid.parents[0].id,
          hybrid.parents[1].id,
          hybrid.seed,
        )

        if (!fusionEntry) {
          fusionEntry = await requestFusionGeneration(
            hybrid.parents[0].id,
            hybrid.parents[1].id,
            hybrid.seed,
          )
        }

        setResult((prev) => {
          if (!prev || !isHybridRoll(prev) || hybridRollKey(prev) !== key) {
            return prev
          }
          const next = { ...prev, fusionEntry }
          cacheResultForLocale(locale, next)
          return next
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
    },
    [cacheResultForLocale, locale, t],
  )

  const loadResultForLocale = useCallback(
    async (targetLocale: Locale): Promise<RollResult> => {
      const cached = getShareRouteCachedResult(routeKey, targetLocale)
      if (cached) {
        return cached
      }

      if (mode === 'single') {
        if (!quirkId || !isShareQuirkId(quirkId)) {
          throw new Error('invalid')
        }
        await ensureQuirksCatalog(targetLocale)
        const quirk = await fetchQuirkById(targetLocale, quirkId)
        cacheResultForLocale(targetLocale, quirk)
        return quirk
      }

      if (
        !parentA ||
        !parentB ||
        !seed ||
        !isShareQuirkId(parentA) ||
        !isShareQuirkId(parentB) ||
        !isFusionSeed(seed) ||
        parentA === parentB
      ) {
        throw new Error('invalid')
      }

      await ensureQuirksCatalog(targetLocale)
      const [first, second] = await Promise.all([
        fetchQuirkById(targetLocale, parentA as QuirkId),
        fetchQuirkById(targetLocale, parentB as QuirkId),
      ])

      let fusionEntry: HybridRollResult['fusionEntry'] = null
      const cachedHybrid = getShareRouteCachedResult(routeKey, targetLocale)
      if (isHybridRoll(cachedHybrid) && cachedHybrid.seed === seed && cachedHybrid.fusionEntry) {
        fusionEntry = cachedHybrid.fusionEntry
      }

      const hybrid: HybridRollResult = {
        parents: [first, second],
        seed,
        fusionEntry,
      }

      cacheResultForLocale(targetLocale, hybrid)
      return hybrid
    },
    [cacheResultForLocale, mode, parentA, parentB, quirkId, routeKey, seed],
  )

  useLocaleSwitchGuard(
    useCallback(
      async (targetLocale) => {
        if (hydratedRouteRef.current !== routeKey || isLoading) {
          return
        }
        await loadResultForLocale(targetLocale)
      },
      [isLoading, loadResultForLocale, routeKey],
    ),
  )

  const applyReadyRoute = useCallback(
    (ready: ShareRouteResult) => {
      cacheResultForLocale(locale, ready)
      setResult(ready)
      hydratedRouteRef.current = routeKey
      setIsLoading(false)
      setLoadError(null)

      if (isHybridRoll(ready) && !ready.fusionEntry) {
        void tryGenerateFusion(ready)
      }
    },
    [cacheResultForLocale, locale, routeKey, tryGenerateFusion],
  )

  useEffect(() => {
    setShellMotion('static')
  }, [routeKey])

  useLayoutEffect(() => {
    if (hydratedRouteRef.current === routeKey) {
      return
    }

    if (routeSharePath) {
      const handoff = consumeShareResultHandoff(routeSharePath)
      if (handoff) {
        applyReadyRoute(handoff.result)
        setShellMotion(handoff.animateEntrance ? 'entrance' : 'static')
        return
      }
    }

    const ready = readReadyShareRouteResult(routeKey, locale, routeParams)
    if (ready) {
      applyReadyRoute(ready)
    }
  }, [applyReadyRoute, locale, routeKey, routeParams, routeSharePath])

  useEffect(() => {
    if (hydratedRouteRef.current === routeKey) {
      return
    }

    const ready = readReadyShareRouteResult(routeKey, locale, routeParams)
    if (ready) {
      applyReadyRoute(ready)
      return
    }

    let cancelled = false

    async function loadRoute() {
      setResult(null)
      setIsLoading(true)
      setLoadError(null)
      setFusionPhase('idle')
      setFusionError(null)
      generatingFusionKeyRef.current = null

      try {
        if (mode === 'single' && (!quirkId || !isShareQuirkId(quirkId))) {
          setLoadError(t('share.invalidLink'))
          return
        }

        if (
          mode === 'hybrid' &&
          (!parentA ||
            !parentB ||
            !seed ||
            !isShareQuirkId(parentA) ||
            !isShareQuirkId(parentB) ||
            !isFusionSeed(seed) ||
            parentA === parentB)
        ) {
          setLoadError(t('share.invalidLink'))
          return
        }

        const loaded = await loadResultForLocale(locale)
        if (!cancelled && loaded) {
          applyReadyRoute(loaded)
        }
      } catch {
        if (!cancelled) {
          setLoadError(t('share.loadError'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadRoute()

    return () => {
      cancelled = true
    }
    // locale read at route change time; language switches use cache + prepareLocaleChange
    // eslint-disable-next-line react-hooks/exhaustive-deps -- locale intentionally omitted
  }, [applyReadyRoute, routeKey, routeParams, locale, t, loadResultForLocale, routeSharePath])

  useEffect(() => {
    if (hydratedRouteRef.current !== routeKey || isLoading) {
      return
    }

    const cached = getShareRouteCachedResult(routeKey, locale)
    if (!cached) {
      return
    }

    setResult((prev) => {
      if (!prev) {
        return cached
      }
      if (isHybridRoll(prev) && isHybridRoll(cached) && prev.seed === cached.seed) {
        return {
          ...cached,
          fusionEntry: cached.fusionEntry ?? prev.fusionEntry,
        }
      }
      return cached
    })
  }, [isLoading, locale, routeKey])

  function handleRetryHybrid() {
    if (
      mode !== 'hybrid' ||
      !parentA ||
      !parentB ||
      !seed ||
      !isShareQuirkId(parentA) ||
      !isShareQuirkId(parentB)
    ) {
      return
    }

    const settings = matchHybridRollSession(parentA, parentB, seed)
    if (!settings) {
      return
    }

    const next = rerollHybridFromSettings(allQuirks, settings, locale, {
      searchableText: (quirk) => buildQuirkSearchText(quirk, locale),
    })
    if (!next) {
      return
    }

    generatingFusionKeyRef.current = null
    cacheResultForLocale(locale, next)
    setResult(next)
    saveHybridRollSession(
      next.parents[0].id,
      next.parents[1].id,
      next.seed,
      settings,
    )
    pushHybridHistoryEntry(next.parents[0], next.parents[1], next.seed, locale)
    const nextPath = shareHybridPath(next.parents[0].id, next.parents[1].id, next.seed)
    if (wizardNavigation) {
      saveWizardNavigationForShare(nextPath, wizardNavigation)
    }
    saveShareResultHandoff(nextPath, next, { animateEntrance: false })
    router.replace(nextPath)
    void tryGenerateFusion(next)
  }

  function handleRerollFusion() {
    if (!result || !isHybridRoll(result)) {
      return
    }

    const settings =
      parentA &&
      parentB &&
      seed &&
      isShareQuirkId(parentA) &&
      isShareQuirkId(parentB)
        ? matchHybridRollSession(parentA, parentB, seed)
        : null

    const next: HybridRollResult = {
      parents: result.parents,
      seed: randomFusionSeed(),
      fusionEntry: null,
    }

    generatingFusionKeyRef.current = null
    cacheResultForLocale(locale, next)
    setResult(next)
    if (settings) {
      saveHybridRollSession(
        next.parents[0].id,
        next.parents[1].id,
        next.seed,
        settings,
      )
    }
    pushHybridHistoryEntry(next.parents[0], next.parents[1], next.seed, locale)
    const nextPath = shareHybridPath(next.parents[0].id, next.parents[1].id, next.seed)
    if (wizardNavigation) {
      saveWizardNavigationForShare(nextPath, wizardNavigation)
    }
    saveShareResultHandoff(nextPath, next, { animateEntrance: false })
    router.replace(nextPath)
    void tryGenerateFusion(next)
  }

  function handleRetryFusionGeneration() {
    if (!result || !isHybridRoll(result)) {
      return
    }

    void tryGenerateFusion(result)
  }

  function goStart() {
    router.push('/start')
  }

  function goMain() {
    clearWizardNavigationSession()
    router.push('/')
  }

  function handleBack() {
    if (wizardNavigation) {
      queueWizardNavigationRestore(wizardNavigation)
      router.push('/start')
      return
    }
    goStart()
  }

  function handleRestart() {
    goMain()
  }

  function renderBody() {
    return (
      <div className={`simple-step result-step result-step-${shellMotion}`}>
        {isLoading ? (
          <LoadingScreen label={t('share.loading')} embedded />
        ) : loadError ? (
          <div role="alert">
            <p className="mini-copy">{loadError}</p>
            <button type="button" className="big-action" onClick={goStart}>
              {t('share.goRoll')}
            </button>
          </div>
        ) : (
          <StepFinalResult
            bare
            mode={mode}
            result={result}
            flickerNames={[]}
            fusionPhase={fusionPhase}
            fusionError={fusionError}
            skipReveal
            shareUrl={shareUrl}
            canRetryHybrid={canRetryHybrid}
            onRetry={() => {
              if (mode === 'hybrid') {
                if (canRetryHybrid) {
                  handleRetryHybrid()
                }
                return
              }
              goStart()
            }}
            onRetryGeneration={handleRetryFusionGeneration}
            onRerollFusion={handleRerollFusion}
            onBack={handleBack}
            onRestart={handleRestart}
          />
        )}
      </div>
    )
  }

  return (
    <QuirksCatalogGate>
      <MinimalFrame
        canGoBack
        showRestart
        onBack={handleBack}
        onRestart={handleRestart}
      >
        {renderBody()}
      </MinimalFrame>
    </QuirksCatalogGate>
  )
}
