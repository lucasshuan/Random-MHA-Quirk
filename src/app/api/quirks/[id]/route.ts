import { NextRequest } from 'next/server'
import { parseLocaleParam } from '@/server/quirks/params'
import { getQuirkById } from '@/server/quirks/service'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const locale = parseLocaleParam(request.nextUrl.searchParams.get('locale'))

  if (!locale) {
    return Response.json(
      { message: 'Query param "locale" is required (en, pt-BR, es).' },
      { status: 400 },
    )
  }

  if (!id?.trim()) {
    return Response.json({ message: 'Quirk id is required.' }, { status: 400 })
  }

  try {
    const quirk = await getQuirkById(locale, id)

    if (!quirk) {
      return Response.json({ message: `Quirk not found: ${id}` }, { status: 404 })
    }

    return Response.json(
      { locale, quirk },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ message }, { status: 500 })
  }
}
