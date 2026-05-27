/** Production fallback when env vars are unset (local build, OG crawlers). */
export const SITE_URL_FALLBACK = 'https://random-mha-quirk.vercel.app'

export const SITE_NAME = 'My Hero Academia Lab'

/** PNG — widely accepted by social crawlers (some reject WebP). */
export const SITE_LOGO_PATH = '/logo.png'

/**
 * Open Graph / Twitter preview image.
 * Keep width under 400px so Discord, Facebook, and LinkedIn use a side thumbnail
 * instead of a full-width banner (logo.png is 124×120).
 */
export const SITE_OG_IMAGE = {
  path: SITE_LOGO_PATH,
  width: 124,
  height: 120,
  type: 'image/png' as const,
  /** Bump when changing the asset or declared dimensions (crawler cache bust). */
  cacheVersion: '2',
} as const

export const SITE_KEYWORDS = [
  'My Hero Academia',
  'MHA',
  'BNHA',
  'Boku no Hero Academia',
  'quirk',
  'individuality',
  'random quirk',
  'quirk generator',
  'quirk roller',
  'random quirk generator',
  'MHA quirk generator',
  'BNHA quirk generator',
  'AI',
  'AI generator',
  'AI quirk generator',
  'AI hybrid generator',
  'AI fusion',
  'AI quirk fusion',
  'AI-generated',
  'generative AI',
  'AI-powered',
  'LLM',
  'OpenAI',
  'character generator',
  'power generator',
  'superpower generator',
  'anime power generator',
  'hybrid quirk',
  'quirk fusion',
  'fan project',
] as const

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (production) {
    return production.startsWith('http')
      ? production.replace(/\/$/, '')
      : `https://${production}`
  }

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) {
    return `https://${vercel}`
  }

  return SITE_URL_FALLBACK
}

export function absoluteSiteUrl(path = ''): string {
  const base = getSiteUrl()
  if (!path || path === '/') {
    return base
  }
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export function siteLogoUrl(): string {
  return absoluteSiteUrl(SITE_LOGO_PATH)
}

/** OG/Twitter image URL with cache-bust query for link-preview crawlers. */
export function siteOgImageUrl(): string {
  return `${absoluteSiteUrl(SITE_OG_IMAGE.path)}?v=${SITE_OG_IMAGE.cacheVersion}`
}
