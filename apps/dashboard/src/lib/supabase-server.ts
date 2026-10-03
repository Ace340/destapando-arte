import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Env vars — create apps/dashboard/.env BY HAND (repo rules block agents from **/*.env*):
//   SUPABASE_URL=https://<project>.supabase.co
//   SUPABASE_SECRET_KEY=sb_secret_...   (bypasses RLS; never prefix with NEXT_PUBLIC_)

export function isConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY)
}

let client: SupabaseClient | undefined

export function db(): SupabaseClient {
  if (!isConfigured()) {
    throw new Error(
      'Faltan las variables de entorno. Crea apps/dashboard/.env con SUPABASE_URL y SUPABASE_SECRET_KEY (ver src/lib/supabase-server.ts).',
    )
  }
  client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)
  return client
}
