import { applyCorsHeaders, buildCorsHeaders, isOriginAllowed } from './cors'
import type { RateLimitResult } from './rate-limit'
import { rateLimitHeaders } from './rate-limit'

export function corsPreflightResponse(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  })
}

export function corsForbiddenResponse(request: Request): Response {
  const body = Response.json(
    { message: 'Origin not allowed.' },
    { status: 403 },
  )
  return applyCorsHeaders(body, request)
}

export function rateLimitedResponse(
  request: Request,
  result: RateLimitResult,
  message = 'Muitas requisições. Tente novamente em breve.',
): Response {
  const headers = rateLimitHeaders(result)
  buildCorsHeaders(request).forEach((value, key) => {
    headers.set(key, value)
  })
  return Response.json({ message }, { status: 429, headers })
}

export function withCors(json: unknown, request: Request, init?: ResponseInit): Response {
  return applyCorsHeaders(Response.json(json, init), request)
}

export { isOriginAllowed }
