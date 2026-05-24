import { describe, expect, it } from 'vitest'
import { isOriginAllowed } from './cors'

describe('isOriginAllowed', () => {
  it('allows missing origin (typical same-origin fetch)', () => {
    const request = new Request('https://app.example/api/fusion/generate')
    expect(isOriginAllowed(null, request)).toBe(true)
  })

  it('allows origin when host matches the request Host header', () => {
    const request = new Request('https://internal.vercel.app/api/fusion/generate', {
      headers: {
        origin: 'https://www.myapp.com',
        host: 'www.myapp.com',
      },
    })
    expect(isOriginAllowed('https://www.myapp.com', request)).toBe(true)
  })

  it('allows origin when host matches x-forwarded-host', () => {
    const request = new Request('https://x.vercel.app/api/quirks', {
      headers: {
        origin: 'https://custom.example',
        'x-forwarded-host': 'custom.example',
      },
    })
    expect(isOriginAllowed('https://custom.example', request)).toBe(true)
  })

  it('rejects foreign origin not on the allow list', () => {
    const request = new Request('https://app.example/api/quirks', {
      headers: {
        origin: 'https://evil.example',
        host: 'app.example',
      },
    })
    expect(isOriginAllowed('https://evil.example', request)).toBe(false)
  })
})
