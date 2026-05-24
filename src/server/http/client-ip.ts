/** Best-effort client IP for rate limiting (Vercel / reverse proxy aware). */
export function getClientIp(request: Request): string {
  const candidates = [
    request.headers.get('x-vercel-forwarded-for'),
    request.headers.get('cf-connecting-ip'),
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for'),
  ]

  for (const raw of candidates) {
    if (!raw) continue
    const ip = raw.split(',')[0]?.trim()
    if (ip) return ip
  }

  return 'unknown'
}
