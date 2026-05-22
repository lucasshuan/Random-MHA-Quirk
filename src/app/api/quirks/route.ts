import { NextRequest } from 'next/server'
import { parseLocaleParam, parseQuirkFiltersFromSearchParams } from '@/server/quirks/params'
import { getFilteredQuirks, getQuirksCatalog } from '@/server/quirks/service'

export const runtime = 'nodejs'

const CACHE_HEADER = 'public, s-maxage=86400, stale-while-revalidate=3600'

export async function GET(request: NextRequest) {
  const locale = parseLocaleParam(request.nextUrl.searchParams.get('locale'))

  if (!locale) {
    return Response.json(
      { message: 'Query param "locale" is required (en, pt-BR, es).' },
      { status: 400 },
    )
  }

  try {
    const filters = parseQuirkFiltersFromSearchParams(request.nextUrl.searchParams)
    const { quirks, total, filtered } = await getFilteredQuirks(locale, filters)

    return Response.json(
      { locale, quirks, total, filtered },
      {
        headers: {
          'Cache-Control': filtered ? 'private, no-store' : CACHE_HEADER,
        },
      },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ message }, { status: 500 })
  }
}

/** Head request for cache warming — same as GET without body parsing cost in clients. */
export async function HEAD(request: NextRequest) {
  const locale = parseLocaleParam(request.nextUrl.searchParams.get('locale'))
  if (!locale) {
    return new Response(null, { status: 400 })
  }

  try {
    await getQuirksCatalog(locale)
    return new Response(null, {
      status: 200,
      headers: { 'Cache-Control': CACHE_HEADER },
    })
  } catch {
    return new Response(null, { status: 500 })
  }
}
