export const API_ERROR_CODES = [
  'RATE_LIMIT_FUSION',
  'RATE_LIMIT_API',
  'FORBIDDEN',
  'INVALID_JSON',
  'MISSING_FUSION_FIELDS',
  'MISSING_LOCALE',
  'QUIRK_NOT_FOUND',
  'FUSION_GENERATE_FAILED',
  'SERVER_ERROR',
] as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[number]

export interface ApiErrorPayload {
  code: ApiErrorCode
  retryAfterSec?: number
  minutes?: number
}

export function isApiErrorCode(value: string): value is ApiErrorCode {
  return (API_ERROR_CODES as readonly string[]).includes(value)
}

export function minutesFromRetryAfterSec(retryAfterSec: number): number {
  return Math.max(1, Math.ceil(retryAfterSec / 60))
}

export class ApiRequestError extends Error {
  readonly code: ApiErrorCode
  readonly params?: Record<string, string | number>

  constructor(code: ApiErrorCode, params?: Record<string, string | number>) {
    super(code)
    this.name = 'ApiRequestError'
    this.code = code
    this.params = params
  }
}

export function apiErrorParams(
  payload: ApiErrorPayload,
): Record<string, string | number> | undefined {
  if (payload.code === 'RATE_LIMIT_FUSION' || payload.code === 'RATE_LIMIT_API') {
    const minutes =
      payload.minutes ??
      (payload.retryAfterSec
        ? minutesFromRetryAfterSec(payload.retryAfterSec)
        : 5)
    return { minutes }
  }
  return undefined
}
