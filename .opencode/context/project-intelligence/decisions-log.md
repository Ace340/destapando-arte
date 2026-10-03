<!-- Context: project-intelligence/decisions | Priority: high | Version: 2.0 | Updated: 2026-10-03 -->

# Decisions Log — ADR Index

> **Canonical ADRs live in `docs/adr/` — this is a routing index, not a copy.**
> Read the ADR itself before working in its blast radius. Never edit this index
> without the corresponding ADR.

## Quick Reference

- **Purpose**: Route any task to the decisions that bind it
- **Format**: one line per ADR: what it decides → where it bites
- **Status**: All 19 decided 2026-09-29 unless noted

| ADR | Decision | Binds |
|-----|----------|-------|
| [0001](../../../docs/adr/0001-recognition-grades-never-silent-wrong-answer.md) | Recognition grades confidence; never a silent wrong answer. Demand collection (`requested_via`) lives from v1 | `content_requests` enum; Phase-3 scanner UX; telemetry |
| [0002](../../../docs/adr/0002-scannable-corpus-is-public-domain-only.md) | Scannable corpus is public-domain only; Commons = images, Met = metadata backbone | `image_assets.source_url`; import script honesty |
| [0003](../../../docs/adr/0003-story-only-lessons-for-copyrighted-works.md) | Copyrighted works publish as story-only lessons; never scannable; rights is a permanent attribute | `rights_status` enum; indexing gate |
| [0004](../../../docs/adr/0004-artwork-collapses-versions.md) | One Artwork record collapses versions; Story carries the version fact | `physical_instances` table; recognition targets |
| [0005](../../../docs/adr/0005-dual-track-publishing.md) | Dual track: `story_status` line ≠ `indexed` boolean; indexing gate floor 3 refs, target 7 | `artworks` columns; gate triggers; `advance()` |
| [0006](../../../docs/adr/0006-launch-scope-is-editorial-hours.md) | Launch = 30 published + 20 pipeline (~75 editorial h); slice of 10; rejected 50-at-launch | seed slice; roadmap scope |
| [0007](../../../docs/adr/0007-curiosities-are-typed-and-sourced.md) | Curiosities are typed (fact/mito/leyenda) AND sourced (URL mandatory) | `curiosities` schema; `createCuriosity` |
| [0008](../../../docs/adr/0008-host-only-public-domain-or-ours.md) | Host only public-domain media or ours; everything else embedded/described (amended by 0014) | media handling, evidence types |
| [0009](../../../docs/adr/0009-spanish-permanently.md) | Spanish, permanently: product, UI, content; zero localization columns, ever | all UI copy; schema |
| [0010](../../../docs/adr/0010-artist-aggregation-why-special-lessons-v2.md) | Artist = aggregation + one `why_special` paragraph; movements = pure taxonomy; Lessons = v2 | `artists`, `movements`; no full artist stories in v1 |
| [0011](../../../docs/adr/0011-public-story-pages-on-dashboard-domain.md) | Dashboard domain serves public `/obra/{slug}` + install funnel | `/obra` route; RLS public policies |
| [0012](../../../docs/adr/0012-scanner-defers-v1-is-the-daily-ritual.md) | Scanner defers to Phase 3 (four live gates); v1 retention = obra del día + weekly episode + push | phase plan; readiness widget |
| [0013](../../../docs/adr/0013-no-transcript-no-adapted-discount.md) | `source_transcript` lands at created; no transcript ⇒ budget as fresh | `artworks.source_transcript`; planning |
| [0014](../../../docs/adr/0014-no-claim-rests-on-a-link-we-dont-control.md) | Every film connection carries required `frame_analysis_text`; embeds are garnish; weekly oEmbed cron | `film_connections` schema; Phase-2 cron |
| [0015](../../../docs/adr/0015-cadence-contract-story-first.md) | Story first: calendar structurally blocks scheduling an episode whose Story isn't published | Phase-2 calendar (not yet built) |
| [0016](../../../docs/adr/0016-attribution-v1-cheap-and-honest.md) | Attribution = deep links + Play Install Referrer + `analytics_events`; UTMs on web; known gaps on record | attribution surfaces |
| [0017](../../../docs/adr/0017-privacy-disclosed-now.md) | Privacy disclosed NOW: repo file + `/privacidad` + Play answers; camera sentence verbatim from day one | `docs/privacy/`; `/privacidad` page; Phase-2 exit |
| [0018](../../../docs/adr/0018-push-blast-ceiling-2-per-day.md) | Max 2 pushes/day/device ever; digest-batched; OPEN: slot competition rule | Phase-2 sender (rule lives in sender) |
| [0019](../../../docs/adr/0019-vision-cost-and-architecture-decided-at-phase-3-gate.md) | Vision cost + architecture decided at Phase-3 gate with real data; placeholder envelope on record | no premature scanner infra |

## Amendment Chain

- 0008 (host doctrine) → amended by **0014** (frame_analysis_text required; evidence_visual aux)
- 0012 phase plan references 0017 (privacy as Phase-2 exit) and gates Phase 3
