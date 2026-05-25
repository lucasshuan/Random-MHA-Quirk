import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { detectLocaleFromAcceptLanguage } from '@/lib/seo/detect-locale'
import {
  buildQuirkShareMetadata,
  buildShareFallbackMetadata,
} from '@/lib/seo/build-metadata'
import { isShareQuirkId } from '@/lib/share/paths'
import { getQuirkById } from '@/server/quirks/service'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const path = `/r/quirk/${encodeURIComponent(id)}`
  const headerList = await headers()
  const locale = detectLocaleFromAcceptLanguage(
    headerList.get('accept-language'),
  )

  if (!isShareQuirkId(id)) {
    return buildShareFallbackMetadata(path, locale)
  }

  const quirk = await getQuirkById(locale, id)
  if (!quirk) {
    return buildShareFallbackMetadata(path, locale)
  }

  return buildQuirkShareMetadata(quirk, id, locale)
}

export default function QuirkShareLayout({ children }: LayoutProps) {
  return children
}
