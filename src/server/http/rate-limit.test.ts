import { describe, expect, it } from 'vitest'
import { checkRateLimit } from './rate-limit'

describe('checkRateLimit', () => {
  it('allows requests up to the configured max', () => {
    const config = { windowMs: 60_000, maxRequests: 3 }
    expect(checkRateLimit('test-a', '1.2.3.4', config).allowed).toBe(true)
    expect(checkRateLimit('test-a', '1.2.3.4', config).allowed).toBe(true)
    expect(checkRateLimit('test-a', '1.2.3.4', config).allowed).toBe(true)
    expect(checkRateLimit('test-a', '1.2.3.4', config).allowed).toBe(false)
  })

  it('tracks IPs separately', () => {
    const config = { windowMs: 60_000, maxRequests: 1 }
    expect(checkRateLimit('test-b', '1.1.1.1', config).allowed).toBe(true)
    expect(checkRateLimit('test-b', '1.1.1.1', config).allowed).toBe(false)
    expect(checkRateLimit('test-b', '2.2.2.2', config).allowed).toBe(true)
  })
})
