import { NextRequest } from 'next/server'
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
    return applyCorsHeaders(
      Response.json(
        { message: 'Muitas requisições. Tente novamente em breve.' },
        { status: 429, headers: rateHeaders },
      ),
      request,
    )
  }

  const { id } = await context.params
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

  if (!id?.trim()) {
    return applyCorsHeaders(
      Response.json(
        { message: 'Quirk id is required.' },
        { status: 400, headers: rateHeaders },
      ),
      request,
    )
  }

  try {
    const quirk = await getQuirkById(locale, id)

    if (!quirk) {
      return applyCorsHeaders(
        Response.json(
          { message: `Quirk not found: ${id}` },
          { status: 404, headers: rateHeaders },
        ),
        request,
      )
    }

    const headers = new Headers(rateHeaders)
    headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600')

    return applyCorsHeaders(
      Response.json({ locale, quirk }, { headers }),
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

export async function OPTIONS(request: NextRequest) {
  return applyCorsHeaders(new Response(null, { status: 204 }), request)
}
