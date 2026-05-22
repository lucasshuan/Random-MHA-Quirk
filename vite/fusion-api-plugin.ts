import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function createMiddleware(root: string) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url?.split('?')[0]
    if (url !== '/api/fusion/generate' || req.method !== 'POST') {
      next()
      return
    }

    try {
      const body = (await readJsonBody(req)) as {
        parentA?: string
        parentB?: string
        seed?: string
        force?: boolean
      }

      if (!body.parentA || !body.parentB || !body.seed) {
        sendJson(res, 400, { message: 'parentA, parentB e seed são obrigatórios.' })
        return
      }

      const { generateFusionEntry } = await import('../scripts/lib/fusion-generate-core.mjs')
      const { entry, cached } = await generateFusionEntry({
        root,
        idA: body.parentA,
        idB: body.parentB,
        seed: body.seed,
        force: Boolean(body.force),
      })

      sendJson(res, 200, { entry, cached })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar fusão.'
      sendJson(res, 500, { message })
    }
  }
}

export function fusionApiPlugin(): Plugin {
  return {
    name: 'fusion-api',
    configureServer(server) {
      server.middlewares.use(createMiddleware(server.config.root))
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMiddleware(server.config.root))
    },
  }
}
