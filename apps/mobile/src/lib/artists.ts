import { supabaseClient } from './supabase'
import type { CatalogRow } from './artworks'
import { displayUrl } from './image-url'
import { unwrap } from './unwrap'
import type { Artist, ImageAsset } from './types'

// ADR-0022 / GLOSSARY: Artistas (section) lists only artists with at least
// one published obra — the garden grows visibly. Obras (view) on the Artist
// page is derived from published artworks, never hand-typed. Same anon-key
// public truth gate as the catalog: RLS hides unpublished works, the
// explicit story_status filter is the query-side mirror
// (apps/dashboard/src/app/artista/[slug]/page.tsx).

// Minimal obra shape the Sello derivation needs (ADR-0023) — satisfied by
// both the list query's embedded obras and CatalogRow on the Artist page.
export type SelloObra = Pick<CatalogRow, 'id' | 'story_status' | 'title_es' | 'palette'> & {
  image_assets: Pick<ImageAsset, 'kind' | 'source_url'>[] | null
}

export interface ArtistListRow extends Artist {
  artworks: SelloObra[] | null
}

export interface SelloSource {
  imageUrl: string | null
  palette: readonly string[]
}

// Small request width — the Sello renders at 44–64px.
const SELLO_WIDTH = 160

// Pure: the Sello source (GLOSSARY, ADR-0023 as amended 2026-11-06). The
// editor's pointer wins only when it names a published obra that carries a
// display asset — the pointer can upgrade the picture, never degrade it to
// a monogram. Without a live pointer, the alphabetically first published
// obra (title_es) with a display image supplies the picture, through the
// same Commons FilePath redirect the Hero uses. With neither, the first
// obra's palette carries the monogram; zero obras means an empty palette,
// and gradientStops resolves that to the neutral base. Sorting happens
// here: Supabase nested embeds arrive unordered.
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

export interface ArtistBundle {
  artist: Artist
  obras: CatalogRow[]
}

export function publishedCount(artist: ArtistListRow): number {
  return (artist.artworks ?? []).filter((obra) => obra.story_status === 'published').length
}

export async function listArtists(): Promise<ArtistListRow[]> {
  const response = await supabaseClient()
    .from('artists')
    // !inner: only artists with at least one published obra — the section's
    // membership rule (GLOSSARY: Artistas (section)). The extra columns feed
    // resolveSello (ADR-0023): title/palette/display image of the first obra.
    .select('*, artworks!artworks_artist_id_fkey!inner(id, story_status, title_es, palette, image_assets(kind, source_url))')
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
