# QA and Fix

`/qa-and-fix` - Standalone QA + fixes

**NOTE**: For ad-hoc QA only. Under `/orchestrator`, use inline QA Gate instead.

## Agents
- **Orchestrator**: Coordinate, Playwright fallback
- **QA Agent**: Distinguished QA Engineer (25+ yrs) - investigate, test, validate
- **Fix Agent**: Distinguished Engineer (25+ yrs) - root cause, fix

## Flow

### Phase 1: Setup
1. Ask: "What to QA?" (feature/file/recent changes/project)
2. Read README, arch docs

### Phase 2: QA (delegated)
3. `[T2:balanced]` Spawn QA agent:
   ```
   Persona: Distinguished QA Engineer (25+ yrs)
   Scope: {user-defined}
   
   Check: functional, code quality, integration, tests, docs, security/perf
   Playwright (web): try MCP → fail? return NEEDS_PLAYWRIGHT + scenarios
   
   Output: issues (CRITICAL/MEDIUM/LOW) w/ file:line, passed checks
   ```
4. If NEEDS_PLAYWRIGHT → orchestrator executes, reports back
5. Present report → "Proceed to fix? [Y/n]"

### Phase 3: Fix (delegated)
6. `[T2:balanced]` Spawn fix agent:
   ```
   Persona: Distinguished Engineer (25+ yrs)
   Issues: {from QA}
   
   For each (CRITICAL→MEDIUM→LOW):
   - Root cause → design fix → implement → verify
   - Follow agents.md philosophy
   
   Output: fixed, files modified, deferred, PLAYWRIGHT_VALIDATION if needed
   ```
7. If Playwright validation → orchestrator executes
8. Loop max 3x if validation fails

### Phase 4: Review
9. `[T1:reasoning]` Spawn distinguished-code-reviewer + distinguished-architect → if CHANGES_NEEDED → fix agent → repeat

### Phase 5: Output
10. Save to `docs/hotfixes/{hotfix-id}/`: qa-report.md, fix-report.md, review-summary.md

## Responsibilities

| Task | Owner |
|------|-------|
| User interaction | Orchestrator |
| QA investigation | QA Agent |
| Fix implementation | Fix Agent |
| Playwright testing | QA Agent (orchestrator fallback) |
| Code review | Review Agents |
