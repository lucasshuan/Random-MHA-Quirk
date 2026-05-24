'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
type LocaleResultCache = Map<Locale, RollResult>

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
  const [result, setResult] = useState<RollResult>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fusionPhase, setFusionPhase] = useState<'idle' | 'generating' | 'error'>('idle')
  const [fusionError, setFusionError] = useState<string | null>(null)
  const generatingFusionKeyRef = useRef<string | null>(null)
  const strippedLegacyLangRef = useRef(false)
  const resultLocaleCacheRef = useRef<Map<string, LocaleResultCache>>(new Map())

  const routeKey =
    mode === 'single' ? `solo:${quirkId ?? ''}` : `hybrid:${parentA}:${parentB}:${seed}`
  const hydratedRouteRef = useRef<string | null>(null)

  const getRouteLocaleCache = useCallback((): LocaleResultCache => {
    let cache = resultLocaleCacheRef.current.get(routeKey)
    if (!cache) {
      cache = new Map()
      resultLocaleCacheRef.current.set(routeKey, cache)
    }
    return cache
  }, [routeKey])

  const cacheResultForLocale = useCallback(
    (targetLocale: Locale, nextResult: RollResult) => {
      getRouteLocaleCache().set(targetLocale, nextResult)
    },
    [getRouteLocaleCache],
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
    async (hybrid: HybridRollResult, force = false) => {
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
        let fusionEntry = force ? null : await fetchFusionFromCache(
          hybrid.parents[0].id,
          hybrid.parents[1].id,
          hybrid.seed,
        )

        if (!fusionEntry) {
          fusionEntry = await requestFusionGeneration(
            hybrid.parents[0].id,
            hybrid.parents[1].id,
            hybrid.seed,
            { force },
          )
        }

        setResult((prev) => {
          if (!prev || !isHybridRoll(prev) || hybridRollKey(prev) !== key) {
            return prev
          }
          const next = { ...prev, fusionEntry }
          for (const [cachedLocale, entry] of getRouteLocaleCache()) {
            if (isHybridRoll(entry) && hybridRollKey(entry) === key) {
              cacheResultForLocale(cachedLocale, { ...entry, fusionEntry })
            }
          }
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
    [cacheResultForLocale, getRouteLocaleCache, t],
  )

  const loadResultForLocale = useCallback(
    async (targetLocale: Locale): Promise<RollResult> => {
      const cached = getRouteLocaleCache().get(targetLocale)
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
      for (const entry of getRouteLocaleCache().values()) {
        if (isHybridRoll(entry) && entry.seed === seed && entry.fusionEntry) {
          fusionEntry = entry.fusionEntry
          break
        }
      }

      const hybrid: HybridRollResult = {
        parents: [first, second],
        seed,
        fusionEntry,
      }

      cacheResultForLocale(targetLocale, hybrid)
      return hybrid
    },
    [cacheResultForLocale, getRouteLocaleCache, mode, parentA, parentB, quirkId, seed],
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

  useEffect(() => {
    let cancelled = false

    async function loadRoute() {
      resultLocaleCacheRef.current.delete(routeKey)
      setIsLoading(true)
      setLoadError(null)
      setResult(null)
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
        if (!cancelled) {
          setResult(loaded)
          hydratedRouteRef.current = routeKey
          if (isHybridRoll(loaded) && !loaded.fusionEntry) {
            void tryGenerateFusion(loaded)
          }
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
  }, [routeKey, t, tryGenerateFusion, loadResultForLocale])

  useEffect(() => {
    if (hydratedRouteRef.current !== routeKey || isLoading) {
      return
    }

    const cached = getRouteLocaleCache().get(locale)
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
  }, [getRouteLocaleCache, isLoading, locale, routeKey])

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
    resultLocaleCacheRef.current.delete(routeKey)
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
    router.replace(nextPath)
    void tryGenerateFusion(next, true)
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
    resultLocaleCacheRef.current.delete(routeKey)
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
    router.replace(nextPath)
    void tryGenerateFusion(next, true)
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
    if (isLoading) {
      return <LoadingScreen label={t('share.loading')} embedded />
    }

    if (loadError) {
      return (
        <div className="simple-step result-step" role="alert">
          <p className="mini-copy">{loadError}</p>
          <button type="button" className="big-action" onClick={goStart}>
            {t('share.goRoll')}
          </button>
        </div>
      )
    }

    return (
      <StepFinalResult
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
        onRetryFusion={handleRerollFusion}
        onBack={handleBack}
        onRestart={handleRestart}
      />
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
