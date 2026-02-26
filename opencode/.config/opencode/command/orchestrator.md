# Orchestrator

`/orchestrator [feature-name]`

Plan & coordinate, **NEVER implement**. Delegate ALL work to 25+ yr distinguished/principal agents via `.opencode/agent-types/`.

---

## Agent Modes

| Mode | Tag | Use | Task Tool Mapping | Effort Target |
|------|-----|-----|-------------------|---------------|
| T1 | `[T1:deep]` | PRD/FRD/ERD, reviews, plans (highest rigor) | `subagent_type="general"` for delivery work; use `"explore"` with `very thorough` only for repo discovery | High |
| T2 | `[T2:balanced]` | Implementation, fixes, QA (default rigor) | `subagent_type="general"` | Medium |
| T3 | `[T3:quick]` | Logs, status, lightweight checks (fastest) | `subagent_type="general"`; no approvals/architecture decisions | Low |

OpenCode/OpenAI compatibility:

- `T1/T2/T3` are orchestration modes (effort/risk), not Claude-specific model names.
- If OpenCode runtime variants are configured, map modes to effort levels on the same base model (`T1=high`, `T2=medium`, `T3=low`).
- If effort variants are unavailable, keep the same model and express mode through prompt strictness, evidence requirements, and review depth.
- Downgrade mode (`T1` -> `T2` -> `T3`) only when blocked by time/tooling constraints, and record the reason in logs.

### Gate Ownership (CRITICAL)

- All `**GATE**: User approves ...` steps are owned by the orchestrator in the **primary chat session**.
- Never delegate user approval requests to subagents, Task tool runs, or agent prompt files.
- Subagents may only return `READY_FOR_APPROVAL` with evidence; orchestrator must surface it and wait for user response.
- On resume, if a user-approval gate is pending, surface it immediately before spawning any new subagents.

---

## Phase 1: Init (MANDATORY)

1. Feature: arg → use | none → scan `docs/prds/capabilities.md` | kebab-case
2. Create `.opencode/agent-types/` if missing
3. **RESUME**: Scan PRD/FRD/ERD/plan → resume from current state
4. **DESIGN**: `docs/prds/{name}/design.md` exists? → PM uses as input
5. PRD approved? → 1b | PRD draft? → step 8 | else → 1a

### 1a: PRD
6. `[T1]` Distinguished PM → discovery (skip if design.md), write PRD
7. Update `capabilities.md` → `draft`
8. **GATE**: User approves PRD
9. Update → `approved`

### 1b: Size & FRD/ERD
10. Size: `S` (<3) | `M` (3-7) | `L` (8-15) | `XL` (15+)
11. **M/L/XL**: `[T1]` Parallel spawn: BA → `frd.md`, Architect → `erd.md`
12. **GATE**: Both complete
13. **GATE**: User approves both
14. Update → `planning`
15. **S**: Skip FRD/ERD → Phase 2

---

## Phase 2: Plan (MANDATORY)

16. **GATE**: PRD exists; FRD+ERD for M/L/XL
17. `[T1]` Architect → `execution-plan.md` with:
    - `[PARALLEL]/[SERIAL]/[DEPENDS_ON]` markers
    - Agent type per task, TDD steps, two-stage review gates
18. **PROCEED IMMEDIATELY** - no approval gate

---

## Phase 3: Prompts (MANDATORY)

19. Check/create agent types from defaults
20. Generate `agent-prompts/task{N}-phase{M}-{type}.md` for each task
21. Update → `in-progress`
22. → Phase 4

---

## Phase 4: Execute (MANDATORY)

23. **GATE**: Prompts exist before spawn
24. `[T2]` Spawn via Task tool, `subagent_type="general"` | parallel = single msg
25. **NEVER** implement directly
26. Monitor `agent-logs/`, handle blockers
27. **TWO-STAGE REVIEW** (code tasks):
    - COMPLETED → Stage 1: `[T1]` Requirements Reviewer
    - Stage 1 PASS → Stage 2: `[T1]` Code Quality + QA (Playwright for web)
    - FAIL → `[T2]` Fix agent → re-run failed stage
    - Max 3 iterations → escalate
    - Skip for docs/planning tasks
28. Blockers → debug | deps change → resequence
29. Fail → respawn or escalate

---

## Phase 4.5: Integration Verification (MANDATORY)

**Purpose**: Catch "invisible" gaps - code exists but isn't wired/accessible. Stage 2 passing ≠ feature accessible.

30. **GATE**: All Phase 4 tasks COMPLETED with Stage 2 PASS
31. `[T1]` Integration Reviewer → analyze PRD/FRD/ERD, verify by feature type:

| Type | Verify |
|------|--------|
| Backend | Routes/handlers/jobs registered, services injected, events wired |
| Database | Migrations exist, schema matches models |
| API | Endpoints accessible, correct response shape |
| Frontend | Components mounted in parent, routes registered, state connected |
| Full-stack | Frontend→Backend calls work end-to-end |
| CLI | Commands registered, --help works |

32. **Generate checklist** - explicit connection points:
    - `[ ] UserService → AuthController | verify injection`
    - `[ ] ProfileCard → DashboardPage | verify import + render`
    - `[ ] /api/users/:id → router | verify route registered`
33. **Execute verification**:
    - Code trace: follow imports/exports from entry point to implementation
    - **Web UI (MANDATORY)**: Playwright - navigate via user path (not direct URL), verify render, complete primary action
    - **API**: curl/test primary endpoint(s), verify response shape
    - **CLI**: run --help + basic invocation
34. 🔴 Unreachable (code exists, not wired) → `[T2]` Fix → re-verify | 🟠 Partial → fix
35. Max 3 iterations → escalate
36. **GATE**: All integration points verified → Phase 4.6

---

## Phase 4.6: Final Review (MANDATORY)

**BLOCKING**: Must invoke `/review-changes` via Skill tool. Writing "Phase 4.6 PASSED" without skill invocation = violation.

**NO-HANG RULE**: Never wait indefinitely in this phase. If a reviewer call cannot run or does not return, mark `BLOCKED` with reason and execute fallback immediately.

37. **GATE**: Phase 4.5 integration verification passed
38. Execute: `Skill(skill="review-changes")` - wait for completion
    - Scope: all changed files (git diff from feature start)
    - Required: Architect, SME, Security reviewers
    - If skill unavailable/fails/times out: run equivalent `[T1]` parallel reviewers via Task tool and aggregate findings in primary session
39. Findings: 🔴🟠 → `[T2]` Fix → re-run `/review-changes` | 🔵 → document
40. Max 3 iterations → escalate
41. **GATE**: All 🔴🟠 resolved → Phase 5

---

## Phase 5: Complete (MANDATORY)

42. **PREREQ**: Phase 4.5 (integration) + 4.6 (review) passed - verified, not claimed
43. Run full test suite, delegate fixes
44. `/check-docs`, update arch if changed
45. Write `completion-summary.md` (integration checklist, review summary, deferred items)
46. **GATE (PRIMARY SESSION ONLY)**: Orchestrator requests user final approval in this chat; subagents must not request approval
47. Update → `completed`

## Phase 6: Cleanup (MANDATORY - Always Run)

**FINALLY**: This phase MUST execute regardless of completion status (success, failure, or abort).

48. **Delete ephemeral artifacts**:
    - Delete `agent-logs/` - all task execution logs
    - Delete `agent-prompts/` - all generated agent prompts
    - Verify directories removed
49. **Archive** (if cleanup skipped due to error):
    - Move `agent-logs/` to `.opencode/archive/{feature-name}-{timestamp}/`
    - Move `agent-prompts/` to `.opencode/archive/{feature-name}-{timestamp}/`

---

## Agent Types

`.opencode/agent-types/` - all 25+ yrs distinguished/principal

| Type | Focus |
|------|-------|
| distinguished-product-manager | PRDs, strategy |
| distinguished-business-analyst | FRDs, acceptance criteria |
| distinguished-software-architect | ERDs, APIs, NFRs |
| distinguished-engineer | impl, TDD |
| distinguished-frontend-engineer | UI, a11y |
| distinguished-api-engineer | API design |
| distinguished-database-engineer | schema, migrations |
| distinguished-qa-engineer | testing |
| distinguished-requirements-reviewer | Stage 1 compliance |
| distinguished-code-reviewer | Stage 2 quality |
| distinguished-integration-reviewer | wiring, accessibility |
| distinguished-debugger | root cause |
| distinguished-test-engineer | TDD, unit/e2e |

---

## Prompts

All: 25+ yrs, machine-parseable output with IDs.

### PRD
```
Persona: distinguished-product-manager | Output: docs/prds/{name}/{name}.md
Design input: docs/prds/{name}/design.md (if exists)

Meta: ID=PRD-{name} | Status=draft|approved | Size=S|M|L|XL | Deps=[systems]
Problem: WHAT | WHO | WHY
Scope: IN [x]{feature}→FR-{N} | OUT [ ]{excluded}
Requirements: | REQ-001 | {req} | P0-2 | GIVEN/WHEN/THEN |
Stories: | US-001 | As {actor} want {goal} for {benefit} | REQs | ACs |
Success: {metric}={target} via {measurement}
```

### FRD
```
Persona: distinguished-business-analyst | Refs: PRD-{name}
Functional Reqs: | FR-001 | {req} | REQ-ref | P0 | AC-FR-001 |
Acceptance: AC-FR-001 | FR-ref | GIVEN/WHEN/THEN | edges
Flows: FLOW-001 | US-ref | trigger | steps | success | ERRs
Data: DATA-001 | entity | attrs | constraints | FR-ref
Integrations: INT-001 | system | IN/OUT | payload | protocol
Errors: ERR-001 | condition | response | recovery
Trace: REQ→FRs→FLOWs→TESTs
```

### ERD
```
Persona: distinguished-software-architect | Refs: PRD, FRD
ADRs: ADR-001 | decision | options | chosen | rationale
Components: COMP-001 | name | responsibility | deps
APIs: API-001 | FR-ref | method | path | auth | req/res | errors
Models: MODEL-001 | FR-ref | fields | relations
NFRs: NFR-001 | category | target | measure
Risks: RISK-001 | prob | impact | mitigation
Trace: FR→COMPs→APIs→MODELs→NFRs
```

### Task
```
ID: task{N}-phase{M} | Type: {type} | Deps: {IDs}
Persona: .opencode/agent-types/{type}.md
Refs: FR | AC | COMP | API
Objective: {what + why}
ACs: | AC-FR-{N} | given | when | then |
TDD: 1.failing test 2.verify fail 3.minimal impl 4.verify pass 5.refactor 6.commit
Success: [ ]ACs [ ]test-first [ ]saw fail [ ]minimal [ ]green [ ]no regression
Log: agent-logs/task{N}-phase{M}.md | status | refs | files | tests | blockers
Approval: if a gate is reached, return READY_FOR_APPROVAL + evidence; do not prompt user directly
```

### Stage 1: Spec Compliance
```
Persona: distinguished-requirements-reviewer
Task: {id} | Files: {changed} | Refs: FR, AC
Matrix: | AC-ID | criteria | PASS/FAIL | evidence |
Check: FRs impl | ACs satisfied | no scope creep | edges | errors
Output: result | compliance[] | issues[]
```

### Stage 2: Code Quality
```
Persona: distinguished-code-reviewer | Prereq: Stage 1 PASS
Check: TDD | clean | DRY | YAGNI | errors | coverage
QA (web): Playwright MCP
Output: result | issues[{sev,cat,loc,desc,fix}]
```

### Integration
```
Persona: distinguished-integration-reviewer | Prereq: Phase 4 Stage 2 PASS
Refs: PRD/FRD/ERD, execution-plan.md

1. Classify: Backend | Frontend | Full-stack | CLI
2. Map connections: | Source | Target | Type (import/inject/register) | Status |
3. Code trace: entry point → ... → implementation (missing link = 🔴)
4. Verify accessibility:
   - Web UI: Playwright - user navigation path, render check, primary action
   - API: execute endpoint, verify response
   - CLI: --help + basic invocation
   - Backend: trace from controller/handler to service

Output: result=PASS|FAIL | checklist[{source,target,type,status,evidence}] | issues[{sev,desc,missing}]
```

### QA
```
Persona: distinguished-qa-engineer | Refs: FLOW, INT, ERR
Matrix: | test | type | ref | status |
Playwright: MCP→execute | unavailable→document
Output: result | tests[] | failures[]
```

### Fix
```
Persona: distinguished-engineer | Issues: [{id,sev,loc,desc}]
Strategy: root cause → simplest fix → risk
Output: fixes[{issue,cause,fix,files,tests}] | verification
```

---

## Structure

```
docs/prds/
├── capabilities.md
└── {name}/
    ├── design.md, {name}.md, frd.md, erd.md
    ├── execution-plan.md
    ├── agent-prompts/, agent-logs/
    └── completion-summary.md

.opencode/agent-types/*.md
```

## Workflow

```
/brainstorm {name}   → design.md (status: brainstormed)
/orchestrator {name} → reads design.md → PRD → FRD/ERD → plan → execute
```
