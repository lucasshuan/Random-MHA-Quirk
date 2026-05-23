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

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    return true
  }
  return getAllowedOrigins().has(origin)
}

export function buildCorsHeaders(request: Request): Headers {
  const origin = request.headers.get('origin')
  const headers = new Headers()

  if (origin && isOriginAllowed(origin)) {
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
