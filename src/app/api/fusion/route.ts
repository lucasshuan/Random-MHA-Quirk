import { NextRequest } from 'next/server'
import { apiErrorJson, rateLimitedJson } from '@/server/http/api-errors'
import { applyCorsHeaders } from '@/server/http/cors'
import { checkApiReadRateLimit, rateLimitHeaders } from '@/server/http/rate-limit'
import { listAllFusionEntries } from '@/server/fusion/repository'
import { parseLocaleParam } from '@/server/quirks/params'

export const runtime = 'nodejs'

const CACHE_HEADER =
  process.env.NODE_ENV === 'development'
    ? 'private, no-store'
    : 'public, s-maxage=300, stale-while-revalidate=60'

export async function GET(request: NextRequest) {
  const rate = checkApiReadRateLimit(request)
  const rateHeaders = rateLimitHeaders(rate)

  if (!rate.allowed) {
    return rateLimitedJson(request, rate, 'RATE_LIMIT_API', rateHeaders)
  }

  const locale = parseLocaleParam(request.nextUrl.searchParams.get('locale'))
  if (!locale) {
    return apiErrorJson({ code: 'MISSING_LOCALE' }, request, 400, rateHeaders)
  }

  try {
    const entries = await listAllFusionEntries()

    return applyCorsHeaders(
      Response.json(
        { locale, entries, total: entries.length },
        {
          headers: new Headers({
            ...Object.fromEntries(rateHeaders.entries()),
            'Cache-Control': CACHE_HEADER,
          }),
        },
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
