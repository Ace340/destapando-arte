<!-- Context: project-intelligence/technical | Priority: high | Version: 2.1 | Updated: 2026-10-08 -->

# Technical Domain

> Canonical schema: `supabase/migrations/` · Canonical vocabulary: `GLOSSARY.md` · Decisions: `docs/adr/`

## Quick Reference

- **Purpose**: Understand how the project works technically
- **Update When**: Stack, structure, or enforcement changes
- **Audience**: Developers, agents touching code or schema

## Primary Stack

Monorepo with two apps (`apps/dashboard`, `apps/mobile`) sharing one Supabase backend.

**Shared:**

| Layer | Technology | Notes |
|-------|-----------|-------|
| Language | TypeScript | Standards: `core/standards/typescript.md` |
| Database | Supabase (Postgres + RLS) | Writes go **server-side only** via the secret key; anon/publishable reads are deny-by-default except the public policies |
| Mobile data | `@supabase/supabase-js` + AsyncStorage | Sessions/local persistence on device |

**Dashboard (`apps/dashboard`):**

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js (App Router) on Vercel | ⚠️ **NOT the Next.js you know** — read `apps/dashboard/AGENTS.md` and `node_modules/next/dist/docs/` before writing code |
| Lint | ESLint 9 + eslint-config-next | `npm run lint` in `apps/dashboard` |

**Mobile (`apps/mobile`):**

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Expo SDK 57 (React Native 0.86.3, React 19.2.3) | ⚠️ **SDK 57 breaks from training data** — read `apps/mobile/AGENTS.md` and fetch versioned docs (https://docs.expo.dev/versions/v57.0.0/) before writing code |
| Navigation | Expo Router ~57 | File-based; routes in `src/app/`, `_layout.tsx` = navigators; non-route code outside `src/app/` |
| Animation/UI | Reanimated 4.5 + worklets, Gesture Handler, SafeArea/Screens | Prefer first-party Expo modules over third-party |
| Native builds | CNG + EAS | No `ios/`/`android/` dirs — never hand-edit; builds via `eas build`, no local Xcode/Android Studio |
| Lint | ESLint 9 + eslint-config-expo | `npm run lint`, `npm run typecheck` (`tsc --noEmit`) in `apps/mobile` |

## Architecture Pattern

Two apps, one backend: Next.js serves the editorial + public web surfaces on one domain (ADR-0011); Expo serves the reader-facing mobile app against the same Supabase instance.

```
apps/dashboard/
├── /                    → editorial home (Catálogo list, readiness counter)
├── /cuadro/[slug]       → editor for one Artwork (private in spirit, no auth in Phase 1)
├── /obra/[slug]         → PUBLIC read-only Story page (404 unless published — query-side mirror of RLS)
├── /privacidad          → PUBLIC static privacy page (ADR-0017; renders with zero setup)
├── src/lib/actions.ts   → mutations, one per editorial act ('use server')
├── src/lib/artworks.ts  → queries (server-only)
└── src/components/      → badges, editors, setup notice
apps/mobile/             → Expo scaffold (SDK 57); details in apps/mobile/AGENTS.md
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
