---
name: docs
description: Reconcile and validate all documents in the project's docs/ directory
---

# Docs

`/docs [mode] [scope]` - Reconcile all documents in the project's `docs/` directory. Discovers structure from disk (no hardcoded shape), validates cross-references, flags drift between documents, and produces a prioritized action list.

- `mode` (optional): `quick` (default) or `full`. Quick = inline checks, fast pass. Full = delegated sub-agent reconciliation with phases.
- `scope` (optional): subpath under `docs/` to narrow reconciliation. Defaults to the whole `docs/` tree.

## Priority

🔴 High - broken cross-refs, missing required docs, contradictory status | 🟠 Medium - stale references, inconsistent naming, partial coverage | 🔵 Low - style drift, optional metadata

## Recommended Baseline

Adopt all that apply to the project. Missing recommended docs are flagged as 🟠 Medium (not 🔴), since absence is a judgment call. Stale or inconsistent content in an adopted baseline doc is 🔴.

| Doc | Purpose | When to adopt |
|-----|---------|---------------|
| `terminology.md` (or `glossary.md`) | Domain terms, project jargon, abbreviations, ambiguous words with project-specific meaning. Prevents the agent from inventing or misinterpreting terms mid-task. | Any project with 2+ people, or 1+ week of work, or a non-trivial domain. |
| `code-map.md` | Semantic index of the codebase: what each module/folder is for, key entry points, public surface, where X kind of change usually lives. Maps intent → location. | Any codebase the agent navigates repeatedly. |
| `architecture.md` | Current system shape only. Decisions/why live in ADRs. | Any project beyond a single module. |
| `requirements.md` (or `spec.md`) | Product scope, what the product is (not what each release did). | Any product with a defined scope that outlives a single release. |
| `docs/adr/` (MADR or Nygard format) | One file per non-obvious decision: context, decision, consequences. | Any project with 3+ decisions worth recording. |
| `docs/runbooks/` | Operational procedures: deploy, rollback, incident response. | Any project with on-call, deploys, or external dependencies. |

Discovery: scan for any of these filenames or directory names (case-insensitive, with common aliases: `glossary`, `domain.md`, `codebase-map.md`, `nav.md`, `system-design.md`, `spec.md`, `decisions/`). Report which baseline docs are present, missing, or stale.

`prds/`, `audits/`, `hotfixes/`, `features.md` are **discovered categories** (not baseline) — flag them when present, ignore when absent.

## Discovery (MANDATORY)

Do not assume a fixed `docs/` shape. Discover it from disk before running checks:

1. Resolve `docs/` from CWD; if absent, report `✅ HEALTHY (no docs/ to reconcile)` and stop.
2. Inventory every file and subdirectory under `docs/` (recursively). Skip `node_modules/`, `.git/`, lockfiles, generated artifacts.
3. Classify documents by content heuristics, not by path convention alone:
   - **`features.md` / `features/`** - feature inventory with status (planned/active/deprecated/removed)
   - **`audits/` / `audit*.md`** - audit reports
   - **`prds/` / `prd*.md`** - product requirement documents
   - **`architecture.md` / `adr/` / `decisions/`** - architecture / decision records
   - **`requirements.md` / `specs/`** - specifications
   - **`hotfixes/`** - incident/fix records
   - **everything else** - uncategorized; flag as candidates for new categories
4. Read frontmatter (`name:`, `status:`, `feature:`, `date:`, `owner:`) and leading headings to extract identity.
5. Build a map: `{doc_id -> {path, type, status, refs_to[], refs_from[]}}` for the whole `docs/` tree.

## Flow

Invocation of `/docs` is treated as explicit approval for read-only git operations in the current repo (`git log`, `git status`, `git diff`). Do not run write/destructive git operations without separate user confirmation.

### Quick Mode (default)

1. **Scope** (MANDATORY):
   - Default: full `docs/` tree.
   - Explicit `scope` argument narrows to a subpath.
   - Exclude generated/dependency artifacts: `.git/`, `node_modules/`, lockfile caches, build outputs.
   - If resolved scope has zero documents, return `✅ HEALTHY` and stop.
2. **Context** (MANDATORY): read project root (`README`, `AGENTS.md`) for naming conventions; read-only git log for recent doc churn.
3. **Discovery** (MANDATORY): per Discovery section above. Cache the doc map for the rest of the run.
4. **Checks** (MANDATORY, inline in main context):
   1. **Baseline coverage** - per Recommended Baseline: report which baseline docs are present, missing, or stale. Missing = 🟠. Stale = 🔴 (see checks 4-5).
   2. **Orphans** - documents with no incoming or outgoing references, excluding intentional root indexes (e.g. `README.md`, `features.md`) and adopted baseline docs (which are inherently entry points).
   3. **Broken cross-refs** - any `[text](path.md)` or `path.md` mention in any doc that does not resolve to an existing file. Resolve paths relative to the referencing doc.
   4. **Baseline content checks**:
      - `code-map.md` paths resolve - every file/directory path it references must exist in the repo.
      - `terminology.md` terms consistent - each defined term, when used in other docs, refers to the defined sense (spot-check high-traffic terms).
      - `architecture.md` vs ADRs - if an ADR contradicts current `architecture.md`, flag both directions.
      - `requirements.md` coverage - every feature in `features.md` traces back to a requirement, or is explicitly marked `unscoped`.
   5. **Feature status drift** - any `status:` value in feature docs that contradicts supporting evidence in the doc body (e.g. `status: removed` but a PRD still references it as active).
   6. **Stale references** - mentions of features/PRDs/audits by name that do not match any known doc id.
   7. **Date sanity** - future-dated docs, missing dates on audit/PRD/hotfix types, inconsistent date formats.
5. **Output** (MANDATORY): see Output section.
6. **Fix prompt**: end with `Apply fixes now? (recommended: yes for 🔴; no for 🟠/🔵) [Y/n]`.

### Full Mode (`/docs full`)

Delegated reconciliation with phases. Spawn sub-agents per phase; consolidate in main context.

1. **Scope** + **Context** + **Discovery** as in Quick Mode.
2. **Phase 1 - Inventory** (delegated): spawn one general sub-agent to walk `docs/`, classify documents, and emit the full doc map. Sub-agent contract: no user prompts, no escalation, assume-and-proceed.
3. **Phase 2 - Cross-ref validation** (delegated): spawn one general sub-agent with the doc map. Validate every reference, build the broken-ref list, and identify orphans. Return structured findings only.
4. **Phase 3 - Content consistency** (delegated): spawn one general sub-agent per category (features, audits, PRDs, ADRs) to check status drift, date sanity, and category-specific invariants. Parallelize when independent.
5. **Phase 4 - Consolidate**: de-duplicate findings, rank by priority (🔴 → 🟠 → 🔵), cap 🔵 at 5 most actionable.
6. **Phase 5 - Output**: see Output section.
7. **Phase 6 - Optional fix pass**: on user approval, spawn a fix sub-agent per category. Each fix sub-agent receives only its category's findings and applies minimal targeted edits. Re-run Phase 2-3 after fixes; max 2 iterations.

## Sub-agent Interaction Contract (MANDATORY)

Applies to all Task-spawned sub-agents.

- **No direct user prompts:** Sub-agents must never ask the end user for input.
- **No prompt escalation:** Sub-agents must not return clarification questions for the parent to relay.
- **Assume-and-proceed rule:** If ambiguity is low risk and reversible, sub-agent proceeds with explicit assumptions.
- **Insufficient-context handling:** If required data is missing, sub-agent returns findings with explicit "insufficient context" notes and the exact artifacts that were unavailable.
- **Deterministic completion:** Sub-agent final response must contain findings only (never question payloads).

## Failure Handling (MANDATORY)

- Set an execution timeout per spawned sub-agent task.
- On timeout/non-conforming output, retry once with a stricter prompt including the interaction contract.
- If still blocked, parent ends the run with `🔄 CHANGES_NEEDED` and a concrete action list of missing context to supply before re-running.

## Output

```
# Doc Reconciliation
Mode: {quick|full} | Scope: {path or "full docs/"} | Date: {date}
Docs discovered: {count} | Categories: {list}

## Summary
🔴 High: {n} | 🟠 Medium: {n} | 🔵 Low: {n}

## Findings
### 🔴 {finding}
- Doc: {path:line}
- Evidence: {quote or pattern}
- Impact: {concrete consequence}
- Fix: {minimal action}

### 🟠 {finding}
...

### 🔵 {finding} (max 5)
...

## Doc Map
| ID | Path | Type | Status | Refs Out | Refs In |
|----|------|------|--------|----------|---------|

## Action Items
Immediate: [ ] ...
Short-term: [ ] ...
Optional: [ ] ...

## Status
🔴 NEEDS ATTENTION (3+ 🔴) | 🟡 MINOR (1-2 🔴 or any 🟠) | 🟢 HEALTHY
```

## When to Run

- After adding/removing a feature, PRD, or audit doc.
- Before releases.
- When onboarding to a project to surface doc debt.
- On schedule (weekly) for projects with active doc churn.
