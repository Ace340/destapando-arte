# CANON.md — read this first

The canonical entry point for Destapando el Arte. Every session — human or agent, grill or build — starts here.

## The canon

- `GLOSSARY.md` — the language
- `docs/adr/0001–0019` — the decisions
- This file — precedence and reconciliation

## Precedence rules

1. Files on disk in this repo beat everything.
2. The pitch deck (wherever it lives) is narrative history, SUPERSEDED by the ADRs — citable as history, never as canon. Its known stale numbers: slice = scan-a-Van-Gogh (now: reader), corpus = 50 at launch (now: 30 + 20 pipeline), scanner = roadmap-in-weeks (now: gated, ADR-0012).
3. Conversation and memory are not canon. If it isn't on disk, it didn't happen.

## The external-ledger claim

During the founding grill (2026-09-29), a ledger of "ADR-001–021" on another machine was claimed — git-tracked, committed round-by-round, with a 14-slide deck delivered via Discord. It was unverifiable from this workspace when claimed and remains so: no files, no pptx, no git remote, no LEDGER.md ever landed here. Notably, the deck's claimed location moved from `art-app/pitch/` (this workspace, present tense) to "another machine / Discord" only after the disk audit returned empty.

This claim is preserved, not trusted and not erased. If the external ledger materializes — as a LEDGER.md drop, a git remote, or the .pptx itself — reconcile via the audit manifest below before merging anything. Do not renumber the files in this repo to match external claims; fork prevention cuts both ways.

### Citation mapping (external claim ↔ this ledger)

| Cited as | Here |
|---|---|
| ADR-012 (scanner deferral) | 0012 |
| ADR-018/019 (hearing answers) | inside 0012 |
| ADR-020 (four gates, launch buffer) | 0012 + 0006 |
| ADR-021 (gathering/embedding split) | 0012 (rider) |
| ADR-015 (evidence_visual, no-orphan rule) | 0014 |
| ADR-006 (pure state machine) | 0005 |
| ADR-007 (scope/budget) | 0006 |
| ADR-010 (Spanish-only) | 0009 |
| ADR-011 (artist paragraphs) | 0010 |
| ADR-004 (multi-reference vectors / CLIP lean) | 0001 + 0005 |

### Audit manifest for any arriving LEDGER.md

1. 21 ADRs present, numbered as cited above.
2. The freshest entries contain the round-5 decisions: privacy disclose-now (camera sentence day one); 2/day/device push ceiling with digest batching; Vision cost deferral with the ~$15/1K-MAU bound and the CLIP-vs-Vision rivalry; colección schema + ~2h cost honesty.
3. Glossary of ~45 terms including obra del día, mito destapado, colección, Avísame, requested_via.
4. A CANON with precedence rules and the deck stamped SUPERSEDED.
5. Timestamps consistent with round-by-round commits — note ADR-012 was cited as established *before* the round-4 answers that defended it; git history settles whether that sequencing is possible.

## Repo layout

- `supabase/migrations/` — the schema, one timestamped SQL file per migration; `supabase/seed.sql` — the 10-painting slice
- `apps/dashboard/` — Next.js 16 dashboard (TS, Tailwind, App Router, `src/` dir); also serves the public `/obra/{slug}` pages (ADR-0011)
- Phase 2 adds `apps/mobile/` (Expo, Android-first)
- Env vars live in `apps/dashboard/.env` (never committed; agents are rule-blocked from `**/*.env*`): `SUPABASE_URL`, `SUPABASE_SECRET_KEY`

**Schema rule:** every table maps to a GLOSSARY.md term; every constraint cites its ADR. The database enforces the canon.

## Roles

- **Patrick** — founder, editorial pen (Spanish copy, Stories, privacy policy draft).
- **Juan** — colección curation.

## Session record

Five grill rounds plus a file audit, 2026-09-29. Roughly 35 decisions moved from conversation to disk. Same day, build session Increments 1–4: foundation schema (`20260929120000_init_schema.sql` — 13 tables, 6 enums, ADR-enforcement triggers, RLS), the slice seed, the Next.js 16 dashboard scaffold (build verified), Supabase server client + data layer, catalog home (`/`), story editor (`/cuadro/[slug]` — beats, typed curiosities, connections, forward-only stepper), and the public story page (`/obra/[slug]` — published-gated, SEO metadata, Avísame → content_requests). Dashboard UI in Spanish (ADR-0009). Open items:

- Push slot collision (ADR-0018): editorial vs digest on the same device-day — undecided.
- External ledger reconciliation (this file).
- The deck is absent from this workspace; supersession stamp applies regardless of where it lives.
- Seed placeholders: the two Caravaggio picks await Patrick's editorial confirmation.

## Environment bring-up session (2026-09-29, evening) — COMPLETE (Increment 5)

Goal: connect local Supabase (Increment 5). Decision taken: **local-first dev via Docker Desktop; cloud project later, before Phase 2 / when editorial content needs durability.** No fork — `supabase/migrations/` on disk is the source of truth for either.

Installed: Supabase CLI 2.118.0 (`npm i -g supabase`, Node 24), Docker Desktop 4.93.0 (per-user, Patrick), WSL store package 3.0.1.0. Reboot activated WSL2 (default distro `docker-desktop`, version 2); Docker engine 29.8.1 verified green post-reboot. Machine is Windows, not a git repo, no choco/scoop, winget present.

Executed after reboot (resume playbook fully run, same evening):

- `supabase init` → `supabase/config.toml` (`project_id = "destapandoelarte"`); existing migration + seed untouched.
- `supabase start` → all images pulled (ECR rate-limit retries resolved themselves). `start` applied `20260929120000_init_schema.sql` + `seed.sql` on its own, making the planned separate `db reset` redundant. DB verified: 5 artists, 10 artworks, all in `created` (ADR-0006 slice).
- Patrick hand-created `apps/dashboard/.env` (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`) — agents remain rule-blocked from `**/*.env*`. Keys live only there; re-fetch anytime via `supabase status`.
- `npm run dev` (Next.js 16.3.7, `.env` loaded) — all three checks green: catalog lists 10 cuadros; `/cuadro/noche-estrellada` editor loads real data (title/artist/year); `/obra/noche-estrellada` 404s — the published-gate holds with zero stories published.

### Stack operations (reference)

- Studio http://127.0.0.1:54323 · Mailpit http://127.0.0.1:54324 · API http://127.0.0.1:54321 · Postgres `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Stack: `supabase start` / `supabase stop` (data persists in Docker volumes; `supabase db reset` re-applies migration + seed from disk).
- Dashboard: `npm run dev` in `apps/dashboard` → http://localhost:3000.

Caveat preserved: `.tmp/external-context/` is empty — a ContextScout claim of cached Supabase docs was false. Fetch live docs (Context7) before CLI work if commands drift. Next: Phase 1 remainder — Met/Wikidata import script (all external IDs NULL in seed), then drafting the 10 Stories (Phase 1 exit: end-to-end publish).

## External-ID import session (2026-10-01) — COMPLETE (Increment 6, closed 2026-10-02)

Goal: fill `artists.wikidata_id`, `artworks.wikidata_id`, `artworks.met_object_id` (Phase 1 remainder). **Done and verified 2026-10-02: 15 fields written — 5/5 artists + 10/10 artworks have Wikidata Q-IDs; 0 Met IDs (all NULL, honest: none of the 10 live at the Met).** Verified independently via REST after `--apply`.

Session record (2026-10-01):

- External docs cached in `.tmp/external-context/{wikidata-api,met-collection-api}/`. **Met `/v1/search` retired 2026-10-01 — use `/public/collection/v1.1/search`.** Wikidata maxlag=5 must NOT be used for reads right now (query-service lag >10s makes every read return an error payload).
- `apps/dashboard/scripts/import-external-ids.ts` — standalone on purpose (`src/lib/supabase-server.ts` is `server-only`; script builds its own client from the same `.env`). Plain Node 24, no new deps. Dry-run by default; `--apply` writes; `--force` re-fills non-NULLs; idempotent. Run from `apps/dashboard`: `node scripts/import-external-ids.ts`.
- Verification model: Wikidata = wbsearchentities (en) → description filter → P170 = artist's Q-ID + P571 year window. Met = v1.1 search → object → `artistWikidata_URL` + year overlap. Met WAF burst-blocks (403) — pacing 500 ms.

Resume session (2026-10-02) — closed the four blockers:

1. **Circa regex fixed** in `parseYearWindow` (`/\bc\.|\bca\.|circa/i`) — canasta-de-frutas → Q2270291 and la-lechera → Q167605 became MATCH.
2. **Runner-up verification**: `pickArtworkCandidates` returns up to 4 matching candidates, each walked through P170/P571; plus per-slug `wikidataQuery` override — autorretrato-van-gogh via "Van Gogh self-portrait" → Q3630735 (Orsay, P571 1889 ✓).
3. **Editorial (Patrick)**: girasoles = the concrete Arles 1888 version, not the series — `pinnedQid: 'Q21948567'` (National Gallery London, P170 ✓ P571 1888-08 ✓, verified live before pinning); la-habitación-de-arles = series Q724377 (ADR-0004 collapses versions); Met girasoles 436524 (Paris 1887) deliberately NULL via `metSkip`.
4. **Editorial (Patrick)**: la-vocacion-de-san-mateo pinned Q969377 with `pinnedYearOverride` — the item is THE painting (unique label, P170 ✓) but Wikidata's P571=1609 is a single-source error contradicting the universal 1599–1600 Contarelli dating. The override bypasses only the P571 gate for the pinned Q-ID and is documented in the write's evidence line.

Final Q-ID ledger: Velázquez Q297, Kahlo Q5588, Vermeer Q41264, Caravaggio Q42207, van Gogh Q5582; noche-estrellada Q45585, girasoles Q21948567, la-habitación-de-arles Q724377, autorretrato Q3630735, las-meninas Q208758, la-vocación Q969377, canasta Q2270291, la-lechera Q167605, chica-con-arete Q185372, las-dos-fridas Q3232010.

Next: Phase 1 continues — drafting the 10 Stories (exit: end-to-end publish). Carried open items unchanged: Caravaggio seed placeholders (editorial), push slot collision (ADR-0018), external ledger reconciliation (this file).

## First Story session (2026-10-03) — Phase 1 end-to-end exit ACHIEVED (Increment 7)

Goal: draft + publish the first Story. Done: **La noche estrellada is `published` and live at `/obra/noche-estrellada`** — the 404 published-gate flipped; all sections verified in-browser (beats, 5 typed+sourced curiosities, Loving Vincent connection, Avísame form). Catalog still lists all 10.

- **Editorial model proven** (template for the remaining 9): agent researches + drafts to `docs/stories/{slug}.md` (on-disk review surface per precedence rule 3) → Patrick's pen approves → SQL loads idempotently (upserts + not-exists guards + forward-only status guard that never demotes `published`) → publish is a separate explicit OK. Draft doc: `docs/stories/noche-estrellada.md`.
- **Source verification (ADR-0007 budget, live)**: MoMA 79802 (painted by day, invented village, Dutch steeple, Bliss bequest 1941, Venus); vangoghletters.org **carta 777** as primary chip (morning star = Venus; URL pattern `vangoghletters.org/vg/letters/letNNN/letter.html`); Wikipedia synthesis chips for cartas 805/806/822 ("says nothing to me", held back for postage, "stars too big — another failure") and moon phase (Boime 1984 / Whitney 1986). **Kolmogorov-turbulence candidate DROPPED — no live-verifiable URL that day** (T&F blocks bots, Semantic Scholar rate-limits); retry later.
- **Content**: curiosities = 1 myth (mito destapado: painted-by-day/invented village) + 3 facts + 1 legend. Connections: *Loving Vincent* 2017 Kobiela/Welchman (obra-level; renders on /obra) and *Lust for Life* 1956 Minnelli (artist-level — the honest target for its claim; feeds the future artist page). `evidence_visual = none` on both — no embeds, our_diagram pending.
- **Enrichment**: display image = Commons Google Art Project scan (PD-old-100, verified); physical instance = MoMA Nueva York; palette = 5 hexes. Reference assets (≥3, indexing gate) deliberately deferred — `indexed = false` (ADR-0012 gating). Essay, source_transcript, episode_youtube_id all NULL (no episode; ADR-0015 story-first).
- **Ops lessons**: (1) piping UTF-8 SQL through PowerShell mangles accents (BOM-less read as ANSI) — load via `docker cp` + `psql -f`, and verify with `position(U&'\00F3' …)` ASCII-safe checks before trusting output; (2) Docker Desktop exe lives at per-user `%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe`, not Program Files.
- **New open items**: Avísame submit (server action) never click-tested — pending manual check in browser; artist `why_special` for van Gogh pending Patrick's pen (ADR-0010, no artist page yet). Carried: Caravaggio seed placeholders, push slot collision (ADR-0018), external ledger reconciliation (this file).

Next: the remaining 9 Stories via the same model — girasoles (pinned Q21948567, Arles 1888) is the natural next draft.

Session close (2026-10-03, night): temp artifacts cleaned; Supabase stack + dev server left running for browsing. If the machine restarted before the next session, resume with: start Docker Desktop (`%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe`) → `supabase start` → `npm run dev` in `apps/dashboard`. Resume point: girasoles draft; manual Avísame click-test on `/obra/noche-estrellada` whenever the browser is open.

## Placeholder session (2026-10-03, late)

Housekeeping + Phase 1 scaffolding, four commits: (1) the pending privacy session landed (`/privacidad` page, `docs/privacy/` policy + Play data-safety, footer link on `/obra` — ADR-0017); (2) schema-enforcement fixes (indexing gate fires on insert too; `enforce_reference_floor` trigger blocks deleting references below 3 on an indexed artwork — ADR-0005 rider; curiosity position now max+1, fixing the collision with gaps left by removals); (3) `.opencode/context` reorg (openagents-repo + C# docs → `archive/`, project-intelligence condensed); (4) `docs/stories/` placeholders for the remaining 9 slice Stories — each prefilled with the verified Q-ID ledger data and editorial flags (girasoles pinned Q21948567 + metSkip note; la-habitación = series Q724377; la-vocación pinned + year-override warning; both Caravaggio picks flagged as awaiting Patrick's confirmation; las-dos-fridas flagged non-PD for the display image). Placeholders are checklists against the Increment-7 template — no content invented, nothing loaded to DB. Resume point unchanged: girasoles draft first.
