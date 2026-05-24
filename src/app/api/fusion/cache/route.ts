import { fusionCacheKeyFromHybridRoute } from '@/lib/share/paths'
import { findFusionByKey } from '@/server/fusion/repository'
import { apiErrorJson, rateLimitedJson } from '@/server/http/api-errors'
import { applyCorsHeaders } from '@/server/http/cors'
import { checkApiReadRateLimit, rateLimitHeaders } from '@/server/http/rate-limit'
import type { QuirkId } from '@/types/quirk-id'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const rate = checkApiReadRateLimit(request)
  const rateHeaders = rateLimitHeaders(rate)

  if (!rate.allowed) {
    return rateLimitedJson(request, rate, 'RATE_LIMIT_API', rateHeaders)
  }

  const { searchParams } = new URL(request.url)
  const parentA = searchParams.get('parentA') ?? ''
  const parentB = searchParams.get('parentB') ?? ''
  const seed = searchParams.get('seed') ?? ''

  const key = fusionCacheKeyFromHybridRoute(parentA, parentB, seed)
  if (!key) {
    return apiErrorJson({ code: 'FUSION_NOT_FOUND' }, request, 400, rateHeaders)
  }

  try {
    const entry = await findFusionByKey(key)
    if (!entry) {
      return apiErrorJson({ code: 'FUSION_NOT_FOUND' }, request, 404, rateHeaders)
    }

    const headers = new Headers(rateHeaders)
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')

    return applyCorsHeaders(
      Response.json(
        {
          entry: {
            ...entry,
            parents: entry.parents as [QuirkId, QuirkId],
          },
        },
        { headers },
      ),
      request,
    )
  } catch {
    return apiErrorJson({ code: 'SERVER_ERROR' }, request, 500, rateHeaders)
  }
}

export async function OPTIONS(request: Request) {
  return applyCorsHeaders(new Response(null, { status: 204 }), request)
}
