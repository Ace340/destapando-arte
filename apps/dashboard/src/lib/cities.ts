import 'server-only'
import { db } from './supabase-server'
import type { Artwork, City, CityPlace } from './types'

// Las Ciudades (ADR-0024, GLOSSARY): hand-created editorial entities — the
// Tablero creates them and creation is the listing gate. Reads mirror
// artists.ts: the secret key bypasses RLS, so the published-only gate for
// the derived «Obras aquí» happens query-side in code.

export interface CityRow extends City {
  places: CityPlace[]
  // Published catalog obras with a physical_instance in this city — the
  // link is by NAME: cities.name = physical_instances.city (both Spanish).
  publishedObras: number
}

export type CityObraRow = Pick<
  Artwork,
  'id' | 'slug' | 'title_es' | 'year' | 'story_status'
>

export interface CityBundle {
  city: City
  places: CityPlace[]
  obras: CityObraRow[]
}

// Pure: 'Ciudad de México' -> 'ciudad-de-mexico' — accent-stripped, dashed,
// lowercase. The slug is derived once at creation and never edited.
export function slugifyCity(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Published artworks with their instances' cities (versions collapse,
// ADR-0004: one row per artwork, dedup on city|artwork_id still guards
// multi-instance cases). Querying from the artworks side keeps type and
// runtime honest: the one-to-many embed really is an array, so the untyped
// client's inference matches PostgREST — no cast gymnastics needed.
interface ArtworkInstancesRow {
  id: string
  physical_instances: { city: string | null }[]
}

async function publishedObrasByCity(): Promise<Map<string, number>> {
  const { data, error } = await db()
    .from('artworks')
    .select('id, physical_instances!inner(city)')
    .eq('story_status', 'published')
  if (error) throw new Error(`Instancias físicas: ${error.message}`)
  const seen = new Set<string>()
  const counts = new Map<string, number>()
  for (const row of (data ?? []) as ArtworkInstancesRow[]) {
    for (const instance of row.physical_instances) {
      if (!instance.city) continue
      const key = `${instance.city}|${row.id}`
      if (seen.has(key)) continue
      seen.add(key)
      counts.set(instance.city, (counts.get(instance.city) ?? 0) + 1)
    }
  }
  return counts
}

export async function listCities(): Promise<CityRow[]> {
  const { data, error } = await db()
    .from('cities')
    .select('*, city_places(*)')
    .order('position')
  if (error) throw new Error(`Ciudades: ${error.message}`)
  const cities = (data ?? []) as (City & { city_places: CityPlace[] | null })[]

  const counts = await publishedObrasByCity()
  return cities.map(({ city_places, ...city }) => ({
    ...city,
    places: city_places ?? [],
    publishedObras: counts.get(city.name) ?? 0,
  }))
}

// The city editor bundle: the hand row, the curated Lugares (sorted here —
// nested embeds arrive unordered), and the derived «Obras aquí» (published
// only, versions collapsed). Unknown slug -> null -> notFound().
export async function getCity(slug: string): Promise<CityBundle | null> {
  const { data, error } = await db()
    .from('cities')
    .select('*, city_places(*)')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw new Error(`Ciudad ${slug}: ${error.message}`)
  if (!data) return null

  const { city_places, ...city } = data as City & {
    city_places: CityPlace[] | null
  }
  const places = [...(city_places ?? [])].sort((a, b) => a.position - b.position)

  // «Obras aquí»: from the artworks side with a filtered inner join — the
  // published gate rides in the query (the secret key bypasses RLS), each
  // matching obra arrives once with its instances grouped beneath it.
  const { data: obraRows, error: obrasError } = await db()
    .from('artworks')
    .select('id, slug, title_es, year, story_status, physical_instances!inner(city)')
    .eq('story_status', 'published')
    .eq('physical_instances.city', city.name)
  if (obrasError) throw new Error(`Obras de ${city.name}: ${obrasError.message}`)

  const obras = ((obraRows ?? []) as (CityObraRow & {
    physical_instances: { city: string | null }[]
  })[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title_es: row.title_es,
    year: row.year,
    story_status: row.story_status,
  }))
  obras.sort((a, b) => a.title_es.localeCompare(b.title_es, 'es'))

  return { city, places, obras }
}
