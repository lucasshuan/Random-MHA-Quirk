import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { fusionCopyForLocale } from '@/types/fusion'
import { detectLocaleFromAcceptLanguage } from '@/lib/seo/detect-locale'
import {
  buildHybridShareMetadata,
  buildShareFallbackMetadata,
} from '@/lib/seo/build-metadata'
import {
  fusionCacheKeyFromHybridRoute,
  isShareQuirkId,
} from '@/lib/share/paths'
import { findFusionByKey } from '@/server/fusion/repository'
import { getQuirkById } from '@/server/quirks/service'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ parentA: string; parentB: string; seed: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ parentA: string; parentB: string; seed: string }>
}): Promise<Metadata> {
  const { parentA, parentB, seed } = await params
  const path = `/r/hybrid/${encodeURIComponent(parentA)}/${encodeURIComponent(parentB)}/${encodeURIComponent(seed)}`
  const headerList = await headers()
  const locale = detectLocaleFromAcceptLanguage(
    headerList.get('accept-language'),
  )

  const cacheKey = fusionCacheKeyFromHybridRoute(parentA, parentB, seed)
  if (!cacheKey || !isShareQuirkId(parentA) || !isShareQuirkId(parentB)) {
    return buildShareFallbackMetadata(path, locale)
  }

  const [fusion, parentAQuirk, parentBQuirk] = await Promise.all([
    findFusionByKey(cacheKey),
    getQuirkById(locale, parentA),
    getQuirkById(locale, parentB),
  ])

  const parentAName = parentAQuirk?.name ?? parentA
  const parentBName = parentBQuirk?.name ?? parentB

  if (!fusion) {
    return buildHybridShareMetadata({
      fusionName: null,
      fusionDescription: null,
      parentAName,
      parentBName,
      path,
      locale,
    })
  }

  const copy = fusionCopyForLocale(fusion, locale)

  return buildHybridShareMetadata({
    fusionName: copy.name,
    fusionDescription: copy.description,
    parentAName,
    parentBName,
    path,
    locale,
  })
}

export default function HybridShareLayout({ children }: LayoutProps) {
  return children
}
