<!-- Context: project-intelligence/notes | Priority: high | Version: 2.0 | Updated: 2026-10-03 -->

# Living Notes

> Current state, debt, open questions. Keep alive; archive resolved items with status.

## Current State (2026-10-03)

- **Phase**: 1 — La Fundación (ADR-0012). Initial commit landed (schema, dashboard, import script, ADRs); first two-axis review done.
- **P0 fixes applied, uncommitted**: curiosity position `max+1` (was `count+1` — collision bug); indexing gate now fires `before insert or update` + reference-floor on delete; `/privacidad` + `docs/privacy/` shipped (ADR-0017).
- **Pending manual step**: `supabase db reset` locally to re-apply the edited init migration.
- **Phase-1 exit check**: "end-to-end publish works" — not yet verified against a live local DB.

## Technical Debt

| Item | Impact | Priority | Status |
|------|--------|----------|--------|
| `advance()` moves created→enriched with no rights check (ADR-0005: "Enriched includes the rights check and image-asset attachment") | Weakens dual-track gate at the UI level (DB still holds on `indexed`) | Med | Open |
| `~90 lines` duplicated resolve-loop skeleton in `import-external-ids.ts` | Drift risk across resolveArtists/resolveWikidata/resolveMet | Med | Open |
| `{ artworkId, slug }` clump through every action + editor form | Noise; a bundled prop/hidden-field pair would remove ~8 repetitions | Low | Open |
| `physical_instances.version_note` — "version" is a glossary *Avoid* word (defensible as a field) | Naming purity | Low | Open |
| `/cuadro` route name is a non-canonical synonym (glossary avoid: "cuadro" = painting) | Cosmetic; `/obra` is the specified public route | Low | Open |
| `.opencode/context/` template scaffolding (csharp, openagents-repo, mastra) | Context noise; wrong standards loaded for this stack | Med | Partially done — csharp + openagents-repo archived 2026-10-03; mastra-ai still in `development/ai/` |

## Open Questions

| Question | Stakeholders | Status |
|----------|--------------|--------|
| ADR-0018 OPEN: when obra del día and the digest compete for the same device-day, which spends the slot? | Patrick | Decide before Phase-2 exit |
| Issue tracker not set up (`docs/agents/issue-tracker.md` missing) — findings live in chat/here | Patrick | Run `/setup-matt-pocock-skills` |
| `docs/stories/` has 1 of 10 slice stories — editorial pipeline is the real critical path (ADR-0006) | Patrick | Ongoing |

## Resolved (2026-10-03)

- ✅ Curiosity position collision — fixed with `max+1` (review finding)
- ✅ Indexing gate INSERT bypass — trigger now `before insert or update` (review finding)
- ✅ Privacy page/docs missing — shipped per ADR-0017 (review finding)
