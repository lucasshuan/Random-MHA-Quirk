import { generateFusionEntry } from '@/lib/server/fusion/generate'
import { checkFusionRateLimit } from '@/lib/server/fusion/rateLimit'
import type { QuirkId } from '@/data/quirk-ids'

export const runtime = 'nodejs'

interface FusionRequestBody {
  parentA?: string
  parentB?: string
  seed?: string
  force?: boolean
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown'
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  if (!checkFusionRateLimit(ip)) {
    return Response.json(
      { message: 'Muitas requisições. Tente novamente em um minuto.' },
      { status: 429 },
    )
  }

  let body: FusionRequestBody
  try {
    body = (await request.json()) as FusionRequestBody
  } catch {
    return Response.json({ message: 'JSON inválido.' }, { status: 400 })
  }

  const { parentA, parentB, seed, force } = body
  if (!parentA || !parentB || !seed) {
    return Response.json(
      { message: 'parentA, parentB e seed são obrigatórios.' },
      { status: 400 },
    )
  }

  try {
    const { entry, cached, generated } = await generateFusionEntry({
      idA: parentA,
      idB: parentB,
      seed,
      force: force ?? false,
    })

    return Response.json({
      entry: {
        ...entry,
        parents: entry.parents as [QuirkId, QuirkId],
      },
      cached,
      generated,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ message }, { status: 500 })
  }
}
