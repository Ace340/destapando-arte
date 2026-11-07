# HANDOFF: header inside the curiosity collapsible

Status: **live queue** for the next session (supersede/absorb into CANON.md once done).
Created: 2026-11-07, right after the curiosity `title` column landed (migration 20261107120000).

## What the user wants

A "sort of header" rendered **inside** the collapsible when the user opens it.
Today the title lives only in the summary row (it is the collapsed label AND stays
visible when open). Next session: when the row expands, the title should read as a
proper editorial header above the body text — open reads: **header → text → fuente**.

Example (autorretrato, myth): open the row → see «La cara de un loco» as a heading,
then the debunk text, then the fuente link.

## Current state (already committed)

- `curiosities.title text` (nullable) exists in schema; the 10 mitos destapados are
  backfilled; facts/leyendas are untitled on purpose (set titles via the editor's
  «guardar título»).
- Web `/obra/[slug]`: title is the summary-row label (`text-sm font-semibold`); badge
  bubbles removed. Untitled rows fall back to the gray text preview (hidden when open).
- Mobile `CuriosityCard`: title as header label (Fraunces_600SemiBold 16); badge deleted.
- Editor: shows titles + inline title edit + Título field on create.
- PENDING from previous session: **apply migration 20261107120000 via `supabase db push`**
  (title reads will fail / column missing until it lands).

## To build next session

1. **Web** (`apps/dashboard/src/app/obra/[slug]/page.tsx`): when open, render the title
   as a header above `{curiosity.text}` (e.g. `text-base font-semibold` or the page's
   `text-lg` scale — match the ¿Qué es? heading rhythm). Decide duplication: either hide
   the summary label when open (`group-open:hidden`) so the header is the only title, or
   keep both (row label + body header). Lean: hide the summary label when open.
2. **Mobile** (`apps/mobile/src/components/curiosity-card.tsx`): same — when `open`,
   render the title as a body header (bump beyond the 16px header label; consider
   Fraunces_600SemiBold ~20 to match `StorySection` titles) and hide the header-row
   title to avoid duplication.
3. **Fallback**: untitled rows keep today's behavior exactly (preview when collapsed,
   plain text when open) — no header, no empty heading.
4. **Parity + constraints**: same visual hierarchy both surfaces; zero-client-JS on web
   (details/summary + group-open, no state); Spanish copy only (ADR-0009); no new deps.
5. **Validation gates**: `npm run lint` + `npx tsc --noEmit` in BOTH apps before done;
   `next build` on the dashboard.

## Out of scope (do not drift)

- No schema changes — `title` column already exists and is backfilled.
- No ADR needed (reversible UI decision, same as the cap/collapsible commit 8995d58).
- Do not resurrect type bubbles on public surfaces (editor keeps its CuriosityBadge).
