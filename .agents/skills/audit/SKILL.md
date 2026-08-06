---
name: audit
description: Full-project code audit workflow: audit then fix
---

# Audit

`/audit [scope] [guidance]` — Full-project code audit (audit first, then fix).

- `scope` (optional): module/path. Defaults to full project sweep.
- `guidance` (optional): free-form sentence to steer audit focus.

Read-only git allowed (`git status/diff/log`). No write/destructive git.

Exclude: `.git/`, `node_modules/`, `dist/`, `build/`, vendor dirs, lockfiles, generated code.

## Priority

CRITICAL - must fix now | MEDIUM - should fix soon | LOW - suggestion (max 5)

## Focus Areas

- **Security**: input validation, auth gaps, exposure surface
- **Performance**: bottlenecks, wasted allocation, N+1
- **Complexity**: flatten control flow, reduce nesting, shorten functions, narrow scope
- **Error handling**: swallowed errors, silent failures, missing guards
- **Dead code**: unreachable branches, unused exports, orphaned files
- **State/data flow**: shared mutable state, hidden coupling, side effects
- **Conventions**: naming, style drift, idiomatic patterns, project consistency
- **Dependencies**: unused, unnecessary, bloated API surface
- **Test gaps**: untested critical paths, missing boundary checks
- **Readability**: clear naming, obvious intent, no cleverness over clarity

## Flow

1. **Audit** — Spawn ONE reviewer via Task tool covering all focus areas. Returns findings: severity, file:line, one-line evidence, one-line impact. Drop findings without specific code evidence. CRITICAL/MEDIUM = verifiable defect; LOW = suggestion.
2. **Report** — Consolidate, de-duplicate, cap LOW at 5. No findings → `APPROVED`. Else write findings to `todo.md` as `[ ] {severity} {issue} @file:line` items (CRITICAL first), then ask: `Proceed to fix now? (recommended: yes) [Y/n]`.
3. **Fix** — Work through `todo.md` items by priority (CRITICAL → MEDIUM → LOW). Mark `[x]` as each completes. Each: root cause → minimal targeted fix → verify. Parallel for independent, serial for dependent.
4. **Re-audit** — Only if CRITICAL/MEDIUM were fixed. Re-run reviewer on modified areas. If findings remain, loop (max 3 rounds). Still blocked → `CHANGES_NEEDED`.