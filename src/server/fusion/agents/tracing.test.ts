import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  fusionTraceGroupId,
  resolveFusionTraceIncludeSensitiveData,
  resolveFusionTracingDisabled,
} from './tracing'

const ENV_KEYS = [
  'OPENAI_AGENTS_DISABLE_TRACING',
  'FUSION_AGENT_TRACING_DISABLED',
  'FUSION_AGENT_TRACE_SENSITIVE_DATA',
  'NODE_ENV',
] as const

const envSnapshot = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof ENV_KEYS)[number], string | undefined>

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = envSnapshot[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

describe('fusionTraceGroupId', () => {
  it('builds a stable group id from pair key and seed', () => {
    expect(fusionTraceGroupId('a+b', 'deadbeef')).toBe('fusion:a+b:deadbeef')
  })
})

describe('resolveFusionTracingDisabled', () => {
  it('honors SDK-wide and fusion-specific disable flags', () => {
    delete process.env.OPENAI_AGENTS_DISABLE_TRACING
    delete process.env.FUSION_AGENT_TRACING_DISABLED
    expect(resolveFusionTracingDisabled()).toBe(false)

    process.env.FUSION_AGENT_TRACING_DISABLED = '1'
    expect(resolveFusionTracingDisabled()).toBe(true)

    delete process.env.FUSION_AGENT_TRACING_DISABLED
    process.env.OPENAI_AGENTS_DISABLE_TRACING = 'true'
    expect(resolveFusionTracingDisabled()).toBe(true)
  })
})

describe('resolveFusionTraceIncludeSensitiveData', () => {
  it('defaults to off in production and on otherwise', () => {
    delete process.env.FUSION_AGENT_TRACE_SENSITIVE_DATA
    vi.stubEnv('NODE_ENV', 'production')
    expect(resolveFusionTraceIncludeSensitiveData()).toBe(false)

    vi.stubEnv('NODE_ENV', 'development')
    expect(resolveFusionTraceIncludeSensitiveData()).toBe(true)
  })

  it('allows explicit override', () => {
    vi.stubEnv('NODE_ENV', 'production')
    process.env.FUSION_AGENT_TRACE_SENSITIVE_DATA = '1'
    expect(resolveFusionTraceIncludeSensitiveData()).toBe(true)
  })
})
