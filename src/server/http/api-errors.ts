import type { ApiErrorPayload } from '@/lib/api/errors'
import { applyCorsHeaders, buildCorsHeaders } from './cors'
import type { RateLimitResult } from './rate-limit'

export function apiErrorJson(
  error: ApiErrorPayload,
  request: Request,
  status: number,
  extraHeaders?: Headers,
): Response {
  const headers = new Headers(extraHeaders)
  buildCorsHeaders(request).forEach((value, key) => {
    headers.set(key, value)
  })
  return applyCorsHeaders(Response.json({ error }, { status, headers }), request)
}

export function rateLimitedJson(
  request: Request,
  result: RateLimitResult,
  code: ApiErrorPayload['code'],
  extraHeaders?: Headers,
): Response {
  const headers = new Headers(extraHeaders)
  headers.set('Retry-After', String(result.retryAfterSec))
  headers.set('X-RateLimit-Limit', String(result.limit))
  headers.set('X-RateLimit-Remaining', '0')
  headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))

  return apiErrorJson(
    { code, retryAfterSec: result.retryAfterSec },
    request,
    429,
    headers,
  )
}
