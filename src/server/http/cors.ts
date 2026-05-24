const DEFAULT_DEV_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

function parseAllowedOrigins(): Set<string> {
  const raw = process.env.ALLOWED_ORIGINS?.trim()
  const fromEnv = raw
    ? raw.split(',').map((origin) => origin.trim()).filter(Boolean)
    : []
  const merged = [...DEFAULT_DEV_ORIGINS, ...fromEnv]
  if (process.env.VERCEL_URL) {
    merged.push(`https://${process.env.VERCEL_URL}`)
  }
  if (process.env.VERCEL_BRANCH_URL) {
    merged.push(`https://${process.env.VERCEL_BRANCH_URL}`)
  }
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (productionUrl) {
    merged.push(productionUrl.startsWith('http') ? productionUrl : `https://${productionUrl}`)
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    merged.push(process.env.NEXT_PUBLIC_SITE_URL.trim())
  }
  return new Set(merged)
}

let cachedOrigins: Set<string> | null = null

export function getAllowedOrigins(): Set<string> {
  if (!cachedOrigins) {
    cachedOrigins = parseAllowedOrigins()
  }
  return cachedOrigins
}

function normalizeHost(host: string): string {
  return host.split(',')[0]?.trim().toLowerCase() ?? ''
}

/** True when the browser Origin matches the host serving this API request. */
function isSameSiteOrigin(origin: string, request: Request): boolean {
  try {
    const originHost = normalizeHost(new URL(origin).host)
    const requestHosts = [
      request.headers.get('x-forwarded-host'),
      request.headers.get('host'),
      new URL(request.url).host,
    ]
      .filter((host): host is string => Boolean(host))
      .map(normalizeHost)

    return requestHosts.some((host) => host === originHost)
  } catch {
    return false
  }
}

export function isOriginAllowed(origin: string | null, request?: Request): boolean {
  if (!origin) {
    return true
  }
  if (request && isSameSiteOrigin(origin, request)) {
    return true
  }
  return getAllowedOrigins().has(origin)
}

export function buildCorsHeaders(request: Request): Headers {
  const origin = request.headers.get('origin')
  const headers = new Headers()

  if (origin && isOriginAllowed(origin, request)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Vary', 'Origin')
  }

  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS')
  headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With',
  )
  headers.set('Access-Control-Max-Age', '86400')

  return headers
}

export function applyCorsHeaders(
  response: Response,
  request: Request,
): Response {
  const cors = buildCorsHeaders(request)
  cors.forEach((value, key) => {
    response.headers.set(key, value)
  })
  return response
}
