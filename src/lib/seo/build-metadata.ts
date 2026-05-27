import type { Metadata } from 'next'
import type { Locale } from '@/i18n/types'
import {
  getPageSeoCopy,
  hybridShareTitle,
  quirkShareTitle,
  type SeoPageKey,
} from './copy'
import {
  absoluteSiteUrl,
  SITE_KEYWORDS,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_OG_IMAGE,
  siteOgImageUrl,
} from './site'

const DESCRIPTION_MAX = 160

export function truncateForMeta(text: string, max = DESCRIPTION_MAX): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) {
    return normalized
  }
  return `${normalized.slice(0, max - 1).trimEnd()}…`
}

function sharedOpenGraph(
  title: string,
  description: string,
  path: string,
  locale: Locale,
): Metadata['openGraph'] {
  const url = absoluteSiteUrl(path)
  const ogLocale =
    locale === 'pt-BR' ? 'pt_BR' : locale === 'es' ? 'es_ES' : 'en_US'

  return {
    type: 'website',
    siteName: SITE_NAME,
    title,
    description,
    url,
    locale: ogLocale,
    alternateLocale: ['en_US', 'pt_BR', 'es_ES'].filter((l) => l !== ogLocale),
    images: [
      {
        url: siteOgImageUrl(),
        width: SITE_OG_IMAGE.width,
        height: SITE_OG_IMAGE.height,
        type: SITE_OG_IMAGE.type,
        alt: `${SITE_NAME} logo`,
      },
    ],
  }
}

function sharedTwitter(title: string, description: string): Metadata['twitter'] {
  return {
    card: 'summary',
    title,
    description,
    images: [siteOgImageUrl()],
  }
}

export function buildPageMetadata(
  page: SeoPageKey,
  path: string,
  locale: Locale = 'en',
  options?: { robots?: Metadata['robots'] },
): Metadata {
  const { title, description } = getPageSeoCopy(page, locale)
  const fullTitle = page === 'home' ? `${SITE_NAME} — ${title}` : title

  return {
    title: fullTitle,
    description,
    keywords: [...SITE_KEYWORDS],
    alternates: {
      canonical: absoluteSiteUrl(path),
    },
    openGraph: sharedOpenGraph(fullTitle, description, path, locale),
    twitter: sharedTwitter(fullTitle, description),
    robots: options?.robots,
  }
}

export function buildRootMetadata(): Metadata {
  const home = buildPageMetadata('home', '/', 'en')

  return {
    metadataBase: new URL(absoluteSiteUrl()),
    title: {
      default: home.title as string,
      template: `%s · ${SITE_NAME}`,
    },
    description: home.description,
    keywords: [...SITE_KEYWORDS],
    applicationName: SITE_NAME,
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: 'entertainment',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: absoluteSiteUrl('/'),
    },
    openGraph: home.openGraph,
    twitter: home.twitter,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [{ url: SITE_LOGO_PATH, type: 'image/png' }],
      apple: [{ url: SITE_LOGO_PATH, type: 'image/png' }],
    },
    manifest: '/manifest.webmanifest',
  }
}

export function buildQuirkShareMetadata(
  quirk: { name: string; description: string },
  quirkId: string,
  locale: Locale,
): Metadata {
  const path = `/r/quirk/${encodeURIComponent(quirkId)}`
  const title = `${quirkShareTitle(quirk.name, locale)} · ${SITE_NAME}`
  const description = truncateForMeta(quirk.description)

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: absoluteSiteUrl(path) },
    openGraph: {
      ...sharedOpenGraph(title, description, path, locale),
      type: 'article',
    },
    twitter: sharedTwitter(title, description),
  }
}

export function buildHybridShareMetadata(input: {
  fusionName: string | null
  fusionDescription: string | null
  parentAName: string
  parentBName: string
  path: string
  locale: Locale
}): Metadata {
  const titleText = input.fusionName
    ? `${hybridShareTitle(
        input.fusionName,
        input.parentAName,
        input.parentBName,
        input.locale,
      )} · ${SITE_NAME}`
    : `${getPageSeoCopy('shareFallback', input.locale).title} · ${SITE_NAME}`

  const description = truncateForMeta(
    input.fusionDescription ??
      `Hybrid fusion of ${input.parentAName} and ${input.parentBName}. Roll your own MHA quirk or fuse two parents on ${SITE_NAME}.`,
  )

  return {
    title: { absolute: titleText },
    description,
    alternates: { canonical: absoluteSiteUrl(input.path) },
    openGraph: {
      ...sharedOpenGraph(titleText, description, input.path, input.locale),
      type: 'article',
    },
    twitter: sharedTwitter(titleText, description),
  }
}

export function buildShareFallbackMetadata(
  path: string,
  locale: Locale,
): Metadata {
  const { title, description } = getPageSeoCopy('shareFallback', locale)
  const fullTitle = `${title} · ${SITE_NAME}`

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: absoluteSiteUrl(path) },
    openGraph: sharedOpenGraph(fullTitle, description, path, locale),
    twitter: sharedTwitter(fullTitle, description),
    robots: { index: false, follow: true },
  }
}
