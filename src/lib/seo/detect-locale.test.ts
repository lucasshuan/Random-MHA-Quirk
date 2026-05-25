import { describe, expect, it } from 'vitest'
import { detectLocaleFromAcceptLanguage } from './detect-locale'

describe('detectLocaleFromAcceptLanguage', () => {
  it('prefers pt-BR when Portuguese is listed first', () => {
    expect(detectLocaleFromAcceptLanguage('pt-BR,en;q=0.9')).toBe('pt-BR')
  })

  it('prefers es when Spanish is listed first', () => {
    expect(detectLocaleFromAcceptLanguage('es-MX,en;q=0.8')).toBe('es')
  })

  it('defaults to en for empty or unknown tags', () => {
    expect(detectLocaleFromAcceptLanguage(null)).toBe('en')
    expect(detectLocaleFromAcceptLanguage('de-DE,fr;q=0.5')).toBe('en')
  })
})
