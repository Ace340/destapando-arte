import { supabaseClient } from './supabase'
import type { CatalogRow } from './artworks'
import type { Artist } from './types'

// ADR-0022 / GLOSSARY: Artistas (section) lists only artists with at least
// one published obra — the garden grows visibly. Obras (view) on the Artist
// page is derived from published artworks, never hand-typed. Same anon-key
// public truth gate as the catalog: RLS hides unpublished works, the
// explicit story_status filter is the query-side mirror
// (apps/dashboard/src/app/artista/[slug]/page.tsx).

export interface ArtistListRow extends Artist {
  artworks: Pick<CatalogRow, 'id' | 'story_status'>[] | null
}

export interface ArtistBundle {
  artist: Artist
  obras: CatalogRow[]
}

// One honest error per query — same shape as lib/artworks.ts.
function unwrap<T>(response: { data: T | null; error: { message: string } | null }, label: string): T | null {
  if (response.error) throw new Error(`${label}: ${response.error.message}`)
  return response.data ?? null
}

export function publishedCount(artist: ArtistListRow): number {
  return (artist.artworks ?? []).filter((obra) => obra.story_status === 'published').length
}

export async function listArtists(): Promise<ArtistListRow[]> {
  const response = await supabaseClient()
    .from('artists')
    // !inner: only artists with at least one published obra — the section's
    // membership rule (GLOSSARY: Artistas (section)).
    .select('*, artworks!inner(id, story_status)')
    .eq('artworks.story_status', 'published')
    .order('name')
  return unwrap<ArtistListRow[]>(response, 'Artistas') ?? []
}

// The Artist page exists even with zero published obras — the dignified
// stub serving artist-level fallback duty (ADR-0022). No inner join here.
export async function getArtist(slug: string): Promise<ArtistBundle | null> {
  const response = await supabaseClient()
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  const artist = unwrap<Artist>(response, `Artista ${slug}`)
  if (!artist) return null

  const obrasResponse = await supabaseClient()
    .from('artworks')
    .select('*, image_assets(kind, source_url, credit)')
    .eq('artist_id', artist.id)
    .eq('story_status', 'published')
    .order('title_es')
  const obras = unwrap<CatalogRow[]>(obrasResponse, 'Obras') ?? []
  return { artist, obras }
}
