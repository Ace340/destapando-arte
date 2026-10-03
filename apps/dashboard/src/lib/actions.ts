'use server'

// Mutations — one per editorial act. Every rule the ADRs state, these enforce
// at the boundary; the database enforces the rest (see migration triggers).

import { revalidatePath } from 'next/cache'
import { db } from './supabase-server'
import type { CuriosityType, EvidenceVisual, StoryStatus } from './types'

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

export async function advance(formData: FormData): Promise<void> {
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

export async function createCuriosity(formData: FormData): Promise<void> {
  const artworkId = text(formData, 'artwork_id')
  const slug = text(formData, 'slug')
  const body = text(formData, 'text')
  const sourceUrl = text(formData, 'source_url')
  // ADR-0007: typed AND sourced — "I only write what I can defend"
  if (!body || !sourceUrl) {
    throw new Error('ADR-0007: la curiosidad necesita texto y fuente.')
  }

  // Next free slot: max + 1. count+1 would collide with the gaps that
  // removeCuriosity leaves behind (unique(artwork_id, position) rejects it).
  const { data: last } = await db()
    .from('curiosities')
    .select('position')
    .eq('artwork_id', artworkId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await db().from('curiosities').insert({
    artwork_id: artworkId,
    position: (last?.position ?? 0) + 1,
    text: body,
    type: text(formData, 'type') as CuriosityType,
    source_url: sourceUrl,
    source_note: text(formData, 'source_note') || null,
  })
  if (error) throw new Error(`Curiosidad: ${error.message}`)
  revalidate(slug)
}

export async function removeCuriosity(formData: FormData): Promise<void> {
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
  const id = text(formData, 'id')
  const slug = text(formData, 'slug')
  const { error } = await db().from('film_connections').delete().eq('id', id)
  if (error) throw new Error(`Quitar conexión: ${error.message}`)
  revalidate(slug)
}

// Public "Avísame / pide otra obra" from the story page (ADR-0001: story_page source)
export async function createRequest(formData: FormData): Promise<void> {
  const slug = text(formData, 'slug')
  const label = text(formData, 'label')
  if (!label) throw new Error('Dinos qué obra quieres que destapemos.')
  const { error } = await db().from('content_requests').insert({
    requested_via: 'story_page',
    label,
    artist_id: text(formData, 'artist_id') || null,
  })
  if (error) throw new Error(`Avísame: ${error.message}`)
  revalidate(slug)
}
