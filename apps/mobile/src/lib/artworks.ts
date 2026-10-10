import { supabaseClient } from './supabase'
import { displayUrl } from './image-url'
import type { Artwork, Artist, Curiosity, Film, FilmConnection, ImageAsset } from './types'

// Public reads through the anon key. RLS already hides unpublished works;
// the explicit `story_status = 'published'` filter is the query-side mirror
// of the web's public truth gate (apps/dashboard/src/app/obra/[slug]/page.tsx).

export interface CatalogRow extends Artwork {
  artists: Pick<Artist, 'slug' | 'name'> | null
  image_assets: Pick<ImageAsset, 'kind' | 'source_url' | 'credit'>[] | null
}

export interface ConnectionRow extends FilmConnection {
  films: Film | null
}

export interface StoryBundle {
  artwork: CatalogRow
  curiosities: Curiosity[]
  connections: ConnectionRow[]
}

// The display asset behind both the Hero image and its credit line (ADR-0016).
export function displayAsset(artwork: CatalogRow): NonNullable<CatalogRow['image_assets']>[number] | null {
  return artwork.image_assets?.find((asset) => asset.kind === 'display') ?? null
}

// The Hero source (ADR-0020, GLOSSARY Hero): the display asset through the
// Commons FilePath redirect. Null when the work is story-only (ADR-0003) —
// the caller falls back to the palette gradient.
export function heroSource(artwork: CatalogRow, width = 1080): string | null {
  const display = displayAsset(artwork)
  return display ? displayUrl(display.source_url, width) : null
}

// ADR-0016 attribution: cheap and honest — the display asset's credit line.
export function heroCredit(artwork: CatalogRow): string | null {
  return displayAsset(artwork)?.credit ?? null
}

// One honest error per query — the four fetches below share this shape.
function unwrap<T>(response: { data: T | null; error: { message: string } | null }, label: string): T | null {
  if (response.error) throw new Error(`${label}: ${response.error.message}`)
  return response.data ?? null
}

export async function list(): Promise<CatalogRow[]> {
  const response = await supabaseClient()
    .from('artworks')
    .select('*, artists(slug, name), image_assets(kind, source_url, credit)')
    .eq('story_status', 'published')
    .order('title_es')
  return unwrap<CatalogRow[]>(response, 'Catálogo') ?? []
}

export async function get(slug: string): Promise<StoryBundle | null> {
  const response = await supabaseClient()
    .from('artworks')
    .select('*, artists(slug, name), image_assets(kind, source_url, credit)')
    .eq('slug', slug)
    .eq('story_status', 'published')
    .maybeSingle()
  const artwork = unwrap<CatalogRow>(response, `Obra ${slug}`)
  if (!artwork) return null

  const [curiosities, connections] = await Promise.all([
    curiositiesOf(artwork.id),
    connectionsOf(artwork.id),
  ])
  return { artwork, curiosities, connections }
}

async function curiositiesOf(artworkId: string): Promise<Curiosity[]> {
  const response = await supabaseClient()
    .from('curiosities')
    .select('*')
    .eq('artwork_id', artworkId)
    .order('position')
  return unwrap<Curiosity[]>(response, 'Curiosidades') ?? []
}

async function connectionsOf(artworkId: string): Promise<ConnectionRow[]> {
  const response = await supabaseClient()
    .from('film_connections')
    .select('*, films(*)')
    .eq('artwork_id', artworkId)
  return unwrap<ConnectionRow[]>(response, 'Conexiones') ?? []
}
