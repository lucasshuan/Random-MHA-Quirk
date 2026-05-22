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

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return adminClient
}
