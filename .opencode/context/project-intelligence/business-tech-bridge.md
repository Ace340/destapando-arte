<!-- Context: project-intelligence/bridge | Priority: high | Version: 2.0 | Updated: 2026-10-03 -->

# Business ↔ Tech Bridge

> How business promises become technical constraints. The pattern is consistent:
> **if the ADRs say it, the schema enforces it** (migration header, verbatim).

## Core Mapping

| Business promise | Technical enforcement | Where |
|------------------|----------------------|-------|
| "Never a silent wrong answer" (0001) | Recognition deferred to Phase 3 behind four live gates; demand telemetry (`requested_via`, no `scanner_miss` yet) ships now | enum + readiness widget (partial) |
| "Trust Wikipedia doesn't offer" (0007) | Curiosity insert requires type AND source_url — enforced in `createCuriosity` + `source_url not null` | actions.ts, schema |
| "Claims survive link-rot" (0014) | `frame_analysis_text not null`; evidence_url is garnish | schema + `saveConnection` |
| "Spanish is identity" (0009) | Zero localization columns; Spanish UI/error copy in code | schema + actions.ts |
| "Editorial hours are the budget" (0006) | Launch scope 30+20; seed = 10-slice; import does metadata, never editorial | seed.sql, import script |
| "Honest open data" (0002) | Import never fabricates IDs; P170/P571-verified; honest NULLs for non-Met works | import-external-ids.ts |
| "The DB is the last line of defense" (0005) | Gate triggers: insert-or-update indexing gate, reference floor on delete, story-only asset block | init migration |
| "Privacy disclosed now" (0017) | Static `/privacidad` page (zero deps, renders pre-setup) + `docs/privacy/` canonical text + Play answers draft | app route, docs/privacy |
| "2 pushes/day, ever" (0018) | Rule lives in the sender (Phase 2); `notified_at` column ready | future sender |
| "No episode before its Story" (0015) | Calendar must *structurally block* scheduling — making drift impossible, not forbidden | Phase-2 calendar (not yet built) |
| "Cheap honest attribution" (0016) | Deep links + Install Referrer + plain `analytics_events` table (no SDK) | schema, episode end-cards |

## The Recurring Design Move

When a business rule must hold, it is enforced **structurally** (schema trigger,
404 gate, required field) rather than procedurally (docs, discipline, hope).
Examples: `/obra` renders unpublished works as 404 instead of hiding links;
the cadence calendar is specified to *block* rather than *warn*. New features
should ask first: *"can the database make this impossible, not just forbidden?"*
