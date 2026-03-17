# Audit

`/audit [scope]` - Full-project code audit workflow (audit first, then fix)

Broad repository audit for overall code health. Not change-scoped.

## Priority

CRITICAL - must fix now | MEDIUM - should fix soon | LOW - suggestion

## Model Tiers

- Inherit tier semantics from `/orchestrator`.
- `T1` = deep audit/review rigor, `T2` = balanced fixes and validation, `T3` = quick triage only.
- Task tool mapping: `subagent_type="general"`; if effort variants exist use `T1=high`, `T2=medium`, `T3=low`, else enforce via prompt depth/evidence.

## Flow

Invocation of `/audit` is treated as explicit approval for read-only git commands in the current repo (`git status/diff/log`). Do not run git write/destructive operations without separate user confirmation.

1. **Scope** (MANDATORY):
   - Default to full project sweep (entire repository), not staged/unstaged diff scope.
   - Optional explicit scope argument may narrow to a module/path.
   - Exclude generated/dependency artifacts: `.git/`, `node_modules/`, `dist/`, `build/`, `.next/`, `.cache/`, coverage artifacts, lockfile vendor caches.
   - If resolved scope has zero auditable files, return `APPROVED` with `Actions: none (nothing to audit)`.

2. **Context** (MANDATORY):
   - Read project context: `README`, `docs/architecture.md`, `docs/requirements.md` when present.
   - Inspect read-only git context (`git status/diff/log`) for recent risk areas (context only, not scope selection).
   - Detect domain and stack to select SMEs and specialists.

3. **Pass 1 - Audit** (MANDATORY):
   - `[T1:deep]` Spawn reviewers via Task tool:
     - Required: Distinguished Architect, Distinguished SME ({domain}), Distinguished Security Architect
     - Additional as needed: Performance, API, Data, Platform, UX specialists
   - Include checks across: architecture, correctness, maintainability, tests, docs, security, performance, operational risk.
   - Each reviewer returns findings with: severity, file:line, evidence, impact, and recommended remediation.
   - Include sub-agent contract in every spawn prompt:
     - no direct user questions
     - no prompt escalation questions
     - assume-and-proceed for low-risk ambiguity with explicit assumptions

4. **Audit Report** (MANDATORY):
   - Consolidate and de-duplicate findings into one prioritized report.
   - If no actionable findings, return `APPROVED` and stop.
   - Otherwise present report and ask: `Proceed to fix now? (recommended: yes) [Y/n]`.

5. **Pass 2 - Fix** (MANDATORY when approved):
   - `[T2:balanced]` Delegate fixes by priority (CRITICAL -> MEDIUM -> LOW).
   - For each issue: root cause -> minimal targeted fix -> verification.
   - Run independent fixes in parallel; dependent fixes serially.
   - Validate with relevant tests/checks for changed areas.

6. **Re-audit** (MANDATORY):
   - `[T1:deep]` Re-run reviewer pass on modified and adjacent high-risk areas.
   - If findings remain, iterate fix -> re-audit loop (max 3 rounds).
   - If still blocked after 3 rounds, return `CHANGES_NEEDED` with concrete missing context/actions.

7. **Output** (MANDATORY, lightweight):
   - Save a single artifact to `docs/audits/{audit-id}/audit-summary.md`.
   - Keep concise: scope, top findings, actions taken, final verdict, open follow-ups.
   - Do not create separate fix/re-audit files unless explicitly requested.

## Report Format

```
# Audit: {scope}
Scope: source={full_project|explicit}; files_scanned={count}; exclusions={list}
Reviewers: {list}

## Findings
### CRITICAL
- {issue} file:line

### MEDIUM
- {issue} file:line

### LOW
- {issue} file:line

## Verdict: APPROVED | CHANGES_NEEDED
## Actions: {prioritized list}
```
