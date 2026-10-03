<!-- Context: project-intelligence/business | Priority: high | Version: 2.0 | Updated: 2026-10-03 -->

# Business Domain

> Canonical sources: `GLOSSARY.md` (root) and `docs/adr/`. This file distills; they decide.

## Quick Reference

- **Purpose**: Understand why this project exists
- **Update When**: Business direction changes, new ADRs, phase transitions
- **Audience**: Developers needing context, stakeholders

## Project Identity

```
Project: Destapando el Arte
Tagline: La historia del arte que nadie te cuenta — destapada.
Problem: Spanish-speaking audiences get art either from Wikipedia (no voice,
  no curation, machine prose) or from entertainment content with no sources.
Solution: One brand, two products — a YouTube channel + a Spanish-first app —
  built on a hand-written editorial layer over open data (Met + Wikidata +
  Commons), where every claim is typed, sourced, and curated.
```

*Destapar* ("to uncork/expose") is the brand verb — the debunk (*mito destapado*)
is the premium, shareable tier (ADR-0007).

## Target Users

| Segment | Who | Needs | Pain |
|---------|-----|-------|------|
| Primary | Spanish-speaking art-curious YouTube viewers | The story behind the painting, in Spanish, trustworthy | Wikipedia is dry/English-centric; entertainment content is unsourced |
| Editor | Patrick (solo) | Editorial hours budgeted honestly (ADR-0006) | Import capacity ≠ enrichable stories |

## Value Proposition

- **Trust combination Wikipedia doesn't offer**: sourced + typed + curated + Spanish (ADR-0007).
- **The moat**: film connections — *the cinema that borrowed its language* — with claims that survive link-rot (ADR-0014).
- **Honest recognition** (Phase 3): graded confidence, never a silent wrong answer (ADR-0001).

## Success Metrics / Phase Gates (ADR-0012)

| Phase | Name | Exit criteria |
|-------|------|---------------|
| 1 | La Fundación | End-to-end publish works (dashboard, schema, import, 10 Stories drafted) |
| 2 | La Biblioteca | 30 published + 20 in pipeline, 10 episodes, Play closed beta passed (incl. privacy, ADR-0017), attribution live |
| 3 | El Escáner | ALL four: ≥50 published · 100% of scannable corpus with reference vectors · ≥500 installs · D7 ≥15% |

Launch scope is **editorial hours**, not import capacity (ADR-0006): 30 published + 20 buffered, slice of 10, ~75 h total.

## Non-Negotiables

- Spanish, permanently — identity, not a launch decision (ADR-0009).
- Privacy disclosed now, not patched later (ADR-0017).
- Push blast ceiling 2/day/device, ever (ADR-0018).
