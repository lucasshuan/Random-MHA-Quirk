import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /** Agents SDK + OpenAI client must run as native Node modules (not Turbopack-bundled). */
  serverExternalPackages: [
    '@openai/agents',
    '@openai/agents-core',
    '@openai/agents-openai',
    'openai',
  ],
}

export default nextConfig
