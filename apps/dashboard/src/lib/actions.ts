'use server'

// Mutations — one per editorial act. Every rule the ADRs state, these enforce
// at the boundary; the database enforces the rest (see migration triggers).
// ADR-0026: every act checks the Allow-list first — save one: createRequest
// is the public Content-request write (Avísame), the funnel's open door.

import { revalidatePath } from 'next/cache'
import { assertEditor } from './access'
import { db } from './supabase-server'
import { previewUrl } from './image-url'
import { slugifyCity } from './cities'
import type { CuriosityType, EvidenceVisual, ImageKind, StoryStatus } from './types'

// ADR-0005: forward-only line. 'published' is terminal.
const NEXT_STATUS: Record<StoryStatus, StoryStatus | null> = {
  created: 'enriched',
  enriched: 'draft',
  draft: 'published',
  published: null,
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

function revalidate(slug: string): void {
  revalidatePath('/')
  revalidatePath(`/cuadro/${slug}`)
  revalidatePath(`/obra/${slug}`)
}

export async function saveBeats(formData: FormData): Promise<void> {
  await assertEditor()
  const slug = text(formData, 'slug')
  const patch = {
    summary: text(formData, 'summary') || null,
    why_it_matters: text(formData, 'why_it_matters') || null,
    essay: text(formData, 'essay') || null,
    source_transcript: text(formData, 'source_transcript') || null,
    episode_youtube_id: text(formData, 'episode_youtube_id') || null,
  }
  const { error } = await db().from('artworks').update(patch).eq('slug', slug)
  if (error) throw new Error(`Guardar beats: ${error.message}`)
  revalidate(slug)
}

// ADR-0025: the per-obra classification, set by hand like every editorial
// claim. Null clears the link («Sin clasificar»). Non-empty ids are
// validated at the boundary so a stale select reads a Spanish error; the
// schema's FK stays as the backstop (its English body only surfaces for
// forged posts).
export async function saveStyle(formData: FormData): Promise<void> {
  await assertEditor()
  const slug = text(formData, 'slug')
  const styleId = text(formData, 'style_id') || null
  if (styleId) {
    const { count, error } = await db()
      .from('styles')
      .select('id', { count: 'exact', head: true })
      .eq('id', styleId)
    if (error) throw new Error(`Guardar estilo: ${error.message}`)
    if ((count ?? 0) === 0) {
      throw new Error(
        'Guardar estilo: ese estilo no está en el vocabulario — recarga la página o elige otro.',
      )
    }
  }
  const { error } = await db()
    .from('artworks')
    .update({ style_id: styleId })
    .eq('slug', slug)
  if (error) throw new Error(`Guardar estilo: ${error.message}`)
  revalidate(slug)
}

// Same write, state-flavored for the Estilo picker's client island
// (useActionState needs the prevState-forwarding signature — see the Forms
// guide). Errors still throw; the boolean just drives the saved message.
export async function saveStyleState(_prev: boolean, formData: FormData): Promise<boolean> {
  await saveStyle(formData)
  return true
}

export async function advance(formData: FormData): Promise<void> {
  await assertEditor()
  const slug = text(formData, 'slug')
  const { data, error } = await db()
    .from('artworks')
    .select('story_status')
    .eq('slug', slug)
    .single()
  if (error || !data) throw new Error(`Avanzar: no existe «${slug}»`)

  const next = NEXT_STATUS[data.story_status as StoryStatus]
  if (!next) return
  const patch =
    next === 'published'
      ? { story_status: next, published_at: new Date().toISOString() }
      : { story_status: next }

  const { error: updateError } = await db().from('artworks').update(patch).eq('slug', slug)
  if (updateError) throw new Error(`Avanzar: ${updateError.message}`)
  revalidate(slug)
}

// Next free slot: max + 1. count+1 would collide with the gaps the remove
// actions leave behind (unique(*, position) rejects it). The optional filter
// scopes the max to one parent (artwork, city).
async function nextSlot(
  table: 'curiosities' | 'cities' | 'city_places',
  filterColumn?: string,
  filterValue?: string,
): Promise<number> {
  const { data: last } =
    filterColumn && filterValue
      ? await db()
          .from(table)
          .select('position')
          .eq(filterColumn, filterValue)
          .order('position', { ascending: false })
          .limit(1)
          .maybeSingle()
      : await db()
          .from(table)
          .select('position')
          .order('position', { ascending: false })
          .limit(1)
          .maybeSingle()
  return (last?.position ?? 0) + 1
}

export async function createCuriosity(formData: FormData): Promise<void> {
  await assertEditor()
  const artworkId = text(formData, 'artwork_id')
  const slug = text(formData, 'slug')
  const body = text(formData, 'text')
  const sourceUrl = text(formData, 'source_url')
  // ADR-0007: typed AND sourced — "I only write what I can defend"
  if (!body || !sourceUrl) {
    throw new Error('ADR-0007: la curiosidad necesita texto y fuente.')
  }

  const { error } = await db().from('curiosities').insert({
    artwork_id: artworkId,
    position: await nextSlot('curiosities', 'artwork_id', artworkId),
    title: text(formData, 'title') || null,
    text: body,
    type: text(formData, 'type') as CuriosityType,
    source_url: sourceUrl,
    source_note: text(formData, 'source_note') || null,
  })
  if (error) throw new Error(`Curiosidad: ${error.message}`)
  revalidate(slug)
}

// The editorial headline shown as the collapsible label on /obra and in the
// app. Optional: null keeps the text preview as the row label.
export async function setCuriosityTitle(formData: FormData): Promise<void> {
  await assertEditor()
  const id = text(formData, 'id')
  const slug = text(formData, 'slug')
  const { error } = await db()
    .from('curiosities')
    .update({ title: text(formData, 'title') || null })
    .eq('id', id)
  if (error) throw new Error(`Título: ${error.message}`)
  revalidate(slug)
}

export async function removeCuriosity(formData: FormData): Promise<void> {
  await assertEditor()
  const id = text(formData, 'id')
  const slug = text(formData, 'slug')
  const { error } = await db().from('curiosities').delete().eq('id', id)
  if (error) throw new Error(`Quitar curiosidad: ${error.message}`)
  revalidate(slug)
}

async function resolveFilm(
  title: string,
  year: number | null,
  director: string | null,
): Promise<string> {
  const { data: existing } = await db()
    .from('films')
    .select('id')
    .match({ title, year, director })
    .maybeSingle()
  if (existing) return existing.id

  const { data: created, error } = await db()
    .from('films')
    .insert({ title, year, director })
    .select('id')
    .single()
  if (error || !created) throw new Error(`Película: ${error?.message ?? 'sin id'}`)
  return created.id
}

export async function saveConnection(formData: FormData): Promise<void> {
  await assertEditor()
  const artworkId = text(formData, 'artwork_id')
  const slug = text(formData, 'slug')
  const filmTitle = text(formData, 'film_title')
  const frameAnalysis = text(formData, 'frame_analysis_text')
  // ADR-0014: no claim rests on a link we don't control — the written analysis is mandatory
  if (!filmTitle || !frameAnalysis) {
    throw new Error('ADR-0014: la conexión necesita película y análisis de plano.')
  }

  const rawYear = parseInt(text(formData, 'film_year'), 10)
  const filmId = await resolveFilm(
    filmTitle,
    Number.isNaN(rawYear) ? null : rawYear,
    text(formData, 'film_director') || null,
  )

  const { error } = await db().from('film_connections').insert({
    film_id: filmId,
    artwork_id: artworkId,
    what_it_borrowed: text(formData, 'what_it_borrowed'),
    mechanism: text(formData, 'mechanism'),
    frame_analysis_text: frameAnalysis,
    evidence_visual: (text(formData, 'evidence_visual') || 'none') as EvidenceVisual,
    evidence_url: text(formData, 'evidence_url') || null,
  })
  if (error) throw new Error(`Conexión: ${error.message}`)
  revalidate(slug)
}

export async function removeConnection(formData: FormData): Promise<void> {
  await assertEditor()
  const id = text(formData, 'id')
  const slug = text(formData, 'slug')
  const { error } = await db().from('film_connections').delete().eq('id', id)
  if (error) throw new Error(`Quitar conexión: ${error.message}`)
  revalidate(slug)
}

// Imágenes — enlazadas a Commons, nunca alojadas aquí (ADR-0008: host only
// public-domain or ours — the corpus is PD, so we link). source_url is the
// Commons *file page* (migration contract); the Special:FilePath transform
// renders it. Credit is mandatory: attribution stays cheap and honest (ADR-0016).
export async function saveImage(formData: FormData): Promise<void> {
  await assertEditor()
  const artworkId = text(formData, 'artwork_id')
  const slug = text(formData, 'slug')
  const sourceUrl = text(formData, 'source_url')
  const credit = text(formData, 'credit')
  const kind = text(formData, 'kind') as ImageKind

  if (!previewUrl(sourceUrl)) {
    throw new Error(
      'La URL debe ser la página de archivo de Commons (https://commons.wikimedia.org/wiki/File:…).',
    )
  }
  if (!credit) throw new Error('ADR-0016: la imagen necesita su línea de crédito.')

  // ADR-0003: story-only for rights-blocked works — zero images, any kind.
  const { data: artwork } = await db()
    .from('artworks')
    .select('rights_status')
    .eq('id', artworkId)
    .single()
  if (artwork?.rights_status === 'blocked') {
    throw new Error('ADR-0003: obra bloqueada por derechos — solo historia, sin imágenes.')
  }

  // Display is the artwork's face: one per artwork, replace-on-save — the
  // same delete+insert model the story-loads use. References append (>= 3
  // unlocks indexing, ADR-0005).
  if (kind === 'display') {
    const { error: clearError } = await db()
      .from('image_assets')
      .delete()
      .match({ artwork_id: artworkId, kind: 'display' })
    if (clearError) throw new Error(`Reemplazar imagen: ${clearError.message}`)
  }

  const { error } = await db().from('image_assets').insert({
    artwork_id: artworkId,
    kind,
    source_url: sourceUrl,
    credit,
  })
  if (error) throw new Error(`Imagen: ${error.message}`)
  revalidate(slug)
}

export async function removeImage(formData: FormData): Promise<void> {
  await assertEditor()
  const id = text(formData, 'id')
  const slug = text(formData, 'slug')
  // The reference floor (>= 3 on an indexed artwork) is the database's call —
  // its Spanish error surfaces here if the delete would break ADR-0005.
  const { error } = await db().from('image_assets').delete().eq('id', id)
  if (error) throw new Error(`Quitar imagen: ${error.message}`)
  revalidate(slug)
}

// Public "Avísame / pide otra obra" (ADR-0001 sources). artist_slug marks
// the artist_page variant; the obra form keeps the story_page default.
export async function createRequest(formData: FormData): Promise<void> {
  const slug = text(formData, 'slug')
  const artistSlug = text(formData, 'artist_slug')
  const label = text(formData, 'label')
  if (!label) throw new Error('Dinos qué obra quieres que destapemos.')
  const { error } = await db().from('content_requests').insert({
    requested_via: artistSlug ? 'artist_page' : 'story_page',
    label,
    artist_id: text(formData, 'artist_id') || null,
  })
  if (error) throw new Error(`Avísame: ${error.message}`)
  if (artistSlug) revalidatePath(`/artista/${artistSlug}`)
  else if (slug) revalidate(slug)
}

// ADR-0022: the artist's editorial pair — why_special (the 3–5 sentence
// hook) and bio (optional short narrative). Enrichment, never a launch gate.
// ADR-0023 (amended 2026-11-06): sello_artwork_id points at the published
// obra that represents the artist; null keeps the alphabetical derivation.
// Trusted single-editor surface, but the pointer is still validated against
// the resolver's rule: it must name one of this artist's published obras
// WITH a display asset — the choice can upgrade the picture, never degrade
// it to a monogram. A stale pointer fails the save with a clear message so
// the editor fixes the choice instead of silently losing it.
export async function saveArtist(formData: FormData): Promise<void> {
  await assertEditor()
  const slug = text(formData, 'slug')
  const born = parseInt(text(formData, 'born_year'), 10)
  const died = parseInt(text(formData, 'died_year'), 10)
  const selloArtworkId = text(formData, 'sello_artwork_id') || null
  if (selloArtworkId) {
    const artist = await db().from('artists').select('id').eq('slug', slug).maybeSingle()
    if (artist.error) throw new Error(`Guardar artista: ${artist.error.message}`)
    if (artist.data) {
      const pointed = await db()
        .from('artworks')
        .select('id, artist_id, story_status, image_assets(kind)')
        .eq('id', selloArtworkId)
        .maybeSingle()
      if (pointed.error) throw new Error(`Guardar artista: ${pointed.error.message}`)
      const obra = pointed.data as {
        artist_id: string | null
        story_status: string
        image_assets: { kind: string }[] | null
      } | null
      if (
        !obra ||
        obra.artist_id !== (artist.data as { id: string }).id ||
        obra.story_status !== 'published' ||
        !(obra.image_assets ?? []).some((asset) => asset.kind === 'display')
      ) {
        throw new Error(
          'Guardar artista: el Sello debe ser una obra publicada de este artista con imagen de display — elige otra o deja vacío.',
        )
      }
    }
  }
  const patch = {
    why_special: text(formData, 'why_special') || null,
    bio: text(formData, 'bio') || null,
    episode_youtube_id: text(formData, 'episode_youtube_id') || null,
    born_year: Number.isNaN(born) ? null : born,
    died_year: Number.isNaN(died) ? null : died,
    sello_artwork_id: selloArtworkId,
  }
  const { error } = await db().from('artists').update(patch).eq('slug', slug)
  if (error) throw new Error(`Guardar artista: ${error.message}`)
  revalidatePath('/')
  revalidatePath(`/taller/${slug}`)
  revalidatePath(`/artista/${slug}`)
}

// ---------------------------------------------------------------------------
// Las Ciudades (ADR-0024) — hand-created editorial entities; creation is the
// listing gate. Places (GLOSSARY: Lugar) are the hand-curated Lugares list.
// The city↔instance link is by NAME: cities.name = physical_instances.city.
// ---------------------------------------------------------------------------

function revalidateCity(slug: string): void {
  revalidatePath('/')
  revalidatePath('/ciudades')
  revalidatePath(`/ciudades/${slug}`)
}

export async function saveCity(formData: FormData): Promise<void> {
  await assertEditor()
  const slug = text(formData, 'slug')
  const name = text(formData, 'name')
  const position = parseInt(text(formData, 'position'), 10)
  const imageUrl = text(formData, 'image_url')
  const story = text(formData, 'story')
  if (!name) throw new Error('La ciudad necesita nombre.')
  // ADR-0008: the picture is a Commons link, never a host of ours — the
  // same boundary validation saveImage applies to artwork images.
  if (imageUrl && !previewUrl(imageUrl)) {
    throw new Error(
      'La URL debe ser la página de archivo de Commons (https://commons.wikimedia.org/wiki/File:…).',
    )
  }

  if (slug) {
    // Update: the slug is fixed at creation (the app links by it); position
    // keeps its value when the field comes back empty; an emptied picture
    // clears the link (null → the app shows the monogram placeholder); an
    // emptied story clears the paragraph (null → no story section renders).
    // The city↔instance link is by NAME (ADR-0024) — a rename would orphan
    // the derived «Obras aquí» with no guard. Same rule as saveArtist's
    // stale Sello pointer: fail the save with the count so the editor
    // resolves the coupling instead of silently losing the obras.
    const { data: current, error: currentError } = await db()
      .from('cities')
      .select('name')
      .eq('slug', slug)
      .maybeSingle()
    if (currentError) throw new Error(`Guardar ciudad: ${currentError.message}`)
    if (current && current.name !== name) {
      const { count, error: linkError } = await db()
        .from('physical_instances')
        .select('id', { count: 'exact', head: true })
        .eq('city', current.name)
      if (linkError) throw new Error(`Guardar ciudad: ${linkError.message}`)
      if ((count ?? 0) > 0) {
        throw new Error(
          `Guardar ciudad: «${current.name}» tiene ${count} ${
            count === 1 ? 'obra enlazada' : 'obras enlazadas'
          } por nombre — renombrar rompería «Obras aquí». Actualiza las instancias primero o mantén el nombre.`,
        )
      }
    }
    const patch: {
      name: string
      position?: number
      image_url: string | null
      story: string | null
    } = {
      name,
      image_url: imageUrl || null,
      story: story || null,
    }
    if (!Number.isNaN(position)) patch.position = position
    const { error } = await db().from('cities').update(patch).eq('slug', slug)
    if (error) throw new Error(`Guardar ciudad: ${error.message}`)
    revalidateCity(slug)
    return
  }

  // Create: the slug derives from the name — a duplicate means the city
  // already exists (creation is the listing gate, ADR-0024).
  const newSlug = slugifyCity(name)
  if (!newSlug) {
    throw new Error('El nombre no produce un slug válido — usa letras y números.')
  }
  const { data: existing } = await db()
    .from('cities')
    .select('slug')
    .eq('slug', newSlug)
    .maybeSingle()
  if (existing) {
    throw new Error(
      `Ya existe una ciudad con el slug «${newSlug}» — edítala en /ciudades/${newSlug}.`,
    )
  }

  const { error } = await db().from('cities').insert({
    slug: newSlug,
    name,
    // Next free slot: max + 1 — a hand order stays gap-free (no unique
    // constraint on cities.position, but consistency is cheap).
    position: Number.isNaN(position) ? await nextSlot('cities') : position,
    image_url: imageUrl || null,
    story: story || null,
  })
  if (error) throw new Error(`Ciudad: ${error.message}`)
  revalidateCity(newSlug)
}

export async function savePlace(formData: FormData): Promise<void> {
  await assertEditor()
  const cityId = text(formData, 'city_id')
  const citySlug = text(formData, 'city_slug')
  const placeId = text(formData, 'place_id')
  const name = text(formData, 'name')
  const url = text(formData, 'url')
  const position = parseInt(text(formData, 'position'), 10)
  if (!cityId) throw new Error('Lugar: falta la ciudad.')
  if (!name) throw new Error('El lugar necesita nombre.')
  // ADR-0014: links are opt-in and verified — never a bare domain.
  if (url && !/^https:\/\//i.test(url)) {
    throw new Error('La URL del lugar debe empezar por https:// — o déjala vacía.')
  }

  if (placeId) {
    const patch: {
      name: string
      note: string | null
      url: string | null
      position?: number
    } = {
      name,
      note: text(formData, 'note') || null,
      url: url || null,
    }
    if (!Number.isNaN(position)) patch.position = position
    const { error } = await db().from('city_places').update(patch).eq('id', placeId)
    if (error) throw new Error(`Lugar: ${error.message}`)
  } else {
    // A hand-taken position that collides hits unique(city_id, position)
    // and its error surfaces here; the Lugares form explains this in the
    // Tablero.
    const slot = Number.isNaN(position) ? await nextSlot('city_places', 'city_id', cityId) : position
    const { error } = await db().from('city_places').insert({
      city_id: cityId,
      name,
      note: text(formData, 'note') || null,
      url: url || null,
      position: slot,
    })
    if (error) throw new Error(`Lugar: ${error.message}`)
  }
  revalidateCity(citySlug)
}

export async function removePlace(formData: FormData): Promise<void> {
  await assertEditor()
  const id = text(formData, 'id')
  const citySlug = text(formData, 'city_slug')
  const { error } = await db().from('city_places').delete().eq('id', id)
  if (error) throw new Error(`Quitar lugar: ${error.message}`)
  revalidateCity(citySlug)
}

export async function removeCity(formData: FormData): Promise<void> {
  await assertEditor()
  const slug = text(formData, 'slug')
  // Places cascade in the database (city_places.city_id ON DELETE CASCADE);
  // a city is a cheap hand-created row — unlike obras/artists, whose removal
  // has no editorial precedent, this delete is reversible by re-creating.
  const { error } = await db().from('cities').delete().eq('slug', slug)
  if (error) throw new Error(`Eliminar ciudad: ${error.message}`)
  revalidatePath('/')
  revalidatePath('/ciudades')
}
