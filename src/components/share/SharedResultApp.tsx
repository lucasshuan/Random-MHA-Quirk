'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingScreen } from '@/components/LoadingScreen'
import { QuirksCatalogGate } from '@/components/QuirksCatalogGate'
import { MinimalFrame } from '@/components/wizard/MinimalFrame'
import { StepFinalResult } from '@/components/wizard/StepFinalResult'
import { useI18n } from '@/i18n/useI18n'
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
  isQuirkId,
  SHARE_LANG_PARAM,
  shareHybridPath,
  shareLocaleFromSearchParams,
  shareQuirkPath,
} from '@/lib/share/paths'
import type { ResultMode } from '@/lib/wizard/flow'
import type { HybridRollResult } from '@/types/fusion'
import type { Quirk } from '@/types/quirk'
import type { QuirkId } from '@/types/quirk-id'

type RollResult = Quirk | HybridRollResult | null

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
  const [result, setResult] = useState<RollResult>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fusionPhase, setFusionPhase] = useState<'idle' | 'generating' | 'error'>('idle')
  const [fusionError, setFusionError] = useState<string | null>(null)
  const generatingFusionKeyRef = useRef<string | null>(null)
  const strippedLegacyLangRef = useRef(false)

  const routeKey =
    mode === 'single' ? `solo:${quirkId ?? ''}` : `hybrid:${parentA}:${parentB}:${seed}`
  const hydratedRouteRef = useRef<string | null>(null)

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

  useEffect(() => {
    if (strippedLegacyLangRef.current) {
      return
    }
    strippedLegacyLangRef.current = true

    const legacyLang = shareLocaleFromSearchParams(searchParams)
    if (legacyLang) {
      setLocale(legacyLang)
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
    },
    [locale, t],
  )

  useEffect(() => {
    let cancelled = false

    async function loadRoute() {
      setIsLoading(true)
      setLoadError(null)
      setResult(null)
      setFusionPhase('idle')
      setFusionError(null)
      generatingFusionKeyRef.current = null

      try {
        if (mode === 'single') {
          if (!quirkId || !isQuirkId(quirkId)) {
            setLoadError(t('share.invalidLink'))
            return
          }
          const quirk = await fetchQuirkById(locale, quirkId)
          if (!cancelled) {
            setResult(quirk)
            hydratedRouteRef.current = routeKey
          }
          return
        }

        if (
          !parentA ||
          !parentB ||
          !seed ||
          !isQuirkId(parentA) ||
          !isQuirkId(parentB) ||
          !isFusionSeed(seed) ||
          parentA === parentB
        ) {
          setLoadError(t('share.invalidLink'))
          return
        }

        const [first, second] = await Promise.all([
          fetchQuirkById(locale, parentA as QuirkId),
          fetchQuirkById(locale, parentB as QuirkId),
        ])

        const hybrid: HybridRollResult = {
          parents: [first, second],
          seed,
          fusionEntry: null,
        }

        if (!cancelled) {
          setResult(hybrid)
          hydratedRouteRef.current = routeKey
          void tryGenerateFusion(hybrid)
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
    // locale read at route change time; language switches use refreshLocale below
    // eslint-disable-next-line react-hooks/exhaustive-deps -- locale intentionally omitted
  }, [routeKey, t, tryGenerateFusion, mode, parentA, parentB, quirkId, seed])

  useEffect(() => {
    if (hydratedRouteRef.current !== routeKey || isLoading) {
      return
    }

    let cancelled = false

    async function refreshLocale() {
      try {
        if (mode === 'single') {
          if (!quirkId || !isQuirkId(quirkId)) {
            return
          }
          const quirk = await fetchQuirkById(locale, quirkId)
          if (!cancelled) {
            setResult(quirk)
          }
          return
        }

        if (
          !parentA ||
          !parentB ||
          !seed ||
          !isQuirkId(parentA) ||
          !isQuirkId(parentB) ||
          !isFusionSeed(seed)
        ) {
          return
        }

        const [first, second] = await Promise.all([
          fetchQuirkById(locale, parentA as QuirkId),
          fetchQuirkById(locale, parentB as QuirkId),
        ])

        if (!cancelled) {
          setResult((prev) => {
            if (!prev || !isHybridRoll(prev) || prev.seed !== seed) {
              return prev
            }
            return {
              ...prev,
              parents: [first, second],
            }
          })
        }
      } catch {
        // Keep current content visible if locale refresh fails.
      }
    }

    void refreshLocale()

    return () => {
      cancelled = true
    }
  }, [locale, routeKey, isLoading, mode, parentA, parentB, quirkId, seed])

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
    pushHybridHistoryEntry(next.parents[0], next.parents[1], next.seed, locale)
    router.replace(shareHybridPath(next.parents[0].id, next.parents[1].id, next.seed))
    void tryGenerateFusion(next, true)
  }

  function goHome() {
    router.push('/start')
  }

  function renderBody() {
    if (isLoading) {
      return <LoadingScreen label={t('share.loading')} embedded />
    }

    if (loadError) {
      return (
        <div className="simple-step result-step" role="alert">
          <p className="mini-copy">{loadError}</p>
          <button type="button" className="big-action" onClick={goHome}>
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
        onRetry={() => goHome()}
        onRetryFusion={handleRerollFusion}
        onBack={goHome}
        onRestart={goHome}
      />
    )
  }

  return (
    <QuirksCatalogGate>
      <MinimalFrame
        canGoBack
        showRestart
        onBack={goHome}
        onRestart={goHome}
      >
        {renderBody()}
      </MinimalFrame>
    </QuirksCatalogGate>
  )
}
