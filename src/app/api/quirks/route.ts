import { NextRequest } from 'next/server'
import { applyCorsHeaders } from '@/server/http/cors'
import { checkApiReadRateLimit, rateLimitHeaders } from '@/server/http/rate-limit'
import { parseLocaleParam, parseQuirkFiltersFromSearchParams } from '@/server/quirks/params'
import { getFilteredQuirks, getQuirksCatalog } from '@/server/quirks/service'

export const runtime = 'nodejs'

const CACHE_HEADER = 'public, s-maxage=86400, stale-while-revalidate=3600'

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
    return applyCorsHeaders(
      Response.json(
        { message: 'Muitas requisições. Tente novamente em breve.' },
        { status: 429, headers: rateHeaders },
      ),
      request,
    )
  }

  const locale = parseLocaleParam(request.nextUrl.searchParams.get('locale'))

  if (!locale) {
    return applyCorsHeaders(
      Response.json(
        { message: 'Query param "locale" is required (en, pt-BR, es).' },
        { status: 400, headers: rateHeaders },
      ),
      request,
    )
  }

  try {
    const filters = parseQuirkFiltersFromSearchParams(request.nextUrl.searchParams)
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return applyCorsHeaders(
      Response.json({ message }, { status: 500, headers: rateHeaders }),
      request,
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
