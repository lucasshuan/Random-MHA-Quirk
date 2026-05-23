import { generateFusionEntry } from '@/server/fusion/generate'
import { apiErrorJson, rateLimitedJson } from '@/server/http/api-errors'
import { applyCorsHeaders } from '@/server/http/cors'
import {
  checkFusionGenerateRateLimit,
  rateLimitHeaders,
} from '@/server/http/rate-limit'
import type { QuirkId } from '@/types/quirk-id'

export const runtime = 'nodejs'

interface FusionRequestBody {
  parentA?: string
  parentB?: string
  seed?: string
  force?: boolean
}

function jsonWithHeaders(
  body: unknown,
  request: Request,
  status: number,
  extraHeaders?: Headers,
): Response {
  const headers = new Headers(extraHeaders)
  return applyCorsHeaders(Response.json(body, { status, headers }), request)
}

export async function POST(request: Request) {
  const rate = checkFusionGenerateRateLimit(request)
  const rateHeaders = rateLimitHeaders(rate)

  if (!rate.allowed) {
    return rateLimitedJson(request, rate, 'RATE_LIMIT_FUSION', rateHeaders)
  }

  let body: FusionRequestBody
  try {
    body = (await request.json()) as FusionRequestBody
  } catch {
    return apiErrorJson({ code: 'INVALID_JSON' }, request, 400, rateHeaders)
  }

  const { parentA, parentB, seed, force } = body
  if (!parentA || !parentB || !seed) {
    return apiErrorJson(
      { code: 'MISSING_FUSION_FIELDS' },
      request,
      400,
      rateHeaders,
    )
  }

  try {
    const { entry, cached, generated } = await generateFusionEntry({
      idA: parentA,
      idB: parentB,
      seed,
      force: force ?? false,
    })

    return jsonWithHeaders(
      {
        entry: {
          ...entry,
          parents: entry.parents as [QuirkId, QuirkId],
        },
        cached,
        generated,
      },
      request,
      200,
      rateHeaders,
    )
  } catch {
    return apiErrorJson(
      { code: 'FUSION_GENERATE_FAILED' },
      request,
      500,
      rateHeaders,
    )
  }
}

export async function OPTIONS(request: Request) {
  return applyCorsHeaders(new Response(null, { status: 204 }), request)
}
