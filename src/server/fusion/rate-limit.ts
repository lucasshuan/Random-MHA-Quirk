const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

const hits = new Map<string, { count: number; resetAt: number }>()

export function checkFusionRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = hits.get(ip)

  if (!record || now >= record.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (record.count >= MAX_REQUESTS) {
    return false
  }

  record.count += 1
  return true
}
