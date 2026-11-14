# HANDOFF: city pictures + brief city story

Status: **QUEUED**
Created: 2026-11-13, right after the city `image_url` column landed
(migration 20261113120000) on branch `cities-feature`.

## What the user wants

1. **A picture per city, added from the Tablero.** The plumbing already
   exists (see below); what's left is the editorial act: pick a public-domain
   Wikimedia Commons picture for each city and link it in the editor.
2. **A brief story per city.** Cities are deliberately thin today (ADR-0024):
   name, hand order, optional picture, Lugares. The user wants a short
   editorial narrative on the Ciudad page. This needs a small build: one
   nullable story column, an editor field, mobile rendering — then the copy.

## Current state (already committed)

- `cities.image_url text` (nullable) exists — migration 20261113120000,
  applied to the LOCAL stack (`supabase migration up`); both seeded cities
  are NULL there. **DONE 2026-11-14: `supabase db push` applied ALL 7
  migrations to the remote project** (`bzzavpaqsrpuuyolxhbx`, org
  «destapando-arte», West US) — `migration list` verified local/remote in
  sync. Schema only, by decision: **remote tables are EMPTY** — seeds,
  story-loads, and the two city picture links (entered via the Tablero
  against the local stack) did NOT travel. Data sync is an explicit future
  decision before any app points at the cloud.
- Tablero `saveCity` validates the Commons file-page shape at the boundary
  (same `previewUrl` regex as `saveImage`): only
  `https://commons.wikimedia.org/wiki/File:…` passes; empty field clears.
- Tablero `CityForm` (ciudad editor): «Imagen» field with saved-value preview
  via Special:FilePath; shows the «sin imagen» note while empty.
- Mobile: `city-image.tsx` renders the linked Commons image (Special:FilePath
  thumb) or the honest placeholder — neutral-gradient tile with the city's
  initial (Sello monogram model, no palette). 48px round thumb in the Ciudades
  list row; 168px hero on the Ciudad page under the name.
- Both `types.ts` copies carry `image_url` (no-drift contract respected).

## To build next session

1. **Editorial — pictures (no code): DONE 2026-11-14** — Patrick added the
   Commons links via the Tablero (live in the LOCAL DB; see the data-sync
   note above — the remote will not show them until data is synced or
   re-entered).
2. **Build — `cities.story text` (nullable, one short paragraph): DONE
   2026-11-14** — migration 20261114120000_city_story.sql (applied to the
   LOCAL stack), both types.ts copies, Tablero CityForm textarea +
   saveCity patch, mobile «Historia» section between the hero and
   «Obras aquí» (StorySection/BodyText; null renders no section).
3. **Editorial — story copy:** one brief paragraph per city, written in the
   Tablero after the build lands. Honesty constraints apply (ADR-0007/0014
   spirit): narrative voice, no invented facts, no unverified links.

## Out of scope (do not drift)

- No upload infrastructure — pictures are Commons links, never hosted
  (ADR-0008). Do not add Supabase Storage buckets or upload endpoints.
- No city facts schema (ADR-0024 rejected them) — the story is ONE nullable
  editorial paragraph, not a facts table.
- Mobile-only surface in v1 (ADR-0024): no /ciudad/{slug} web page.
- No ADR needed: nullable-column extension following existing doctrine
  (same bar as the curiosity `title` column, commit c478779).

## Validation gates

`npm run lint` + `npx tsc --noEmit` in BOTH apps; `next build` on the
dashboard; apply the migration to the local stack (`supabase migration up`)
and re-run the seed if defaults change (they should not — NULL default).
