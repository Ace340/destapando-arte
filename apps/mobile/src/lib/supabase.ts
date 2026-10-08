import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Env vars — create apps/mobile/.env BY HAND (repo rules block agents from **/*.env*):
//   EXPO_PUBLIC_SUPABASE_URL=http://10.0.2.2:54321   (emulador Android → stack local)
//   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key de `supabase status`>
// La clave anon respeta RLS: solo lectura pública. La secret key NUNCA va en la app.

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

export function isConfigured(): boolean {
  return Boolean(url && anonKey)
}

let client: SupabaseClient | undefined

export function db(): SupabaseClient {
  if (!isConfigured()) {
    throw new Error(
      'Faltan las variables de entorno. Crea apps/mobile/.env con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY (ver src/lib/supabase.ts).',
    )
  }
  client ??= createClient(url!, anonKey!, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
  return client
}
