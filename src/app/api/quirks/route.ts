import { NextRequest } from 'next/server'
import { apiErrorJson, rateLimitedJson } from '@/server/http/api-errors'
import { applyCorsHeaders } from '@/server/http/cors'
import { checkApiReadRateLimit, rateLimitHeaders } from '@/server/http/rate-limit'
import {
  parseLocaleParam,
  parsePageParam,
  parsePageSizeParam,
  parseQuirkFiltersFromSearchParams,
} from '@/server/quirks/params'
import { getFilteredQuirks, getPaginatedQuirks, getQuirksCatalog } from '@/server/quirks/service'

export const runtime = 'nodejs'

const CACHE_HEADER =
  process.env.NODE_ENV === 'development'
    ? 'private, no-store'
    : 'public, s-maxage=86400, stale-while-revalidate=3600'

function mergeHeaders(rate: Headers, extra?: Record<string, string>): Headers {
  const headers = new Headers(rate)
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      headers.set(key, value)
    }
  }
  return headers
}

export async function GET(request: NextRequest) {
  const rate = checkApiReadRateLimit(request)
  const rateHeaders = rateLimitHeaders(rate)

  if (!rate.allowed) {
    return rateLimitedJson(request, rate, 'RATE_LIMIT_API', rateHeaders)
  }

  const locale = parseLocaleParam(request.nextUrl.searchParams.get('locale'))

  if (!locale) {
    return apiErrorJson(
      { code: 'MISSING_LOCALE' },
      request,
      400,
      rateHeaders,
    )
  }

  try {
    const params = request.nextUrl.searchParams
    const filters = parseQuirkFiltersFromSearchParams(params)
    const paginate = params.get('paginate') === '1' || params.has('page')

    if (paginate) {
      const page = parsePageParam(params.get('page'))
      const pageSize = parsePageSizeParam(params.get('limit'))
      const result = await getPaginatedQuirks(locale, filters, page, pageSize)

      return applyCorsHeaders(
        Response.json(
          {
            locale: result.locale,
            quirks: result.quirks,
            entries: result.entries,
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
            pageCount: result.pageCount,
            filtered: result.filtered,
          },
          {
            headers: mergeHeaders(rateHeaders, {
              'Cache-Control': 'private, no-store',
            }),
          },
        ),
        request,
      )
    }

    const { quirks, total, filtered } = await getFilteredQuirks(locale, filters)

    return applyCorsHeaders(
      Response.json(
        { locale, quirks, total, filtered },
        {
          headers: mergeHeaders(rateHeaders, {
            'Cache-Control': filtered ? 'private, no-store' : CACHE_HEADER,
          }),
        },
      ),
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

export async function HEAD(request: NextRequest) {
  const rate = checkApiReadRateLimit(request)
  const rateHeaders = rateLimitHeaders(rate)

  if (!rate.allowed) {
    return applyCorsHeaders(
      new Response(null, { status: 429, headers: rateHeaders }),
      request,
    )
  }

  const locale = parseLocaleParam(request.nextUrl.searchParams.get('locale'))
  if (!locale) {
    return applyCorsHeaders(
      new Response(null, { status: 400, headers: rateHeaders }),
      request,
    )
  }

  try {
    await getQuirksCatalog(locale)
    return applyCorsHeaders(
      new Response(null, {
        status: 200,
        headers: mergeHeaders(rateHeaders, { 'Cache-Control': CACHE_HEADER }),
      }),
      request,
    )
  } catch {
    return applyCorsHeaders(
      new Response(null, { status: 500, headers: rateHeaders }),
      request,
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return applyCorsHeaders(new Response(null, { status: 204 }), request)
}
