import { supabaseClient } from './supabase'
import type { CatalogRow } from './artworks'
import { unwrap } from './unwrap'
import type { City, CityPlace } from './types'

// Las Ciudades (GLOSSARY / ADR-0024): hand-created editorial entities — the
// Tablero creates them and creation is the listing gate (no draft state, no
// derived threshold, unlike Artistas). Same anon-key public reads as the
// catalog: RLS hides nothing here (public-read policies), and obras are
// derived from published artworks, never hand-typed.

// A city plus the ids of its hand-curated Lugares — the count feeds the
// list row's secondary line.
export interface CityListRow extends City {
  city_places: Pick<CityPlace, 'id'>[] | null
}

export interface CityBundle {
  city: City
  lugares: CityPlace[]
}

export interface CityPageData extends CityBundle {
  obras: CatalogRow[]
}

// Pure: lugar count for the list row — mirrors publishedCount in
// lib/artists.ts (client-side count over a minimal embed).
export function lugarCount(city: CityListRow): number {
  return city.city_places?.length ?? 0
}

// The Ciudades tab: every created city, in the editor's hand order.
export async function listCities(): Promise<CityListRow[]> {
  const response = await supabaseClient()
    .from('cities')
    .select('*, city_places(id)')
    .order('position')
  return unwrap<CityListRow[]>(response, 'Ciudades') ?? []
}

// The Ciudad page header + its hand-curated Lugares, in the editor's hand
// order. Null for an unknown slug — the screen serves the honest stub.
export async function getCityBySlug(slug: string): Promise<CityBundle | null> {
  const response = await supabaseClient()
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  const city = unwrap<City>(response, `Ciudad ${slug}`)
  if (!city) return null

  const placesResponse = await supabaseClient()
    .from('city_places')
    .select('*')
    .eq('city_id', city.id)
    .order('position')
  const lugares = unwrap<CityPlace[]>(placesResponse, 'Lugares') ?? []
  return { city, lugares }
}

// Obras aquí (ADR-0024): published catalog obras with a physical_instance
// in the city — linked by NAME (physical_instances.city = cities.name, both
// stored in Spanish, ADR-0009). The !inner join drops obras without a
// matching instance (left-join semantics would return every obra); the
// artist embed keeps the mandatory FK hint (see lib/artworks.ts —
// artworksArtistId is one of several FK paths, PostgREST can't infer it).
export async function obrasEnCiudad(cityName: string): Promise<CatalogRow[]> {
  const response = await supabaseClient()
    .from('artworks')
    .select('*, artists!artworks_artist_id_fkey(slug, name), image_assets(kind, source_url, credit), physical_instances!inner(city)')
    .eq('story_status', 'published')
    .eq('physical_instances.city', cityName)
    .order('title_es')
  return unwrap<CatalogRow[]>(response, `Obras en ${cityName}`) ?? []
}
