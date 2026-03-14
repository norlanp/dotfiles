# Orchestrator

`/orchestrator [feature-name]`

Plan & coordinate, **NEVER implement**. Delegate ALL work to 25+ yr distinguished/principal agents via `.opencode/agent-types/`.

---

## Agent Modes

| Mode | Tag | Use | Effort |
|------|-----|-----|--------|
| T1 | `[T1:deep]` | PRD, plans, reviews (highest rigor) | High |
| T2 | `[T2:balanced]` | Implementation, fixes, QA (default) | Medium |
| T3 | `[T3:quick]` | Logs/status/lightweight checks only | Low |

OpenCode/OpenAI compatibility:

- `T1/T2/T3` are orchestration modes (effort/risk), not model names.
- Task mapping: use `subagent_type="general"` for delivery/review work; use `subagent_type="explore"` with `very thorough` only for repo discovery.
- If effort variants exist, map `T1=high`, `T2=medium`, `T3=low`; otherwise keep one model and enforce mode by prompt strictness/evidence depth.
- Downgrade `T1 -> T2 -> T3` only when blocked by time/tooling constraints; record reason in logs.

### Gate Ownership (CRITICAL)

- User-approval gates are owned by orchestrator in the **primary chat session**.
- Never delegate approval requests to subagents, Task runs, or prompt files.
- Subagents may return `READY_FOR_APPROVAL` + evidence only; orchestrator surfaces it and waits.
- On resume, surface pending user-approval gate before spawning new subagents.
- Single active run per workspace when using root-level `agent-logs/` and `agent-prompts/`.

---

## Phase 1: Init (MANDATORY)

1. Feature: arg → use | none → scan `docs/prds/capabilities.md` | kebab-case
2. Create `.opencode/agent-types/` if missing
3. **RESUME**: Scan PRD/plan → resume from current state
4. **DESIGN**: `docs/prds/{name}/design.md` exists? → PM uses as input
5. PRD approved? → step 10 | PRD draft? → step 8 | else → step 6

### 1a: PRD
6. `[T1]` Distinguished PM → discovery (skip if design.md), write PRD
7. Update `capabilities.md` → `draft`
8. **GATE**: User approves PRD
9. Update → `approved`

### 1b: Size Classification
10. Size: `S` (<3) | `M` (3-7) | `L` (8-15) | `XL` (15+) | override: regulated/high-risk → treat as `XL`
11. **S**: Update `capabilities.md` → `planning`; skip technical appendix and execution-plan → Phase 3
12. **M/L**: No technical appendix; update `capabilities.md` → `planning` → Phase 2
13. **XL/regulated/high-risk**: `[T1]` Architect → `technical-appendix.md` (optional); update `capabilities.md` → `planning` → Phase 2

---

## Phase 2: Plan (MANDATORY for M/L/XL)

14. **GATE**: Approved PRD exists and size is `M`/`L`/`XL`
15. `[T1]` Architect → `execution-plan.md` with:
    - `[PARALLEL]/[SERIAL]/[DEPENDS_ON]` markers
    - Agent type per task, TDD steps, review gates
16. **PROCEED IMMEDIATELY** - no approval gate

---

## Phase 3: Prompts (MANDATORY)

17. Check/create agent types from defaults
18. Generate task prompts (ephemeral, not committed) from delivery instructions (`S`: PRD tasks, `M/L/XL`: execution plan)
19. Update → `in-progress`
20. → Phase 4

---

## Phase 4: Execute (MANDATORY)

21. **GATE**: Delivery instructions exist (`S`: PRD task list; `M/L/XL`: `execution-plan.md`)
22. `[T2]` Spawn via Task tool, `subagent_type="general"` | parallel = single msg
23. **NEVER** implement directly
24. Monitor `agent-logs/` (ephemeral), handle blockers
25. **TWO-STAGE REVIEW** (code tasks):
    - COMPLETED → Stage 1: `[T1]` Requirements Reviewer
    - Stage 1 PASS → Stage 2: `[T1]` Code Quality + QA (Playwright for web)
    - FAIL → `[T2]` Fix agent → re-run failed stage
    - Max 3 iterations → escalate
    - Skip for docs/planning tasks
26. Blockers → debug | deps change → resequence
27. Fail → respawn or escalate

---

## Phase 4.5: Integration Verification (MANDATORY)

**Purpose**: Catch "invisible" gaps (code exists but is not wired/accessible). Stage 2 pass does not guarantee accessibility.

28. **GATE**: All Phase 4 tasks COMPLETED with Stage 2 PASS
29. `[T1]` Integration Reviewer → analyze PRD (+ `execution-plan.md` when present), verify by feature type:

| Type | Verify |
|------|--------|
| Backend | Routes/handlers/jobs registered, services injected, events wired |
| Database | Migrations exist, schema matches models |
| API | Endpoints accessible, correct response shape |
| Frontend | Components mounted in parent, routes registered, state connected |
| Full-stack | Frontend→Backend calls work end-to-end |
| CLI | Commands registered, --help works |

30. **Generate checklist** - explicit connection points, e.g.:
    - `[ ] UserService → AuthController | verify injection`
    - `[ ] ProfileCard → DashboardPage | verify import + render`
    - `[ ] /api/users/:id → router | verify route registered`
31. **Execute verification**:
    - Code trace: follow imports/exports from entry point to implementation
    - **Web UI (MANDATORY)**: Playwright - navigate via user path (not direct URL), verify render, complete primary action
    - **API**: curl/test primary endpoint(s), verify response shape
    - **CLI**: run --help + basic invocation
32. 🔴 Unreachable (exists, not wired) → `[T2]` fix → re-verify | 🟠 Partial → fix
33. Max 3 iterations → escalate
34. **GATE**: All integration points verified → Phase 4.6

---

## Phase 4.6: Final Review (MANDATORY)

**BLOCKING**: Must invoke `/review-changes` via Skill tool. Claiming "Phase 4.6 PASSED" without invocation is a violation.

**NO-HANG RULE**: Never wait indefinitely. If reviewer call cannot run or does not return, mark `BLOCKED` with reason and execute fallback immediately.

**AUTONOMY RULE**: Phase 4.6 runs without user interaction. Do not open approval/clarification gates while iterating review findings.

35. **GATE**: Phase 4.5 integration verification passed
36. Execute: `Skill(skill="review-changes")` - wait for completion
    - Scope: all changed files (git diff from feature start)
    - Required: Architect, SME, Security reviewers
    - If skill unavailable/fails/times out: run equivalent `[T1]` parallel reviewers via Task tool and aggregate findings in primary session
37. Findings loop (autonomous):
    - 🔴🟠 → spawn `[T2]` fix agents immediately (parallel for independent issues, serial for dependent issues)
    - Re-run `/review-changes` immediately after fixes
    - Repeat until no 🔴🟠 or max iterations reached
    - Never request user input in this loop
38. Max 3 iterations → mark `BLOCKED` with unresolved issues + evidence; continue to Phase 5 only after loop exits with zero 🔴🟠
39. **GATE**: All 🔴🟠 resolved → Phase 5

---

## Phase 5: Complete (MANDATORY)

40. **PREREQ**: Phase 4.5 (integration) + 4.6 (review) passed - verified, not claimed
41. Run full test suite, delegate fixes
42. `/docs quick`, update arch if changed
43. Write `completion-summary.md` (integration checklist, review summary, deferred items)
44. **GATE (PRIMARY SESSION ONLY)**: Orchestrator requests user final approval in this chat; subagents must not request approval
45. Update → `completed`

## Phase 6: Cleanup (MANDATORY - Always Run)

**FINALLY**: This phase MUST execute regardless of completion status (success, failure, or abort).

46. **Delete ephemeral artifacts**:
    - Delete `agent-logs/` - all task execution logs (never committed)
    - Delete `agent-prompts/` - all generated agent prompts (never committed)
    - Verify directories removed
47. **Archive** (if cleanup skipped due to error):
    - Move `agent-logs/` to `.opencode/archive/{feature-name}-{timestamp}/`
    - Move `agent-prompts/` to `.opencode/archive/{feature-name}-{timestamp}/`

---

## Agent Types

`.opencode/agent-types/` - all 25+ yrs distinguished/principal

| Type | Focus |
|------|-------|
| distinguished-product-manager | PRDs, strategy |
| distinguished-software-architect | Technical design, APIs, NFRs |
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

## Documentation Structure

**Canonical spec**: Single PRD containing all requirements
**Operational plan**: `S` uses PRD delivery tasks; `M/L/XL` use `execution-plan.md`
**Ephemeral artifacts**: Agent prompts/logs (never committed)

### Size-Based Documentation Rules

| Size | Docs Required | Optional |
|------|---------------|----------|
| S | `{name}.md` | `design.md` |
| M | `{name}.md` + `execution-plan.md` | `design.md` |
| L | `{name}.md` + `execution-plan.md` | `design.md` |
| XL | `{name}.md` + `execution-plan.md` | `design.md` + `technical-appendix.md` |

Note: regulated/high-risk features follow `XL` documentation rigor regardless of requirement count.

### PRD Template (Unified)

```
Persona: distinguished-product-manager | Output: docs/prds/{name}/{name}.md
Design: docs/prds/{name}/design.md (optional input only)

Meta: ID=PRD-{name} | Status=draft|approved | Size=S|M|L|XL | Deps=[systems]

Problem: WHAT | WHO | WHY
Scope: IN [x]{feature}→REQ-{N} | OUT [ ]{excluded}

Requirements:
| REQ-001 | {requirement} | P0-2 | GIVEN/WHEN/THEN |

Acceptance Criteria:
| AC-001 | REQ-ref | GIVEN/WHEN/THEN | edges |

User Stories:
| US-001 | As {actor} want {goal} for {benefit} | REQs | ACs |

Flows:
| FLOW-001 | US-ref | trigger | steps | success | ERRs |

Data Model:
| DATA-001 | entity | attrs | constraints | REQ-ref |

APIs/Interfaces:
| API-001 | REQ-ref | method | path | auth | req/res | errors |

Integrations:
| INT-001 | system | IN/OUT | payload | protocol |

Error Handling:
| ERR-001 | condition | response | recovery |

Technical Decisions:
| DEC-001 | decision | options | chosen | rationale |

NFRs:
| NFR-001 | category | target | measure |

Risks:
| RISK-001 | prob | impact | mitigation |

Success: {metric}={target} via {measurement}
Trace: REQ→ACs→FLOWs→DATA→APIs→TESTs

Delivery Tasks (`S` only):
| TASK-S-001 | objective | AC refs | owner |
```

### Execution Plan Template

Required for `M/L/XL`; optional for `S`.

```
Persona: distinguished-software-architect | Refs: PRD-{name}

Tasks:
| ID | Type | Description | Deps | Mode | TDD Steps |
| task1-phase4 | engineer | Implement X | none | T2 | 6-step TDD |

Markers:
[PARALLEL] task1, task2 | [SERIAL] task3 | [DEPENDS_ON] task3→task1,task2

Reviews:
Stage 1: requirements-reviewer | Stage 2: code-reviewer
```

### Task Prompt Template (Ephemeral)

```
ID: task{N}-phase{M} | Type: {type} | Deps: {IDs}
Persona: .opencode/agent-types/{type}.md
Refs: PRD REQ-{N} | AC-{N} | API-{N}
Objective: {what + why}
ACs: | AC-{N} | given | when | then |
TDD: 1 failing test 2 verify fail 3 minimal impl 4 verify pass 5 refactor 6 commit
Success: [ ]ACs [ ]test-first [ ]saw fail [ ]minimal [ ]green [ ]no regression
Log: agent-logs/task{N}-phase{M}.md (ephemeral) | status | refs | files | tests | blockers
Approval: return `READY_FOR_APPROVAL` only when orchestrator explicitly marks a user-approval gate; otherwise return `DONE` + evidence; never prompt user directly
```

### Stage 1: Requirements Compliance

```
Persona: distinguished-requirements-reviewer
Task: {id} | Files: {changed} | Refs: PRD REQ-{N}, AC-{N}
Matrix: | AC-ID | criteria | PASS/FAIL | evidence |
Check: REQ implemented | AC satisfied | no scope creep | edges | errors
Output: result | compliance[] | issues[]
```

### Stage 2: Code Quality

```
Persona: distinguished-code-reviewer | Prereq: Stage 1 PASS
Check: TDD | clean code | DRY | YAGNI | errors | coverage
QA (web): Playwright MCP
Output: result | issues[{sev,cat,loc,desc,fix}]
```

### Integration

```
Persona: distinguished-integration-reviewer | Prereq: Phase 4 Stage 2 PASS
Refs: PRD, execution-plan.md

1. Classify: Backend | Frontend | Full-stack | CLI
2. Map connections: | Source | Target | Type (import/inject/register) | Status |
3. Code trace: entry point → ... → implementation (missing link = 🔴)
4. Verify access:
   - Web UI: Playwright user path, render check, primary action
   - API: execute primary endpoint(s), verify response shape
   - CLI: --help + basic invocation
   - Backend: trace controller/handler → service

Output: result=PASS|FAIL | checklist[{source,target,type,status,evidence}] | issues[{sev,desc,missing}]
```

### QA

```
Persona: distinguished-qa-engineer | Refs: PRD FLOW-{N}, INT-{N}, ERR-{N}
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

## Directory Structure

```
docs/prds/
├── capabilities.md
└── {name}/
    ├── design.md (optional, input only)
    ├── {name}.md (canonical PRD)
    ├── technical-appendix.md (XL only, optional)
    ├── execution-plan.md (M/L/XL required, S optional)
    └── completion-summary.md

.opencode/agent-types/*.md
.opencode/archive/ (ephemeral archive)
agent-logs/ (ephemeral, gitignored)
agent-prompts/ (ephemeral, gitignored)
```

## Workflow

```
/brainstorm {name}   → design.md (status: brainstormed)
/orchestrator {name} → reads design.md → PRD → (execution-plan for M/L/XL) → execute
```

## Migration Notes

**From multi-doc to unified PRD:**
- Legacy FRD content → PRD "Requirements", "Acceptance Criteria", "Flows" sections
- Legacy ERD content → PRD "Data Model", "APIs/Interfaces", "Technical Decisions", "NFRs", "Risks" sections
- `frd.md` and `erd.md` files deprecated; do not create for new features
- Reviewers now reference PRD (+ `execution-plan.md` when present)

**Ephemeral artifacts:**
- `agent-logs/` and `agent-prompts/` are execution aids, not documentation
- Never commit to git; clean up in Phase 6
- Archive only on error for debugging
