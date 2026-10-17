import 'server-only'
import { db } from './supabase-server'
import type { Artwork, Artist } from './types'

// ADR-0022: the Artist aggregation. The secret key bypasses RLS, so the
// public page filters published obras itself — the same query-side truth
// gate as /obra/[slug] (apps/dashboard/src/app/obra/[slug]/page.tsx). The
// Tablero editor (apps/dashboard/src/app/taller/[slug]) sees all statuses.

export interface ArtistRow extends Artist {
  artworks: Pick<Artwork, 'id' | 'slug' | 'title_es' | 'year' | 'story_status'>[] | null
}

export interface ArtistBundle {
  artist: Artist
  obras: ObrasRow[]
}

export type ObrasRow = NonNullable<ArtistRow['artworks']>[number]

export async function listArtists(): Promise<ArtistRow[]> {
  const { data, error } = await db()
    .from('artists')
    .select('*, artworks(id, slug, title_es, year, story_status)')
    .order('name')
  if (error) throw new Error(`Artistas: ${error.message}`)
  return (data ?? []) as ArtistRow[]
}

// The Artist page exists even with zero obras — the dignified stub serving
// artist-level fallback duty (ADR-0022).
export async function getArtist(slug: string): Promise<ArtistBundle | null> {
  const { data, error } = await db()
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw new Error(`Artista ${slug}: ${error.message}`)
  if (!data) return null

  const { data: obrasData, error: obrasError } = await db()
    .from('artworks')
    .select('id, slug, title_es, year, story_status')
    .eq('artist_id', (data as Artist).id)
    .order('title_es')
  if (obrasError) throw new Error(`Obras de ${slug}: ${obrasError.message}`)
  return { artist: data as Artist, obras: (obrasData ?? []) as ObrasRow[] }
}
