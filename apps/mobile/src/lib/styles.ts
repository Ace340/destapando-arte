import { supabaseClient } from './supabase'
import { displayUrl } from './image-url'
import { unwrap } from './unwrap'
import type { CatalogRow } from './artworks'
import type { Style } from './types'

// El Estilo (GLOSSARY, ADR-0025): the art-style taxonomy, read through the
// anon key — RLS already hides unpublished works, so embedded artworks
// arrive published-only. No creation here: styles are seed/import data
// (migration 20261126120000), never hand-typed in the app.

// Dev-time only (ADR-0025): the «Sin clasificar» chip routes here. It is
// not a styles row — this pseudo-slug retires when published-obras style
// coverage is complete. A placeholder, not a permanent type.
export const SIN_CLASIFICAR = 'sin-clasificar'

// The artwork embed the CatalogRow needs — identical shape to
// lib/artworks' list select.
const EMBED =
  '*, artists!artworks_artist_id_fkey(slug, name), image_assets(kind, source_url, credit)'

// The strip chip (ADR-0025): the style plus its representative obra, the
// ADR-0023 derivation — the style's first published obra with a display
// image, by title order; null when none (the chip renders its bare
// gradient, no monogram lie about art that isn't there).
export interface StyleChipRow extends Style {
  representative: { palette: readonly string[]; source: string | null } | null
}

// The rows the list query returns: each style with its embedded obras.
interface StyleWithObras extends Style {
  artworks: {
    id: string
    slug: string
    title_es: string
    palette: string[]
    image_assets: CatalogRow['image_assets']
  }[] | null
}

export async function list(): Promise<StyleChipRow[]> {
  const response = await supabaseClient()
    .from('styles')
    .select(
      '*, artworks!artworks_style_id_fkey(id, slug, title_es, palette, image_assets(kind, source_url, credit))',
    )
    .order('name')
    .order('title_es', { referencedTable: 'artworks' })
  const rows = unwrap<StyleWithObras[]>(response, 'Estilos') ?? []
  return rows.map((row): StyleChipRow => {
    const { artworks: obras, ...style } = row
    const first = (obras ?? []).find((obra) =>
      (obra.image_assets ?? []).some((asset) => asset.kind === 'display'),
    )
    const display = first?.image_assets?.find((asset) => asset.kind === 'display') ?? null
    return {
      ...style,
      representative: first
        ? { palette: first.palette, source: display ? displayUrl(display.source_url, 240) : null }
        : null,
    }
  })
}

export interface StyleBundle {
  style: Style | null // null = «Sin clasificar» (dev-time chip, ADR-0025)
  obras: CatalogRow[]
}

// The browse-list bundle: the style (or the sin-clasificar pseudo-route)
// plus its published obras in title order. The strip chip tap lands here
// (single-select, ADR-0025).
export async function bundle(slug: string): Promise<StyleBundle | null> {
  if (slug === SIN_CLASIFICAR) {
    const response = await supabaseClient()
      .from('artworks')
      .select(EMBED)
      .eq('story_status', 'published')
      .is('style_id', null)
      .order('title_es')
    return { style: null, obras: unwrap<CatalogRow[]>(response, 'Sin clasificar') ?? [] }
  }

  const response = await supabaseClient()
    .from('styles')
    .select('id, slug, name, wikidata_id')
    .eq('slug', slug)
    .maybeSingle()
  const style = unwrap<Style>(response, `Estilo ${slug}`)
  if (!style) return null

  const obrasResponse = await supabaseClient()
    .from('artworks')
    .select(EMBED)
    .eq('story_status', 'published')
    .eq('style_id', style.id)
    .order('title_es')
  return { style, obras: unwrap<CatalogRow[]>(obrasResponse, 'Obras') ?? [] }
}
