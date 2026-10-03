<!-- Context: project-intelligence/technical | Priority: high | Version: 2.0 | Updated: 2026-10-03 -->

# Technical Domain

> Canonical schema: `supabase/migrations/` · Canonical vocabulary: `GLOSSARY.md` · Decisions: `docs/adr/`

## Quick Reference

- **Purpose**: Understand how the project works technically
- **Update When**: Stack, structure, or enforcement changes
- **Audience**: Developers, agents touching code or schema

## Primary Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Language | TypeScript | Standards: `core/standards/typescript.md` |
| Framework | Next.js (App Router) on Vercel | ⚠️ **NOT the Next.js you know** — read `apps/dashboard/AGENTS.md` and `node_modules/next/dist/docs/` before writing code |
| Database | Supabase (Postgres + RLS) | Writes go **server-side only** via the secret key; anon/publishable reads are deny-by-default except the public policies |
| Lint | ESLint 9 + eslint-config-next | `npm run lint` in `apps/dashboard` |

## Architecture Pattern

Single Next.js app serves two surfaces on one domain (ADR-0011):

```
apps/dashboard/
├── /                    → editorial home (Catálogo list, readiness counter)
├── /cuadro/[slug]       → editor for one Artwork (private in spirit, no auth in Phase 1)
├── /obra/[slug]         → PUBLIC read-only Story page (404 unless published — query-side mirror of RLS)
├── /privacidad          → PUBLIC static privacy page (ADR-0017; renders with zero setup)
├── src/lib/actions.ts   → mutations, one per editorial act ('use server')
├── src/lib/artworks.ts  → queries (server-only)
└── src/components/      → badges, editors, setup notice
scripts/import-external-ids.ts → Met/Wikidata import; never fabricates IDs, honest NULLs (ADR-0002)
```

### The database is the last line of defense

Every ADR that can be enforced in schema, is — via triggers in the init migration:

- `artworks_indexing_gate` (before insert or update): `indexed` requires published + not rights-blocked + ≥3 reference assets (ADR-0005)
- `image_assets_reference_floor` (after delete): can't delete references below the 3-floor of an indexed artwork — un-index first, explicitly
- `image_assets_story_only` (before insert): rights-blocked artworks take no reference assets (ADR-0012 rider)
- `artworks_touch` (before update): `updated_at`

Dual track: `story_status` (created → enriched → draft → published, forward-only, terminal) is independent of `indexed` (ADR-0005). The Artwork collapses versions into `physical_instances` (ADR-0004); recognition can never target an instance.

## Conventions That Bind Code

- **Spanish-first**: UI copy, entity names, error messages in `actions.ts` are Spanish; zero localization columns, ever (ADR-0009).
- **Glossary naming**: `artworks` not paintings/works; `curiosities` typed+sourced; `film_connections` with mandatory `frame_analysis_text` (ADR-0014). Avoid-lists live in `GLOSSARY.md`.
- **Public truth gate**: only `story_status = 'published'` exists at `/obra/*`; RLS + the `published()` helper agree.
- **No `.env` or secrets committed**; `isConfigured()` guard renders `SetupNotice` pre-setup.
