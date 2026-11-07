import 'server-only'
import { db } from './supabase-server'
import { displayUrl } from './image-url'
import type { Artwork, Artist, ImageAsset } from './types'

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

// The extra palette + display asset feed resolveSello (ADR-0023).
export type ObrasRow = Pick<
  Artwork,
  'id' | 'slug' | 'title_es' | 'year' | 'story_status' | 'palette'
> & {
  image_assets: Pick<ImageAsset, 'kind' | 'source_url'>[] | null
}

// Minimal obra shape the Sello derivation needs (ADR-0023) — ObrasRow
// satisfies it.
export type SelloObra = Pick<ObrasRow, 'id' | 'story_status' | 'title_es' | 'palette'> & {
  image_assets: Pick<ImageAsset, 'kind' | 'source_url'>[] | null
}

// Small request width — the Sello renders at 44–64px.
const SELLO_WIDTH = 160

export interface SelloSource {
  imageUrl: string | null
  palette: readonly string[]
}

// Pure: the Sello source (GLOSSARY, ADR-0023 as amended 2026-11-06). Mirror
// of apps/mobile/src/lib/artists.ts resolveSello — no drift. The editor's
// pointer wins only when it names a published obra that carries a display
// asset — the pointer can upgrade the picture, never degrade it to a
// monogram. Without a live pointer, the alphabetically first published obra
// (title_es) with a display image supplies the picture, through the same
// Commons FilePath redirect the mobile Hero uses. With neither, the first
// obra's palette carries the monogram; an empty palette resolves to the
// neutral base in the Sello component. Sorting happens here: nested embeds
// arrive unordered.
export function resolveSello(
  obras: readonly SelloObra[] | null | undefined,
  selloArtworkId?: string | null,
): SelloSource {
  const published = (obras ?? [])
    .filter((obra) => obra.story_status === 'published')
    .sort((a, b) => a.title_es.localeCompare(b.title_es, 'es'))
  const displayOf = (obra: SelloObra) =>
    (obra.image_assets ?? []).find((asset) => asset.kind === 'display')
  const withDisplay = published.filter((obra) => displayOf(obra) !== undefined)
  const pointed = selloArtworkId
    ? withDisplay.find((obra) => obra.id === selloArtworkId)
    : undefined
  const target = pointed ?? withDisplay[0]
  if (target) {
    const display = displayOf(target)
    return { imageUrl: display ? displayUrl(display.source_url, SELLO_WIDTH) : null, palette: target.palette }
  }
  const first = published[0]
  return { imageUrl: null, palette: first?.palette ?? [] }
}

// Pure: monogram initials for the Sello fallback — first letter of the first
// two words, uppercased ('Diego Velázquez' -> 'DV', 'El Greco' -> 'EG').
export function artistInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

// Pure: the artist's life years label ('1890 – 1920'); empty when neither
// year exists.
export function yearsLabel(artist: Pick<Artist, 'born_year' | 'died_year'>): string {
  return [artist.born_year, artist.died_year].filter(Boolean).join(' – ')
}

export async function listArtists(): Promise<ArtistRow[]> {
  const { data, error } = await db()
    .from('artists')
    .select('*, artworks!artworks_artist_id_fkey(id, slug, title_es, year, story_status)')
    .order('name')
  if (error) throw new Error(`Artistas: ${error.message}`)
  return (data ?? []) as ArtistRow[]
}

// The Artist page exists even with zero obras — the dignified stub serving
// artist-level fallback duty (ADR-0022). Palette + display assets ride along
// for the Sello derivation (ADR-0023).
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
    .select('id, slug, title_es, year, story_status, palette, image_assets(kind, source_url)')
    .eq('artist_id', (data as Artist).id)
    .order('title_es')
  if (obrasError) throw new Error(`Obras de ${slug}: ${obrasError.message}`)
  return { artist: data as Artist, obras: (obrasData ?? []) as ObrasRow[] }
}
