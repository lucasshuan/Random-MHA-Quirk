import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let adminClient: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) {
    return adminClient
  }

  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!url || !key) {
    throw new Error(
      'Supabase não configurado: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env',
    )
  }

  if (!/^https?:\/\//i.test(url)) {
    const hint =
      url.startsWith('postgresql:') || url.startsWith('postgres:')
        ? ' SUPABASE_URL deve ser a Project URL (https://<ref>.supabase.co), não a connection string do Postgres.'
        : ' SUPABASE_URL deve começar com https://'
    throw new Error(`SUPABASE_URL inválida:${hint}`)
  }

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return adminClient
}
