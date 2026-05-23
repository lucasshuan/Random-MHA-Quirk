import { describe, expect, it } from 'vitest'
import { en } from '@/i18n/messages/ui/en'
import { translate } from '@/i18n/translate'
import { ApiRequestError } from './errors'
import { parseApiErrorBody, resolveApiErrorMessage } from './resolve-error'

const t = (key: string, values?: Record<string, string | number>) =>
  translate('en', key, values)

describe('parseApiErrorBody', () => {
  it('parses rate limit fusion with retryAfterSec', () => {
    const err = parseApiErrorBody({
      error: { code: 'RATE_LIMIT_FUSION', retryAfterSec: 180 },
    })
    expect(err).toBeInstanceOf(ApiRequestError)
    expect(err?.code).toBe('RATE_LIMIT_FUSION')
    expect(err?.params?.minutes).toBe(3)
  })
})

describe('resolveApiErrorMessage', () => {
  it('localizes rate limit fusion in English', () => {
    const msg = resolveApiErrorMessage(
      t,
      new ApiRequestError('RATE_LIMIT_FUSION', { minutes: 5 }),
    )
    expect(msg).toContain('5')
    expect(msg).toContain('10 per 5 minutes')
  })
})
