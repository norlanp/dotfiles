---
name: docs
description: Audit and reconcile docs/; use for /docs, broken links, stale docs, missing canonical docs, and doc cleanup
---

# Docs

`/docs [quick|full] [scope]`

Default: `quick docs/`. If arg 1 is not `quick` or `full`, treat it as `scope`.

## Canonical Docs

- `docs/features.md`: capabilities and status: `planned`, `active`, `deprecated`, `removed`, `unscoped`
- `docs/glossary.md`: terms and abbreviations
- `docs/architecture.md`: current system shape and boundaries
- `docs/requirements.md`: durable product requirements
- `docs/code-map.md`: repo map and entry points
- `docs/adr/`: decisions
- `docs/runbooks/`: operations

Aliases (auto-detect, propose consolidation — never rename without per-file approval): `terminology.md`/`domain.md` → `glossary.md`, `spec.md` → `requirements.md`, `decisions/` → `adr/`, `architecture-notes.md`/`system.md` → `architecture.md`, `feature-log.md` → `features.md`, `ops/` → `runbooks/`.

Preserve historical docs: `prds/`, `audits/`, `hotfixes/`, release notes, ADRs. Never delete without explicit approval.

## Check

1. If `docs/` or scoped docs are absent, return `HEALTHY`.
2. Read `README*`, `AGENTS.md`, and last 10 commits.
3. Inventory docs recursively; skip `.git/`, `node_modules/`, lockfiles, caches, generated output.
4. Build `{id, path, type, status, refs_to, refs_from}`.
5. **Structure reconciliation** (MANDATORY): compare actual `docs/` tree against canonical list. Flag:
   - non-canonical docs whose content belongs in a canonical doc → propose consolidation (merge durable facts into canonical, mark source historical or delete with approval)
   - missing canonical docs where evidence supports creation
   - extra files/dirs outside canonical + historical list → propose removal or reclassification
6. **Accuracy checks**:
   - broken links or unresolved `*.md` refs
   - stale or contradictory canonical docs
   - `AGENTS.md` references to docs that don't exist or were renamed (stale refs)
   - applicable canonical docs missing from `AGENTS.md`
   - orphan docs, excluding indexes and canonical entry points
   - invalid feature status or missing requirement trace
   - `code-map.md` paths that do not exist
   - glossary/architecture/ADR conflicts
   - durable content stranded in historical docs that belongs in canonical
   - missing or inconsistent dates on PRDs, audits, hotfixes

Severity: High = broken/contradictory/invalid, Medium = missing/stale/orphan/non-canonical, Low = style or metadata. Cap Low at 5. Every finding needs specific evidence (quote or path:line). Drop findings without evidence.

## Full Mode

Use sub-agents only for `/docs full`: inventory, cross-reference validation, content checks per category. Sub-agents must not ask questions; assume low-risk ambiguity and state it. Fix agents skip ambiguous writes.

## Reconciliation Flow

When structure doesn't match canonical:
1. **Consolidate** — merge durable facts from non-canonical docs into the matching canonical doc. Preserve source records as historical or delete with explicit per-file approval.
2. **Canonicalize** — propose creating missing canonical docs only when evidence exists. Propose renaming alias files to canonical names with per-file approval.
3. **Sync** — update `AGENTS.md` to reference current canonical docs; remove stale refs to renamed/deleted docs; add refs for newly created canonical docs.
4. **Prune** — propose removal of orphan/extra files only with explicit approval. Never auto-delete.

## Fix Rules

- Ask before edits. End reports with: `Apply fixes now? (recommended: yes for High only after reviewing actions; no for broad doc restructuring) [y/N]`.
- Before full-mode fixes, show exact file/action plan.
- Fix only approved actions.
- On conflicting facts, flag High instead of guessing.
- Never delete docs unless explicitly approved.

## Output

```markdown
# Doc Reconciliation
Mode: {quick|full} | Scope: {scope|docs/}
Docs: {count} | Categories: {list}

## Summary
High: {n} | Medium: {n} | Low: {n}

## Structure Match
Canonical present: {list} | Missing: {list} | Non-canonical: {list} | Historical: {list}

## Findings
### High: {title}
- Doc: {path:line}
- Evidence: {quote}
- Fix: {action}

## Doc Map
| ID | Path | Type | Status | Refs Out | Refs In |
|----|------|------|--------|----------|---------|

## Actions
- [ ] ...

## Status
{NEEDS ATTENTION | MINOR | HEALTHY}
```