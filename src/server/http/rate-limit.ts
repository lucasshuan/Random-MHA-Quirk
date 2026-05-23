import { getClientIp } from './client-ip'

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number
  retryAfterSec: number
}

interface BucketRecord {
  count: number
  resetAt: number
}

const buckets = new Map<string, BucketRecord>()

function readIntEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim()
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/** No cap during `pnpm dev` (NODE_ENV=development). Set RATE_LIMIT_FORCE=1 to test limits locally. */
export function isRateLimitDisabled(): boolean {
  if (process.env.RATE_LIMIT_FORCE === '1') return false
  return process.env.NODE_ENV === 'development'
}

function unlimitedRateLimitResult(): RateLimitResult {
  const resetAt = Date.now() + 86_400_000
  return {
    allowed: true,
    limit: 0,
    remaining: 0,
    resetAt,
    retryAfterSec: 0,
  }
}

/** Catalog reads — generous but blocks obvious scraping bursts. */
export const API_READ_RATE_LIMIT: RateLimitConfig = {
  windowMs: readIntEnv('RATE_LIMIT_API_WINDOW_MS', 60_000),
  maxRequests: readIntEnv('RATE_LIMIT_API_MAX', 90),
}

/** Fusion generation — strict (direct LLM cost). */
export const FUSION_GENERATE_RATE_LIMIT: RateLimitConfig = {
  windowMs: readIntEnv('RATE_LIMIT_FUSION_WINDOW_MS', 300_000),
  maxRequests: readIntEnv('RATE_LIMIT_FUSION_MAX', 10),
}

function bucketKey(namespace: string, ip: string): string {
  return `${namespace}:${ip}`
}

export function checkRateLimit(
  namespace: string,
  ip: string,
  config: RateLimitConfig,
): RateLimitResult {
  if (isRateLimitDisabled()) {
    return unlimitedRateLimitResult()
  }

  const now = Date.now()
  const key = bucketKey(namespace, ip)
  const record = buckets.get(key)

  if (!record || now >= record.resetAt) {
    const resetAt = now + config.windowMs
    buckets.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - 1),
      resetAt,
      retryAfterSec: Math.ceil(config.windowMs / 1000),
    }
  }

  if (record.count >= config.maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000))
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfterSec,
    }
  }

  record.count += 1
  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetAt: record.resetAt,
    retryAfterSec: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
  }
}

export function checkApiReadRateLimit(request: Request): RateLimitResult {
  return checkRateLimit('api-read', getClientIp(request), API_READ_RATE_LIMIT)
}

export function checkFusionGenerateRateLimit(request: Request): RateLimitResult {
  return checkRateLimit(
    'fusion-generate',
    getClientIp(request),
    FUSION_GENERATE_RATE_LIMIT,
  )
}

export function rateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', String(result.limit))
  headers.set('X-RateLimit-Remaining', String(result.remaining))
  headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))
  if (!result.allowed) {
    headers.set('Retry-After', String(result.retryAfterSec))
  }
  return headers
}

/** @deprecated Use checkFusionGenerateRateLimit — kept for imports during migration. */
export function checkFusionRateLimit(ip: string): boolean {
  return checkRateLimit('fusion-generate', ip, FUSION_GENERATE_RATE_LIMIT).allowed
}
