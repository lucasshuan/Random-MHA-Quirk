import { applyCorsHeaders, buildCorsHeaders, isOriginAllowed } from './cors'
import { apiErrorJson } from './api-errors'

export function corsPreflightResponse(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  })
}

export function corsForbiddenResponse(request: Request): Response {
  return apiErrorJson({ code: 'FORBIDDEN' }, request, 403)
}

export function withCors(json: unknown, request: Request, init?: ResponseInit): Response {
  return applyCorsHeaders(Response.json(json, init), request)
}

export { isOriginAllowed }
