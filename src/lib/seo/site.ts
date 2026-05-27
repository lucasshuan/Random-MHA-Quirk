/** Production fallback when env vars are unset (local build, OG crawlers). */
export const SITE_URL_FALLBACK = 'https://random-mha-quirk.vercel.app'

export const SITE_NAME = 'My Hero Academia Lab'

/** PNG — widely accepted by social crawlers (some reject WebP). */
export const SITE_LOGO_PATH = '/logo.png'

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
