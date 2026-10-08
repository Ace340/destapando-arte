// Types mirror supabase/migrations/20260929120000_init_schema.sql exactly
// (same contract as apps/dashboard/src/lib/types.ts). If the migration
// changes, both copies change in the same commit — no drift.

export type StoryStatus = 'created' | 'enriched' | 'draft' | 'published'
export type RightsStatus = 'clear' | 'blocked'
export type CuriosityType = 'fact' | 'myth' | 'legend'
export type EvidenceVisual = 'our_diagram' | 'youtube_embed' | 'both' | 'none'

export interface Artist {
  id: string
  slug: string
  name: string
  why_special: string | null
  episode_youtube_id: string | null
  born_year: number | null
  died_year: number | null
  wikidata_id: string | null
  created_at: string
}

export interface Artwork {
  id: string
  slug: string
  title_es: string
  artist_id: string | null
  year: string | null
  rights_status: RightsStatus
  story_status: StoryStatus
  indexed: boolean
  summary: string | null
  why_it_matters: string | null
  essay: string | null
  palette: string[]
  source_transcript: string | null
  episode_youtube_id: string | null
  wikidata_id: string | null
  met_object_id: number | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Curiosity {
  id: string
  artwork_id: string
  position: number
  text: string
  type: CuriosityType
  source_url: string
  source_note: string | null
}

export interface Film {
  id: string
  title: string
  year: number | null
  director: string | null
}

export interface FilmConnection {
  id: string
  film_id: string
  artwork_id: string | null
  artist_id: string | null
  movement_id: string | null
  what_it_borrowed: string
  mechanism: string
  frame_analysis_text: string
  evidence_visual: EvidenceVisual
  evidence_url: string | null
}
