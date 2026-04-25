---
name: audit
description: Full-project code audit workflow: audit then fix
---

# Audit

`/audit [scope]` - Full-project code audit workflow (audit first, then fix)

Broad repository audit for overall code health. Not change-scoped.

## Priority

CRITICAL - must fix now | MEDIUM - should fix soon | LOW - suggestion (max 5)

## Focus Areas

- **Security**: vulnerabilities, exposure surface, input validation, auth/authorization gaps
- **Performance**: bottlenecks, unnecessary computation, wasted allocations, N+1 patterns
- **Feature complexity**: reduce without losing core functionality — eliminate accidental complexity, over-abstraction, unused paths
- **Code complexity**: flatten control flow, reduce nesting, shorten functions, narrow variable scope
- **Error handling**: swallowed errors, silent failures, missing guard clauses, propagated panics
- **Dead code / unused paths**: unreachable branches, unused exports, orphaned files
- **State management / data flow**: shared mutable state, implicit coupling, hidden side effects
- **Code inconsistencies**: naming, patterns, style drift within the codebase
- **Idiomatic code**: align with language/framework conventions, not translated patterns from other paradigms
- **Project conventions**: follow existing patterns, naming, and structure already established in the codebase
- **Dependency health**: unused deps, unnecessary deps, bloated API surface
- **Critical test gaps**: untested critical paths, missing boundary checks — not coverage %, but real risk
- **Human readability**: clear naming, obvious intent, no cleverness at the cost of clarity

## Delegation

All audit and fix work must be delegated to sub-agents via the Task tool to conserve the main context window. Never read full source files, run analysis, apply fixes, or stream raw findings in the main conversation. The main context only receives: consolidated reports, user prompts, and fix approvals.

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
   - Spawn reviewers via Task tool:
     - Required: Distinguished Architect, Distinguished SME ({domain}), Distinguished Security Architect
     - Additional as needed: Performance, API, Data, Platform, UX specialists
   - Each reviewer covers all focus areas relevant to their domain.
   - Each reviewer returns findings with: severity, file:line, **evidence** (exact code snippet or pattern), **impact** (concrete consequence), and recommended remediation.
   - **Evidence bar** (MANDATORY): drop any finding that cannot cite specific code evidence. No vague patterns ("could be improved"), no speculative risks ("might cause issues"). Every finding must answer: what is broken, where exactly, and what concrete failure it causes.
   - **Classification rule**: CRITICAL/MEDIUM = "this IS broken" (verifiable defect). LOW = "this could be better" (actionable suggestion). Do not ship speculative CRITICAL/MEDIUM findings.
   - Include sub-agent contract in every spawn prompt:
     - no direct user questions
     - no prompt escalation questions
     - assume-and-proceed for low-risk ambiguity with explicit assumptions

4. **Audit Report** (MANDATORY):
   - Consolidate and de-duplicate findings into one prioritized report.
   - **Merge rule**: overlapping findings from multiple reviewers merge into one entry with combined evidence and strongest severity.
   - Cap LOW findings at 5 — keep only most actionable.
   - If no actionable findings, return `APPROVED` and stop.
   - Otherwise present report and ask: `Proceed to fix now? (recommended: yes) [Y/n]`.

5. **Pass 2 - Fix** (MANDATORY when approved):
   - Delegate fixes by priority (CRITICAL -> MEDIUM -> LOW).
   - For each issue: root cause -> minimal targeted fix -> verification.
   - Run independent fixes in parallel; dependent fixes serially.
   - Validate with relevant tests/checks for changed areas.

6. **Re-audit** (MANDATORY):
   - Re-run reviewer pass on modified and adjacent high-risk areas.
   - If findings remain, iterate fix -> re-audit loop (max 3 rounds).
   - If still blocked after 3 rounds, return `CHANGES_NEEDED` with concrete missing context/actions.

7. **Output** (MANDATORY, lightweight):
   - Present concise summary: scope, top findings, actions taken, final verdict, open follow-ups.

## Report Format

```
# Audit: {scope}
Scope: source={full_project|explicit}; files_scanned={count}; exclusions={list}
Reviewers: {list}

## Findings
### CRITICAL
- {issue} file:line
  Evidence: {exact code/pattern}
  Impact: {concrete consequence}

### MEDIUM
- {issue} file:line
  Evidence: {exact code/pattern}
  Impact: {concrete consequence}

### LOW (max 5)
- {issue} file:line
  Evidence: {exact code/pattern}

## Verdict: APPROVED | CHANGES_NEEDED
## Actions: {prioritized list}
```