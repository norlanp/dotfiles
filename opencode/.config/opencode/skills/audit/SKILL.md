---
name: audit
description: Full-project code audit workflow: audit then fix
---

# Audit

`/audit [scope] [guidance]` — Full-project code audit (audit first, then fix).

- `scope` (optional): module/path. Defaults to full project sweep.
- `guidance` (optional): free-form sentence to steer audit focus.

Read-only git allowed (`git status/diff/log`). No write/destructive git.

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

## Flow

1. **Audit** — Delegate to reviewers via Task tool. Each covers relevant focus areas, returns findings with severity, file:line, evidence (exact code), impact (concrete consequence). Drop any finding without specific code evidence. CRITICAL/MEDIUM = verifiable defect; LOW = actionable suggestion.
2. **Report** — Consolidate, de-duplicate (merge overlapping findings, strongest severity wins), cap LOW at 5. If no findings, return `APPROVED`. Else ask: `Proceed to fix now? (recommended: yes) [Y/n]`.
3. **Fix** — By priority (CRITICAL → MEDIUM → LOW). Each: root cause → minimal targeted fix → verify. Parallel for independent fixes, serial for dependent.
4. **Re-audit** — Re-run reviewers on modified areas. If findings remain, loop (max 3 rounds). Still blocked → `CHANGES_NEEDED` with concrete missing actions.