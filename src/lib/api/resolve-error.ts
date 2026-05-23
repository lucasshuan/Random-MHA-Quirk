import type { I18nContextValue } from '@/i18n/types'
import {
  ApiRequestError,
  type ApiErrorCode,
  apiErrorParams,
  isApiErrorCode,
} from './errors'

const ERROR_I18N_KEYS: Record<ApiErrorCode, string> = {
  RATE_LIMIT_FUSION: 'api.errors.rateLimitFusion',
  RATE_LIMIT_API: 'api.errors.rateLimitApi',
  INVALID_JSON: 'api.errors.invalidJson',
  MISSING_FUSION_FIELDS: 'api.errors.missingFusionFields',
  MISSING_LOCALE: 'api.errors.missingLocale',
  QUIRK_NOT_FOUND: 'api.errors.quirkNotFound',
  FUSION_GENERATE_FAILED: 'api.errors.fusionGenerateFailed',
  SERVER_ERROR: 'api.errors.serverError',
}

export function resolveApiErrorMessage(
  t: I18nContextValue['t'],
  error: unknown,
): string {
  if (error instanceof ApiRequestError) {
    return t(ERROR_I18N_KEYS[error.code], error.params)
  }

  if (error instanceof Error && isApiErrorCode(error.message)) {
    return t(ERROR_I18N_KEYS[error.message])
  }

  return t('api.errors.fusionGenerateFailed')
}

export function parseApiErrorBody(body: unknown): ApiRequestError | null {
  if (!body || typeof body !== 'object') return null
  const record = body as Record<string, unknown>
  const errorBlock = record.error
  if (!errorBlock || typeof errorBlock !== 'object') return null

  const code =
    typeof (errorBlock as Record<string, unknown>).code === 'string'
      ? (errorBlock as Record<string, unknown>).code.trim()
      : ''
  if (!isApiErrorCode(code)) return null

  const retryAfterSec =
    typeof (errorBlock as Record<string, unknown>).retryAfterSec === 'number'
      ? (errorBlock as Record<string, unknown>).retryAfterSec
      : undefined

  const payload = {
    code,
    retryAfterSec,
    minutes:
      typeof (errorBlock as Record<string, unknown>).minutes === 'number'
        ? (errorBlock as Record<string, unknown>).minutes
        : undefined,
  }

  return new ApiRequestError(code, apiErrorParams(payload))
}
