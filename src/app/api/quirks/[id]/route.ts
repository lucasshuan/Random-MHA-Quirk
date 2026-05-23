import { NextRequest } from 'next/server'
import { apiErrorJson, rateLimitedJson } from '@/server/http/api-errors'
import { applyCorsHeaders } from '@/server/http/cors'
import { checkApiReadRateLimit, rateLimitHeaders } from '@/server/http/rate-limit'
import { parseLocaleParam } from '@/server/quirks/params'
import { getQuirkById } from '@/server/quirks/service'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const rate = checkApiReadRateLimit(request)
  const rateHeaders = rateLimitHeaders(rate)

  if (!rate.allowed) {
    return rateLimitedJson(request, rate, 'RATE_LIMIT_API', rateHeaders)
  }

  const { id } = await context.params
  const locale = parseLocaleParam(request.nextUrl.searchParams.get('locale'))

  if (!locale) {
    return apiErrorJson(
      { code: 'MISSING_LOCALE' },
      request,
      400,
      rateHeaders,
    )
  }

  if (!id?.trim()) {
    return apiErrorJson(
      { code: 'QUIRK_NOT_FOUND' },
      request,
      400,
      rateHeaders,
    )
  }

  try {
    const quirk = await getQuirkById(locale, id)

    if (!quirk) {
      return apiErrorJson(
        { code: 'QUIRK_NOT_FOUND' },
        request,
        404,
        rateHeaders,
      )
    }

    const headers = new Headers(rateHeaders)
    headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600')

    return applyCorsHeaders(
      Response.json({ locale, quirk }, { headers }),
      request,
    )
  } catch {
    return apiErrorJson(
      { code: 'SERVER_ERROR' },
      request,
      500,
      rateHeaders,
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return applyCorsHeaders(new Response(null, { status: 204 }), request)
}
