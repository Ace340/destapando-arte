import { db } from './supabase'
import type { Artwork, Artist, Curiosity, Film, FilmConnection } from './types'

// Public reads through the anon key. RLS already hides unpublished works;
// the explicit `story_status = 'published'` filter is the query-side mirror
// of the web's public truth gate (apps/dashboard/src/app/obra/[slug]/page.tsx).

export interface CatalogRow extends Artwork {
  artists: Pick<Artist, 'slug' | 'name'> | null
}

export interface ConnectionRow extends FilmConnection {
  films: Film | null
}

export interface StoryBundle {
  artwork: CatalogRow
  curiosities: Curiosity[]
  connections: ConnectionRow[]
}

export async function list(): Promise<CatalogRow[]> {
  const { data, error } = await db()
    .from('artworks')
    .select('*, artists(slug, name)')
    .eq('story_status', 'published')
    .order('title_es')
  if (error) throw new Error(`Catálogo: ${error.message}`)
  return (data ?? []) as CatalogRow[]
}

export async function get(slug: string): Promise<StoryBundle | null> {
  const { data, error } = await db()
    .from('artworks')
    .select('*, artists(slug, name)')
    .eq('slug', slug)
    .eq('story_status', 'published')
    .maybeSingle()
  if (error) throw new Error(`Obra ${slug}: ${error.message}`)
  if (!data) return null

  const artwork = data as CatalogRow
  const [curiosities, connections] = await Promise.all([
    curiositiesOf(artwork.id),
    connectionsOf(artwork.id),
  ])
  return { artwork, curiosities, connections }
}

async function curiositiesOf(artworkId: string): Promise<Curiosity[]> {
  const { data, error } = await db()
    .from('curiosities')
    .select('*')
    .eq('artwork_id', artworkId)
    .order('position')
  if (error) throw new Error(`Curiosidades: ${error.message}`)
  return (data ?? []) as Curiosity[]
}

async function connectionsOf(artworkId: string): Promise<ConnectionRow[]> {
  const { data, error } = await db()
    .from('film_connections')
    .select('*, films(*)')
    .eq('artwork_id', artworkId)
  if (error) throw new Error(`Conexiones: ${error.message}`)
  return (data ?? []) as ConnectionRow[]
}
