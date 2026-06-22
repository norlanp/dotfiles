---
name: improve-code
description: Surface deepening opportunities in a codebase — shallow modules, seam leaks, missing locality — and grill through whichever one you pick. Architecture-pattern aware (monolith / distributed / serverless).
disable-model-invocation: true
---

# Improve Code

`/improve-code [path] [--arch=monolith|distributed|serverless]` — Read-only audit → HTML report of **deepening opportunities** (shallow modules → deep) → grilling loop on user's pick. No code mods in audit. Invocation implies read-only git approval (`status/diff/log`); no git write without separate confirmation.

## Vocabulary (use exactly — no "component/service/API/boundary")

**Module** — interface + implementation (function/class/package/slice). **Interface** — everything a caller must know: signature, invariants, ordering, errors, config, perf. **Implementation** — module body. **Depth** — behaviour per unit of interface; **deep** = small interface + lots of behaviour, **shallow** = interface ≈ implementation. **Seam** — alter behaviour without editing in that place; where the interface lives. **Adapter** — concrete thing at a seam (role, not substance). **Leverage** — callers' gain from depth. **Locality** — maintainers' gain (change/bugs/knowledge concentrate).

## Principles

Depth is a property of the **interface**, not implementation. **Deletion test:** delete it — complexity vanishes (pass-through) or concentrates across N callers (earning keep)? **Interface is the test surface:** testing past it = wrong shape. **One adapter = hypothetical seam, two = real** — don't introduce unless something varies.

## Architecture pattern

Auto-detect (package layout, Dockerfile/compose, framework, entry points) or `--arch`. Print at report top with confidence. Tunes seam-vs-leak: **monolith** — HTTP in logic = leak, seam is in-process. **distributed** — inter-service HTTP = seam; flag only within-service. **serverless** — function boundary = seam; downweight "shallow". Low-confidence → default `monolith`, note in header.

## Scope

Path arg → scan that only. Else count source files (exclude `.git/`, `node_modules/`, `dist/`, `build/`, `vendor/`, lockfiles, generated): ≤500 → whole repo; >500 → `git diff` vs base (`origin/main`, `origin/master`, `main`, `master` in order; fallback `HEAD~1..HEAD`; if no `HEAD~1`, `HEAD`). Zero → `✅ NOTHING TO REVIEW`, stop.

## Exclusions (auto-skip)

Tests (`*.test.*`, `*.spec.*`, `__tests__/`, `tests/`, `*_test.go`), migrations (`migrations/`, `*.migration.*`), scripts (`scripts/`, `bin/`), config (`.config/`, `*.config.*`, root `*.json/yaml/toml`), generated (`generated/`, `dist/`, `build/`, `.next/`, `gen/`, header markers), vendored (`vendor/`, `node_modules/`, `third_party/`). Unclassifiable modules → skip silently.

## Flow

### 1. Context

**Glossary:** first of `docs/glossary.md` / `terminology.md` / `domain.md` (case-insensitive) = domain vocabulary. None → note, proceed without. **ADRs:** `docs/adr/` or `docs/decisions/`, read any in touched area, don't re-litigate; surface conflicts only if friction warrants reopening, mark in card. **Pattern:** auto-detect or `--arch`, print with confidence.

### 2. Explore

Spawn one `subagent_type=Explore`. Walk scope organically, feel friction, no rigid heuristics. Look for: concept-bouncing across small modules (no locality); shallow modules; pure-for-testability extracts where bugs hide in call sites (no locality); seam leaks; untested/hard-to-test-through-interface; cross-layer calls the pattern says should be seamed. Apply **deletion test** to suspects.

### 3. Report (HTML)

Self-contained HTML to `$TMPDIR` (fallback `/tmp`/`%TEMP%`): `improve-code-<timestamp>.html`. Open it (`open`/`xdg-open`/`start`). Tell user absolute path. Tailwind via CDN for layout, Mermaid via CDN for graph-shaped, hand-built divs/SVG for editorial. Each candidate: before/after visualisation.

Card: **Files** | **Problem** (vocab terms) | **Solution** (plain English) | **Benefits** (leverage+locality+testability) | **Before/After** | **Strength** (`Strong`/`Worth exploring`/`Speculative` badge). Glossary vocab for domain, this skill's for architecture. End with **Top recommendation**. Don't propose interfaces yet. Ask: "Which would you like to explore?"

### 4. Grilling

Run `/brainstorm` on picked candidate — design tree: constraints, dependencies, deepened shape, behind-seam, surviving tests. Inline: new term → add to `docs/glossary.md` (create lazily if none); sharpened term → update; load-bearing rejection → offer ADR only if hard-to-reverse + surprising + real trade-off.

## Sub-agent contract (Explore)

No user prompts, no escalation, assume-and-proceed on low-risk reversible ambiguity (record assumptions), missing context → "insufficient context" notes, findings only in final response.

## Failure handling

Explore timeout → retry once stricter + contract; still blocked → `🔄 CHANGES_NEEDED` + missing-context list. HTML write fails → Markdown in terminal + note. No opener → print path. Not a repo → skip adaptive scope, scan whole/path arg, note reduced confidence.

## Out of scope (YAGNI)

No proposing interfaces in Phase 3, code mods, running tests/build/lint, numerical scoring, cross-run tracking, perf/security/correctness bugs (→ `/review-changes`, `/debug`), forcing layers on layerless code (`✅ NOTHING TO REVIEW — no architectural layering detected`, stop), auto-creating ADRs, spawning >1 Explore.

## Edge cases

Empty repo → `✅ NOTHING TO REVIEW`. No `docs/` → skip glossary/ADR, note. No pattern signals → default `monolith`, note. Single-file path → 0-1 candidates. No pick → end after report.