<!-- Context: core/navigation | Priority: critical | Version: 2.0 | Updated: 2026-10-03 -->

# Context Navigation

**New here?** → `project-intelligence/navigation.md` (this project's business, stack, and ADR index)

---

## Structure

```
.opencode/context/
├── project-intelligence/  # ⭐ THIS project: domain, stack, ADR index, debt
├── core/                   # Universal standards & workflows
├── development/            # Software development (all stacks)
├── ui/                     # Visual design & UX
└── archive/                # Quarantined template content (csharp, openagents-repo)
```

---

## Quick Routes

| Task | Path |
|------|------|
| **Anything** ⭐ | Start: `project-intelligence/navigation.md` — then the route below |
| **Write code** | `project-intelligence/technical-domain.md` → `core/standards/typescript.md` + `code-quality.md` |
| **Touch schema** | `project-intelligence/decisions-log.md` → the ADR it enforces → `supabase/migrations/` |
| **Write tests** | `core/standards/test-coverage.md` |
| **Write docs/content** | `project-intelligence/business-domain.md` → `core/standards/documentation.md` |
| **Privacy-adjacent** | `docs/adr/0017-privacy-disclosed-now.md` + `docs/privacy/` |
| **Review code** | `core/workflows/code-review.md` + `project-intelligence/decisions-log.md` |
| **Delegate task** | `core/workflows/task-delegation-basics.md` |
| **UI development** | `development/ui-navigation.md` |

---

## By Category

**core/** - Standards, workflows, patterns → `core/navigation.md`
**development/** - All development → `development/navigation.md`
**ui/** - Design & UX → `ui/navigation.md`
**archive/** - Quarantined template content; do not load
