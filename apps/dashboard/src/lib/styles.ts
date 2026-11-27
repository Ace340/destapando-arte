import 'server-only'
import { db } from './supabase-server'
import type { Style } from './types'

// GLOSSARY: Estilo — the art-style taxonomy (ADR-0025). Reference data:
// the Tablero's Estilo dropdown reads it; creating styles is a seed or
// import act (migration 20261126120000), never an editorial one in v1.
export async function list(): Promise<Style[]> {
  const { data, error } = await db().from('styles').select('*').order('name')
  if (error) throw new Error(`Estilos: ${error.message}`)
  return (data ?? []) as Style[]
}
